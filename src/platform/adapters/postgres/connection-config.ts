/**
 * Connection-configuration builder (Foundation 001 §5.3 rule 2, A07).
 *
 * Parses one Springboard-named connection URL into the exact client configuration. Certificate
 * verification is mandatory: `sslmode` must be `verify-full`, the trust store must be the
 * system's (`sslrootcert` absent or `system`), and no other option is accepted. Any URL that
 * would weaken verification is rejected here, before a client exists. Errors name the variable
 * and the rule; they never carry any part of the value.
 */
export type SslMode = 'verify-full';
export type TrustStore = 'system';

export interface StoreConnectionConfig {
  readonly variable: string;
  readonly host: string;
  readonly port: number;
  readonly database: string;
  readonly user: string;
  readonly password: string;
  readonly sslMode: SslMode;
  readonly trustStore: TrustStore;
  readonly ssl: { readonly rejectUnauthorized: true; readonly servername: string };
}

export class ConnectionConfigError extends Error {
  readonly variable: string;
  readonly rule: string;
  constructor(variable: string, rule: string) {
    super(`configuration invalid: ${variable} (${rule})`);
    this.name = 'ConnectionConfigError';
    this.variable = variable;
    this.rule = rule;
  }
}

const ALLOWED_PARAMS: ReadonlySet<string> = new Set(['sslmode', 'sslrootcert', 'application_name']);
const DEFAULT_PORT = 5432;

export function buildConnectionConfig(variable: string, url: string): StoreConnectionConfig {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    throw new ConnectionConfigError(variable, 'must be a URL');
  }
  if (parsed.protocol !== 'postgresql:' && parsed.protocol !== 'postgres:') {
    throw new ConnectionConfigError(variable, 'scheme must be postgresql');
  }
  const host = parsed.hostname;
  if (host === '') throw new ConnectionConfigError(variable, 'host is required');
  const port = parsed.port === '' ? DEFAULT_PORT : Number(parsed.port);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new ConnectionConfigError(variable, 'port is invalid');
  }
  const database = decodeURIComponent(parsed.pathname.replace(/^\//, ''));
  if (database === '' || database.includes('/')) {
    throw new ConnectionConfigError(variable, 'database name is required');
  }
  const user = decodeURIComponent(parsed.username);
  if (user === '') throw new ConnectionConfigError(variable, 'user is required');
  const password = decodeURIComponent(parsed.password);
  if (password === '') throw new ConnectionConfigError(variable, 'password is required');

  for (const key of parsed.searchParams.keys()) {
    if (!ALLOWED_PARAMS.has(key)) {
      throw new ConnectionConfigError(variable, `option not permitted: ${key}`);
    }
  }
  if (parsed.searchParams.get('sslmode') !== 'verify-full') {
    throw new ConnectionConfigError(variable, 'sslmode must be verify-full');
  }
  const rootcert = parsed.searchParams.get('sslrootcert');
  if (rootcert !== null && rootcert !== 'system') {
    throw new ConnectionConfigError(variable, 'sslrootcert must be system');
  }

  return {
    variable,
    host,
    port,
    database,
    user,
    password,
    sslMode: 'verify-full',
    trustStore: 'system',
    ssl: { rejectUnauthorized: true, servername: host },
  };
}

/** A description safe to log: no password, no user, no query string. */
export function describeConnection(config: StoreConnectionConfig): string {
  return `${config.variable}: ${config.host}:${String(config.port)}/${config.database} ${config.sslMode}`;
}
