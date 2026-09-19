import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { createStores, storeConfigs, type Stores } from '../../src/app/compose.js';
import type { SqlStatement } from '../../src/platform/ports/index.js';

import { requireDatabaseEnv } from './support.js';

describe('connection discipline against the live development-class database (A07, A09)', () => {
  const env = requireDatabaseEnv();
  const configs = storeConfigs(env);
  const statements: SqlStatement[] = [];
  let stores: Stores;
  beforeAll(() => {
    stores = createStores(configs, (s) => statements.push(s));
  });
  afterAll(async () => {
    await stores.close();
  });

  it('both configurations are verify-full against the system trust store', () => {
    expect(configs.domain).toMatchObject({
      sslMode: 'verify-full',
      trustStore: 'system',
      ssl: { rejectUnauthorized: true },
    });
    expect(configs.audit).toMatchObject({
      sslMode: 'verify-full',
      trustStore: 'system',
      ssl: { rejectUnauthorized: true },
    });
  });

  it('both live connections are TLS sessions as the intended roles', async () => {
    for (const [store, role] of [
      [stores.domain, 'mesh_app'],
      [stores.audit, 'mesh_audit_writer'],
    ] as const) {
      const row = await store.transaction(
        null,
        async (scope) => {
          const r = await scope.query<{ ssl: boolean; role: string; db: string }>({
            text: 'SELECT s.ssl, current_user AS role, current_database() AS db FROM pg_stat_ssl s WHERE s.pid = pg_backend_pid()',
          });
          return r.rows[0];
        },
        { readOnly: true },
      );
      expect(row).toMatchObject({ ssl: true, role });
    }
  });

  it('the domain identity cannot reach the audit database (§5.2, A13 groundwork)', async () => {
    const denied = await stores.domain.transaction(
      null,
      async (scope) => {
        const r = await scope.query<{ can: boolean }>({
          text: "SELECT has_database_privilege('mesh_app', 'provider_mesh_audit', 'CONNECT') AS can",
        });
        return r.rows[0]?.can;
      },
      { readOnly: true },
    );
    expect(denied).toBe(false);
  });

  it('a READ ONLY transaction is refused any write by the server', async () => {
    await expect(
      stores.domain.transaction(
        null,
        (scope) => scope.query({ text: 'CREATE TEMP TABLE pm_probe (x int)' }),
        {
          readOnly: true,
        },
      ),
    ).rejects.toThrow(/read-only/);
  });
});
