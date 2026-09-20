import { mkdtemp } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';

import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { rollbackOnly, type LedgerStore } from '../../db/ledger/connection.js';
import {
  AuditAppendError,
  AuditService,
  latestCheckpointKey,
  parseCheckpoint,
  readChainRows,
  verifyChain,
} from '../../src/modules/audit/index.js';
import { FilesystemObjectStore } from '../../src/platform/adapters/dev/index.js';
import type { TransactionScope } from '../../src/platform/ports/index.js';

import {
  connectAs,
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

async function objects(): Promise<FilesystemObjectStore> {
  return new FilesystemObjectStore(await mkdtemp(path.join(tmpdir(), 'pm-audit-objects-')));
}

async function headOf(scope: TransactionScope): Promise<HeadRowText | null> {
  return (await scope.query<HeadRowText>({ text: HEAD_SQL })).rows[0] ?? null;
}

describe('Audit Service as the writer identity (§5.5, AuditSink contract A28)', () => {
  let writer: LedgerStore;
  beforeAll(async () => {
    writer = await connectAs(env, 'writer');
  });
  afterAll(async () => {
    await writer.close();
  });

  it('appends content columns only and reports the position the store assigned', async () => {
    await rollbackOnly(writer, async (scope) => {
      const service = new AuditService(new SavepointStore(scope), await objects(), instance);
      const before = await service.chainHead();
      const first = await service.append(sampleEvent());
      const second = await service.append(sampleEvent());
      expect(first.sequence).toBe((before?.sequence ?? 0) + 1);
      expect(second.sequence).toBe(first.sequence + 1);
      expect(first.hash).toMatch(/^[0-9a-f]{64}$/);
      expect(second.hash).not.toBe(first.hash);
      expect(await service.chainHead()).toEqual(second);
    });
  });

  it('refuses an invalid event by field name, without carrying the value, before any statement', async () => {
    await rollbackOnly(writer, async (scope) => {
      const statements: string[] = [];
      const store = new SavepointStore(scope);
      const service = new AuditService(
        {
          transaction: (context, work, options) =>
            store.transaction(
              context,
              (inner) =>
                work({
                  query: (statement) => {
                    statements.push(statement.text);
                    return inner.query(statement);
                  },
                }),
              options,
            ),
          ping: () => store.ping(),
          close: () => store.close(),
        },
        await objects(),
        instance,
      );
      const failure = await service
        .append(sampleEvent({ operation: 'has space and a secret-looking value' }))
        .then(
          () => null,
          (error: unknown) => error,
        );
      expect(failure).toBeInstanceOf(AuditAppendError);
      expect((failure as AuditAppendError).code).toBe('invalid_event');
      expect((failure as AuditAppendError).field).toBe('operation');
      expect((failure as Error).message).not.toContain('secret-looking');
      expect(statements).toEqual([]);
      // A bare null is not an event: the type forbids it, and the store would too.
      const bare = await service
        .append({ ...sampleEvent(), actorId: null as unknown as string })
        .then(
          () => null,
          (error: unknown) => error,
        );
      expect((bare as AuditAppendError).code).toBe('invalid_event');
    });
  });

  it('exports a checkpoint through the object-store port, readable back, and records the export (A15)', async () => {
    await rollbackOnly(writer, async (scope) => {
      const store = await objects();
      const service = new AuditService(new SavepointStore(scope), store, instance);
      const appended = await service.append(sampleEvent());
      const checkpoint = await service.exportCheckpoint('test:verifier');
      expect(checkpoint).toMatchObject({
        sequence: appended.sequence,
        hash: appended.hash,
        verifierIdentity: 'test:verifier',
      });
      expect(Date.parse(checkpoint.verifiedAt)).not.toBeNaN();
      const latest = await store.get(latestCheckpointKey(instance.instanceId));
      expect(latest).not.toBeNull();
      expect(parseCheckpoint(latest?.bytes ?? new Uint8Array(), instance.instanceId)).toEqual({
        version: 1,
        ...instance,
        sequence: appended.sequence,
        hash: appended.hash,
        verifiedAt: checkpoint.verifiedAt,
        verifierIdentity: 'test:verifier',
      });
      // The export itself is the next event of the chain.
      const head = await headOf(scope);
      expect(Number(head?.sequence)).toBe(appended.sequence + 1);
      // A second export names the first checkpoint's hash as the version before it.
      const again = await service.exportCheckpoint('test:verifier');
      expect(again.sequence).toBe(appended.sequence + 1);
    });
  });
});

describe('what the Audit Service writes, read back as the owner (rolled back)', () => {
  let migrate: LedgerStore;
  beforeAll(async () => {
    migrate = await connectAs(env, 'migrate');
  });
  afterAll(async () => {
    await migrate.close();
  });

  it('maps every field and absence reason to its column pair, and the checkpoint event carries the receipt', async () => {
    await rollbackOnly(migrate, async (scope) => {
      const store = await objects();
      const service = new AuditService(new SavepointStore(scope), store, instance, {
        originChannel: 'test',
      });
      const start = await headOf(scope);
      const base = start === null ? 0n : BigInt(start.sequence);
      const event = sampleEvent({
        eventId: '0f0f0f0f-0f0f-4f0f-8f0f-0f0f0f0f0f0f',
        externalTime: '2026-09-19T08:00:00Z',
      });
      const appended = await service.append(event);
      const [row] = await readChainRows(scope, base, 1);
      expect(row).toMatchObject({
        event_id: event.eventId,
        event_type: 'test.synthetic',
        schema_version: 1,
        causation_id: null,
        causation_id_absent: 'not_applicable',
        actor_id: 'synthetic-actor-01',
        actor_id_absent: null,
        actor_kind: 'service',
        represented_unit_id: null,
        represented_unit_id_absent: 'unknown',
        represented_capacity: 'navigator',
        occurred_at: '2026-09-20T12:34:56.789000Z',
        external_time: '2026-09-19T08:00:00.000000Z',
        external_time_absent: null,
        time_uncertainty: 'observed',
        authority_refs: ['synthetic-authority-01', 'synthetic-authority-02'],
        authority_refs_absent: null,
        purpose: 'test',
        result: 'completed',
        before_version: '2',
        after_version: '3',
        origin_channel: 'test',
        retention_class: 'foundation',
        sequence: base + 1n,
        hash: appended.hash,
      });
      expect(row?.recorded_at).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{6}Z$/);

      const checkpoint = await service.exportCheckpoint('test:verifier');
      const latest = await store.head(latestCheckpointKey(instance.instanceId));
      const [exportRow] = await readChainRows(scope, base + 1n, 1);
      expect(exportRow).toMatchObject({
        event_type: 'audit.checkpoint_export',
        operation: 'export_checkpoint',
        actor_kind: 'service',
        actor_id: 'test:verifier',
        target_type: 'audit_chain',
        target_version: String(checkpoint.sequence),
        after_version: checkpoint.hash,
        before_version: null,
        before_version_absent: 'not_applicable',
        external_receipt: `sha256:${latest?.contentSha256 ?? ''}`,
        origin_channel: 'test',
        purpose: 'platform_operation',
        represented_capacity: 'platform',
      });
      expect(exportRow?.destination_ref).toMatch(
        /^audit-checkpoints\/[0-9a-f-]{36}\/\d{8}T\d{9}Z-\d{12}\.json$/,
      );

      const report = await verifyChain(scope, {
        checkpoint: { sequence: BigInt(checkpoint.sequence), hash: checkpoint.hash },
      });
      expect(report.ok).toBe(true);
      expect(report.checkpoint.status).toBe('matched');
    });
  });
});
