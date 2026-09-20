/**
 * Composition (Foundation 001 §4.2, §4.4): adapters are selected here, from configuration,
 * and nowhere else. This file is imported by `main.ts` and by tests that exercise startup
 * with correct, missing, and mismatched configuration (§11).
 */
import path from 'node:path';

import type { ReadinessProbe, ReadinessResult } from '../modules/access-gateway/index.js';
import {
  loadCompiledMigrationSets,
  runStartupAssertions,
  StartupAssertionError,
  type CompiledMigrationSets,
  type StartupReport,
} from '../modules/platform-operations/index.js';
import {
  buildConnectionConfig,
  PostgresRelationalStore,
  type StatementObserver,
  type StoreConnectionConfig,
} from '../platform/adapters/postgres/index.js';
import type { RelationalStore } from '../platform/ports/index.js';

import {
  CONFIG_NAMES,
  instanceConfig,
  storeUrls,
  type EnvSource,
  type InstanceConfig,
} from './config.js';

export interface StoreConfigs {
  readonly domain: StoreConnectionConfig;
  readonly audit: StoreConnectionConfig;
}

/** Builds both verified-TLS connection configurations from the two Springboard-named URLs. */
export function storeConfigs(env: EnvSource): StoreConfigs {
  const urls = storeUrls(env);
  return {
    domain: buildConnectionConfig(CONFIG_NAMES.databaseUrl, urls.databaseUrl),
    audit: buildConnectionConfig(CONFIG_NAMES.auditUrl, urls.auditUrl),
  };
}

export interface Stores {
  readonly domain: RelationalStore;
  readonly audit: RelationalStore;
  close(): Promise<void>;
}

export function createStores(configs: StoreConfigs, observe?: StatementObserver): Stores {
  const domain = new PostgresRelationalStore(configs.domain, observe ? { observe } : {});
  const audit = new PostgresRelationalStore(configs.audit, observe ? { observe } : {});
  return {
    domain,
    audit,
    close: async () => {
      await Promise.allSettled([domain.close(), audit.close()]);
    },
  };
}

/** Root of the migration sets: `<root>/domain` and `<root>/audit` (§5.4). */
export const DEFAULT_MIGRATIONS_ROOT = path.resolve(process.cwd(), 'db', 'migrations');

export interface Application {
  readonly instance: InstanceConfig;
  readonly stores: Stores;
  readonly compiledMigrations: CompiledMigrationSets;
  /** Runs the §5.3 assertions once; throws `StartupAssertionError` with a code on failure. */
  assertStartup(): Promise<StartupReport>;
  /** Re-runs the same read-only assertions for `/readyz` (§5.10); never throws. */
  readiness: ReadinessProbe;
}

export async function composeApplication(
  env: EnvSource,
  options: { readonly migrationsRoot?: string; readonly observe?: StatementObserver } = {},
): Promise<Application> {
  const instance = instanceConfig(env);
  const configs = storeConfigs(env);
  const compiledMigrations = await loadCompiledMigrationSets(
    options.migrationsRoot ?? DEFAULT_MIGRATIONS_ROOT,
  );
  const stores = createStores(configs, options.observe);

  const assertStartup = (): Promise<StartupReport> =>
    runStartupAssertions({
      domain: stores.domain,
      audit: stores.audit,
      expected: instance,
      compiledMigrations,
    });

  const readiness: ReadinessProbe = async (): Promise<ReadinessResult> => {
    try {
      await assertStartup();
      return { ready: true };
    } catch (error) {
      if (error instanceof StartupAssertionError) return { ready: false, reason: error.code };
      return { ready: false, reason: 'database_unavailable' };
    }
  };

  return { instance, stores, compiledMigrations, assertStartup, readiness };
}
