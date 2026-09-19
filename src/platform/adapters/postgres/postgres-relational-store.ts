import pg from 'pg';

import type {
  ActorContext,
  QueryResult,
  RelationalStore,
  SqlStatement,
  TransactionOptions,
  TransactionScope,
} from '../../ports/index.js';

import type { StoreConnectionConfig } from './connection-config.js';
import { bindSessionStatement } from './session-context.js';

export type StatementObserver = (statement: SqlStatement) => void;

/**
 * `RelationalStore` over node-postgres (Foundation 001 §4.4, §5.3).
 *
 * The pool receives every parameter explicitly, so the client never falls back to a
 * platform-injected `PG*` variable (A08), and always carries the verified-TLS options the
 * configuration builder produced (A07). Session context is bound as the first statement of
 * every transaction (§5.6 rule 2).
 */
export class PostgresRelationalStore implements RelationalStore {
  readonly #pool: pg.Pool;
  readonly #observe: StatementObserver | undefined;

  constructor(
    config: StoreConnectionConfig,
    options: { readonly observe?: StatementObserver } = {},
  ) {
    this.#observe = options.observe;
    this.#pool = new pg.Pool({
      host: config.host,
      port: config.port,
      database: config.database,
      user: config.user,
      password: config.password,
      ssl: { rejectUnauthorized: config.ssl.rejectUnauthorized, servername: config.ssl.servername },
      application_name: 'provider-mesh',
      max: 4,
      connectionTimeoutMillis: 10_000,
      idleTimeoutMillis: 30_000,
      allowExitOnIdle: true,
    });
    // A failing idle client must not crash the process; the next checkout reports the error.
    this.#pool.on('error', () => undefined);
  }

  async transaction<T>(
    context: ActorContext | null,
    work: (scope: TransactionScope) => Promise<T>,
    options: TransactionOptions = {},
  ): Promise<T> {
    const client = await this.#pool.connect();
    const run = async <Row>(statement: SqlStatement): Promise<QueryResult<Row>> => {
      this.#observe?.(statement);
      const result = await client.query<pg.QueryResultRow>(statement.text, [
        ...(statement.values ?? []),
      ]);
      // The row shape is the caller's contract with its own SQL; the port carries no vendor type.
      const rows = result.rows as unknown as readonly Row[];
      return { rows, rowCount: result.rowCount ?? rows.length };
    };
    try {
      await run({ text: options.readOnly === true ? 'BEGIN READ ONLY' : 'BEGIN' });
      await run(bindSessionStatement(context));
      const value = await work({ query: run });
      await run({ text: 'COMMIT' });
      return value;
    } catch (error) {
      try {
        await run({ text: 'ROLLBACK' });
      } catch {
        // The original error is the one to report.
      }
      throw error;
    } finally {
      client.release();
    }
  }

  async ping(): Promise<void> {
    this.#observe?.({ text: 'SELECT 1' });
    await this.#pool.query('SELECT 1');
  }

  async close(): Promise<void> {
    await this.#pool.end();
  }
}
