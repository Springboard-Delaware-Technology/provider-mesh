import { describe, expect, it } from 'vitest';

import { composeApplication } from '../../src/app/compose.js';
import type { SqlStatement } from '../../src/platform/ports/index.js';

import { copyMigrationsRoot, requireDatabaseEnv } from './support.js';

const env = requireDatabaseEnv();

async function withApp<T>(
  overrides: Record<string, string>,
  work: (app: Awaited<ReturnType<typeof composeApplication>>, log: SqlStatement[]) => Promise<T>,
  migrationsRoot?: string,
): Promise<T> {
  const log: SqlStatement[] = [];
  const app = await composeApplication(
    { ...env, ...overrides },
    { observe: (s) => log.push(s), ...(migrationsRoot ? { migrationsRoot } : {}) },
  );
  try {
    return await work(app, log);
  } finally {
    await app.stores.close();
  }
}

describe('startup assertions against the live database (A09)', () => {
  it('pass with the recorded instance identity and both ledgers at head, issuing no write', async () => {
    await withApp({}, async (app, log) => {
      const report = await app.assertStartup();
      expect(report.environment).toBe(env['PROVIDER_MESH_ENVIRONMENT']);
      expect(report.appliedMigrations).toEqual({
        domain: app.compiledMigrations.domain.length,
        audit: app.compiledMigrations.audit.length,
      });
      expect(report.appliedMigrations.domain).toBeGreaterThanOrEqual(1);
      expect(report.appliedMigrations.audit).toBeGreaterThanOrEqual(1);
      for (const s of log) {
        expect(s.text).not.toMatch(
          /\b(INSERT|UPDATE|DELETE|TRUNCATE|CREATE|ALTER|DROP|GRANT|REVOKE)\b/i,
        );
      }
      expect(log.some((s) => s.text === 'BEGIN READ ONLY')).toBe(true);
      expect(log.some((s) => s.text === 'BEGIN')).toBe(false);
      expect(log.filter((s) => s.text.startsWith('SELECT filename'))).toHaveLength(2);
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

  it('fail when the release carries a domain migration the domain ledger does not record', async () => {
    const root = await copyMigrationsRoot({
      target: 'domain',
      filename: '9999_not_applied.sql',
      content: '-- synthetic, never applied\n',
    });
    await withApp(
      {},
      async (app) => {
        await expect(app.assertStartup()).rejects.toMatchObject({
          code: 'migration_ledger_mismatch',
        });
        expect(await app.readiness()).toEqual({
          ready: false,
          reason: 'migration_ledger_mismatch',
        });
      },
      root,
    );
  });

  it('fail when the release carries an audit migration the audit ledger does not record', async () => {
    const root = await copyMigrationsRoot({
      target: 'audit',
      filename: '9999_not_applied.sql',
      content: '-- synthetic, never applied\n',
    });
    await withApp(
      {},
      async (app) => {
        await expect(app.assertStartup()).rejects.toMatchObject({
          code: 'migration_ledger_mismatch',
        });
      },
      root,
    );
  });
});
