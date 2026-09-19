import { CONFIG_NAMES, type EnvSource } from '../../src/app/config.js';

/** The database tests read the application's own names and fail, never skip, when absent. */
export function requireDatabaseEnv(): EnvSource {
  const missing = [
    CONFIG_NAMES.instanceId,
    CONFIG_NAMES.environment,
    CONFIG_NAMES.databaseUrl,
    CONFIG_NAMES.auditUrl,
  ].filter((name) => !process.env[name]);
  if (missing.length > 0) {
    throw new Error(
      `test:db requires configuration: ${missing.join(', ')} (see tests/db/README.md)`,
    );
  }
  return process.env;
}
