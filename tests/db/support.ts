import { cp, mkdtemp, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { CONFIG_NAMES, type EnvSource } from '../../src/app/config.js';
import type { MigrationTarget } from '../../src/modules/platform-operations/index.js';
import {
  buildConnectionConfig,
  type StoreConnectionConfig,
} from '../../src/platform/adapters/postgres/index.js';

/** The repository's migration root: `domain/` and `audit/` (§5.4). */
export const MIGRATIONS_ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
  '..',
  'db',
  'migrations',
);

const REQUIRED = [
  CONFIG_NAMES.instanceId,
  CONFIG_NAMES.environment,
  CONFIG_NAMES.databaseUrl,
  CONFIG_NAMES.auditUrl,
  CONFIG_NAMES.migrateUrl,
  CONFIG_NAMES.auditMigrateUrl,
] as const;

/** The database tests read the application's own names and fail, never skip, when absent. */
export function requireDatabaseEnv(): EnvSource {
  const missing = REQUIRED.filter((name) => !process.env[name]);
  if (missing.length > 0) {
    throw new Error(
      `test:db requires configuration: ${missing.join(', ')} (see tests/db/README.md)`,
    );
  }
  return process.env;
}

/** The `mesh_migrate` connection for one target, as `db:migrate` builds it (§5.2). */
export function migrationStoreConfig(
  env: EnvSource,
  target: MigrationTarget,
): StoreConnectionConfig {
  const variable = target === 'domain' ? CONFIG_NAMES.migrateUrl : CONFIG_NAMES.auditMigrateUrl;
  const url = env[variable];
  if (url === undefined) throw new Error(`test:db requires configuration: ${variable}`);
  return buildConnectionConfig(variable, url);
}

export interface ExtraMigration {
  readonly target: MigrationTarget;
  readonly filename: string;
  readonly content: string;
}

/**
 * A temporary copy of the repository's migration root, optionally with one extra synthetic
 * file, for exercising the mechanism and the startup assertion against a set that differs
 * from what the database has applied — never against the committed files.
 */
export async function copyMigrationsRoot(extra?: ExtraMigration): Promise<string> {
  const root = await mkdtemp(path.join(tmpdir(), 'pm-migrations-copy-'));
  await cp(MIGRATIONS_ROOT, root, { recursive: true });
  if (extra) await writeFile(path.join(root, extra.target, extra.filename), extra.content);
  return root;
}
