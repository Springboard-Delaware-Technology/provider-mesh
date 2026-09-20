/**
 * Migration commands (Foundation 001 §4.1, §5.4): `db:migrate`, `db:status`, `db:rehearse`,
 * `db:verify`. Runs as `mesh_migrate` through PROVIDER_MESH_MIGRATE_URL and
 * PROVIDER_MESH_AUDIT_MIGRATE_URL, never as the application identity, and never reads any other
 * database variable (A08). Output names files, hashes, roles, and counts; never a connection
 * string or a credential.
 */
import path from 'node:path';

import {
  CONFIG_NAMES,
  ConfigError,
  instanceConfig,
  readRequired,
  type ConfigName,
} from '../../src/app/config.js';
import {
  loadCompiledMigrationSets,
  MigrationSetError,
  type MigrationTarget,
} from '../../src/modules/platform-operations/index.js';
import {
  buildConnectionConfig,
  ConnectionConfigError,
  describeConnection,
} from '../../src/platform/adapters/postgres/index.js';

import { CliUsageError, parseCliArgs, USAGE, type Command } from './cli-args.js';
import { LedgerStore } from './connection.js';
import { EXPECTED_CATALOG } from './expected-catalog.js';
import {
  applyPending,
  inspectLedger,
  MigrationFailedError,
  MigrationStopError,
  preflightTarget,
  type MigrationTargetContext,
} from './runner.js';
import { evaluateCatalog, observeCatalog } from './verify.js';

export const EXIT = { ok: 0, failure: 1, stop: 2 } as const;

const TARGET_VARIABLE: Readonly<Record<MigrationTarget, ConfigName>> = {
  domain: CONFIG_NAMES.migrateUrl,
  audit: CONFIG_NAMES.auditMigrateUrl,
};

const out = (line: string): void => {
  console.log(line);
};
const err = (line: string): void => {
  console.error(line);
};

async function runStatus(ctx: MigrationTargetContext): Promise<number> {
  const { rows, report } = await inspectLedger(ctx);
  out(`  ledger: ${rows === null ? 'absent' : `${String(rows.length)} row(s)`}`);
  for (const a of report.applied) {
    const row = rows?.find((r) => r.filename === a.filename);
    out(
      `  applied   ${a.filename}  ${a.sha256}  at ${row?.applied_at ?? '?'} by ${row?.applied_by ?? '?'}`,
    );
  }
  for (const p of report.pending) out(`  pending   ${p.filename}  ${p.sha256}`);
  for (const m of report.mismatched) {
    out(`  MISMATCH  ${m.filename}  ledger ${m.ledgerSha256}  file ${m.compiledSha256}`);
  }
  for (const u of report.unknown)
    out(`  UNKNOWN   ${u.filename}  ${u.sha256}  (ledger entry without a file)`);
  if (report.mismatched.length > 0 || report.unknown.length > 0) {
    err(
      `  hard stop (Governance §11.4): ${String(report.mismatched.length)} hash mismatch(es), ${String(report.unknown.length)} unexpected ledger entry(ies); applied migrations are immutable`,
    );
    return EXIT.stop;
  }
  if (report.pending.length > 0) {
    out(`  not at head: ${String(report.pending.length)} pending`);
    return EXIT.failure;
  }
  out(`  at head: ${String(report.applied.length)} applied, zero pending, zero mismatches`);
  return EXIT.ok;
}

async function runApply(ctx: MigrationTargetContext, rehearse: boolean): Promise<number> {
  const outcome = await applyPending(ctx, { rehearse });
  const verb = rehearse ? 'rehearsed' : 'applied  ';
  for (const a of outcome.applied) {
    out(
      `  ${verb} ${a.filename}  ${a.sha256}  catalog ${a.catalogSha256}  at ${a.appliedAt} by ${a.appliedBy}`,
    );
  }
  const presence = (p: boolean): string => (p ? 'present' : 'absent');
  if (rehearse) {
    out(
      `  rolled back ${String(outcome.applied.length)} migration(s); ledger ${presence(outcome.before.ledgerPresent)} -> ${presence(outcome.after.ledgerPresent)}; catalog ${outcome.before.catalogSha256} -> ${outcome.after.catalogSha256} (unchanged)`,
    );
  } else {
    out(
      `  at head: ${String(outcome.applied.length)} applied in this run; ledger ${presence(outcome.after.ledgerPresent)}; catalog ${outcome.after.catalogSha256} verified against the ledger head`,
    );
  }
  return EXIT.ok;
}

async function runVerify(ctx: MigrationTargetContext): Promise<number> {
  const expected = EXPECTED_CATALOG[ctx.target];
  const observed = await ctx.store.transaction(null, (scope) => observeCatalog(scope, expected), {
    readOnly: true,
  });
  const report = evaluateCatalog(observed, expected, ctx.compiled);
  for (const c of report.checks) out(`  ${c.ok ? 'ok  ' : 'FAIL'}  ${c.name}: ${c.detail}`);
  if (!report.passed) {
    err(`  verification failed: ${String(report.checks.filter((c) => !c.ok).length)} check(s)`);
    return EXIT.stop;
  }
  out(`  verified: ${String(report.checks.length)} checks passed`);
  return EXIT.ok;
}

async function runTarget(command: Command, ctx: MigrationTargetContext): Promise<number> {
  const preflight = await preflightTarget(ctx);
  out(
    `  identity: instance ${preflight.marker.instanceId} environment ${preflight.marker.environment} role ${ctx.target} matched; connected as ${preflight.role}`,
  );
  switch (command) {
    case 'status':
      return runStatus(ctx);
    case 'migrate':
      return runApply(ctx, false);
    case 'rehearse':
      return runApply(ctx, true);
    case 'verify':
      return runVerify(ctx);
  }
}

async function main(argv: readonly string[]): Promise<number> {
  const args = parseCliArgs(argv);
  const env = process.env;
  const expected = instanceConfig(env);
  const root = args.migrationsRoot ?? path.resolve(process.cwd(), 'db', 'migrations');
  const sets = await loadCompiledMigrationSets(root);
  let exit: number = EXIT.ok;
  for (const target of args.targets) {
    const variable = TARGET_VARIABLE[target];
    const config = buildConnectionConfig(variable, readRequired(env, variable));
    out(`db:${args.command} ${target} (${describeConnection(config)})`);
    const store = await LedgerStore.connect(config);
    try {
      const ctx: MigrationTargetContext = {
        target,
        store,
        compiled: sets[target],
        directory: path.join(root, target),
        expected,
      };
      exit = Math.max(exit, await runTarget(args.command, ctx));
    } finally {
      await store.close();
    }
    if (exit === EXIT.stop) break;
  }
  out(
    `db:${args.command}: ${exit === EXIT.ok ? 'ok' : exit === EXIT.stop ? 'HARD STOP' : 'not ok'} (exit ${String(exit)})`,
  );
  return exit;
}

function describe(error: unknown): { readonly line: string; readonly exit: number } {
  if (error instanceof CliUsageError)
    return { line: `${error.message}\n${USAGE}`, exit: EXIT.failure };
  if (error instanceof MigrationStopError) {
    return {
      line: `HARD STOP (Governance §11.4): ${error.code}: ${error.detail}`,
      exit: EXIT.stop,
    };
  }
  if (error instanceof MigrationFailedError) {
    const cause = error.cause;
    const reason =
      cause instanceof Error
        ? `${cause.message}${'code' in cause && typeof cause.code === 'string' ? ` [${cause.code}]` : ''}`
        : 'unknown cause';
    return {
      line: `${error.message}: ${reason}; the ledger is unchanged`,
      exit: EXIT.failure,
    };
  }
  if (
    error instanceof ConfigError ||
    error instanceof ConnectionConfigError ||
    error instanceof MigrationSetError
  ) {
    return { line: error.message, exit: EXIT.failure };
  }
  if (error instanceof Error) {
    return { line: `${error.name}: ${error.message}`, exit: EXIT.failure };
  }
  return { line: 'failed', exit: EXIT.failure };
}

main(process.argv.slice(2)).then(
  (code) => {
    process.exitCode = code;
  },
  (error: unknown) => {
    const { line, exit } = describe(error);
    err(`db/ledger: ${line}`);
    process.exitCode = exit;
  },
);
