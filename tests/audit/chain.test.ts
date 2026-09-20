import { randomUUID } from 'node:crypto';

import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { rollbackOnly, type LedgerStore } from '../../db/ledger/connection.js';
import {
  AuditService,
  auditEventHash,
  GENESIS_HASH,
  readChainRows,
  verifyChain,
  type ChainVerificationReport,
} from '../../src/modules/audit/index.js';
import { FilesystemObjectStore } from '../../src/platform/adapters/dev/index.js';
import type { TransactionScope } from '../../src/platform/ports/index.js';

import {
  connectAs,
  forgedInsert,
  HEAD_SQL,
  requireAuditEnv,
  sampleEvent,
  SavepointStore,
  type HeadRowText,
} from './support.js';

const env = requireAuditEnv();
const instance = {
  instanceId: env['PROVIDER_MESH_INSTANCE_ID'] ?? '',
  environment: env['PROVIDER_MESH_ENVIRONMENT'] ?? '',
};

async function head(scope: TransactionScope): Promise<HeadRowText | null> {
  return (await scope.query<HeadRowText>({ text: HEAD_SQL })).rows[0] ?? null;
}

/** Appends `n` synthetic events through the Audit Service over the caller's scope. */
async function appendSynthetic(scope: TransactionScope, n: number): Promise<void> {
  const service = new AuditService(
    new SavepointStore(scope),
    new FilesystemObjectStore('/nonexistent'),
    instance,
  );
  for (let i = 0; i < n; i += 1) {
    await service.append(
      sampleEvent({
        correlationId: `corr-${String(i)}`,
        // Values that exercise the serialization: quotes, backslash, unicode, microseconds.
        targetId: i === 1 ? 'x"y\\z/é€ — synthetic' : `synthetic-target-${String(i)}`,
        occurredAt: i === 1 ? '2026-09-20T12:34:56.001Z' : '2026-09-20T12:34:56.789Z',
        subjectScope: i === 2 ? { absent: 'unknown' } : 'org:synthetic-org-01',
      }),
    );
  }
}

async function verifyHere(
  scope: TransactionScope,
  checkpoint?: { sequence: bigint; hash: string },
): Promise<ChainVerificationReport> {
  return verifyChain(scope, { checkpoint: checkpoint ?? null, batchSize: 2 });
}

describe('the trigger-computed hash chain (§5.5 rule 1, A14)', () => {
  let writer: LedgerStore;
  let writer2: LedgerStore;
  let migrate: LedgerStore;
  beforeAll(async () => {
    writer = await connectAs(env, 'writer');
    writer2 = await connectAs(env, 'writer');
    migrate = await connectAs(env, 'migrate');
  });
  afterAll(async () => {
    await Promise.allSettled([writer.close(), writer2.close(), migrate.close()]);
  });

  it('overwrites a client-supplied sequence, prev_hash, hash, and recorded_at, so a forged position never lands', async () => {
    const outcome = await rollbackOnly(writer, async (scope) => {
      const before = await head(scope);
      const eventId = randomUUID();
      await scope.query(forgedInsert(eventId, 999_999, 'f'.repeat(64)));
      const after = await head(scope);
      return { before, after, eventId };
    });
    const expectedSequence = outcome.before === null ? 1n : BigInt(outcome.before.sequence) + 1n;
    expect(outcome.after).not.toBeNull();
    expect(BigInt(outcome.after?.sequence ?? '0')).toBe(expectedSequence);
    expect(outcome.after?.hash).toMatch(/^[0-9a-f]{64}$/);
    expect(outcome.after?.hash).not.toBe('f'.repeat(64));
    expect(outcome.after?.event_id).toBe(outcome.eventId);
  });

  it('serializes concurrent appends on the advisory lock: the second waits for the first to end', async () => {
    let releaseFirst: () => void = () => undefined;
    const firstHolds = new Promise<void>((resolve) => {
      releaseFirst = resolve;
    });
    let firstHead: HeadRowText | null = null;
    const first = rollbackOnly(writer, async (scope) => {
      await scope.query(forgedInsert(randomUUID(), 1, 'a'.repeat(64)));
      firstHead = await head(scope);
      await firstHolds;
    });
    // Give the first transaction time to take the lock before the second tries.
    await new Promise((resolve) => setTimeout(resolve, 150));
    let secondDone = false;
    const second = rollbackOnly(writer2, async (scope) => {
      await scope.query(forgedInsert(randomUUID(), 1, 'b'.repeat(64)));
      secondDone = true;
      return head(scope);
    });
    await new Promise((resolve) => setTimeout(resolve, 300));
    expect(secondDone, 'the second append must block while the first holds the lock').toBe(false);
    releaseFirst();
    await first;
    const secondHead = await second;
    expect(secondDone).toBe(true);
    // The first rolled back, so the second received the very position the first had taken.
    expect(secondHead?.sequence).toBe((firstHead as HeadRowText | null)?.sequence);
  });

  it('links every row to its predecessor and hashes as the TypeScript canonicalization recomputes (rows never persist)', async () => {
    await rollbackOnly(migrate, async (scope) => {
      const start = await head(scope);
      const startSequence = start === null ? 0n : BigInt(start.sequence);
      await appendSynthetic(scope, 3);
      const rows = await readChainRows(scope, startSequence, 10);
      expect(rows).toHaveLength(3);
      let previous = start?.hash ?? GENESIS_HASH;
      for (const [i, row] of rows.entries()) {
        expect(row.sequence).toBe(startSequence + BigInt(i) + 1n);
        expect(row.prev_hash).toBe(previous);
        expect(auditEventHash(row)).toBe(row.hash);
        previous = row.hash;
      }
      // The store's own function agrees with the stored hash and with TypeScript.
      const sql = await scope.query<{ ok: boolean }>({
        text: 'SELECT bool_and(hash = audit_event_hash(audit_event.*)) AS ok FROM audit_event',
      });
      expect(sql.rows[0]?.ok).toBe(true);
      const report = await verifyHere(scope);
      expect(report.problem).toBeNull();
      expect(report.ok).toBe(true);
      expect(report.rows).toBe(startSequence + 3n);
      expect(report.head?.hash).toBe(previous);
    });
  });

  it('audit:verify detects a row altered afterwards, a gap, and a duplicate (altered as mesh_migrate, rolled back)', async () => {
    await rollbackOnly(migrate, async (scope) => {
      const start = await head(scope);
      const base = start === null ? 0n : BigInt(start.sequence);
      await appendSynthetic(scope, 3);
      const target = (base + 2n).toString();
      // The owner must first switch off the append-only trigger — the act of a tampering
      // administrator — which is exactly what independent recomputation must catch.
      await scope.query({ text: 'ALTER TABLE audit_event DISABLE TRIGGER audit_event_immutable' });

      await scope.query({ text: 'SAVEPOINT altered' });
      await scope.query({
        text: `UPDATE audit_event SET operation = 'tampered' WHERE sequence = $1`,
        values: [target],
      });
      const altered = await verifyHere(scope);
      expect(altered.ok).toBe(false);
      expect(altered.problem).toMatchObject({ kind: 'hash_mismatch', sequence: base + 2n });
      expect(altered.problem?.detail).not.toContain('tampered');
      await scope.query({ text: 'ROLLBACK TO SAVEPOINT altered' });

      await scope.query({ text: 'SAVEPOINT gap' });
      await scope.query({ text: 'DELETE FROM audit_event WHERE sequence = $1', values: [target] });
      const gap = await verifyHere(scope);
      expect(gap.problem).toMatchObject({ kind: 'sequence_gap', sequence: base + 2n });
      await scope.query({ text: 'ROLLBACK TO SAVEPOINT gap' });

      await scope.query({ text: 'SAVEPOINT truncated' });
      await scope.query({
        text: 'DELETE FROM audit_event WHERE sequence > $1',
        values: [(base + 1n).toString()],
      });
      const truncated = await verifyHere(scope, { sequence: base + 3n, hash: 'c'.repeat(64) });
      expect(truncated.problem).toMatchObject({
        kind: 'checkpoint_beyond_head',
        sequence: base + 3n,
      });
      await scope.query({ text: 'ROLLBACK TO SAVEPOINT truncated' });

      await scope.query({ text: 'SAVEPOINT duplicate' });
      // A replay: an exact copy of a row, which needs every uniqueness constraint gone first.
      await scope.query({
        text: 'ALTER TABLE audit_event DROP CONSTRAINT audit_event_pkey, DROP CONSTRAINT audit_event_sequence_key, DROP CONSTRAINT audit_event_hash_key',
      });
      await scope.query({ text: 'ALTER TABLE audit_event DISABLE TRIGGER audit_event_chain' });
      await scope.query({
        text: 'INSERT INTO audit_event SELECT * FROM audit_event WHERE sequence = $1',
        values: [target],
      });
      const duplicate = await verifyHere(scope);
      expect(duplicate.problem).toMatchObject({ kind: 'sequence_duplicate', sequence: base + 2n });
      await scope.query({ text: 'ROLLBACK TO SAVEPOINT duplicate' });

      // With the tampering undone, the chain verifies again, checkpoint included.
      const rows = await readChainRows(scope, base, 10);
      const intact = await verifyHere(scope, { sequence: base + 2n, hash: rows[1]?.hash ?? '' });
      expect(intact.ok).toBe(true);
      expect(intact.checkpoint.status).toBe('matched');
      const wrong = await verifyHere(scope, { sequence: base + 2n, hash: 'e'.repeat(64) });
      expect(wrong.problem).toMatchObject({
        kind: 'checkpoint_hash_mismatch',
        sequence: base + 2n,
      });
    });
  });

  it('a prev_hash that does not name the predecessor is reported at that row', async () => {
    await rollbackOnly(migrate, async (scope) => {
      const start = await head(scope);
      const base = start === null ? 0n : BigInt(start.sequence);
      await appendSynthetic(scope, 2);
      await scope.query({ text: 'ALTER TABLE audit_event DISABLE TRIGGER audit_event_immutable' });
      await scope.query({
        text: `UPDATE audit_event SET prev_hash = repeat('9', 64) WHERE sequence = $1`,
        values: [(base + 2n).toString()],
      });
      const report = await verifyHere(scope);
      expect(report.problem).toMatchObject({ kind: 'prev_hash_mismatch', sequence: base + 2n });
    });
  });
});
