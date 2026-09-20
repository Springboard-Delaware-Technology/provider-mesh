import type { LedgerState } from '../../src/modules/platform-operations/index.js';
import type { TransactionScope } from '../../src/platform/ports/index.js';

/** One `migration_ledger` row (§5.4), timestamps as server text. */
export interface LedgerRow {
  readonly filename: string;
  readonly sha256: string;
  readonly applied_at: string;
  readonly applied_by: string;
  readonly catalog_sha256: string;
}

export async function ledgerPresent(scope: TransactionScope): Promise<boolean> {
  const result = await scope.query<{ present: boolean }>({
    text: "SELECT to_regclass('public.migration_ledger') IS NOT NULL AS present",
  });
  return result.rows[0]?.present === true;
}

/** Every ledger row in filename order, or `null` when the table does not exist. */
export async function readLedgerRows(
  scope: TransactionScope,
): Promise<readonly LedgerRow[] | null> {
  if (!(await ledgerPresent(scope))) return null;
  const result = await scope.query<LedgerRow>({
    text: `SELECT filename, sha256, applied_at::text AS applied_at, applied_by, catalog_sha256
             FROM migration_ledger ORDER BY filename`,
  });
  return result.rows;
}

export function toLedgerState(rows: readonly LedgerRow[] | null): LedgerState {
  if (rows === null) return { present: false };
  return {
    present: true,
    entries: rows.map((row) => ({ filename: row.filename, sha256: row.sha256 })),
  };
}

/** The head is the highest-numbered applied file; `null` for an absent or empty ledger. */
export function ledgerHead(rows: readonly LedgerRow[] | null): LedgerRow | null {
  if (rows === null || rows.length === 0) return null;
  return rows.reduce((head, row) => (row.filename > head.filename ? row : head));
}
