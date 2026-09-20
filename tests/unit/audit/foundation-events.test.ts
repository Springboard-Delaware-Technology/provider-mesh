import { describe, expect, it } from 'vitest';

import {
  auditEventInsert,
  checkpointExportEvent,
  FOUNDATION_EVENT_SCHEMA_VERSION,
  NOT_APPLICABLE,
  startupAssertionsEvent,
} from '../../../src/modules/audit/index.js';

const identity = { instanceId: '543e37e2-0ffa-4576-8443-e37f1355e421', environment: 'ci' };

describe('foundation events (§5.5 rule 5)', () => {
  it('startup assertions passed: a system event attributed to the instance, every field supplied', () => {
    const event = startupAssertionsEvent({
      ...identity,
      eventId: '0f0f0f0f-0f0f-4f0f-8f0f-0f0f0f0f0f0f',
      correlationId: 'corr-startup',
      occurredAt: '2026-09-20T15:00:00.000Z',
      appliedMigrations: { domain: 1, audit: 2 },
    });
    expect(event).toMatchObject({
      eventType: 'platform.startup_assertions',
      schemaVersion: FOUNDATION_EVENT_SCHEMA_VERSION,
      actorKind: 'system',
      actorId: `instance:${identity.instanceId}`,
      representedCapacity: 'platform',
      timeUncertainty: 'observed',
      operation: 'assert_startup',
      targetType: 'mesh_instance',
      targetId: identity.instanceId,
      subjectScope: `instance:${identity.instanceId}`,
      authorizationDecisionId: NOT_APPLICABLE,
      authorityRefs: NOT_APPLICABLE,
      purpose: 'platform_operation',
      result: 'completed',
      afterVersion: 'migrations:domain:1,audit:2',
      originChannel: 'system',
      retentionClass: 'foundation',
    });
    expect(() => auditEventInsert(event)).not.toThrow();
  });

  it('checkpoint exported: a service event naming the object, its digest, and the head', () => {
    const event = checkpointExportEvent({
      ...identity,
      eventId: '1f1f1f1f-1f1f-4f1f-8f1f-1f1f1f1f1f1f',
      correlationId: 'corr-checkpoint',
      occurredAt: '2026-09-20T15:00:01.000Z',
      verifierIdentity: 'instance:543e37e2-0ffa-4576-8443-e37f1355e421:startup',
      headSequence: 41,
      headHash: 'b'.repeat(64),
      previousCheckpointHash: 'a'.repeat(64),
      objectKey: `audit-checkpoints/${identity.instanceId}/20260920T150001000Z-000000000041.json`,
      objectSha256: 'c'.repeat(64),
      originChannel: 'cli',
    });
    expect(event).toMatchObject({
      eventType: 'audit.checkpoint_export',
      actorKind: 'service',
      actorId: 'instance:543e37e2-0ffa-4576-8443-e37f1355e421:startup',
      operation: 'export_checkpoint',
      targetType: 'audit_chain',
      targetVersion: '41',
      afterVersion: 'b'.repeat(64),
      beforeVersion: 'a'.repeat(64),
      externalReceipt: `sha256:${'c'.repeat(64)}`,
      originChannel: 'cli',
    });
    expect(event.destinationRef).toMatch(/^audit-checkpoints\//);
    expect(() => auditEventInsert(event)).not.toThrow();
    const first = checkpointExportEvent({
      ...identity,
      eventId: '2f2f2f2f-2f2f-4f2f-8f2f-2f2f2f2f2f2f',
      correlationId: 'corr-checkpoint',
      occurredAt: '2026-09-20T15:00:01.000Z',
      verifierIdentity: 'test',
      headSequence: 0,
      headHash: '0'.repeat(64),
      previousCheckpointHash: null,
      objectKey: 'audit-checkpoints/x/latest.json',
      objectSha256: 'c'.repeat(64),
      originChannel: 'cli',
    });
    expect(first.beforeVersion).toBe(NOT_APPLICABLE);
  });
});
