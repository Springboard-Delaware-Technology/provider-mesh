import { randomUUID } from 'node:crypto';

import { LedgerStore } from '../../db/ledger/connection.js';
import { CONFIG_NAMES, type EnvSource } from '../../src/app/config.js';
import { NOT_APPLICABLE } from '../../src/modules/audit/index.js';
import {
  buildConnectionConfig,
  type StoreConnectionConfig,
} from '../../src/platform/adapters/postgres/index.js';
import type {
  ActorContext,
  AuditEventInput,
  QueryResult,
  RelationalStore,
  SqlStatement,
  TransactionOptions,
  TransactionScope,
} from '../../src/platform/ports/index.js';

/**
 * Audit tests (§5.5; A13–A15) run as the roles they claim to be — `mesh_audit_writer`,
 * `mesh_audit_reader`, `mesh_app`, and, for the tamper cases, `mesh_migrate` — through the
 * same configuration names the application and the commands read. Nothing persists: every
 * write runs inside a transaction that rolls back.
 */
const REQUIRED = [
  CONFIG_NAMES.instanceId,
  CONFIG_NAMES.environment,
  CONFIG_NAMES.databaseUrl,
  CONFIG_NAMES.auditUrl,
  CONFIG_NAMES.auditMigrateUrl,
  CONFIG_NAMES.auditReaderUrl,
] as const;

export function requireAuditEnv(): EnvSource {
  const missing = REQUIRED.filter((name) => !process.env[name]);
  if (missing.length > 0) {
    throw new Error(
      `test:db requires configuration: ${missing.join(', ')} (see tests/audit/README.md)`,
    );
  }
  return process.env;
}

export type AuditRole = 'writer' | 'reader' | 'migrate';

const VARIABLE: Readonly<Record<AuditRole, (typeof CONFIG_NAMES)[keyof typeof CONFIG_NAMES]>> = {
  writer: CONFIG_NAMES.auditUrl,
  reader: CONFIG_NAMES.auditReaderUrl,
  migrate: CONFIG_NAMES.auditMigrateUrl,
};

export const ROLE_NAME: Readonly<Record<AuditRole, string>> = {
  writer: 'mesh_audit_writer',
  reader: 'mesh_audit_reader',
  migrate: 'mesh_migrate',
};

export function auditConfig(env: EnvSource, role: AuditRole): StoreConnectionConfig {
  const variable = VARIABLE[role];
  const url = env[variable];
  if (url === undefined) throw new Error(`test:db requires configuration: ${variable}`);
  return buildConnectionConfig(variable, url);
}

/** One client, as the named audit role; `LedgerStore` is a single-client store for any role. */
export function connectAs(env: EnvSource, role: AuditRole): Promise<LedgerStore> {
  return LedgerStore.connect(auditConfig(env, role));
}

/**
 * A `RelationalStore` whose every transaction is a savepoint inside one outer transaction
 * (the caller's `rollbackOnly` scope), so the Audit Service can be exercised end to end —
 * appends, head reads, checkpoint events — and leave nothing behind.
 */
export class SavepointStore implements RelationalStore {
  readonly #scope: TransactionScope;
  #n = 0;

  constructor(scope: TransactionScope) {
    this.#scope = scope;
  }

  async transaction<T>(
    context: ActorContext | null,
    work: (scope: TransactionScope) => Promise<T>,
    _options: TransactionOptions = {},
  ): Promise<T> {
    if (context !== null) throw new Error('the audit store binds no compartment context');
    this.#n += 1;
    const name = `pm_test_sp_${String(this.#n)}`;
    await this.#scope.query({ text: `SAVEPOINT ${name}` });
    try {
      const value = await work(this.#scope);
      await this.#scope.query({ text: `RELEASE SAVEPOINT ${name}` });
      return value;
    } catch (error) {
      await this.#scope.query({ text: `ROLLBACK TO SAVEPOINT ${name}` });
      throw error;
    }
  }

  ping(): Promise<void> {
    return Promise.resolve();
  }

  close(): Promise<void> {
    return Promise.resolve();
  }

  query<Row>(statement: SqlStatement): Promise<QueryResult<Row>> {
    return this.#scope.query<Row>(statement);
  }
}

/** A fully populated synthetic event; every value is fictional. */
export function sampleEvent(overrides: Partial<AuditEventInput> = {}): AuditEventInput {
  return {
    eventId: randomUUID(),
    eventType: 'test.synthetic',
    schemaVersion: 1,
    correlationId: `corr-${randomUUID()}`,
    causationId: NOT_APPLICABLE,
    actorId: 'synthetic-actor-01',
    actorKind: 'service',
    delegatingActorId: NOT_APPLICABLE,
    representedOrgId: 'synthetic-org-01',
    representedUnitId: { absent: 'unknown' },
    representedCapacity: 'navigator',
    occurredAt: '2026-09-20T12:34:56.789Z',
    externalTime: NOT_APPLICABLE,
    timeUncertainty: 'observed',
    operation: 'probe',
    targetType: 'synthetic_target',
    targetId: 'synthetic-target-0001',
    targetVersion: '3',
    subjectScope: 'org:synthetic-org-01',
    destinationRef: NOT_APPLICABLE,
    authorizationDecisionId: NOT_APPLICABLE,
    authorityRefs: ['synthetic-authority-01', 'synthetic-authority-02'],
    policyVersion: NOT_APPLICABLE,
    purpose: 'test',
    result: 'completed',
    reasonCode: NOT_APPLICABLE,
    beforeVersion: '2',
    afterVersion: '3',
    externalReceipt: NOT_APPLICABLE,
    reviewRef: NOT_APPLICABLE,
    originChannel: 'test',
    retentionClass: 'foundation',
    ...overrides,
  };
}

/** The raw INSERT a writer would issue to forge a chain position (A14). */
export function forgedInsert(eventId: string, sequence: number, hash: string): SqlStatement {
  return {
    text: `INSERT INTO audit_event (event_id, event_type, schema_version, correlation_id, causation_id_absent,
             actor_id, actor_kind, delegating_actor_id_absent, represented_org_id_absent,
             represented_unit_id_absent, represented_capacity_absent, occurred_at, recorded_at,
             external_time_absent, time_uncertainty_absent, operation, target_type_absent, target_id_absent,
             target_version_absent, subject_scope_absent, destination_ref_absent,
             authorization_decision_id_absent, authority_refs_absent, policy_version_absent, purpose_absent,
             result, reason_code_absent, before_version_absent, after_version_absent, external_receipt_absent,
             review_ref_absent, origin_channel, retention_class, sequence, prev_hash, hash)
           VALUES ($1::uuid, 'test.forged', 1, 'corr-forged', 'not_applicable',
             'synthetic-actor-02', 'service', 'not_applicable', 'not_applicable',
             'not_applicable', 'not_applicable', '2026-09-20T00:00:00Z', '1999-01-01T00:00:00Z',
             'not_applicable', 'not_applicable', 'forge', 'not_applicable', 'not_applicable',
             'not_applicable', 'not_applicable', 'not_applicable',
             'not_applicable', 'not_applicable', 'not_applicable', 'not_applicable',
             'attempted', 'not_applicable', 'not_applicable', 'not_applicable', 'not_applicable',
             'not_applicable', 'test', 'foundation', $2, $3, $3)`,
    values: [eventId, sequence, hash],
  };
}

export const HEAD_SQL =
  'SELECT sequence::text AS sequence, hash, event_id::text AS event_id FROM audit_chain_head';

export interface HeadRowText {
  readonly sequence: string;
  readonly hash: string;
  readonly event_id: string;
}
