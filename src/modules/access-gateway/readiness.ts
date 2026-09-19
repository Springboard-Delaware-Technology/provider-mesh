/**
 * Readiness contract (Foundation 001 §5.10). Ready means: database connection open, instance
 * marker matched, migration ledger matched, audit sink reachable. Not-ready carries a reason code
 * and no detail.
 */
export type NotReadyReason =
  | 'database_unavailable'
  | 'instance_marker_mismatch'
  | 'migration_ledger_mismatch'
  | 'audit_sink_unavailable';

export type ReadinessResult =
  { readonly ready: true } | { readonly ready: false; readonly reason: NotReadyReason };

export type ReadinessProbe = () => Promise<ReadinessResult>;
