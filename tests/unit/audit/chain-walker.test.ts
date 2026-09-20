import { describe, expect, it } from 'vitest';

import {
  auditEventHash,
  ChainWalker,
  GENESIS_HASH,
  type AuditEventRow,
  type HashedColumns,
} from '../../../src/modules/audit/index.js';

import { FIXED_ROW } from './canonical.test.js';

/** A valid synthetic chain of `n` rows, hashed exactly as the trigger would. */
function chain(n: number): AuditEventRow[] {
  const rows: AuditEventRow[] = [];
  let prev = GENESIS_HASH;
  for (let i = 1; i <= n; i += 1) {
    const content: HashedColumns = {
      ...FIXED_ROW,
      correlation_id: `corr-${String(i)}`,
      sequence: BigInt(i),
      prev_hash: prev,
    };
    const hash = auditEventHash(content);
    rows.push({ ...content, hash });
    prev = hash;
  }
  return rows;
}

function at(rows: readonly AuditEventRow[], index: number): AuditEventRow {
  const row = rows[index];
  if (row === undefined) throw new Error(`no row ${String(index)}`);
  return row;
}

function walk(
  rows: readonly AuditEventRow[],
  checkpoint: { sequence: bigint; hash: string } | null = null,
) {
  const walker = new ChainWalker(checkpoint);
  for (const row of rows) if (!walker.step(row)) break;
  return walker.finish();
}

describe('chain walker (§5.5 rule 3; A14)', () => {
  const rows = chain(4);

  it('accepts an intact chain and reports its head', () => {
    const report = walk(rows);
    expect(report).toMatchObject({ ok: true, rows: 4n, problem: null });
    expect(report.head).toEqual({ sequence: 4n, hash: rows[3]?.hash });
    expect(walk([])).toMatchObject({ ok: true, rows: 0n, head: null });
  });

  it('reports an altered row by its sequence with hashes only', () => {
    const altered = rows.map((r) => (r.sequence === 3n ? { ...r, operation: 'tampered' } : r));
    const report = walk(altered);
    expect(report.problem).toMatchObject({ kind: 'hash_mismatch', sequence: 3n });
    expect(report.problem?.detail).toMatch(/^stored hash [0-9a-f]{64}, recomputed [0-9a-f]{64}$/);
    expect(report.rows).toBe(2n);
  });

  it('reports a broken link, a wrong genesis, a gap, and a duplicate', () => {
    const relinked = rows.map((r) => (r.sequence === 2n ? { ...r, prev_hash: 'a'.repeat(64) } : r));
    expect(walk(relinked).problem).toMatchObject({ kind: 'prev_hash_mismatch', sequence: 2n });
    const genesis = rows.map((r) => (r.sequence === 1n ? { ...r, prev_hash: 'a'.repeat(64) } : r));
    expect(walk(genesis).problem).toMatchObject({ kind: 'genesis_mismatch', sequence: 1n });
    expect(walk(rows.filter((r) => r.sequence !== 2n)).problem).toMatchObject({
      kind: 'sequence_gap',
      sequence: 2n,
    });
    const duplicated = [at(rows, 0), at(rows, 1), at(rows, 1), at(rows, 2), at(rows, 3)];
    expect(walk(duplicated).problem).toMatchObject({ kind: 'sequence_duplicate', sequence: 2n });
    expect(walk([at(rows, 1)]).problem).toMatchObject({
      kind: 'sequence_gap',
      sequence: 1n,
    });
  });

  it('checks the chain against a checkpoint: matched, mismatched, or beyond the head', () => {
    const matched = walk(rows, { sequence: 3n, hash: rows[2]?.hash ?? '' });
    expect(matched.ok).toBe(true);
    expect(matched.checkpoint.status).toBe('matched');
    const mismatched = walk(rows, { sequence: 3n, hash: 'b'.repeat(64) });
    expect(mismatched.problem).toMatchObject({ kind: 'checkpoint_hash_mismatch', sequence: 3n });
    expect(mismatched.checkpoint.status).toBe('mismatched');
    const truncated = walk(rows.slice(0, 2), { sequence: 3n, hash: rows[2]?.hash ?? '' });
    expect(truncated.problem).toMatchObject({ kind: 'checkpoint_beyond_head', sequence: 3n });
    expect(truncated.checkpoint.status).toBe('beyond_head');
    // A checkpoint of an empty chain is matched by any chain; a wrong genesis is not.
    expect(walk(rows, { sequence: 0n, hash: GENESIS_HASH }).checkpoint.status).toBe('matched');
    expect(walk([], { sequence: 0n, hash: GENESIS_HASH }).ok).toBe(true);
    expect(walk([], { sequence: 0n, hash: 'c'.repeat(64) }).problem).toMatchObject({
      kind: 'checkpoint_hash_mismatch',
      sequence: 0n,
    });
    expect(walk(rows, null).checkpoint).toEqual({ status: 'none', target: null });
  });

  it('stops at the first problem and ignores rows fed afterwards', () => {
    const walker = new ChainWalker();
    expect(walker.step(at(rows, 0))).toBe(true);
    expect(walker.step(at(rows, 2))).toBe(false);
    expect(walker.step(at(rows, 1))).toBe(false);
    expect(walker.finish().problem).toMatchObject({ kind: 'sequence_gap', sequence: 2n });
  });
});
