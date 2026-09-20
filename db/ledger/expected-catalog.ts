import type { MigrationTarget } from '../../src/modules/platform-operations/index.js';

import { MESH_ROLE_NAMES } from './catalog-checksum.js';

/**
 * The catalog state `db:verify` expects after the compiled migration set is applied (Foundation
 * 001 §5.4; Governance §12.4): the exact set of tables, the protected tables that must carry
 * both row-level-security flags (§5.6 rule 1), the policies and triggers that must exist, the
 * attributes of the four roles (§5.2, A12), the exact non-owner grants on each table, the row
 * counts of reference tables, and which roles may connect. Every capability that adds a migration
 * extends this list in the same change.
 */
export interface ExpectedRole {
  readonly name: string;
  readonly superuser: boolean;
  readonly bypassRls: boolean;
  readonly createDb: boolean;
  readonly createRole: boolean;
  readonly login: boolean;
  readonly replication: boolean;
}

export interface ExpectedObject {
  readonly relation: string;
  readonly name: string;
}

export interface ExpectedGrant {
  readonly relation: string;
  readonly grantee: string;
  readonly privileges: readonly string[];
}

export interface ExpectedCatalog {
  readonly database: string;
  /** Exactly these ordinary tables exist in `public`; any other is an unexpected object. */
  readonly tables: readonly string[];
  /** Tables that must have row-level security enabled and forced (§5.6 rule 1). */
  readonly protectedTables: readonly string[];
  readonly policies: readonly ExpectedObject[];
  readonly triggers: readonly ExpectedObject[];
  readonly roles: readonly ExpectedRole[];
  /** Exact privileges of every grantee other than the owner, per table; PUBLIC holds none. */
  readonly relationGrants: readonly ExpectedGrant[];
  readonly referenceRowCounts: Readonly<Record<string, number>>;
  readonly connect: { readonly allowed: readonly string[]; readonly denied: readonly string[] };
}

const ROLES: readonly ExpectedRole[] = MESH_ROLE_NAMES.map((name) => ({
  name,
  superuser: false,
  bypassRls: false,
  createDb: false,
  createRole: false,
  login: true,
  replication: false,
}));

const LEDGER_TRIGGER: ExpectedObject = {
  relation: 'migration_ledger',
  name: 'migration_ledger_immutable',
};

export const EXPECTED_CATALOG: Readonly<Record<MigrationTarget, ExpectedCatalog>> = {
  domain: {
    database: 'provider_mesh',
    tables: ['mesh_instance', 'migration_ledger'],
    protectedTables: [],
    policies: [],
    triggers: [LEDGER_TRIGGER],
    roles: ROLES,
    relationGrants: [
      { relation: 'mesh_instance', grantee: 'mesh_app', privileges: ['SELECT'] },
      { relation: 'migration_ledger', grantee: 'mesh_app', privileges: ['SELECT'] },
    ],
    referenceRowCounts: { mesh_instance: 1 },
    connect: {
      allowed: ['mesh_migrate', 'mesh_app'],
      denied: ['mesh_audit_writer', 'mesh_audit_reader'],
    },
  },
  audit: {
    database: 'provider_mesh_audit',
    tables: ['mesh_instance', 'migration_ledger'],
    protectedTables: [],
    policies: [],
    triggers: [LEDGER_TRIGGER],
    roles: ROLES,
    relationGrants: [
      { relation: 'mesh_instance', grantee: 'mesh_audit_writer', privileges: ['SELECT'] },
      { relation: 'mesh_instance', grantee: 'mesh_audit_reader', privileges: ['SELECT'] },
      { relation: 'migration_ledger', grantee: 'mesh_audit_writer', privileges: ['SELECT'] },
      { relation: 'migration_ledger', grantee: 'mesh_audit_reader', privileges: ['SELECT'] },
    ],
    referenceRowCounts: { mesh_instance: 1 },
    connect: {
      allowed: ['mesh_migrate', 'mesh_audit_writer', 'mesh_audit_reader'],
      denied: ['mesh_app'],
    },
  },
};
