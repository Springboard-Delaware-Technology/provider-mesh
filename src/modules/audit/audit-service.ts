import { randomUUID } from 'node:crypto';

import type {
  AuditCheckpoint,
  AuditEventInput,
  AuditSink,
  ChainHead,
  ObjectStore,
  RelationalStore,
} from '../../platform/ports/index.js';

import { GENESIS_HASH } from './canonical.js';
import { readChainHead } from './chain-reader.js';
import {
  datedCheckpointKey,
  latestCheckpointKey,
  readLatestCheckpoint,
  serializeCheckpoint,
  type CheckpointRecord,
} from './checkpoint.js';
import { AuditEventInputError, auditEventInsert } from './event-row.js';
import { checkpointExportEvent, type FoundationIdentity } from './foundation-events.js';

/**
 * The Audit Service (Architecture §6.17; Foundation 001 §5.5): the only writer to
 * `provider_mesh_audit`, over a `RelationalStore` that `src/app` built from the audit-writer
 * credential and injects here and nowhere else (§5.2). It supplies content columns only; the
 * store's trigger assigns the chain position, and the service reads the position back through
 * the chain-head view inside the same transaction — the advisory lock is still held, so the
 * head it reads is its own row (rule 1).
 *
 * It holds no `SELECT` on `audit_event` and cannot verify the chain; `audit:verify` does that
 * as `mesh_audit_reader` (rule 3). A checkpoint export (rule 4) records the head as this
 * service observed it, attributed to the caller's verifier identity.
 */
export type AuditAppendCode =
  | 'invalid_event'
  | 'store_rejected'
  | 'head_unreadable'
  | 'head_mismatch'
  | 'checkpoint_store_failed';

/** Names the failure and the field, never a value (§5.8). The store's error is the cause. */
export class AuditAppendError extends Error {
  readonly code: AuditAppendCode;
  readonly field: string | null;
  override readonly cause: unknown;
  constructor(code: AuditAppendCode, options: { field?: string; cause?: unknown } = {}) {
    super(
      `audit append failed: ${code}${options.field === undefined ? '' : ` (${options.field})`}`,
    );
    this.name = 'AuditAppendError';
    this.code = code;
    this.field = options.field ?? null;
    this.cause = options.cause;
  }
}

const VERIFIER_IDENTITY = /^[A-Za-z0-9][A-Za-z0-9_.:/@-]{0,255}$/;

export interface AuditServiceOptions {
  /** `origin_channel` recorded on the events this service produces itself. */
  readonly originChannel?: string;
}

export class AuditService implements AuditSink {
  readonly #store: RelationalStore;
  readonly #objects: ObjectStore;
  readonly #identity: FoundationIdentity;
  readonly #originChannel: string;

  constructor(
    store: RelationalStore,
    objects: ObjectStore,
    identity: FoundationIdentity,
    options: AuditServiceOptions = {},
  ) {
    this.#store = store;
    this.#objects = objects;
    this.#identity = identity;
    this.#originChannel = options.originChannel ?? 'system';
  }

  async append(event: AuditEventInput): Promise<ChainHead> {
    let statement;
    try {
      statement = auditEventInsert(event);
    } catch (error) {
      if (error instanceof AuditEventInputError) {
        throw new AuditAppendError('invalid_event', { field: error.field, cause: error });
      }
      throw error;
    }
    return this.#store.transaction(null, async (scope) => {
      try {
        await scope.query(statement);
      } catch (error) {
        throw new AuditAppendError('store_rejected', { cause: error });
      }
      let head;
      try {
        head = await readChainHead(scope);
      } catch (error) {
        throw new AuditAppendError('head_unreadable', { cause: error });
      }
      if (head?.eventId !== event.eventId.toLowerCase()) {
        throw new AuditAppendError('head_mismatch');
      }
      return { sequence: head.sequence, hash: head.hash };
    });
  }

  async chainHead(): Promise<ChainHead | null> {
    const head = await this.#store.transaction(null, (scope) => readChainHead(scope), {
      readOnly: true,
    });
    return head === null ? null : { sequence: head.sequence, hash: head.hash };
  }

  async exportCheckpoint(verifierIdentity: string): Promise<AuditCheckpoint> {
    if (!VERIFIER_IDENTITY.test(verifierIdentity)) {
      throw new AuditAppendError('invalid_event', { field: 'verifierIdentity' });
    }
    const head = (await this.chainHead()) ?? { sequence: 0, hash: GENESIS_HASH };
    const previous = await readLatestCheckpoint(this.#objects, this.#identity.instanceId);
    const verifiedAt = new Date().toISOString();
    const record: CheckpointRecord = {
      version: 1,
      instanceId: this.#identity.instanceId,
      environment: this.#identity.environment,
      sequence: head.sequence,
      hash: head.hash,
      verifiedAt,
      verifierIdentity,
    };
    const bytes = serializeCheckpoint(record);
    const dated = datedCheckpointKey(this.#identity.instanceId, verifiedAt, head.sequence);
    const labels = { kind: 'audit-checkpoint', instance: this.#identity.instanceId };
    let metadata;
    try {
      metadata = await this.#objects.put(dated, bytes, { contentType: 'application/json', labels });
      await this.#objects.put(latestCheckpointKey(this.#identity.instanceId), bytes, {
        contentType: 'application/json',
        labels,
      });
    } catch (error) {
      throw new AuditAppendError('checkpoint_store_failed', { cause: error });
    }
    await this.append(
      checkpointExportEvent({
        ...this.#identity,
        eventId: randomUUID(),
        correlationId: randomUUID(),
        occurredAt: verifiedAt,
        verifierIdentity,
        headSequence: head.sequence,
        headHash: head.hash,
        previousCheckpointHash: previous?.hash ?? null,
        objectKey: dated,
        objectSha256: metadata.contentSha256,
        originChannel: this.#originChannel,
      }),
    );
    return { sequence: head.sequence, hash: head.hash, verifiedAt, verifierIdentity };
  }
}
