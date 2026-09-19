import { describe, expect, it } from 'vitest';

import { composeApplication } from '../../../src/app/compose.js';
import { ConfigError } from '../../../src/app/config.js';
import { ConnectionConfigError } from '../../../src/platform/adapters/postgres/index.js';

const url =
  'postgresql://mesh_app:fake@db.example.invalid/provider_mesh?sslmode=verify-full&sslrootcert=system';
const base = {
  PROVIDER_MESH_INSTANCE_ID: '543e37e2-0ffa-4576-8443-e37f1355e421',
  PROVIDER_MESH_ENVIRONMENT: 'ci',
  PROVIDER_MESH_DATABASE_URL: url,
  PROVIDER_MESH_AUDIT_URL: url,
};

describe('composition with missing and weakened configuration (§5.3 rules 1–2, §11)', () => {
  it.each([
    'PROVIDER_MESH_INSTANCE_ID',
    'PROVIDER_MESH_ENVIRONMENT',
    'PROVIDER_MESH_DATABASE_URL',
    'PROVIDER_MESH_AUDIT_URL',
  ])('refuses to compose without %s, naming it', async (name) => {
    const env = Object.fromEntries(Object.entries(base).filter(([key]) => key !== name));
    await expect(composeApplication(env)).rejects.toThrow(
      new ConfigError(name as never, 'missing'),
    );
  });

  it('refuses a connection option that weakens certificate verification', async () => {
    const env = { ...base, PROVIDER_MESH_AUDIT_URL: url.replace('verify-full', 'require') };
    await expect(composeApplication(env)).rejects.toThrow(
      new ConnectionConfigError('PROVIDER_MESH_AUDIT_URL', 'sslmode must be verify-full'),
    );
  });

  it('reports an unreachable store as not ready with a code and no detail', async () => {
    const application = await composeApplication({
      ...base,
      PROVIDER_MESH_DATABASE_URL: url.replace('db.example.invalid', '127.0.0.1:1'),
    });
    try {
      expect(await application.readiness()).toEqual({
        ready: false,
        reason: 'database_unavailable',
      });
      await expect(application.assertStartup()).rejects.toMatchObject({
        code: 'database_unavailable',
      });
    } finally {
      await application.stores.close();
    }
  });
});
