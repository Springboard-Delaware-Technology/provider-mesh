import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { createStores, storeConfigs, type Stores } from '../../src/app/compose.js';
import type { ActorContext } from '../../src/platform/ports/index.js';

import { requireDatabaseEnv } from './support.js';

const context: ActorContext = {
  actorId: 'synthetic-actor-01',
  personIds: ['synthetic-person-0001'],
  orgIds: ['synthetic-org-01', 'synthetic-org-02'],
  collabIds: ['synthetic-collab-01'],
  purpose: 'assistance',
  capacity: 'navigator',
};

const READ = `SELECT current_setting('mesh.actor_id', true) AS actor, current_setting('mesh.org_ids', true) AS orgs, current_setting('mesh.capacity', true) AS capacity`;
interface Row {
  actor: string | null;
  orgs: string | null;
  capacity: string | null;
}

describe('session context is server-set and transaction-local (§5.6 rule 2)', () => {
  const env = requireDatabaseEnv();
  let stores: Stores;
  beforeAll(() => {
    stores = createStores(storeConfigs(env));
  });
  afterAll(async () => {
    await stores.close();
  });

  it('binds the validated context for the transaction only', async () => {
    const inside = await stores.domain.transaction(
      context,
      async (scope) => (await scope.query<Row>({ text: READ })).rows[0],
    );
    expect(inside).toEqual({
      actor: 'synthetic-actor-01',
      orgs: 'synthetic-org-01,synthetic-org-02',
      capacity: 'navigator',
    });

    // Same pool, next transaction, no context: every setting is empty again.
    const after = await stores.domain.transaction(
      null,
      async (scope) => (await scope.query<Row>({ text: READ })).rows[0],
    );
    expect(after).toEqual({ actor: '', orgs: '', capacity: '' });
  });

  it('a rolled-back transaction leaves nothing behind either', async () => {
    await stores.domain
      .transaction(context, async (scope) => {
        await scope.query({ text: 'SELECT 1/0' });
      })
      .catch(() => undefined);
    const after = await stores.domain.transaction(
      null,
      async (scope) => (await scope.query<Row>({ text: READ })).rows[0],
    );
    expect(after).toEqual({ actor: '', orgs: '', capacity: '' });
  });
});
