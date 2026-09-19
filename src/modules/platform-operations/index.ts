/**
 * Human Review and Platform Operations — public surface (Architecture §6.15).
 * Under Foundation 001: instance identity and migration status (§4.2), and the startup
 * assertions built from them (§5.3).
 */
export {
  compareIdentity,
  readInstanceMarker,
  type DatabaseRole,
  type ExpectedIdentity,
  type IdentityOutcome,
  type InstanceMarker,
} from './instance-identity.js';
export {
  loadCompiledMigrationSet,
  MIGRATION_FILENAME,
  MigrationSetError,
  type CompiledMigration,
} from './migration-set.js';
export {
  compareLedger,
  readLedger,
  type LedgerEntry,
  type LedgerOutcome,
  type LedgerProblem,
  type LedgerState,
} from './migration-status.js';
export {
  runStartupAssertions,
  StartupAssertionError,
  type StartupAssertionCode,
  type StartupAssertionInput,
  type StartupReport,
} from './startup-assertions.js';
