import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import path from 'node:path';

import {
  compareIdentity,
  describeLedger,
  readInstanceMarker,
  type CompiledMigration,
  type InstanceMarker,
  type LedgerReport,
  type MigrationTarget,
} from '../../src/modules/platform-operations/index.js';
import type { RelationalStore, TransactionScope } from '../../src/platform/ports/index.js';

import { catalogChecksum } from './catalog-checksum.js';
import { rollbackOnly, TransactionStateUnknownError } from './connection.js';
import {
  ledgerHead,
  ledgerPresent,
  readLedgerRows,
  toLedgerState,
  type LedgerRow,
} from './ledger-rows.js';

/**
 * The migration runner (Foundation 001 §5.4; Governance §12.4; `replit.md` §9).
 *
 * Before touching anything it confirms the connection is `mesh_migrate` and that the database's
 * instance marker is the one the configuration names, so a verifier or migration can never run
 * against an unintended database. It refuses to apply on top of a ledger with a hash mismatch or
 * an unexpected entry. Each pending file is applied inside its own transaction — advisory lock,
 * `search_path`, the file's statements, the catalog checksum, the ledger row — and a rehearsal
 * runs the whole pending set inside one transaction that always rolls back. After applying, it
 * re-reads the ledger and recomputes the catalog checksum to confirm the head.
 */
export const MIGRATION_ROLE = 'mesh_migrate';
const LEDGER_LOCK = "SELECT pg_advisory_xact_lock(hashtext('provider_mesh.migration_ledger'))";

export type MigrationStopCode =
  | 'wrong_role'
  | 'identity_mismatch'
  | 'ledger_integrity'
  | 'set_changed'
  | 'ledger_not_created'
  | 'post_apply_mismatch'
  | 'rehearsal_residue'
  | 'transaction_state_unknown';

/** A hard-stop condition (Governance §11.4): report to a human; do not repair by hand. */
export class MigrationStopError extends Error {
  readonly code: MigrationStopCode;
  readonly detail: string;
  constructor(code: MigrationStopCode, detail: string) {
    super(`migration hard stop: ${code} (${detail})`);
    this.name = 'MigrationStopError';
    this.code = code;
    this.detail = detail;
  }
}

/** A migration file failed; its transaction was rolled back and the ledger is unchanged. */
export class MigrationFailedError extends Error {
  readonly filename: string;
  override readonly cause: unknown;
  constructor(filename: string, cause: unknown) {
    super(`migration failed and was rolled back: ${filename}`);
    this.name = 'MigrationFailedError';
    this.filename = filename;
    this.cause = cause;
  }
}

export interface MigrationTargetContext {
  readonly target: MigrationTarget;
  readonly store: RelationalStore;
  /** The compiled set for this target; the files are read from `directory` at apply time. */
  readonly compiled: readonly CompiledMigration[];
  readonly directory: string;
  readonly expected: { readonly instanceId: string; readonly environment: string };
}

export interface TargetPreflight {
  readonly role: string;
  readonly marker: InstanceMarker;
}

/** Role and identity checks, read-only, before any command touches the target. */
export async function preflightTarget(ctx: MigrationTargetContext): Promise<TargetPreflight> {
  const role = await ctx.store.transaction(
    null,
    async (scope) =>
      (await scope.query<{ role: string }>({ text: 'SELECT current_user::text AS role' })).rows[0]
        ?.role,
    { readOnly: true },
  );
  if (role !== MIGRATION_ROLE) {
    throw new MigrationStopError(
      'wrong_role',
      `connected as ${role ?? 'unknown'}, expected ${MIGRATION_ROLE}`,
    );
  }
  const marker = await readInstanceMarker(ctx.store);
  const outcome = compareIdentity({ ...ctx.expected, databaseRole: ctx.target }, marker);
  if (!outcome.matched) {
    throw new MigrationStopError('identity_mismatch', `mesh_instance: ${outcome.problem}`);
  }
  return { role, marker: outcome.marker };
}

export interface LedgerInspection {
  readonly rows: readonly LedgerRow[] | null;
  readonly report: LedgerReport;
}

/** The ledger as it stands, classified against the compiled set (for `db:status`). */
export async function inspectLedger(ctx: MigrationTargetContext): Promise<LedgerInspection> {
  return ctx.store.transaction(
    null,
    async (scope) => {
      const rows = await readLedgerRows(scope);
      return { rows, report: describeLedger(ctx.compiled, toLedgerState(rows)) };
    },
    { readOnly: true },
  );
}

export interface AppliedRecord {
  readonly filename: string;
  readonly sha256: string;
  readonly catalogSha256: string;
  readonly appliedAt: string;
  readonly appliedBy: string;
}

export interface CatalogSnapshot {
  readonly ledgerPresent: boolean;
  readonly catalogSha256: string;
}

export interface ApplyOutcome {
  readonly mode: 'apply' | 'rehearse';
  readonly applied: readonly AppliedRecord[];
  readonly before: CatalogSnapshot;
  readonly after: CatalogSnapshot;
}

async function snapshot(store: RelationalStore): Promise<CatalogSnapshot> {
  return store.transaction(
    null,
    async (scope) => ({
      ledgerPresent: await ledgerPresent(scope),
      catalogSha256: await catalogChecksum(scope),
    }),
    { readOnly: true },
  );
}

function integrityDetail(report: LedgerReport): string {
  const parts: string[] = [];
  for (const m of report.mismatched) parts.push(`hash mismatch ${m.filename}`);
  for (const u of report.unknown) parts.push(`unexpected ledger entry ${u.filename}`);
  return parts.join('; ');
}

/** One file, inside the caller's transaction: lock, path, statements, checksum, ledger row. */
async function applyOne(
  scope: TransactionScope,
  ctx: MigrationTargetContext,
  migration: CompiledMigration,
): Promise<AppliedRecord> {
  await scope.query({ text: LEDGER_LOCK });
  await scope.query({ text: 'SET LOCAL search_path TO public' });
  const bytes = await readFile(path.join(ctx.directory, migration.filename));
  const sha256 = createHash('sha256').update(bytes).digest('hex');
  if (sha256 !== migration.sha256) {
    throw new MigrationStopError(
      'set_changed',
      `${migration.filename} changed since it was compiled`,
    );
  }
  await scope.query({ text: bytes.toString('utf8') });
  if (!(await ledgerPresent(scope))) {
    throw new MigrationStopError(
      'ledger_not_created',
      `${migration.filename} left no migration_ledger to record itself in`,
    );
  }
  const catalogSha256 = await catalogChecksum(scope);
  const inserted = await scope.query<{ applied_at: string; applied_by: string }>({
    text: `INSERT INTO migration_ledger (filename, sha256, catalog_sha256)
           VALUES ($1, $2, $3)
           RETURNING applied_at::text AS applied_at, applied_by`,
    values: [migration.filename, sha256, catalogSha256],
  });
  const row = inserted.rows[0];
  if (row === undefined) {
    throw new MigrationStopError('ledger_not_created', `${migration.filename} recorded no row`);
  }
  return {
    filename: migration.filename,
    sha256,
    catalogSha256,
    appliedAt: row.applied_at,
    appliedBy: row.applied_by,
  };
}

function classify(error: unknown, filename: string): Error {
  if (error instanceof MigrationStopError) return error;
  if (error instanceof TransactionStateUnknownError) {
    return new MigrationStopError('transaction_state_unknown', `while applying ${filename}`);
  }
  return new MigrationFailedError(filename, error);
}

/**
 * Applies every pending migration, or rehearses them all in one rollback-only transaction
 * (§5.4 `db:rehearse`; Governance §12.3). Never applies on top of a ledger with a mismatch or
 * an unexpected entry; verifies the head after applying; verifies nothing remains after a
 * rehearsal.
 */
export async function applyPending(
  ctx: MigrationTargetContext,
  options: { readonly rehearse: boolean },
): Promise<ApplyOutcome> {
  const inspection = await inspectLedger(ctx);
  if (inspection.report.mismatched.length > 0 || inspection.report.unknown.length > 0) {
    throw new MigrationStopError('ledger_integrity', integrityDetail(inspection.report));
  }
  const pending = inspection.report.pending;
  const before = await snapshot(ctx.store);
  const applied: AppliedRecord[] = [];

  if (options.rehearse) {
    let current = '';
    try {
      const rehearsed = await rollbackOnly(ctx.store, async (scope) => {
        const out: AppliedRecord[] = [];
        for (const migration of pending) {
          current = migration.filename;
          out.push(await applyOne(scope, ctx, migration));
        }
        return out;
      });
      applied.push(...rehearsed);
    } catch (error) {
      throw classify(error, current);
    }
  } else {
    for (const migration of pending) {
      try {
        applied.push(await ctx.store.transaction(null, (scope) => applyOne(scope, ctx, migration)));
      } catch (error) {
        throw classify(error, migration.filename);
      }
    }
  }

  const after = await snapshot(ctx.store);
  if (options.rehearse) {
    if (
      after.ledgerPresent !== before.ledgerPresent ||
      after.catalogSha256 !== before.catalogSha256
    ) {
      throw new MigrationStopError('rehearsal_residue', 'the catalog changed across a rollback');
    }
    return { mode: 'rehearse', applied, before, after };
  }

  const verified = await inspectLedger(ctx);
  const head = ledgerHead(verified.rows);
  const atHead =
    verified.report.pending.length === 0 &&
    verified.report.mismatched.length === 0 &&
    verified.report.unknown.length === 0 &&
    (ctx.compiled.length === 0 || (head !== null && head.catalog_sha256 === after.catalogSha256));
  if (!atHead) {
    throw new MigrationStopError(
      'post_apply_mismatch',
      `ledger or catalog differs from the compiled set after applying ${String(applied.length)} migration(s)`,
    );
  }
  return { mode: 'apply', applied, before, after };
}
