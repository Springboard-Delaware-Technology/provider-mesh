import type { ActorContext } from './actor-context.js';

/**
 * `RelationalStore` port (Foundation 001 §4.4): transaction scope, session-context binding, and
 * query execution. The interface exposes no vendor type; the SQL client lives only behind
 * `src/platform/adapters/postgres` (boundary rule 5).
 */
export interface SqlStatement {
  readonly text: string;
  readonly values?: readonly unknown[];
}

export interface QueryResult<Row> {
  readonly rows: readonly Row[];
  readonly rowCount: number;
}

export interface TransactionScope {
  query<Row>(statement: SqlStatement): Promise<QueryResult<Row>>;
}

export interface RelationalStore {
  /**
   * Runs `work` inside one transaction. When `context` is supplied, the adapter writes the
   * transaction-local compartment settings from it before any statement runs (§5.6 rule 2).
   * With `null` context the transaction carries no compartment and, under forced row-level
   * security, sees no protected rows (§5.6 rule 3).
   */
  transaction<T>(
    context: ActorContext | null,
    work: (scope: TransactionScope) => Promise<T>,
  ): Promise<T>;
  /** Read-only liveness probe for readiness (§5.10); issues no write. */
  ping(): Promise<void>;
  close(): Promise<void>;
}
