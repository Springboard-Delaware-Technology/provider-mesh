import { createHash } from 'node:crypto';

import { describe, expect, it } from 'vitest';

import {
  auditEventHash,
  canonicalAuditEvent,
  CanonicalizationError,
  CHAIN_SERIALIZATION_VERSION,
  GENESIS_HASH,
  HASHED_COLUMNS,
  hashOfCanonical,
  type HashedColumns,
} from '../../../src/modules/audit/index.js';

/** A fixed row; every value is synthetic. */
export const FIXED_ROW: HashedColumns = {
  event_id: '0f0f0f0f-0f0f-4f0f-8f0f-0f0f0f0f0f0f',
  event_type: 'test.synthetic',
  schema_version: 1,
  correlation_id: 'corr-1',
  causation_id: null,
  causation_id_absent: 'not_applicable',
  actor_id: 'synthetic-actor-01',
  actor_id_absent: null,
  actor_kind: 'service',
  delegating_actor_id: null,
  delegating_actor_id_absent: 'not_applicable',
  represented_org_id: 'synthetic-org-01',
  represented_org_id_absent: null,
  represented_unit_id: null,
  represented_unit_id_absent: 'unknown',
  represented_capacity: 'navigator',
  represented_capacity_absent: null,
  occurred_at: '2026-09-20T12:34:56.789000Z',
  recorded_at: '2026-09-20T12:34:57.000001Z',
  external_time: null,
  external_time_absent: 'not_applicable',
  time_uncertainty: 'observed',
  time_uncertainty_absent: null,
  operation: 'probe',
  target_type: 'synthetic_target',
  target_type_absent: null,
  target_id: 'x"y\\z/é€',
  target_id_absent: null,
  target_version: '3',
  target_version_absent: null,
  subject_scope: 'org:synthetic-org-01',
  subject_scope_absent: null,
  destination_ref: null,
  destination_ref_absent: 'not_applicable',
  authorization_decision_id: null,
  authorization_decision_id_absent: 'not_applicable',
  authority_refs: ['synthetic-authority-01', 'synthetic-authority-02'],
  authority_refs_absent: null,
  policy_version: null,
  policy_version_absent: 'not_applicable',
  purpose: 'test',
  purpose_absent: null,
  result: 'completed',
  reason_code: null,
  reason_code_absent: 'not_applicable',
  before_version: '2',
  before_version_absent: null,
  after_version: '3',
  after_version_absent: null,
  external_receipt: null,
  external_receipt_absent: 'not_applicable',
  review_ref: null,
  review_ref_absent: 'not_applicable',
  origin_channel: 'test',
  retention_class: 'foundation',
  sequence: 7n,
  prev_hash: GENESIS_HASH,
};

const EXPECTED_CANONICAL =
  '{"actor_id":"synthetic-actor-01","actor_id_absent":null,"actor_kind":"service","after_version":"3","after_version_absent":null,"authority_refs":["synthetic-authority-01","synthetic-authority-02"],"authority_refs_absent":null,"authorization_decision_id":null,"authorization_decision_id_absent":"not_applicable","before_version":"2","before_version_absent":null,"causation_id":null,"causation_id_absent":"not_applicable","correlation_id":"corr-1","delegating_actor_id":null,"delegating_actor_id_absent":"not_applicable","destination_ref":null,"destination_ref_absent":"not_applicable","event_id":"0f0f0f0f-0f0f-4f0f-8f0f-0f0f0f0f0f0f","event_type":"test.synthetic","external_receipt":null,"external_receipt_absent":"not_applicable","external_time":null,"external_time_absent":"not_applicable","occurred_at":"2026-09-20T12:34:56.789000Z","operation":"probe","origin_channel":"test","policy_version":null,"policy_version_absent":"not_applicable","prev_hash":"0000000000000000000000000000000000000000000000000000000000000000","purpose":"test","purpose_absent":null,"reason_code":null,"reason_code_absent":"not_applicable","recorded_at":"2026-09-20T12:34:57.000001Z","represented_capacity":"navigator","represented_capacity_absent":null,"represented_org_id":"synthetic-org-01","represented_org_id_absent":null,"represented_unit_id":null,"represented_unit_id_absent":"unknown","result":"completed","retention_class":"foundation","review_ref":null,"review_ref_absent":"not_applicable","schema_version":1,"sequence":7,"subject_scope":"org:synthetic-org-01","subject_scope_absent":null,"target_id":"x\\"y\\\\z/é€","target_id_absent":null,"target_type":"synthetic_target","target_type_absent":null,"target_version":"3","target_version_absent":null,"time_uncertainty":"observed","time_uncertainty_absent":null}';

describe('canonical serialization version 1 (§5.5 rule 1)', () => {
  it('is version 1 with 57 hashed columns in code-unit order', () => {
    expect(CHAIN_SERIALIZATION_VERSION).toBe(1);
    expect(HASHED_COLUMNS).toHaveLength(57);
    expect([...HASHED_COLUMNS]).toEqual([...HASHED_COLUMNS].sort());
    expect(HASHED_COLUMNS).not.toContain('hash');
    expect(HASHED_COLUMNS[0]).toBe('actor_id');
    expect(HASHED_COLUMNS[HASHED_COLUMNS.length - 1]).toBe('time_uncertainty_absent');
  });

  it('has a fixed form: sorted keys, no whitespace, JSON strings, digits, arrays, null', () => {
    // If this text changes, the serialization changed: that is a new version (see the migration).
    expect(canonicalAuditEvent(FIXED_ROW)).toBe(EXPECTED_CANONICAL);
  });

  it('hashes the UTF-8 bytes of the canonical text with SHA-256', () => {
    const expected = createHash('sha256').update(EXPECTED_CANONICAL, 'utf8').digest('hex');
    expect(hashOfCanonical(EXPECTED_CANONICAL)).toBe(expected);
    expect(auditEventHash(FIXED_ROW)).toBe(expected);
    expect(hashOfCanonical('abc')).toBe(
      'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad',
    );
  });

  it("is independent of the row object's key order and changes when any column changes", () => {
    const reversed: Record<string, unknown> = {};
    for (const column of [...HASHED_COLUMNS].reverse()) reversed[column] = FIXED_ROW[column];
    const shuffled = reversed as HashedColumns;
    expect(canonicalAuditEvent(shuffled)).toBe(EXPECTED_CANONICAL);
    const base = auditEventHash(FIXED_ROW);
    expect(auditEventHash({ ...FIXED_ROW, sequence: 8n })).not.toBe(base);
    expect(auditEventHash({ ...FIXED_ROW, causation_id_absent: 'unknown' })).not.toBe(base);
    expect(auditEventHash({ ...FIXED_ROW, authority_refs: ['synthetic-authority-01'] })).not.toBe(
      base,
    );
  });

  it('escapes control characters as PostgreSQL to_json does', () => {
    const text = canonicalAuditEvent({ ...FIXED_ROW, target_id: 'tab\tnl\nbell\u0007del\u007F' });
    expect(text).toContain('"target_id":"tab\\tnl\\nbell\\u0007del\u007F"');
  });

  it('refuses a non-canonical timestamp, a missing column, and an unsupported value', () => {
    expect(() =>
      canonicalAuditEvent({ ...FIXED_ROW, occurred_at: '2026-09-20T12:34:56Z' }),
    ).toThrow(CanonicalizationError);
    const { actor_kind: _dropped, ...missing } = FIXED_ROW;
    expect(() => canonicalAuditEvent(missing as unknown as HashedColumns)).toThrow(
      /actor_kind is missing/,
    );
    expect(() => canonicalAuditEvent({ ...FIXED_ROW, schema_version: 1.5 })).toThrow(
      /schema_version/,
    );
    expect(() => canonicalAuditEvent({ ...FIXED_ROW, authority_refs: [1] as never })).toThrow(
      /authority_refs/,
    );
  });
});
