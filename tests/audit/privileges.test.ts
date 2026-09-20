import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { LedgerStore, rollbackOnly } from '../../db/ledger/connection.js';
import { CONFIG_NAMES } from '../../src/app/config.js';
import { HASHED_COLUMNS } from '../../src/modules/audit/index.js';
import { buildConnectionConfig } from '../../src/platform/adapters/postgres/index.js';

import { connectAs, forgedInsert, requireAuditEnv, ROLE_NAME } from './support.js';

const env = requireAuditEnv();

/** SEC-AUD-02 field groups → the columns that carry them (A13). */
const FIELD_GROUPS: Readonly<Record<string, readonly string[]>> = {
  'event identity': ['event_id', 'event_type', 'schema_version', 'correlation_id', 'causation_id'],
  actor: [
    'actor_id',
    'actor_kind',
    'delegating_actor_id',
    'represented_org_id',
    'represented_unit_id',
    'represented_capacity',
  ],
  time: ['occurred_at', 'recorded_at', 'external_time', 'time_uncertainty'],
  'action and target': [
    'operation',
    'target_type',
    'target_id',
    'target_version',
    'subject_scope',
    'destination_ref',
  ],
  authority: ['authorization_decision_id', 'authority_refs', 'policy_version', 'purpose'],
  execution: ['result', 'reason_code', 'before_version', 'after_version', 'external_receipt'],
  accountability: ['review_ref', 'origin_channel', 'retention_class'],
  integrity: ['sequence', 'prev_hash', 'hash'],
};

describe('audit store privileges (§5.2, §5.5 rule 2, A13)', () => {
  let writer: LedgerStore;
  let reader: LedgerStore;
  let migrate: LedgerStore;
  beforeAll(async () => {
    writer = await connectAs(env, 'writer');
    reader = await connectAs(env, 'reader');
    migrate = await connectAs(env, 'migrate');
  });
  afterAll(async () => {
    await Promise.allSettled([writer.close(), reader.close(), migrate.close()]);
  });

  it('the domain identity cannot even connect to the audit database', async () => {
    const domain = buildConnectionConfig(
      CONFIG_NAMES.databaseUrl,
      env[CONFIG_NAMES.databaseUrl] ?? '',
    );
    expect(domain.user).toBe('mesh_app');
    const denied = await LedgerStore.connect({ ...domain, database: 'provider_mesh_audit' }).then(
      async (store) => {
        await store.close();
        return null;
      },
      (error: unknown) => error,
    );
    expect(denied).toBeInstanceOf(Error);
    expect((denied as Error).message).toMatch(/permission denied|database/);
    const privilege = await reader.transaction(
      null,
      async (scope) =>
        (
          await scope.query<{ can: boolean }>({
            text: "SELECT has_database_privilege('mesh_app', current_database(), 'CONNECT') AS can",
          })
        ).rows[0]?.can,
      { readOnly: true },
    );
    expect(privilege).toBe(false);
  });

  it('audit_event carries every SEC-AUD-02 field group, and nothing the hash does not cover', async () => {
    const columns = await reader.transaction(
      null,
      async (scope) =>
        (
          await scope.query<{ column_name: string }>({
            text: "SELECT column_name FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'audit_event' ORDER BY column_name",
          })
        ).rows.map((r) => r.column_name),
      { readOnly: true },
    );
    for (const [group, names] of Object.entries(FIELD_GROUPS)) {
      for (const name of names) expect(columns, `${group}: ${name}`).toContain(name);
    }
    expect(columns).toEqual([...HASHED_COLUMNS, 'hash'].sort());
  });

  it('mesh_audit_writer may insert and read the head, and nothing else', async () => {
    const inserted = await rollbackOnly(writer, async (scope) => {
      await scope.query(forgedInsert('00000000-0000-4000-8000-00000000a13a', 999, 'f'.repeat(64)));
      return (
        await scope.query<{ n: string }>({
          text: 'SELECT count(*)::text AS n FROM audit_chain_head',
        })
      ).rows[0]?.n;
    });
    expect(inserted).toBe('1');
    for (const text of [
      'SELECT count(*) FROM audit_event',
      "UPDATE audit_event SET operation = 'x'",
      'DELETE FROM audit_event',
      'TRUNCATE audit_event',
    ]) {
      await expect(rollbackOnly(writer, (scope) => scope.query({ text }))).rejects.toThrow(
        /permission denied/,
      );
    }
  });

  it('mesh_audit_reader may read, and nothing else', async () => {
    await rollbackOnly(reader, async (scope) => {
      await scope.query({ text: 'SELECT count(*) FROM audit_event' });
      await scope.query({ text: 'SELECT * FROM audit_chain_head' });
    });
    for (const text of [
      "INSERT INTO audit_event (event_id) VALUES ('00000000-0000-4000-8000-00000000a13b')",
      "UPDATE audit_event SET operation = 'x'",
      'DELETE FROM audit_event',
      'TRUNCATE audit_event',
    ]) {
      await expect(rollbackOnly(reader, (scope) => scope.query({ text }))).rejects.toThrow(
        /permission denied/,
      );
    }
  });

  it('even the owner cannot update, delete, or truncate: the table is append-only', async () => {
    for (const text of [
      "UPDATE audit_event SET operation = 'x'",
      'DELETE FROM audit_event',
      'TRUNCATE audit_event',
    ]) {
      await expect(rollbackOnly(migrate, (scope) => scope.query({ text }))).rejects.toThrow(
        /append-only/,
      );
    }
  });

  it('the chain function is SECURITY DEFINER and owned by mesh_migrate; no other function is', async () => {
    const functions = await reader.transaction(
      null,
      async (scope) =>
        (
          await scope.query<{ name: string; definer: boolean; owner: string }>({
            text: `SELECT p.proname AS name, p.prosecdef AS definer, r.rolname AS owner
                     FROM pg_proc p JOIN pg_roles r ON r.oid = p.proowner
                    WHERE p.pronamespace = 'public'::regnamespace ORDER BY p.proname`,
          })
        ).rows,
      { readOnly: true },
    );
    expect(functions.filter((f) => f.definer).map((f) => f.name)).toEqual(['audit_event_chain']);
    expect(functions.every((f) => f.owner === ROLE_NAME.migrate)).toBe(true);
    const direct = await rollbackOnly(writer, (scope) =>
      scope.query({ text: 'SELECT audit_event_chain()' }),
    ).then(
      () => null,
      (error: unknown) => (error as Error).message,
    );
    expect(direct).toMatch(/permission denied|trigger/);
  });
});
