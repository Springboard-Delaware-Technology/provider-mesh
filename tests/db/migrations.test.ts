import { execFileSync } from 'node:child_process';
import { realpathSync } from 'node:fs';
import { appendFile } from 'node:fs/promises';
import path from 'node:path';

import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { catalogChecksum } from '../../db/ledger/catalog-checksum.js';
import { LedgerStore, rollbackOnly } from '../../db/ledger/connection.js';
import { EXPECTED_CATALOG } from '../../db/ledger/expected-catalog.js';
import {
  applyPending,
  inspectLedger,
  MigrationFailedError,
  MigrationStopError,
  preflightTarget,
  type MigrationTargetContext,
} from '../../db/ledger/runner.js';
import { evaluateCatalog, observeCatalog } from '../../db/ledger/verify.js';
import { createStores, storeConfigs, type Stores } from '../../src/app/compose.js';
import { instanceConfig } from '../../src/app/config.js';
import {
  loadCompiledMigrationSets,
  MIGRATION_TARGETS,
  type CompiledMigrationSets,
  type MigrationTarget,
} from '../../src/modules/platform-operations/index.js';

import {
  copyMigrationsRoot,
  migrationStoreConfig,
  MIGRATIONS_ROOT,
  requireDatabaseEnv,
} from './support.js';

const env = requireDatabaseEnv();
const expected = instanceConfig(env);
const repoRoot = path.resolve(MIGRATIONS_ROOT, '..', '..');
const tsx = realpathSync(path.join(repoRoot, 'node_modules', '.bin', 'tsx'));

interface CliResult {
  readonly code: number;
  readonly stdout: string;
  readonly stderr: string;
}

/** Runs the real command line as CI does, with the test's own environment. */
function cli(args: readonly string[], overrides: Record<string, string> = {}): CliResult {
  try {
    const stdout = execFileSync(process.execPath, [tsx, 'db/ledger/cli.ts', ...args], {
      cwd: repoRoot,
      env: { ...process.env, ...overrides },
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    return { code: 0, stdout, stderr: '' };
  } catch (error) {
    const failed = error as { status: number | null; stdout: string; stderr: string };
    return { code: failed.status ?? -1, stdout: failed.stdout, stderr: failed.stderr };
  }
}

describe('migration mechanism against the live databases (§5.4)', () => {
  const migrate = new Map<MigrationTarget, LedgerStore>();
  let sets: CompiledMigrationSets;
  let app: Stores;

  beforeAll(async () => {
    sets = await loadCompiledMigrationSets(MIGRATIONS_ROOT);
    for (const target of MIGRATION_TARGETS) {
      migrate.set(target, await LedgerStore.connect(migrationStoreConfig(env, target)));
    }
    app = createStores(storeConfigs(env));
  });
  afterAll(async () => {
    for (const store of migrate.values()) await store.close();
    await app.close();
  });

  function store(target: MigrationTarget): LedgerStore {
    const s = migrate.get(target);
    if (s === undefined) throw new Error(`no migration store for ${target}`);
    return s;
  }

  function ctx(
    target: MigrationTarget,
    over: Partial<Pick<MigrationTargetContext, 'compiled' | 'directory'>> = {},
  ): MigrationTargetContext {
    return {
      target,
      store: store(target),
      compiled: sets[target],
      directory: path.join(MIGRATIONS_ROOT, target),
      expected,
      ...over,
    };
  }

  it.each(MIGRATION_TARGETS)(
    '%s: the connection is mesh_migrate, the marker matches, and the ledger is at head (A05)',
    async (target) => {
      const preflight = await preflightTarget(ctx(target));
      expect(preflight.role).toBe('mesh_migrate');
      expect(preflight.marker.databaseRole).toBe(target);
      const { rows, report } = await inspectLedger(ctx(target));
      expect(report).toMatchObject({ present: true, pending: [], mismatched: [], unknown: [] });
      expect(report.applied.map((a) => a.filename)).toEqual(sets[target].map((m) => m.filename));
      expect(rows?.every((r) => r.applied_by === 'mesh_migrate')).toBe(true);
      expect(rows?.every((r) => /^[0-9a-f]{64}$/.test(r.catalog_sha256))).toBe(true);
    },
  );

  it.each(MIGRATION_TARGETS)(
    '%s: db:verify passes on the migrated database (A06)',
    async (target) => {
      const expectedCatalog = EXPECTED_CATALOG[target];
      const observed = await store(target).transaction(
        null,
        (scope) => observeCatalog(scope, expectedCatalog),
        { readOnly: true },
      );
      const report = evaluateCatalog(observed, expectedCatalog, sets[target]);
      expect(report.checks.filter((c) => !c.ok)).toEqual([]);
      expect(report.passed).toBe(true);
    },
  );

  it('db:migrate at head applies nothing and changes nothing', async () => {
    const outcome = await applyPending(ctx('domain'), { rehearse: false });
    expect(outcome).toMatchObject({ mode: 'apply', applied: [] });
    expect(outcome.after).toEqual(outcome.before);
    expect(outcome.after.ledgerPresent).toBe(true);
  });

  it('db:rehearse applies a synthetic extra migration in a rollback and leaves nothing behind (A04)', async () => {
    const root = await copyMigrationsRoot({
      target: 'domain',
      filename: '9999_rehearsal_probe.sql',
      content: 'CREATE TABLE rehearsal_probe (id integer PRIMARY KEY);\n',
    });
    const compiled = (await loadCompiledMigrationSets(root)).domain;
    const outcome = await applyPending(
      ctx('domain', { compiled, directory: path.join(root, 'domain') }),
      { rehearse: true },
    );
    expect(outcome.mode).toBe('rehearse');
    expect(outcome.applied.map((a) => a.filename)).toEqual(['9999_rehearsal_probe.sql']);
    expect(outcome.applied[0]?.appliedBy).toBe('mesh_migrate');
    // Inside the transaction the catalog had changed; after the rollback it is what it was.
    expect(outcome.applied[0]?.catalogSha256).not.toBe(outcome.before.catalogSha256);
    expect(outcome.after).toEqual(outcome.before);

    const residue = await store('domain').transaction(
      null,
      async (scope) => ({
        table: (
          await scope.query<{ present: boolean }>({
            text: "SELECT to_regclass('public.rehearsal_probe') IS NOT NULL AS present",
          })
        ).rows[0]?.present,
        row: (
          await scope.query<{ n: number }>({
            text: "SELECT count(*)::int AS n FROM migration_ledger WHERE filename = '9999_rehearsal_probe.sql'",
          })
        ).rows[0]?.n,
        catalog: await catalogChecksum(scope),
      }),
      { readOnly: true },
    );
    expect(residue).toEqual({ table: false, row: 0, catalog: outcome.before.catalogSha256 });
  });

  it('a failing migration file is rolled back, reported by name, and leaves the ledger unchanged', async () => {
    const root = await copyMigrationsRoot({
      target: 'audit',
      filename: '9999_broken.sql',
      content: 'CREATE TABLE broken (\n',
    });
    const compiled = (await loadCompiledMigrationSets(root)).audit;
    const broken = ctx('audit', { compiled, directory: path.join(root, 'audit') });
    for (const rehearse of [true, false]) {
      const failure = await applyPending(broken, { rehearse }).then(
        () => null,
        (error: unknown) => error,
      );
      expect(failure).toBeInstanceOf(MigrationFailedError);
      expect((failure as MigrationFailedError).filename).toBe('9999_broken.sql');
    }
    const { report } = await inspectLedger(ctx('audit'));
    expect(report).toMatchObject({ pending: [], mismatched: [], unknown: [] });
  });

  it('an applied migration whose bytes changed is a hard stop for db:status and db:migrate (A05, on a copy)', async () => {
    const root = await copyMigrationsRoot();
    await appendFile(
      path.join(root, 'domain', '0001_migration_ledger.sql'),
      '\n-- altered after application (synthetic)\n',
    );
    const altered = (await loadCompiledMigrationSets(root)).domain;
    const alteredCtx = ctx('domain', { compiled: altered, directory: path.join(root, 'domain') });

    const { report } = await inspectLedger(alteredCtx);
    expect(report.mismatched.map((m) => m.filename)).toEqual(['0001_migration_ledger.sql']);
    expect(report.mismatched[0]?.ledgerSha256).toBe(sets.domain[0]?.sha256);
    expect(report.mismatched[0]?.compiledSha256).toBe(altered[0]?.sha256);

    for (const rehearse of [true, false]) {
      await expect(applyPending(alteredCtx, { rehearse })).rejects.toMatchObject({
        name: 'MigrationStopError',
        code: 'ledger_integrity',
      });
    }

    const status = cli(['status', '--migrations', root]);
    expect(status.code).toBe(2);
    expect(status.stdout).toMatch(/MISMATCH\s+0001_migration_ledger\.sql/);
    expect(status.stderr).toMatch(/hard stop/);
  });

  it('the command line: status and verify exit 0 at head; a wrong instance id is a hard stop', () => {
    const status = cli(['status']);
    expect(status.code, status.stderr).toBe(0);
    expect(status.stdout).toMatch(/db:status domain/);
    expect(status.stdout).toMatch(/db:status audit/);
    expect(status.stdout).toMatch(/at head: \d+ applied, zero pending, zero mismatches/);
    expect(status.stdout).not.toMatch(/postgres(ql)?:\/\//);

    const verify = cli(['verify', '--database', 'audit']);
    expect(verify.code, verify.stderr).toBe(0);
    expect(verify.stdout).toMatch(/verified: \d+ checks passed/);
    expect(verify.stdout).not.toMatch(/FAIL/);

    const rehearse = cli(['rehearse', '--database', 'domain']);
    expect(rehearse.code, rehearse.stderr).toBe(0);
    expect(rehearse.stdout).toMatch(/rolled back 0 migration\(s\)/);

    const wrong = cli(['status'], {
      PROVIDER_MESH_INSTANCE_ID: '00000000-0000-4000-8000-000000000000',
    });
    expect(wrong.code).toBe(2);
    expect(wrong.stderr).toMatch(/HARD STOP .*identity_mismatch/);
  });

  it('ledger rows are immutable even for mesh_migrate (§1.4 invariant 7)', async () => {
    for (const text of [
      "UPDATE migration_ledger SET sha256 = repeat('0', 64)",
      'DELETE FROM migration_ledger',
      'TRUNCATE migration_ledger',
    ]) {
      await expect(rollbackOnly(store('domain'), (scope) => scope.query({ text }))).rejects.toThrow(
        /immutable/,
      );
    }
  });

  it('the application identities read their ledger and can write nothing to it (§5.2)', async () => {
    const count = await app.domain.transaction(
      null,
      async (scope) =>
        (
          await scope.query<{ n: number }>({
            text: 'SELECT count(*)::int AS n FROM migration_ledger',
          })
        ).rows[0]?.n,
      { readOnly: true },
    );
    expect(count).toBe(sets.domain.length);
    for (const text of [
      "INSERT INTO migration_ledger (filename, sha256, catalog_sha256) VALUES ('9999_x.sql', repeat('0', 64), repeat('0', 64))",
      "UPDATE migration_ledger SET sha256 = repeat('0', 64)",
      'DELETE FROM migration_ledger',
      'TRUNCATE migration_ledger',
    ]) {
      await expect(app.domain.transaction(null, (scope) => scope.query({ text }))).rejects.toThrow(
        /permission denied/,
      );
    }
    const auditCount = await app.audit.transaction(
      null,
      async (scope) =>
        (
          await scope.query<{ n: number }>({
            text: 'SELECT count(*)::int AS n FROM migration_ledger',
          })
        ).rows[0]?.n,
      { readOnly: true },
    );
    expect(auditCount).toBe(sets.audit.length);
    await expect(
      app.audit.transaction(null, (scope) =>
        scope.query({
          text: "INSERT INTO migration_ledger (filename, sha256, catalog_sha256) VALUES ('9999_x.sql', repeat('0', 64), repeat('0', 64))",
        }),
      ),
    ).rejects.toThrow(/permission denied/);
  });

  it('db:verify detects an object created outside a migration (inside a rolled-back transaction)', async () => {
    const expectedCatalog = EXPECTED_CATALOG.domain;
    const report = await rollbackOnly(store('domain'), async (scope) => {
      await scope.query({ text: 'CREATE TABLE stray_object (id integer)' });
      return evaluateCatalog(
        await observeCatalog(scope, expectedCatalog),
        expectedCatalog,
        sets.domain,
      );
    });
    expect(report.passed).toBe(false);
    expect(report.checks.filter((c) => !c.ok).map((c) => c.name)).toEqual([
      'catalog.checksum',
      'tables.exact',
    ]);
    expect(report.checks.find((c) => c.name === 'tables.exact')?.detail).toBe(
      'unexpected: stray_object',
    );
  });

  it('the migration store binds no compartment context and its preflight refuses a foreign identity', async () => {
    await expect(
      store('domain').transaction(
        { actorId: 'a', personIds: [], orgIds: [], collabIds: [], purpose: 'p', capacity: null },
        () => Promise.resolve(),
      ),
    ).rejects.toThrow(/no compartment context/);
    await expect(
      preflightTarget({ ...ctx('audit'), expected: { ...expected, environment: 'production' } }),
    ).rejects.toMatchObject({ name: 'MigrationStopError', code: 'identity_mismatch' });
    expect(new MigrationStopError('wrong_role', 'x').message).toBe(
      'migration hard stop: wrong_role (x)',
    );
  });
});
