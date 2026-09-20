import type { AuditEventInput, Maybe, SqlStatement } from '../../platform/ports/index.js';

import { isAbsent } from './absence.js';

/**
 * Maps an `AuditEventInput` to the `INSERT` the Audit Service issues (§5.5 rule 1: the service
 * supplies content columns only). The chain columns and `recorded_at` are not named, so the
 * trigger assigns them. Validation mirrors the column domains of the migration so a rejected
 * event is reported by field name here, before any statement carries a value to the store.
 */
export class AuditEventInputError extends Error {
  readonly field: string;
  constructor(field: string, problem: string) {
    super(`audit event invalid: ${field} ${problem}`);
    this.name = 'AuditEventInputError';
    this.field = field;
  }
}

const CODE = /^[A-Za-z0-9][A-Za-z0-9_.:/-]{0,127}$/;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
const CONTROL = /\p{Cc}/u;
const REF_MAX = 256;
const REFS_MAX = 64;
const ACTOR_KINDS: ReadonlySet<string> = new Set(['human', 'service', 'system', 'unknown']);
const RESULTS: ReadonlySet<string> = new Set(['attempted', 'completed', 'failed', 'unknown']);

type Kind = 'code' | 'ref' | 'timestamp' | 'refs';

function checkCode(field: string, value: unknown): string {
  if (typeof value !== 'string' || !CODE.test(value))
    throw new AuditEventInputError(field, 'is not a code');
  return value;
}

function checkRef(field: string, value: unknown): string {
  if (
    typeof value !== 'string' ||
    value.length === 0 ||
    value.length > REF_MAX ||
    CONTROL.test(value)
  ) {
    throw new AuditEventInputError(field, 'is not a reference');
  }
  return value;
}

function checkTimestamp(field: string, value: unknown): string {
  if (typeof value !== 'string' || Number.isNaN(Date.parse(value))) {
    throw new AuditEventInputError(field, 'is not an ISO 8601 instant');
  }
  return new Date(value).toISOString();
}

function checkRefs(field: string, value: unknown): readonly string[] {
  if (!Array.isArray(value) || value.length === 0 || value.length > REFS_MAX) {
    throw new AuditEventInputError(field, 'is not a list of 1 to 64 references');
  }
  return (value as readonly unknown[]).map((item) => checkRef(field, item));
}

function checkKind(kind: Kind, field: string, value: unknown): unknown {
  switch (kind) {
    case 'code':
      return checkCode(field, value);
    case 'ref':
      return checkRef(field, value);
    case 'timestamp':
      return checkTimestamp(field, value);
    case 'refs':
      return checkRefs(field, value);
  }
}

const CAST: Readonly<Record<Kind, string>> = {
  code: '',
  ref: '',
  timestamp: '::timestamptz',
  refs: '::text[]',
};

interface Builder {
  readonly columns: string[];
  readonly placeholders: string[];
  readonly values: unknown[];
}

function add(b: Builder, column: string, value: unknown, cast = ''): void {
  b.columns.push(column);
  b.values.push(value);
  b.placeholders.push(`$${String(b.values.length)}${cast}`);
}

function addMaybe(
  b: Builder,
  column: string,
  kind: Kind,
  field: string,
  value: Maybe<unknown>,
): void {
  if (isAbsent(value)) {
    add(b, column, null, CAST[kind]);
    add(b, `${column}_absent`, value.absent);
  } else {
    add(b, column, checkKind(kind, field, value), CAST[kind]);
    add(b, `${column}_absent`, null);
  }
}

export function auditEventInsert(event: AuditEventInput): SqlStatement {
  const b: Builder = { columns: [], placeholders: [], values: [] };

  if (typeof event.eventId !== 'string' || !UUID.test(event.eventId.toLowerCase())) {
    throw new AuditEventInputError('eventId', 'is not a UUID');
  }
  add(b, 'event_id', event.eventId.toLowerCase(), '::uuid');
  add(b, 'event_type', checkCode('eventType', event.eventType));
  if (!Number.isSafeInteger(event.schemaVersion) || event.schemaVersion < 1) {
    throw new AuditEventInputError('schemaVersion', 'is not a positive integer');
  }
  add(b, 'schema_version', event.schemaVersion);
  add(b, 'correlation_id', checkRef('correlationId', event.correlationId));
  addMaybe(b, 'causation_id', 'ref', 'causationId', event.causationId);

  addMaybe(b, 'actor_id', 'ref', 'actorId', event.actorId);
  if (!ACTOR_KINDS.has(event.actorKind))
    throw new AuditEventInputError('actorKind', 'is not a kind');
  add(b, 'actor_kind', event.actorKind);
  addMaybe(b, 'delegating_actor_id', 'ref', 'delegatingActorId', event.delegatingActorId);
  addMaybe(b, 'represented_org_id', 'ref', 'representedOrgId', event.representedOrgId);
  addMaybe(b, 'represented_unit_id', 'ref', 'representedUnitId', event.representedUnitId);
  addMaybe(b, 'represented_capacity', 'code', 'representedCapacity', event.representedCapacity);

  add(b, 'occurred_at', checkTimestamp('occurredAt', event.occurredAt), '::timestamptz');
  addMaybe(b, 'external_time', 'timestamp', 'externalTime', event.externalTime);
  addMaybe(b, 'time_uncertainty', 'code', 'timeUncertainty', event.timeUncertainty);

  add(b, 'operation', checkCode('operation', event.operation));
  addMaybe(b, 'target_type', 'code', 'targetType', event.targetType);
  addMaybe(b, 'target_id', 'ref', 'targetId', event.targetId);
  addMaybe(b, 'target_version', 'ref', 'targetVersion', event.targetVersion);
  addMaybe(b, 'subject_scope', 'ref', 'subjectScope', event.subjectScope);
  addMaybe(b, 'destination_ref', 'ref', 'destinationRef', event.destinationRef);

  addMaybe(
    b,
    'authorization_decision_id',
    'ref',
    'authorizationDecisionId',
    event.authorizationDecisionId,
  );
  addMaybe(b, 'authority_refs', 'refs', 'authorityRefs', event.authorityRefs);
  addMaybe(b, 'policy_version', 'code', 'policyVersion', event.policyVersion);
  addMaybe(b, 'purpose', 'code', 'purpose', event.purpose);

  if (!RESULTS.has(event.result)) throw new AuditEventInputError('result', 'is not a result');
  add(b, 'result', event.result);
  addMaybe(b, 'reason_code', 'code', 'reasonCode', event.reasonCode);
  addMaybe(b, 'before_version', 'ref', 'beforeVersion', event.beforeVersion);
  addMaybe(b, 'after_version', 'ref', 'afterVersion', event.afterVersion);
  addMaybe(b, 'external_receipt', 'ref', 'externalReceipt', event.externalReceipt);

  addMaybe(b, 'review_ref', 'ref', 'reviewRef', event.reviewRef);
  add(b, 'origin_channel', checkCode('originChannel', event.originChannel));
  add(b, 'retention_class', checkCode('retentionClass', event.retentionClass));

  return {
    text: `INSERT INTO audit_event (${b.columns.join(', ')}) VALUES (${b.placeholders.join(', ')})`,
    values: b.values,
  };
}
