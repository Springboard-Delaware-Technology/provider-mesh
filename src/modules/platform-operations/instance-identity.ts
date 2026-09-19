import type { RelationalStore } from '../../platform/ports/index.js';

/**
 * Instance-identity marker (Foundation 001 §5.3 rules 3 and 6; ADR-001 §6.3 rule 8).
 * Written once by provisioning; read here; never written by the application.
 */
export type DatabaseRole = 'domain' | 'audit';

export interface InstanceMarker {
  readonly instanceId: string;
  readonly environment: string;
  readonly databaseRole: string;
  readonly createdAt: string;
}

export interface ExpectedIdentity {
  readonly instanceId: string;
  readonly environment: string;
  readonly databaseRole: DatabaseRole;
}

interface MarkerRow {
  readonly instance_id: string;
  readonly environment: string;
  readonly database_role: string;
  readonly created_at: string | Date;
}

/** Reads the single marker row; `null` when the table or the row is absent. Read-only. */
export async function readInstanceMarker(store: RelationalStore): Promise<InstanceMarker | null> {
  return store.transaction(
    null,
    async (scope) => {
      const present = await scope.query<{ present: boolean }>({
        text: "SELECT to_regclass('public.mesh_instance') IS NOT NULL AS present",
      });
      if (present.rows[0]?.present !== true) return null;
      const rows = await scope.query<MarkerRow>({
        text: 'SELECT instance_id, environment, database_role, created_at FROM mesh_instance',
      });
      if (rows.rowCount !== 1) return null;
      const row = rows.rows[0];
      if (row === undefined) return null;
      return {
        instanceId: row.instance_id,
        environment: row.environment,
        databaseRole: row.database_role,
        createdAt: row.created_at instanceof Date ? row.created_at.toISOString() : row.created_at,
      };
    },
    { readOnly: true },
  );
}

export type IdentityOutcome =
  | { readonly matched: true; readonly marker: InstanceMarker }
  | {
      readonly matched: false;
      readonly problem: 'absent' | 'instance_id' | 'environment' | 'database_role';
    };

export function compareIdentity(
  expected: ExpectedIdentity,
  marker: InstanceMarker | null,
): IdentityOutcome {
  if (marker === null) return { matched: false, problem: 'absent' };
  if (marker.instanceId.toLowerCase() !== expected.instanceId.toLowerCase()) {
    return { matched: false, problem: 'instance_id' };
  }
  if (marker.environment !== expected.environment)
    return { matched: false, problem: 'environment' };
  if (marker.databaseRole !== expected.databaseRole)
    return { matched: false, problem: 'database_role' };
  return { matched: true, marker };
}
