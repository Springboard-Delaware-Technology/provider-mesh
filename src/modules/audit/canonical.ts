import { createHash } from 'node:crypto';

/**
 * Canonical serialization of an `audit_event` row, version 1 (Foundation 001 §5.5 rule 1; §1.8
 * delegated choice). This is the TypeScript mirror of `audit_event_canonical` in
 * `db/migrations/audit/0002_audit_event.sql`, which documents the form; `audit:verify`
 * recomputes every row's hash with this code, independently of the database's functions.
 *
 * Form: one JSON object, one member per column except `hash`, keyed by column name, members
 * ordered by the UTF-16 code units of the name, no whitespace. `null` for a NULL column; text
 * and uuid as JSON strings (`JSON.stringify`, which escapes exactly as PostgreSQL's
 * `to_json(text)` does); integers as decimal digits; timestamps as JSON strings in UTC with six
 * fractional digits (`YYYY-MM-DDTHH:MM:SS.ffffffZ`); `authority_refs` as a JSON array of strings.
 */
export const CHAIN_SERIALIZATION_VERSION = 1;

/** `prev_hash` of the first row of a chain (sequence 1). */
export const GENESIS_HASH = '0'.repeat(64);

export const CANONICAL_TIMESTAMP = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{6}Z$/;
const HEX_64 = /^[0-9a-f]{64}$/;

/**
 * The columns of `audit_event` other than the integrity trio, as the verifier reads them:
 * timestamps already rendered in the canonical text form by the query (the SQL client would
 * otherwise lose microseconds), `sequence` as a bigint, everything else as stored.
 */
export interface AuditEventContent {
  readonly event_id: string;
  readonly event_type: string;
  readonly schema_version: number;
  readonly correlation_id: string;
  readonly causation_id: string | null;
  readonly causation_id_absent: string | null;
  readonly actor_id: string | null;
  readonly actor_id_absent: string | null;
  readonly actor_kind: string;
  readonly delegating_actor_id: string | null;
  readonly delegating_actor_id_absent: string | null;
  readonly represented_org_id: string | null;
  readonly represented_org_id_absent: string | null;
  readonly represented_unit_id: string | null;
  readonly represented_unit_id_absent: string | null;
  readonly represented_capacity: string | null;
  readonly represented_capacity_absent: string | null;
  readonly occurred_at: string;
  readonly recorded_at: string;
  readonly external_time: string | null;
  readonly external_time_absent: string | null;
  readonly time_uncertainty: string | null;
  readonly time_uncertainty_absent: string | null;
  readonly operation: string;
  readonly target_type: string | null;
  readonly target_type_absent: string | null;
  readonly target_id: string | null;
  readonly target_id_absent: string | null;
  readonly target_version: string | null;
  readonly target_version_absent: string | null;
  readonly subject_scope: string | null;
  readonly subject_scope_absent: string | null;
  readonly destination_ref: string | null;
  readonly destination_ref_absent: string | null;
  readonly authorization_decision_id: string | null;
  readonly authorization_decision_id_absent: string | null;
  readonly authority_refs: readonly string[] | null;
  readonly authority_refs_absent: string | null;
  readonly policy_version: string | null;
  readonly policy_version_absent: string | null;
  readonly purpose: string | null;
  readonly purpose_absent: string | null;
  readonly result: string;
  readonly reason_code: string | null;
  readonly reason_code_absent: string | null;
  readonly before_version: string | null;
  readonly before_version_absent: string | null;
  readonly after_version: string | null;
  readonly after_version_absent: string | null;
  readonly external_receipt: string | null;
  readonly external_receipt_absent: string | null;
  readonly review_ref: string | null;
  readonly review_ref_absent: string | null;
  readonly origin_channel: string;
  readonly retention_class: string;
}

/** A row as stored: content plus the chain fields the trigger assigned. */
export interface AuditEventRow extends AuditEventContent {
  readonly sequence: bigint;
  readonly prev_hash: string;
  readonly hash: string;
}

/** Everything the hash covers: content, `sequence`, and `prev_hash`. */
export type HashedColumns = Omit<AuditEventRow, 'hash'>;

/** Compile-time completeness: every hashed column is named here exactly once. */
const HASHED: Readonly<Record<keyof HashedColumns, true>> = {
  event_id: true,
  event_type: true,
  schema_version: true,
  correlation_id: true,
  causation_id: true,
  causation_id_absent: true,
  actor_id: true,
  actor_id_absent: true,
  actor_kind: true,
  delegating_actor_id: true,
  delegating_actor_id_absent: true,
  represented_org_id: true,
  represented_org_id_absent: true,
  represented_unit_id: true,
  represented_unit_id_absent: true,
  represented_capacity: true,
  represented_capacity_absent: true,
  occurred_at: true,
  recorded_at: true,
  external_time: true,
  external_time_absent: true,
  time_uncertainty: true,
  time_uncertainty_absent: true,
  operation: true,
  target_type: true,
  target_type_absent: true,
  target_id: true,
  target_id_absent: true,
  target_version: true,
  target_version_absent: true,
  subject_scope: true,
  subject_scope_absent: true,
  destination_ref: true,
  destination_ref_absent: true,
  authorization_decision_id: true,
  authorization_decision_id_absent: true,
  authority_refs: true,
  authority_refs_absent: true,
  policy_version: true,
  policy_version_absent: true,
  purpose: true,
  purpose_absent: true,
  result: true,
  reason_code: true,
  reason_code_absent: true,
  before_version: true,
  before_version_absent: true,
  after_version: true,
  after_version_absent: true,
  external_receipt: true,
  external_receipt_absent: true,
  review_ref: true,
  review_ref_absent: true,
  origin_channel: true,
  retention_class: true,
  sequence: true,
  prev_hash: true,
};

/** Hashed column names in canonical (UTF-16 code unit) order. */
export const HASHED_COLUMNS: readonly (keyof HashedColumns)[] = Object.keys(
  HASHED,
).sort() as (keyof HashedColumns)[];

const TIMESTAMP_COLUMNS: ReadonlySet<keyof HashedColumns> = new Set([
  'occurred_at',
  'recorded_at',
  'external_time',
]);

export class CanonicalizationError extends Error {
  readonly column: string;
  constructor(column: string, problem: string) {
    super(`audit event canonicalization: ${column} ${problem}`);
    this.name = 'CanonicalizationError';
    this.column = column;
  }
}

function encodeValue(column: keyof HashedColumns, value: unknown): string {
  if (value === null) return 'null';
  if (typeof value === 'string') {
    if (TIMESTAMP_COLUMNS.has(column) && !CANONICAL_TIMESTAMP.test(value)) {
      throw new CanonicalizationError(column, 'is not a canonical timestamp');
    }
    return JSON.stringify(value);
  }
  if (typeof value === 'bigint') return value.toString();
  if (typeof value === 'number') {
    if (!Number.isSafeInteger(value)) throw new CanonicalizationError(column, 'is not an integer');
    return String(value);
  }
  if (Array.isArray(value)) {
    const items: readonly unknown[] = value;
    return `[${items
      .map((item) => {
        if (typeof item !== 'string')
          throw new CanonicalizationError(column, 'has a non-text element');
        return JSON.stringify(item);
      })
      .join(',')}]`;
  }
  throw new CanonicalizationError(column, `has an unsupported value type (${typeof value})`);
}

/** The canonical text of a row (every hashed column), as the chain trigger hashed it. */
export function canonicalAuditEvent(row: HashedColumns): string {
  const members = HASHED_COLUMNS.map((column) => {
    if (!(column in row)) throw new CanonicalizationError(column, 'is missing');
    return `${JSON.stringify(column)}:${encodeValue(column, row[column])}`;
  });
  return `{${members.join(',')}}`;
}

/** Lowercase hex SHA-256 of the canonical text's UTF-8 bytes. */
export function hashOfCanonical(canonical: string): string {
  return createHash('sha256').update(canonical, 'utf8').digest('hex');
}

export function auditEventHash(row: HashedColumns): string {
  return hashOfCanonical(canonicalAuditEvent(row));
}

export function isHex64(value: string): boolean {
  return HEX_64.test(value);
}
