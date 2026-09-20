/**
 * Audit Service — public surface (Architecture §6.17; Foundation 001 §5.5). The `AuditSink`
 * implementation over the audit database, the canonical serialization and chain verification
 * that `audit:verify` runs as `mesh_audit_reader`, the checkpoint record, and the events the
 * foundation itself produces.
 */
export { absent, isAbsent, NOT_APPLICABLE, split, UNKNOWN } from './absence.js';
export {
  AuditAppendError,
  AuditService,
  type AuditAppendCode,
  type AuditServiceOptions,
} from './audit-service.js';
export {
  auditEventHash,
  canonicalAuditEvent,
  CanonicalizationError,
  CHAIN_SERIALIZATION_VERSION,
  GENESIS_HASH,
  HASHED_COLUMNS,
  hashOfCanonical,
  type AuditEventContent,
  type AuditEventRow,
  type HashedColumns,
} from './canonical.js';
export {
  CHAIN_ROW_COLUMNS,
  chainRowsStatement,
  ChainRowError,
  parseChainRow,
  readChainHead,
  readChainRows,
  type HeadRow,
} from './chain-reader.js';
export {
  ChainWalker,
  DEFAULT_BATCH_SIZE,
  verifyChain,
  type ChainProblem,
  type ChainProblemKind,
  type ChainVerificationReport,
  type CheckpointStatus,
  type CheckpointTarget,
} from './chain-verification.js';
export {
  CHECKPOINT_VERSION,
  CheckpointError,
  datedCheckpointKey,
  latestCheckpointKey,
  parseCheckpoint,
  readLatestCheckpoint,
  serializeCheckpoint,
  type CheckpointRecord,
} from './checkpoint.js';
export { AuditEventInputError, auditEventInsert } from './event-row.js';
export {
  checkpointExportEvent,
  FOUNDATION_EVENT_SCHEMA_VERSION,
  FOUNDATION_PURPOSE,
  FOUNDATION_RETENTION_CLASS,
  startupAssertionsEvent,
  type CheckpointExportInput,
  type FoundationIdentity,
  type StartupAssertionsInput,
} from './foundation-events.js';
