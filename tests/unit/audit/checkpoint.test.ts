import { describe, expect, it } from 'vitest';

import {
  CheckpointError,
  datedCheckpointKey,
  GENESIS_HASH,
  latestCheckpointKey,
  parseCheckpoint,
  serializeCheckpoint,
  type CheckpointRecord,
} from '../../../src/modules/audit/index.js';

const instanceId = '543e37e2-0ffa-4576-8443-e37f1355e421';
const record: CheckpointRecord = {
  version: 1,
  instanceId,
  environment: 'ci',
  sequence: 12,
  hash: 'a'.repeat(64),
  verifiedAt: '2026-09-20T15:20:23.870Z',
  verifierIdentity: 'test:verifier',
};

describe('checkpoint record (§5.5 rule 4)', () => {
  it('serializes with sorted keys and no whitespace, and parses back', () => {
    const text = new TextDecoder().decode(serializeCheckpoint(record));
    expect(text).toBe(
      `{"environment":"ci","hash":"${'a'.repeat(64)}","instanceId":"${instanceId}","sequence":12,"verifiedAt":"2026-09-20T15:20:23.870Z","verifierIdentity":"test:verifier","version":1}`,
    );
    expect(parseCheckpoint(serializeCheckpoint(record), instanceId)).toEqual(record);
  });

  it('keys are inside the object-store alphabet and name the instance', () => {
    expect(latestCheckpointKey(instanceId)).toBe(`audit-checkpoints/${instanceId}/latest.json`);
    expect(datedCheckpointKey(instanceId, record.verifiedAt, 12)).toBe(
      `audit-checkpoints/${instanceId}/20260920T152023870Z-000000000012.json`,
    );
    expect(() => latestCheckpointKey('not-a-uuid')).toThrow(CheckpointError);
  });

  it('refuses a malformed record, a foreign instance, and a non-genesis empty chain', () => {
    const bad = (text: string): unknown => {
      try {
        parseCheckpoint(new TextEncoder().encode(text), instanceId);
        return null;
      } catch (error) {
        return error;
      }
    };
    expect(bad('not json')).toMatchObject({ code: 'malformed' });
    expect(bad('[]')).toMatchObject({ code: 'malformed' });
    expect(bad(JSON.stringify({ ...record, hash: 'short' }))).toMatchObject({ code: 'malformed' });
    expect(bad(JSON.stringify({ ...record, version: 2 }))).toMatchObject({ code: 'malformed' });
    expect(bad(JSON.stringify({ ...record, sequence: -1 }))).toMatchObject({ code: 'malformed' });
    expect(
      bad(JSON.stringify({ ...record, instanceId: '00000000-0000-4000-8000-000000000000' })),
    ).toMatchObject({ code: 'foreign_instance' });
    expect(bad(JSON.stringify({ ...record, sequence: 0 }))).toMatchObject({ code: 'malformed' });
    expect(bad(JSON.stringify({ ...record, sequence: 0, hash: GENESIS_HASH }))).toBeNull();
  });
});
