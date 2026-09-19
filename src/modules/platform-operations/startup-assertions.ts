import type { RelationalStore } from '../../platform/ports/index.js';

import { compareIdentity, readInstanceMarker, type ExpectedIdentity } from './instance-identity.js';
import type { CompiledMigration } from './migration-set.js';
import { compareLedger, readLedger } from './migration-status.js';

/**
 * Startup assertions (Foundation 001 §5.3 rules 3–5; §5.5 rule 5; A09).
 *
 * Every step is a read in a `READ ONLY` transaction. Any failure is fatal to startup and is
 * reported as a code with no detail; the same checks back the readiness probe (§5.10).
 */
export type StartupAssertionCode =
  | 'database_unavailable'
  | 'instance_marker_mismatch'
  | 'migration_ledger_mismatch'
  | 'audit_sink_unavailable';

export class StartupAssertionError extends Error {
  readonly code: StartupAssertionCode;
  constructor(code: StartupAssertionCode) {
    super(`startup assertion failed: ${code}`);
    this.name = 'StartupAssertionError';
    this.code = code;
  }
}

export interface StartupAssertionInput {
  readonly domain: RelationalStore;
  readonly audit: RelationalStore;
  readonly expected: { readonly instanceId: string; readonly environment: string };
  readonly compiledMigrations: readonly CompiledMigration[];
}

export interface StartupReport {
  readonly instanceId: string;
  readonly environment: string;
  readonly appliedMigrations: number;
}

async function guard<T>(code: StartupAssertionCode, work: () => Promise<T>): Promise<T> {
  try {
    return await work();
  } catch (error) {
    if (error instanceof StartupAssertionError) throw error;
    throw new StartupAssertionError(code);
  }
}

export async function runStartupAssertions(input: StartupAssertionInput): Promise<StartupReport> {
  const { domain, audit, expected, compiledMigrations } = input;

  await guard('database_unavailable', () => domain.ping());

  const domainIdentity: ExpectedIdentity = { ...expected, databaseRole: 'domain' };
  const domainMarker = await guard('database_unavailable', () => readInstanceMarker(domain));
  if (!compareIdentity(domainIdentity, domainMarker).matched) {
    throw new StartupAssertionError('instance_marker_mismatch');
  }

  const ledger = await guard('database_unavailable', () => readLedger(domain));
  const ledgerOutcome = compareLedger(compiledMigrations, ledger);
  if (!ledgerOutcome.matched) throw new StartupAssertionError('migration_ledger_mismatch');

  await guard('audit_sink_unavailable', () => audit.ping());
  const auditIdentity: ExpectedIdentity = { ...expected, databaseRole: 'audit' };
  const auditMarker = await guard('audit_sink_unavailable', () => readInstanceMarker(audit));
  if (!compareIdentity(auditIdentity, auditMarker).matched) {
    throw new StartupAssertionError('instance_marker_mismatch');
  }

  return {
    instanceId: expected.instanceId,
    environment: expected.environment,
    appliedMigrations: ledgerOutcome.applied,
  };
}
