/**
 * Human Review and Platform Operations — public surface (Architecture §6.15).
 * Under Foundation 001: instance identity and migration status (§4.2), and the startup
 * assertions built from them (§5.3). The migration mechanism in `db/ledger` uses the same
 * migration sets and ledger comparison, so `db:status` and startup agree by construction.
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
  loadCompiledMigrationSets,
  MIGRATION_FILENAME,
  MIGRATION_TARGETS,
  MigrationSetError,
  type CompiledMigration,
  type CompiledMigrationSets,
  type MigrationTarget,
} from './migration-set.js';
export {
  compareLedger,
  describeLedger,
  readLedger,
  type LedgerEntry,
  type LedgerMismatch,
  type LedgerOutcome,
  type LedgerProblem,
  type LedgerReport,
  type LedgerState,
} from './migration-status.js';
export {
  runStartupAssertions,
  StartupAssertionError,
  type StartupAssertionCode,
  type StartupAssertionInput,
  type StartupReport,
} from './startup-assertions.js';
