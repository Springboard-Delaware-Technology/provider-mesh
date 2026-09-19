import { describe, expect, it } from 'vitest';

import {
  bindSessionStatement,
  serializeContext,
  SessionContextError,
  SESSION_SETTINGS,
} from '../../../src/platform/adapters/postgres/index.js';
import type { ActorContext } from '../../../src/platform/ports/index.js';

const context: ActorContext = {
  actorId: 'actor-1',
  personIds: ['person-1'],
  orgIds: ['org-A', 'org-B'],
  collabIds: [],
  purpose: 'assistance',
  capacity: null,
};

describe('session context serialization (§5.6 rule 2)', () => {
  it('maps every field to its transaction-local setting', () => {
    expect(serializeContext(context)).toEqual([
      ['mesh.actor_id', 'actor-1'],
      ['mesh.person_ids', 'person-1'],
      ['mesh.org_ids', 'org-A,org-B'],
      ['mesh.collab_ids', ''],
      ['mesh.purpose', 'assistance'],
      ['mesh.capacity', ''],
    ]);
  });

  it('writes every setting empty for a null context', () => {
    const values = serializeContext(null);
    expect(values.map(([k]) => k)).toEqual(Object.values(SESSION_SETTINGS));
    expect(values.every(([, v]) => v === '')).toBe(true);
  });

  it('rejects identifiers that could break the list encoding or smuggle SQL', () => {
    for (const bad of ['a,b', "x'; DROP TABLE t;--", '', ' space', 'ünïcode']) {
      expect(() => serializeContext({ ...context, orgIds: [bad] })).toThrow(SessionContextError);
    }
    expect(() => serializeContext({ ...context, actorId: 'a,b' })).toThrow(/orgIds|actorId/);
  });

  it('binds through set_config with is_local = true and parameters only', () => {
    const statement = bindSessionStatement(context);
    expect(statement.text).toBe(
      'SELECT set_config($1, $2, true), set_config($3, $4, true), set_config($5, $6, true), set_config($7, $8, true), set_config($9, $10, true), set_config($11, $12, true)',
    );
    expect(statement.values).toEqual([
      'mesh.actor_id',
      'actor-1',
      'mesh.person_ids',
      'person-1',
      'mesh.org_ids',
      'org-A,org-B',
      'mesh.collab_ids',
      '',
      'mesh.purpose',
      'assistance',
      'mesh.capacity',
      '',
    ]);
  });
});
