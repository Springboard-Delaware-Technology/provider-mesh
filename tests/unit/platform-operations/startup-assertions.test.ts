import { describe, expect, it } from 'vitest';

import {
  runStartupAssertions,
  StartupAssertionError,
} from '../../../src/modules/platform-operations/index.js';
import type { CompiledMigrationSets } from '../../../src/modules/platform-operations/index.js';
import type {
  QueryResult,
  RelationalStore,
  SqlStatement,
  TransactionScope,
} from '../../../src/platform/ports/index.js';

const INSTANCE = '543e37e2-0ffa-4576-8443-e37f1355e421';

interface MarkerRow {
  instance_id: string;
  environment: string;
  database_role: string;
  created_at: string;
}

interface FakeState {
  marker: MarkerRow | null;
  ledger: { filename: string; sha256: string }[] | null;
  reachable: boolean;
}

/** In-memory RelationalStore that answers the exact read statements the assertions issue. */
function fakeStore(state: FakeState, log: SqlStatement[]): RelationalStore {
  const answer = (statement: SqlStatement): unknown[] => {
    log.push(statement);
    const t = statement.text;
    if (t.includes("to_regclass('public.mesh_instance')"))
      return [{ present: state.marker !== null }];
    if (t.startsWith('SELECT instance_id')) return state.marker ? [state.marker] : [];
    if (t.includes("to_regclass('public.migration_ledger')"))
      return [{ present: state.ledger !== null }];
    if (t.startsWith('SELECT filename')) return state.ledger ?? [];
    throw new Error(`unexpected statement: ${t}`);
  };
  const scope: TransactionScope = {
    query: <Row>(statement: SqlStatement): Promise<QueryResult<Row>> => {
      const rows = answer(statement) as Row[];
      return Promise.resolve({ rows, rowCount: rows.length });
    },
  };
  return {
    async transaction<T>(
      _context: unknown,
      work: (scope: TransactionScope) => Promise<T>,
      options?: { readOnly?: boolean },
    ): Promise<T> {
      if (!state.reachable) throw new Error('connect ECONNREFUSED');
      log.push({ text: options?.readOnly === true ? 'BEGIN READ ONLY' : 'BEGIN' });
      const value = await work(scope);
      log.push({ text: 'COMMIT' });
      return value;
    },
    ping(): Promise<void> {
      log.push({ text: 'SELECT 1' });
      return state.reachable
        ? Promise.resolve()
        : Promise.reject(new Error('connect ECONNREFUSED'));
    },
    close(): Promise<void> {
      return Promise.resolve();
    },
  };
}

function marker(role: 'domain' | 'audit'): MarkerRow {
  return { instance_id: INSTANCE, environment: 'ci', database_role: role, created_at: 'x' };
}

function good(role: 'domain' | 'audit'): FakeState {
  return { marker: marker(role), ledger: null, reachable: true };
}

const expected = { instanceId: INSTANCE, environment: 'ci' };

const NONE: CompiledMigrationSets = { domain: [], audit: [] };

async function run(domain: FakeState, audit: FakeState, compiled: CompiledMigrationSets = NONE) {
  const log: SqlStatement[] = [];
  const outcome = await runStartupAssertions({
    domain: fakeStore(domain, log),
    audit: fakeStore(audit, log),
    expected,
    compiledMigrations: compiled,
  }).then(
    (report) => ({ report, error: null }),
    (error: unknown) => ({ report: null, error }),
  );
  return { ...outcome, log };
}

describe('startup assertions (§5.3 rules 3–5, §5.5 rule 5, A09)', () => {
  it('pass when both markers match and the ledger matches the compiled set', async () => {
    const { report, error } = await run(good('domain'), good('audit'));
    expect(error).toBeNull();
    expect(report).toEqual({
      instanceId: INSTANCE,
      environment: 'ci',
      appliedMigrations: { domain: 0, audit: 0 },
    });
  });

  it('issue no write statement and open only READ ONLY transactions', async () => {
    const { log } = await run(good('domain'), good('audit'));
    expect(log.length).toBeGreaterThan(0);
    for (const s of log) {
      expect(s.text).not.toMatch(
        /\b(INSERT|UPDATE|DELETE|TRUNCATE|CREATE|ALTER|DROP|GRANT|REVOKE)\b/i,
      );
    }
    expect(log.filter((s) => s.text === 'BEGIN')).toHaveLength(0);
    expect(log.filter((s) => s.text === 'BEGIN READ ONLY').length).toBeGreaterThan(0);
  });

  it.each([
    [
      'unreachable domain database',
      { ...good('domain'), reachable: false },
      good('audit'),
      'database_unavailable',
    ],
    [
      'absent domain marker',
      { ...good('domain'), marker: null },
      good('audit'),
      'instance_marker_mismatch',
    ],
    [
      'wrong instance id',
      {
        ...good('domain'),
        marker: { ...marker('domain'), instance_id: 'ffffffff-0ffa-4576-8443-e37f1355e421' },
      },
      good('audit'),
      'instance_marker_mismatch',
    ],
    [
      'wrong environment',
      { ...good('domain'), marker: { ...marker('domain'), environment: 'production' } },
      good('audit'),
      'instance_marker_mismatch',
    ],
    [
      'unreachable audit database',
      good('domain'),
      { ...good('audit'), reachable: false },
      'audit_sink_unavailable',
    ],
    [
      'audit marker with the domain role',
      good('domain'),
      good('domain'),
      'instance_marker_mismatch',
    ],
  ])('fail closed on %s', async (_name, domain, audit, code) => {
    const { error } = await run(domain, audit);
    expect(error).toBeInstanceOf(StartupAssertionError);
    expect((error as StartupAssertionError).code).toBe(code);
    expect((error as Error).message).toBe(`startup assertion failed: ${code}`);
  });

  it('fail on a domain ledger that differs from the compiled domain set', async () => {
    const compiled = { domain: [{ filename: '0001_a.sql', sha256: 'aa' }], audit: [] };
    expect((await run(good('domain'), good('audit'), compiled)).error).toMatchObject({
      code: 'migration_ledger_mismatch',
    });
    const applied = { ...good('domain'), ledger: [{ filename: '0001_a.sql', sha256: 'zz' }] };
    expect((await run(applied, good('audit'), compiled)).error).toMatchObject({
      code: 'migration_ledger_mismatch',
    });
    const matching = { ...good('domain'), ledger: compiled.domain };
    expect((await run(matching, good('audit'), compiled)).report).toMatchObject({
      appliedMigrations: { domain: 1, audit: 0 },
    });
  });

  it('fail on an audit ledger that differs from the compiled audit set (§5.4: one ledger per database)', async () => {
    const compiled = {
      domain: [{ filename: '0001_a.sql', sha256: 'aa' }],
      audit: [{ filename: '0001_z.sql', sha256: 'zz' }],
    };
    const domain = { ...good('domain'), ledger: compiled.domain };
    expect((await run(domain, good('audit'), compiled)).error).toMatchObject({
      code: 'migration_ledger_mismatch',
    });
    const stale = { ...good('audit'), ledger: [{ filename: '0001_z.sql', sha256: 'old' }] };
    expect((await run(domain, stale, compiled)).error).toMatchObject({
      code: 'migration_ledger_mismatch',
    });
    const matching = { ...good('audit'), ledger: compiled.audit };
    expect((await run(domain, matching, compiled)).report).toEqual({
      instanceId: INSTANCE,
      environment: 'ci',
      appliedMigrations: { domain: 1, audit: 1 },
    });
  });

  it('read the audit ledger only in a READ ONLY transaction, after the audit marker', async () => {
    const compiled = {
      domain: [{ filename: '0001_a.sql', sha256: 'aa' }],
      audit: [{ filename: '0001_z.sql', sha256: 'zz' }],
    };
    const { log, error } = await run(
      { ...good('domain'), ledger: compiled.domain },
      { ...good('audit'), ledger: compiled.audit },
      compiled,
    );
    expect(error).toBeNull();
    const ledgerReads = log.filter((s) => s.text.startsWith('SELECT filename'));
    expect(ledgerReads).toHaveLength(2);
    expect(log.filter((s) => s.text === 'BEGIN')).toHaveLength(0);
  });
});
