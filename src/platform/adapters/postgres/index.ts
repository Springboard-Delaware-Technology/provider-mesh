/**
 * Postgres adapter (Foundation 001 §4.2, §4.4, §5.3): the only directory outside `db/**` that
 * may import the SQL client (boundary rule 5). Only `src/app` may import this directory.
 */
export {
  buildConnectionConfig,
  ConnectionConfigError,
  describeConnection,
  type SslMode,
  type StoreConnectionConfig,
  type TrustStore,
} from './connection-config.js';
export { PostgresRelationalStore, type StatementObserver } from './postgres-relational-store.js';
export {
  bindSessionStatement,
  serializeContext,
  SessionContextError,
  SESSION_SETTINGS,
  type SessionSetting,
  type SessionValues,
} from './session-context.js';
