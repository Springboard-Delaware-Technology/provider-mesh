import { describe, expect, it } from 'vitest';

import {
  absent,
  auditEventInsert,
  AuditEventInputError,
  isAbsent,
  NOT_APPLICABLE,
  split,
  UNKNOWN,
} from '../../../src/modules/audit/index.js';
import type { AuditEventInput } from '../../../src/platform/ports/index.js';

const event: AuditEventInput = {
  eventId: '0F0F0F0F-0F0F-4F0F-8F0F-0F0F0F0F0F0F',
  eventType: 'test.synthetic',
  schemaVersion: 1,
  correlationId: 'corr-1',
  causationId: NOT_APPLICABLE,
  actorId: 'synthetic-actor-01',
  actorKind: 'service',
  delegatingActorId: NOT_APPLICABLE,
  representedOrgId: 'synthetic-org-01',
  representedUnitId: UNKNOWN,
  representedCapacity: 'navigator',
  occurredAt: '2026-09-20T12:34:56.789Z',
  externalTime: NOT_APPLICABLE,
  timeUncertainty: 'observed',
  operation: 'probe',
  targetType: 'synthetic_target',
  targetId: 'synthetic-target-0001',
  targetVersion: '3',
  subjectScope: 'org:synthetic-org-01',
  destinationRef: NOT_APPLICABLE,
  authorizationDecisionId: NOT_APPLICABLE,
  authorityRefs: ['synthetic-authority-01'],
  policyVersion: NOT_APPLICABLE,
  purpose: 'test',
  result: 'completed',
  reasonCode: NOT_APPLICABLE,
  beforeVersion: '2',
  afterVersion: '3',
  externalReceipt: NOT_APPLICABLE,
  reviewRef: NOT_APPLICABLE,
  originChannel: 'test',
  retentionClass: 'foundation',
};

function columnsOf(text: string): string[] {
  return (/\(([^)]+)\) VALUES/.exec(text)?.[1] ?? '').split(', ');
}

describe('absence markers (§5.5)', () => {
  it('distinguishes unknown from not applicable and splits into the column pair', () => {
    expect(absent('unknown')).toBe(UNKNOWN);
    expect(absent('not_applicable')).toBe(NOT_APPLICABLE);
    expect(isAbsent(UNKNOWN)).toBe(true);
    expect(isAbsent({ absent: 'other' })).toBe(false);
    expect(isAbsent(null)).toBe(false);
    expect(isAbsent('unknown')).toBe(false);
    expect(split<string>(UNKNOWN)).toEqual({ value: null, absent: 'unknown' });
    expect(split('v')).toEqual({ value: 'v', absent: null });
  });
});

describe('event to INSERT mapping (§5.5 rule 1: content columns only)', () => {
  it('names every content column and its absence pair, never a chain column', () => {
    const statement = auditEventInsert(event);
    const columns = columnsOf(statement.text);
    expect(columns).toHaveLength(57 - 3);
    for (const chain of ['sequence', 'prev_hash', 'hash', 'recorded_at']) {
      expect(columns).not.toContain(chain);
    }
    expect(statement.values).toHaveLength(columns.length);
    const at = (column: string): unknown => statement.values?.[columns.indexOf(column)];
    expect(at('event_id')).toBe('0f0f0f0f-0f0f-4f0f-8f0f-0f0f0f0f0f0f');
    expect(at('causation_id')).toBeNull();
    expect(at('causation_id_absent')).toBe('not_applicable');
    expect(at('represented_unit_id')).toBeNull();
    expect(at('represented_unit_id_absent')).toBe('unknown');
    expect(at('actor_id')).toBe('synthetic-actor-01');
    expect(at('actor_id_absent')).toBeNull();
    expect(at('authority_refs')).toEqual(['synthetic-authority-01']);
    expect(at('occurred_at')).toBe('2026-09-20T12:34:56.789Z');
    expect(statement.text).toMatch(/\$1::uuid/);
    expect(statement.text).toMatch(/::timestamptz/);
    expect(statement.text).toMatch(/::text\[\]/);
  });

  it.each([
    ['eventId', { eventId: 'not-a-uuid' }],
    ['eventType', { eventType: 'has space' }],
    ['schemaVersion', { schemaVersion: 0 }],
    ['correlationId', { correlationId: '' }],
    ['actorId', { actorId: 'x'.repeat(257) }],
    ['actorKind', { actorKind: 'robot' as never }],
    ['representedCapacity', { representedCapacity: 'not a code' }],
    ['occurredAt', { occurredAt: 'yesterday' }],
    ['externalTime', { externalTime: 'soon' }],
    ['targetId', { targetId: 'tab\there' }],
    ['authorityRefs', { authorityRefs: [] }],
    ['authorityRefs', { authorityRefs: ['ok', ''] }],
    ['result', { result: 'done' as never }],
    ['originChannel', { originChannel: '' }],
    ['actorId', { actorId: null as never }],
    ['reviewRef', { reviewRef: undefined as never }],
  ])('rejects %s by name only', (field, override) => {
    let caught: unknown;
    try {
      auditEventInsert({ ...event, ...override });
    } catch (error) {
      caught = error;
    }
    expect(caught).toBeInstanceOf(AuditEventInputError);
    expect((caught as AuditEventInputError).field).toBe(field);
    expect((caught as Error).message).toMatch(new RegExp(`^audit event invalid: ${field} `));
    expect((caught as Error).message).not.toContain('robot');
    expect((caught as Error).message).not.toContain('yesterday');
  });
});
