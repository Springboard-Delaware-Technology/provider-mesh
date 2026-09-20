import type { AuditEventInput } from '../../platform/ports/index.js';

import { NOT_APPLICABLE } from './absence.js';

/**
 * The audit events the foundation itself produces (§5.5 rule 5): startup assertions passed,
 * and checkpoint exported. Every field of `SEC-AUD-02` is supplied; where the foundation has
 * no value the reason is `not_applicable` — no authorization engine, policy, or reviewer exists
 * in this package (§1.5), and a system event has no delegation or external source.
 *
 * Vocabulary is provisional to the foundation: `retention_class` is `foundation` until the
 * retention schedule is decided (`SEC-D10`); `represented_capacity` is `platform`, Springboard's
 * distinct platform capacity (`replit.md` §6); `time_uncertainty` is the Domain Model §4.4 term
 * `observed`, since the process directly observed its own action.
 */
export const FOUNDATION_EVENT_SCHEMA_VERSION = 1;
export const FOUNDATION_RETENTION_CLASS = 'foundation';
export const FOUNDATION_PURPOSE = 'platform_operation';

export interface FoundationIdentity {
  readonly instanceId: string;
  readonly environment: string;
}

function systemEvent(
  identity: FoundationIdentity,
  fields: Pick<
    AuditEventInput,
    | 'eventId'
    | 'eventType'
    | 'correlationId'
    | 'causationId'
    | 'actorId'
    | 'occurredAt'
    | 'operation'
    | 'targetType'
    | 'targetId'
    | 'targetVersion'
    | 'destinationRef'
    | 'result'
    | 'reasonCode'
    | 'beforeVersion'
    | 'afterVersion'
    | 'externalReceipt'
    | 'originChannel'
  > &
    Partial<Pick<AuditEventInput, 'actorKind' | 'subjectScope'>>,
): AuditEventInput {
  return {
    eventId: fields.eventId,
    eventType: fields.eventType,
    schemaVersion: FOUNDATION_EVENT_SCHEMA_VERSION,
    correlationId: fields.correlationId,
    causationId: fields.causationId,

    actorId: fields.actorId,
    actorKind: fields.actorKind ?? 'system',
    delegatingActorId: NOT_APPLICABLE,
    representedOrgId: NOT_APPLICABLE,
    representedUnitId: NOT_APPLICABLE,
    representedCapacity: 'platform',

    occurredAt: fields.occurredAt,
    externalTime: NOT_APPLICABLE,
    timeUncertainty: 'observed',

    operation: fields.operation,
    targetType: fields.targetType,
    targetId: fields.targetId,
    targetVersion: fields.targetVersion,
    subjectScope: fields.subjectScope ?? `instance:${identity.instanceId}`,
    destinationRef: fields.destinationRef,

    authorizationDecisionId: NOT_APPLICABLE,
    authorityRefs: NOT_APPLICABLE,
    policyVersion: NOT_APPLICABLE,
    purpose: FOUNDATION_PURPOSE,

    result: fields.result,
    reasonCode: fields.reasonCode,
    beforeVersion: fields.beforeVersion,
    afterVersion: fields.afterVersion,
    externalReceipt: fields.externalReceipt,

    reviewRef: NOT_APPLICABLE,
    originChannel: fields.originChannel,
    retentionClass: FOUNDATION_RETENTION_CLASS,
  };
}

export interface StartupAssertionsInput extends FoundationIdentity {
  readonly eventId: string;
  readonly correlationId: string;
  readonly occurredAt: string;
  readonly appliedMigrations: { readonly domain: number; readonly audit: number };
}

/** Startup assertions passed (§5.3; recorded after they pass, so startup itself wrote nothing). */
export function startupAssertionsEvent(input: StartupAssertionsInput): AuditEventInput {
  return systemEvent(input, {
    eventId: input.eventId,
    eventType: 'platform.startup_assertions',
    correlationId: input.correlationId,
    causationId: NOT_APPLICABLE,
    actorId: `instance:${input.instanceId}`,
    occurredAt: input.occurredAt,
    operation: 'assert_startup',
    targetType: 'mesh_instance',
    targetId: input.instanceId,
    targetVersion: NOT_APPLICABLE,
    destinationRef: NOT_APPLICABLE,
    result: 'completed',
    reasonCode: NOT_APPLICABLE,
    beforeVersion: NOT_APPLICABLE,
    afterVersion: `migrations:domain:${String(input.appliedMigrations.domain)},audit:${String(input.appliedMigrations.audit)}`,
    externalReceipt: NOT_APPLICABLE,
    originChannel: 'system',
  });
}

export interface CheckpointExportInput extends FoundationIdentity {
  readonly eventId: string;
  readonly correlationId: string;
  readonly occurredAt: string;
  readonly verifierIdentity: string;
  readonly headSequence: number;
  readonly headHash: string;
  readonly previousCheckpointHash: string | null;
  readonly objectKey: string;
  readonly objectSha256: string;
  readonly originChannel: string;
}

/** Checkpoint exported through the object-store port (§5.5 rule 4). */
export function checkpointExportEvent(input: CheckpointExportInput): AuditEventInput {
  return systemEvent(input, {
    eventId: input.eventId,
    eventType: 'audit.checkpoint_export',
    correlationId: input.correlationId,
    causationId: NOT_APPLICABLE,
    actorId: input.verifierIdentity,
    actorKind: 'service',
    occurredAt: input.occurredAt,
    operation: 'export_checkpoint',
    targetType: 'audit_chain',
    targetId: `instance:${input.instanceId}`,
    targetVersion: String(input.headSequence),
    destinationRef: input.objectKey,
    result: 'completed',
    reasonCode: NOT_APPLICABLE,
    beforeVersion: input.previousCheckpointHash ?? NOT_APPLICABLE,
    afterVersion: input.headHash,
    externalReceipt: `sha256:${input.objectSha256}`,
    originChannel: input.originChannel,
  });
}
