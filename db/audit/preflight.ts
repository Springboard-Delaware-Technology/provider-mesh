import {
  compareIdentity,
  readInstanceMarker,
  type InstanceMarker,
} from '../../src/modules/platform-operations/index.js';
import type { RelationalStore } from '../../src/platform/ports/index.js';

/**
 * Before any audit command touches the store: the connection is the role the command claims
 * to be, and `mesh_instance` carries the instance and environment the configuration names for
 * the audit database role (`replit.md` §9: confirm the intended environment before a verifier).
 */
export type AuditStopCode = 'wrong_role' | 'identity_mismatch';

export class AuditStopError extends Error {
  readonly code: AuditStopCode;
  readonly detail: string;
  constructor(code: AuditStopCode, detail: string) {
    super(`audit hard stop: ${code} (${detail})`);
    this.name = 'AuditStopError';
    this.code = code;
    this.detail = detail;
  }
}

export interface AuditPreflight {
  readonly role: string;
  readonly marker: InstanceMarker;
}

export async function preflightAuditStore(
  store: RelationalStore,
  expectedRole: string,
  expected: { readonly instanceId: string; readonly environment: string },
): Promise<AuditPreflight> {
  const role = await store.transaction(
    null,
    async (scope) =>
      (await scope.query<{ role: string }>({ text: 'SELECT current_user::text AS role' })).rows[0]
        ?.role,
    { readOnly: true },
  );
  if (role !== expectedRole) {
    throw new AuditStopError(
      'wrong_role',
      `connected as ${role ?? 'unknown'}, expected ${expectedRole}`,
    );
  }
  const marker = await readInstanceMarker(store);
  const outcome = compareIdentity({ ...expected, databaseRole: 'audit' }, marker);
  if (!outcome.matched) {
    throw new AuditStopError('identity_mismatch', `mesh_instance: ${outcome.problem}`);
  }
  return { role, marker: outcome.marker };
}
