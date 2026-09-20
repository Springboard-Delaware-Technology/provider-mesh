import type { TransactionScope } from '../../platform/ports/index.js';

import { auditEventHash, GENESIS_HASH, type AuditEventRow } from './canonical.js';
import { CHAIN_ROW_COLUMNS, parseChainRow } from './chain-reader.js';

/**
 * Chain verification (§5.5 rules 1 and 3; A14): recompute every row's hash from its canonical
 * serialization, check that `prev_hash` is the previous row's `hash` (the genesis value for
 * sequence 1), and that `sequence` runs 1, 2, 3, … without a gap or a duplicate. Reports the
 * first divergence and stops. Optionally checks the chain against an exported checkpoint
 * (§5.5 rule 4; `SEC-AUD-04`): the row at the checkpoint's sequence must carry its hash, and
 * the chain must reach that sequence, so a truncation below a checkpoint is detected.
 *
 * Reports carry sequences and hashes only, never row content (`SEC-AUD-02`: audit metadata
 * remains protected).
 */
export type ChainProblemKind =
  | 'sequence_gap'
  | 'sequence_duplicate'
  | 'genesis_mismatch'
  | 'prev_hash_mismatch'
  | 'hash_mismatch'
  | 'checkpoint_hash_mismatch'
  | 'checkpoint_beyond_head';

export interface ChainProblem {
  readonly kind: ChainProblemKind;
  /** The sequence at which verification stopped (for a gap, the sequence that was expected). */
  readonly sequence: bigint;
  readonly detail: string;
}

export interface CheckpointTarget {
  readonly sequence: bigint;
  readonly hash: string;
}

export type CheckpointStatus = 'none' | 'matched' | 'mismatched' | 'beyond_head';

export interface ChainVerificationReport {
  readonly ok: boolean;
  readonly rows: bigint;
  readonly head: { readonly sequence: bigint; readonly hash: string } | null;
  readonly problem: ChainProblem | null;
  readonly checkpoint: {
    readonly status: CheckpointStatus;
    readonly target: CheckpointTarget | null;
  };
}

/** Incremental walker: feed rows in ascending order; stop when `step` returns false. */
export class ChainWalker {
  #expected = 1n;
  #prevHash = GENESIS_HASH;
  #rows = 0n;
  #head: { sequence: bigint; hash: string } | null = null;
  #problem: ChainProblem | null = null;
  readonly #checkpoint: CheckpointTarget | null;
  #checkpointStatus: CheckpointStatus;

  constructor(checkpoint: CheckpointTarget | null = null) {
    this.#checkpoint = checkpoint;
    // A checkpoint of an empty chain (sequence 0, genesis hash) is matched by definition.
    this.#checkpointStatus =
      checkpoint === null
        ? 'none'
        : checkpoint.sequence === 0n
          ? checkpoint.hash === GENESIS_HASH
            ? 'matched'
            : 'mismatched'
          : 'beyond_head';
    if (this.#checkpointStatus === 'mismatched' && checkpoint !== null) {
      this.#problem = {
        kind: 'checkpoint_hash_mismatch',
        sequence: 0n,
        detail: `checkpoint hash ${checkpoint.hash} is not the genesis value`,
      };
    }
  }

  #fail(kind: ChainProblemKind, sequence: bigint, detail: string): false {
    this.#problem = { kind, sequence, detail };
    return false;
  }

  step(row: AuditEventRow): boolean {
    if (this.#problem !== null) return false;
    if (row.sequence < this.#expected) {
      return this.#fail(
        'sequence_duplicate',
        row.sequence,
        `sequence ${row.sequence.toString()} appears again after ${(this.#expected - 1n).toString()}`,
      );
    }
    if (row.sequence > this.#expected) {
      return this.#fail(
        'sequence_gap',
        this.#expected,
        `expected sequence ${this.#expected.toString()}, found ${row.sequence.toString()}`,
      );
    }
    if (row.prev_hash !== this.#prevHash) {
      return this.#fail(
        row.sequence === 1n ? 'genesis_mismatch' : 'prev_hash_mismatch',
        row.sequence,
        `prev_hash ${row.prev_hash} but the previous hash is ${this.#prevHash}`,
      );
    }
    const recomputed = auditEventHash(row);
    if (recomputed !== row.hash) {
      return this.#fail(
        'hash_mismatch',
        row.sequence,
        `stored hash ${row.hash}, recomputed ${recomputed}`,
      );
    }
    if (this.#checkpoint !== null && row.sequence === this.#checkpoint.sequence) {
      if (row.hash === this.#checkpoint.hash) {
        this.#checkpointStatus = 'matched';
      } else {
        this.#checkpointStatus = 'mismatched';
        return this.#fail(
          'checkpoint_hash_mismatch',
          row.sequence,
          `checkpoint hash ${this.#checkpoint.hash}, chain hash ${row.hash}`,
        );
      }
    }
    this.#rows += 1n;
    this.#head = { sequence: row.sequence, hash: row.hash };
    this.#prevHash = row.hash;
    this.#expected = row.sequence + 1n;
    return true;
  }

  finish(): ChainVerificationReport {
    if (
      this.#problem === null &&
      this.#checkpointStatus === 'beyond_head' &&
      this.#checkpoint !== null
    ) {
      this.#problem = {
        kind: 'checkpoint_beyond_head',
        sequence: this.#checkpoint.sequence,
        detail: `checkpoint sequence ${this.#checkpoint.sequence.toString()} is beyond the head ${(this.#expected - 1n).toString()}: the chain is truncated`,
      };
    }
    return {
      ok: this.#problem === null,
      rows: this.#rows,
      head: this.#head,
      problem: this.#problem,
      checkpoint: { status: this.#checkpointStatus, target: this.#checkpoint },
    };
  }
}

export const DEFAULT_BATCH_SIZE = 500;

const CURSOR = 'pm_audit_chain_walk';

/**
 * Walks the whole chain in the caller's transaction from sequence 1, through a server-side
 * cursor fetched in batches. A cursor, rather than keyset pagination on `sequence`, because a
 * duplicated sequence is one of the conditions to detect: a keyset (`sequence > last`) would
 * step over a duplicate that falls on a batch boundary, while the cursor returns every row of
 * one ordered snapshot exactly once.
 */
export async function verifyChain(
  scope: TransactionScope,
  options: { readonly checkpoint?: CheckpointTarget | null; readonly batchSize?: number } = {},
): Promise<ChainVerificationReport> {
  const walker = new ChainWalker(options.checkpoint ?? null);
  const batchSize = options.batchSize ?? DEFAULT_BATCH_SIZE;
  await scope.query({
    text: `DECLARE ${CURSOR} NO SCROLL CURSOR FOR SELECT ${CHAIN_ROW_COLUMNS} FROM audit_event ORDER BY sequence, event_id`,
  });
  try {
    for (;;) {
      const result = await scope.query<Record<string, unknown>>({
        text: `FETCH FORWARD ${String(batchSize)} FROM ${CURSOR}`,
      });
      for (const raw of result.rows) {
        if (!walker.step(parseChainRow(raw))) return walker.finish();
      }
      if (result.rows.length < batchSize) return walker.finish();
    }
  } finally {
    await scope.query({ text: `CLOSE ${CURSOR}` });
  }
}
