import type { RelationalStore } from '../../platform/ports/index.js';

import type { CompiledMigration } from './migration-set.js';

/**
 * Migration-ledger status (Foundation 001 §5.3 rule 4, §5.4). Read-only: the ledger is written
 * only by `db:migrate` (`db/ledger`), which creates it with the first migration of each set.
 * An absent ledger is consistent only with an empty compiled set, so a database that has never
 * been migrated fails the startup assertion once a set exists — as intended.
 */
export interface LedgerEntry {
  readonly filename: string;
  readonly sha256: string;
}

export type LedgerState =
  | { readonly present: false }
  | { readonly present: true; readonly entries: readonly LedgerEntry[] };

export async function readLedger(store: RelationalStore): Promise<LedgerState> {
  return store.transaction(
    null,
    async (scope) => {
      const present = await scope.query<{ present: boolean }>({
        text: "SELECT to_regclass('public.migration_ledger') IS NOT NULL AS present",
      });
      if (present.rows[0]?.present !== true) return { present: false };
      const rows = await scope.query<LedgerEntry>({
        text: 'SELECT filename, sha256 FROM migration_ledger ORDER BY filename',
      });
      return { present: true, entries: rows.rows };
    },
    { readOnly: true },
  );
}

/** Every difference between a compiled set and its ledger, for `db:status` (§5.4). */
export interface LedgerMismatch {
  readonly filename: string;
  readonly compiledSha256: string;
  readonly ledgerSha256: string;
}

export interface LedgerReport {
  readonly present: boolean;
  /** Ledger entries whose file is in the set with the same hash, in filename order. */
  readonly applied: readonly LedgerEntry[];
  /** Compiled files with no ledger entry, in filename order. */
  readonly pending: readonly CompiledMigration[];
  /** Applied files whose current bytes no longer hash to the ledger's value (hard stop). */
  readonly mismatched: readonly LedgerMismatch[];
  /** Ledger entries with no file in the set (unexpected ledger entry; hard stop). */
  readonly unknown: readonly LedgerEntry[];
}

export function describeLedger(
  compiled: readonly CompiledMigration[],
  ledger: LedgerState,
): LedgerReport {
  const entries = new Map(ledger.present ? ledger.entries.map((e) => [e.filename, e.sha256]) : []);
  const applied: LedgerEntry[] = [];
  const pending: CompiledMigration[] = [];
  const mismatched: LedgerMismatch[] = [];
  for (const migration of compiled) {
    const recorded = entries.get(migration.filename);
    if (recorded === undefined) {
      pending.push(migration);
    } else if (recorded === migration.sha256) {
      applied.push({ filename: migration.filename, sha256: recorded });
    } else {
      mismatched.push({
        filename: migration.filename,
        compiledSha256: migration.sha256,
        ledgerSha256: recorded,
      });
    }
    entries.delete(migration.filename);
  }
  const unknown = [...entries]
    .map(([filename, sha256]) => ({ filename, sha256 }))
    .sort((a, b) => (a.filename < b.filename ? -1 : a.filename > b.filename ? 1 : 0));
  return { present: ledger.present, applied, pending, mismatched, unknown };
}

export type LedgerProblem = 'ledger_absent' | 'pending' | 'unknown_applied' | 'hash_mismatch';

export type LedgerOutcome =
  | { readonly matched: true; readonly applied: number }
  | { readonly matched: false; readonly problem: LedgerProblem; readonly filename: string | null };

/**
 * Any difference between the compiled set and the ledger is a mismatch (§5.3 rule 4). Reports
 * the first problem in filename order, with the ledger's absence first and an unexpected ledger
 * entry last; `describeLedger` supplies the full listing.
 */
export function compareLedger(
  compiled: readonly CompiledMigration[],
  ledger: LedgerState,
): LedgerOutcome {
  if (!ledger.present) {
    return compiled.length === 0
      ? { matched: true, applied: 0 }
      : { matched: false, problem: 'ledger_absent', filename: compiled[0]?.filename ?? null };
  }
  const report = describeLedger(compiled, ledger);
  for (const migration of compiled) {
    if (report.pending.some((p) => p.filename === migration.filename)) {
      return { matched: false, problem: 'pending', filename: migration.filename };
    }
    if (report.mismatched.some((m) => m.filename === migration.filename)) {
      return { matched: false, problem: 'hash_mismatch', filename: migration.filename };
    }
  }
  const extra = report.unknown[0];
  if (extra !== undefined) {
    return { matched: false, problem: 'unknown_applied', filename: extra.filename };
  }
  return { matched: true, applied: compiled.length };
}
