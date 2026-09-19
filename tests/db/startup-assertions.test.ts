import { mkdtemp, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

import { composeApplication } from '../../src/app/compose.js';
import type { SqlStatement } from '../../src/platform/ports/index.js';

import { requireDatabaseEnv } from './support.js';

const env = requireDatabaseEnv();

async function withApp<T>(
  overrides: Record<string, string>,
  work: (app: Awaited<ReturnType<typeof composeApplication>>, log: SqlStatement[]) => Promise<T>,
  migrationsDir?: string,
): Promise<T> {
  const log: SqlStatement[] = [];
  const app = await composeApplication(
    { ...env, ...overrides },
    { observe: (s) => log.push(s), ...(migrationsDir ? { migrationsDir } : {}) },
  );
  try {
    return await work(app, log);
  } finally {
    await app.stores.close();
  }
}

describe('startup assertions against the live database (A09)', () => {
  it('pass with the recorded instance identity and issue no write statement', async () => {
    await withApp({}, async (app, log) => {
      const report = await app.assertStartup();
      expect(report.environment).toBe(env['PROVIDER_MESH_ENVIRONMENT']);
      expect(report.appliedMigrations).toBe(app.compiledMigrations.length);
      for (const s of log) {
        expect(s.text).not.toMatch(
          /\b(INSERT|UPDATE|DELETE|TRUNCATE|CREATE|ALTER|DROP|GRANT|REVOKE)\b/i,
        );
      }
      expect(log.some((s) => s.text === 'BEGIN READ ONLY')).toBe(true);
      expect(log.some((s) => s.text === 'BEGIN')).toBe(false);
      expect(await app.readiness()).toEqual({ ready: true });
    });
  });

  it('fail on a mismatched instance id', async () => {
    await withApp(
      { PROVIDER_MESH_INSTANCE_ID: '00000000-0000-4000-8000-000000000000' },
      async (app) => {
        await expect(app.assertStartup()).rejects.toMatchObject({
          code: 'instance_marker_mismatch',
        });
        expect(await app.readiness()).toEqual({ ready: false, reason: 'instance_marker_mismatch' });
      },
    );
  });

  it('fail on a mismatched environment', async () => {
    const other = env['PROVIDER_MESH_ENVIRONMENT'] === 'ci' ? 'development' : 'ci';
    await withApp({ PROVIDER_MESH_ENVIRONMENT: other }, async (app) => {
      await expect(app.assertStartup()).rejects.toMatchObject({ code: 'instance_marker_mismatch' });
    });
  });

  it('fail when the release carries a migration the ledger does not record', async () => {
    const dir = await mkdtemp(path.join(tmpdir(), 'pm-extra-migration-'));
    await writeFile(path.join(dir, '9999_not_applied.sql'), '-- synthetic, never applied\n');
    await withApp(
      {},
      async (app) => {
        await expect(app.assertStartup()).rejects.toMatchObject({
          code: 'migration_ledger_mismatch',
        });
      },
      dir,
    );
  });
});
