import type { RelationalStore } from '../../platform/ports/index.js';

import type { CompiledMigration } from './migration-set.js';

/**
 * Migration-ledger status (Foundation 001 §5.3 rule 4, §5.4). Read-only: the ledger is written
 * only by `db:migrate` (C4). Until that capability creates the table, an absent ledger is
 * consistent only with an empty compiled set.
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

export type LedgerProblem = 'ledger_absent' | 'pending' | 'unknown_applied' | 'hash_mismatch';

export type LedgerOutcome =
  | { readonly matched: true; readonly applied: number }
  | { readonly matched: false; readonly problem: LedgerProblem; readonly filename: string | null };

/** Any difference between the compiled set and the ledger is a mismatch (§5.3 rule 4). */
export function compareLedger(
  compiled: readonly CompiledMigration[],
  ledger: LedgerState,
): LedgerOutcome {
  if (!ledger.present) {
    return compiled.length === 0
      ? { matched: true, applied: 0 }
      : { matched: false, problem: 'ledger_absent', filename: compiled[0]?.filename ?? null };
  }
  const applied = new Map(ledger.entries.map((e) => [e.filename, e.sha256]));
  for (const migration of compiled) {
    const hash = applied.get(migration.filename);
    if (hash === undefined)
      return { matched: false, problem: 'pending', filename: migration.filename };
    if (hash !== migration.sha256)
      return { matched: false, problem: 'hash_mismatch', filename: migration.filename };
    applied.delete(migration.filename);
  }
  const extra = applied.keys().next();
  if (!extra.done) return { matched: false, problem: 'unknown_applied', filename: extra.value };
  return { matched: true, applied: compiled.length };
}
