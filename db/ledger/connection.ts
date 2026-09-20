import pg from 'pg';

import type { StoreConnectionConfig } from '../../src/platform/adapters/postgres/index.js';
import type {
  ActorContext,
  QueryResult,
  RelationalStore,
  SqlStatement,
  TransactionOptions,
  TransactionScope,
} from '../../src/platform/ports/index.js';

/**
 * The migration mechanism's connection (Foundation 001 §5.4): one client, as `mesh_migrate`,
 * over the same verified-TLS configuration the application builds (§5.3 rule 2; invariant 6).
 * `db/**` is, with the Postgres adapter, the only place that may import the SQL client (§4.3
 * rule 5).
 *
 * It implements `RelationalStore` so the platform-operations readers (`readInstanceMarker`,
 * `readLedger`) run here unchanged, but it never binds a compartment context: migrations run
 * outside every compartment, and a caller that supplies one is refused.
 */
export type StatementObserver = (statement: SqlStatement) => void;

/** Thrown when a transaction could not be rolled back: the database state is uncertain. */
export class TransactionStateUnknownError extends Error {
  override readonly cause: unknown;
  readonly rollbackError: unknown;
  constructor(cause: unknown, rollbackError: unknown) {
    super('transaction could not be rolled back; database state is uncertain');
    this.name = 'TransactionStateUnknownError';
    this.cause = cause;
    this.rollbackError = rollbackError;
  }
}

export class LedgerStore implements RelationalStore {
  readonly #client: pg.Client;
  readonly #observe: StatementObserver | undefined;

  private constructor(client: pg.Client, observe: StatementObserver | undefined) {
    this.#client = client;
    this.#observe = observe;
  }

  /** Connects with every parameter explicit, so no platform-injected variable is consulted (A08). */
  static async connect(
    config: StoreConnectionConfig,
    options: { readonly observe?: StatementObserver } = {},
  ): Promise<LedgerStore> {
    const client = new pg.Client({
      host: config.host,
      port: config.port,
      database: config.database,
      user: config.user,
      password: config.password,
      ssl: { rejectUnauthorized: config.ssl.rejectUnauthorized, servername: config.ssl.servername },
      application_name: 'provider-mesh-migrations',
      connectionTimeoutMillis: 10_000,
    });
    await client.connect();
    return new LedgerStore(client, options.observe);
  }

  async #run<Row>(statement: SqlStatement): Promise<QueryResult<Row>> {
    this.#observe?.(statement);
    // Without values the client uses the simple protocol, which accepts a multi-statement
    // migration file; such a query resolves to an array of results and yields no rows here.
    const result: unknown = await this.#client.query(statement.text, [...(statement.values ?? [])]);
    if (Array.isArray(result)) return { rows: [], rowCount: 0 };
    const single = result as pg.QueryResult<pg.QueryResultRow>;
    // The row shape is the caller's contract with its own SQL; the port carries no vendor type.
    const rows = single.rows as unknown as readonly Row[];
    return { rows, rowCount: single.rowCount ?? rows.length };
  }

  async #rollback(cause: unknown): Promise<void> {
    try {
      await this.#run({ text: 'ROLLBACK' });
    } catch (rollbackError) {
      throw new TransactionStateUnknownError(cause, rollbackError);
    }
  }

  async transaction<T>(
    context: ActorContext | null,
    work: (scope: TransactionScope) => Promise<T>,
    options: TransactionOptions = {},
  ): Promise<T> {
    if (context !== null) throw new Error('the migration store binds no compartment context');
    const run = <Row>(statement: SqlStatement): Promise<QueryResult<Row>> =>
      this.#run<Row>(statement);
    await run({ text: options.readOnly === true ? 'BEGIN READ ONLY' : 'BEGIN' });
    let value: T;
    try {
      value = await work({ query: run });
    } catch (error) {
      await this.#rollback(error);
      throw error;
    }
    try {
      await run({ text: 'COMMIT' });
    } catch (error) {
      await this.#rollback(error);
      throw error;
    }
    return value;
  }

  async ping(): Promise<void> {
    await this.#run({ text: 'SELECT 1' });
  }

  async close(): Promise<void> {
    await this.#client.end();
  }
}

class RollbackSignal extends Error {
  readonly value: unknown;
  constructor(value: unknown) {
    super('rollback-only transaction complete');
    this.name = 'RollbackSignal';
    this.value = value;
  }
}

/**
 * Runs `work` inside a transaction that always rolls back (Governance §12.3) and returns what it
 * produced. `db:rehearse` and the database tests use this; nothing done inside persists.
 */
export async function rollbackOnly<T>(
  store: RelationalStore,
  work: (scope: TransactionScope) => Promise<T>,
): Promise<T> {
  try {
    await store.transaction(null, async (scope) => {
      throw new RollbackSignal(await work(scope));
    });
  } catch (error) {
    if (error instanceof RollbackSignal) return error.value as T;
    throw error;
  }
  throw new Error('rollback-only transaction did not raise its signal');
}
