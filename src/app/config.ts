/**
 * Configuration names and readers (Foundation 001 §5.3, A08).
 *
 * The application reads only Springboard-named variables. Platform-injected database variables
 * are never read; `scripts/check-db-env-names.sh` enforces that repository-wide.
 */
export const CONFIG_NAMES = {
  instanceId: 'PROVIDER_MESH_INSTANCE_ID',
  environment: 'PROVIDER_MESH_ENVIRONMENT',
  databaseUrl: 'PROVIDER_MESH_DATABASE_URL',
  auditUrl: 'PROVIDER_MESH_AUDIT_URL',
  migrateUrl: 'PROVIDER_MESH_MIGRATE_URL',
  auditMigrateUrl: 'PROVIDER_MESH_AUDIT_MIGRATE_URL',
  auditReaderUrl: 'PROVIDER_MESH_AUDIT_READER_URL',
  port: 'PORT',
} as const;

export type ConfigName = (typeof CONFIG_NAMES)[keyof typeof CONFIG_NAMES];

export type Environment = 'development' | 'ci' | 'staging' | 'production';
const ENVIRONMENTS: readonly Environment[] = ['development', 'ci', 'staging', 'production'];

/** Thrown when configuration is absent or malformed. The message names the variable, never a value. */
export class ConfigError extends Error {
  readonly variable: ConfigName;
  constructor(variable: ConfigName, problem: 'missing' | 'invalid') {
    super(`configuration ${problem}: ${variable}`);
    this.name = 'ConfigError';
    this.variable = variable;
  }
}

export type EnvSource = Readonly<Record<string, string | undefined>>;

export interface HttpConfig {
  readonly port: number;
}

export interface InstanceConfig {
  readonly instanceId: string;
  readonly environment: Environment;
}

export const DEFAULT_PORT = 3000;

export function readRequired(env: EnvSource, name: ConfigName): string {
  const value = env[name];
  if (value === undefined || value.trim() === '') throw new ConfigError(name, 'missing');
  return value;
}

/** The port the platform supplies (§5.10); `DEFAULT_PORT` when none is set. */
export function httpConfig(env: EnvSource): HttpConfig {
  const raw = env[CONFIG_NAMES.port];
  if (raw === undefined || raw.trim() === '') return { port: DEFAULT_PORT };
  if (!/^\d{1,5}$/.test(raw)) throw new ConfigError(CONFIG_NAMES.port, 'invalid');
  const port = Number(raw);
  if (port < 1 || port > 65535) throw new ConfigError(CONFIG_NAMES.port, 'invalid');
  return { port };
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Instance identity expected at startup (§5.3 rule 3); compared with `mesh_instance` in C3. */
export function instanceConfig(env: EnvSource): InstanceConfig {
  const instanceId = readRequired(env, CONFIG_NAMES.instanceId);
  if (!UUID.test(instanceId)) throw new ConfigError(CONFIG_NAMES.instanceId, 'invalid');
  const environment = readRequired(env, CONFIG_NAMES.environment);
  if (!isEnvironment(environment)) throw new ConfigError(CONFIG_NAMES.environment, 'invalid');
  return { instanceId, environment };
}

function isEnvironment(value: string): value is Environment {
  return (ENVIRONMENTS as readonly string[]).includes(value);
}
