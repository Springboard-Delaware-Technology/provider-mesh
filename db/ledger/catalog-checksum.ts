import { createHash } from 'node:crypto';

import type { TransactionScope } from '../../src/platform/ports/index.js';

/**
 * Catalog checksum (Foundation 001 §5.4: "the catalog checksum after application"; Governance
 * §12.4: catalog state is verified after application).
 *
 * Serialization version 1 reads the facets below for the `public` schema, the database's own
 * grants, and the attributes of the four application roles, and hashes their canonical JSON with
 * SHA-256. Canonical means: object keys sorted by UTF-16 code unit; every facet's rows sorted by
 * their own canonical text; no whitespace; identifiers only, never OIDs, statistics, or row data.
 * The same catalog therefore hashes the same on every run and every role, and the same migration
 * sequence hashes the same on a fresh database. The value is compared only within one database:
 * `db:migrate` records it in the ledger row of each applied migration, and `db:verify` recomputes
 * it and compares it with the ledger head, so any change made outside a migration is detected.
 *
 * Changing the facets or the encoding is a change of this version number and ships only with a
 * new migration, whose ledger row re-anchors the head under the new form.
 */
export const CATALOG_SERIALIZATION_VERSION = 1;

export type JsonValue = string | number | boolean | null | readonly JsonValue[] | JsonObject;

/** An interface rather than `Record`, so the recursive alias above is legal. */
export interface JsonObject {
  readonly [key: string]: JsonValue;
}

export class CatalogSerializationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CatalogSerializationError';
  }
}

export interface GrantRow {
  readonly object: string;
  readonly grantee: string;
  readonly grantor: string;
  readonly privilege: string;
  readonly grantable: boolean;
}

export interface DefaultPrivilegeRow {
  readonly role: string;
  readonly schema: string | null;
  readonly object_type: string;
  readonly grantee: string;
  readonly privilege: string;
  readonly grantable: boolean;
}

export interface ExtensionRow {
  readonly name: string;
  readonly schema: string;
}

export interface RoleRow {
  readonly name: string;
  readonly superuser: boolean;
  readonly inherit: boolean;
  readonly create_role: boolean;
  readonly create_db: boolean;
  readonly login: boolean;
  readonly replication: boolean;
  readonly bypass_rls: boolean;
}

export interface RelationRow {
  readonly name: string;
  readonly kind: string;
  readonly owner: string;
  readonly rls_enabled: boolean;
  readonly rls_forced: boolean;
  readonly comment: string | null;
  readonly definition: string | null;
}

export interface ColumnRow {
  readonly relation: string;
  readonly position: number;
  readonly name: string;
  readonly type: string;
  readonly not_null: boolean;
  readonly default_expr: string | null;
  readonly identity: string;
  readonly generated: string;
  readonly comment: string | null;
}

export interface ConstraintRow {
  readonly relation: string;
  readonly name: string;
  readonly type: string;
  readonly definition: string;
  readonly deferrable: boolean;
  readonly deferred: boolean;
  readonly validated: boolean;
}

export interface IndexRow {
  readonly relation: string;
  readonly name: string;
  readonly definition: string;
}

export interface PolicyRow {
  readonly relation: string;
  readonly name: string;
  readonly permissive: string;
  readonly roles: readonly string[];
  readonly command: string;
  readonly using_expr: string | null;
  readonly check_expr: string | null;
}

export interface TriggerRow {
  readonly relation: string;
  readonly name: string;
  readonly definition: string;
  readonly enabled: string;
}

export interface FunctionRow {
  readonly name: string;
  readonly arguments: string;
  readonly owner: string;
  readonly language: string;
  readonly kind: string;
  readonly security_definer: boolean;
  readonly volatility: string;
  readonly returns: string;
  readonly definition: string | null;
}

export interface SequenceRow {
  readonly name: string;
  readonly type: string;
  readonly start_value: string;
  readonly min_value: string;
  readonly max_value: string;
  readonly increment_by: string;
  readonly cycle: boolean;
  readonly cache_size: string;
}

export interface TypeRow {
  readonly name: string;
  readonly kind: string;
  readonly owner: string;
  readonly base_type: string | null;
  readonly not_null: boolean | null;
  readonly labels: readonly string[] | null;
  readonly constraints: readonly string[] | null;
}

export interface CatalogFacets {
  readonly database_grants: readonly GrantRow[];
  readonly schema_grants: readonly GrantRow[];
  readonly default_privileges: readonly DefaultPrivilegeRow[];
  readonly extensions: readonly ExtensionRow[];
  readonly roles: readonly RoleRow[];
  readonly relations: readonly RelationRow[];
  readonly relation_grants: readonly GrantRow[];
  readonly columns: readonly ColumnRow[];
  readonly constraints: readonly ConstraintRow[];
  readonly indexes: readonly IndexRow[];
  readonly policies: readonly PolicyRow[];
  readonly triggers: readonly TriggerRow[];
  readonly functions: readonly FunctionRow[];
  readonly function_grants: readonly GrantRow[];
  readonly sequences: readonly SequenceRow[];
  readonly types: readonly TypeRow[];
}

/** Compile-time completeness: every facet is named here, so none can be left out of the hash. */
const FACETS: Readonly<Record<keyof CatalogFacets, true>> = {
  database_grants: true,
  schema_grants: true,
  default_privileges: true,
  extensions: true,
  roles: true,
  relations: true,
  relation_grants: true,
  columns: true,
  constraints: true,
  indexes: true,
  policies: true,
  triggers: true,
  functions: true,
  function_grants: true,
  sequences: true,
  types: true,
};

export const FACET_NAMES: readonly (keyof CatalogFacets)[] = Object.keys(
  FACETS,
).sort() as (keyof CatalogFacets)[];

export const MESH_ROLE_NAMES = [
  'mesh_migrate',
  'mesh_app',
  'mesh_audit_writer',
  'mesh_audit_reader',
] as const;

const ROLE_LIST = MESH_ROLE_NAMES.map((r) => `'${r}'`).join(', ');

const SQL: Readonly<Record<keyof CatalogFacets, string>> = {
  database_grants: `
    SELECT d.datname AS object, COALESCE(g.rolname, 'PUBLIC') AS grantee, o.rolname AS grantor,
           a.privilege_type AS privilege, a.is_grantable AS grantable
      FROM pg_database d
      CROSS JOIN LATERAL aclexplode(d.datacl) a
      LEFT JOIN pg_roles g ON g.oid = a.grantee
      JOIN pg_roles o ON o.oid = a.grantor
     WHERE d.datname = current_database()`,
  schema_grants: `
    SELECT n.nspname AS object, COALESCE(g.rolname, 'PUBLIC') AS grantee, o.rolname AS grantor,
           a.privilege_type AS privilege, a.is_grantable AS grantable
      FROM pg_namespace n
      CROSS JOIN LATERAL aclexplode(n.nspacl) a
      LEFT JOIN pg_roles g ON g.oid = a.grantee
      JOIN pg_roles o ON o.oid = a.grantor
     WHERE n.nspname = 'public'`,
  default_privileges: `
    SELECT r.rolname AS role, n.nspname AS schema, d.defaclobjtype::text AS object_type,
           COALESCE(g.rolname, 'PUBLIC') AS grantee, a.privilege_type AS privilege,
           a.is_grantable AS grantable
      FROM pg_default_acl d
      JOIN pg_roles r ON r.oid = d.defaclrole
      LEFT JOIN pg_namespace n ON n.oid = d.defaclnamespace
      CROSS JOIN LATERAL aclexplode(d.defaclacl) a
      LEFT JOIN pg_roles g ON g.oid = a.grantee`,
  extensions: `
    SELECT e.extname AS name, n.nspname AS schema
      FROM pg_extension e JOIN pg_namespace n ON n.oid = e.extnamespace`,
  roles: `
    SELECT rolname AS name, rolsuper AS superuser, rolinherit AS inherit,
           rolcreaterole AS create_role, rolcreatedb AS create_db, rolcanlogin AS login,
           rolreplication AS replication, rolbypassrls AS bypass_rls
      FROM pg_roles WHERE rolname IN (${ROLE_LIST})`,
  relations: `
    SELECT c.relname AS name, c.relkind::text AS kind, r.rolname AS owner,
           c.relrowsecurity AS rls_enabled, c.relforcerowsecurity AS rls_forced,
           obj_description(c.oid, 'pg_class') AS comment,
           CASE WHEN c.relkind IN ('v', 'm') THEN pg_get_viewdef(c.oid, true) END AS definition
      FROM pg_class c
      JOIN pg_namespace n ON n.oid = c.relnamespace
      JOIN pg_roles r ON r.oid = c.relowner
     WHERE n.nspname = 'public' AND c.relkind IN ('r', 'p', 'v', 'm', 'S', 'f')`,
  relation_grants: `
    SELECT c.relname AS object, COALESCE(g.rolname, 'PUBLIC') AS grantee, o.rolname AS grantor,
           a.privilege_type AS privilege, a.is_grantable AS grantable
      FROM pg_class c
      JOIN pg_namespace n ON n.oid = c.relnamespace
      CROSS JOIN LATERAL aclexplode(c.relacl) a
      LEFT JOIN pg_roles g ON g.oid = a.grantee
      JOIN pg_roles o ON o.oid = a.grantor
     WHERE n.nspname = 'public' AND c.relkind IN ('r', 'p', 'v', 'm', 'S', 'f')`,
  columns: `
    SELECT c.relname AS relation, a.attnum AS position, a.attname AS name,
           format_type(a.atttypid, a.atttypmod) AS type, a.attnotnull AS not_null,
           pg_get_expr(d.adbin, d.adrelid) AS default_expr, a.attidentity::text AS identity,
           a.attgenerated::text AS generated, col_description(c.oid, a.attnum) AS comment
      FROM pg_attribute a
      JOIN pg_class c ON c.oid = a.attrelid
      JOIN pg_namespace n ON n.oid = c.relnamespace
      LEFT JOIN pg_attrdef d ON d.adrelid = a.attrelid AND d.adnum = a.attnum
     WHERE n.nspname = 'public' AND c.relkind IN ('r', 'p', 'v', 'm', 'f')
       AND a.attnum > 0 AND NOT a.attisdropped`,
  constraints: `
    SELECT c.relname AS relation, k.conname AS name, k.contype::text AS type,
           pg_get_constraintdef(k.oid, true) AS definition, k.condeferrable AS deferrable,
           k.condeferred AS deferred, k.convalidated AS validated
      FROM pg_constraint k
      JOIN pg_class c ON c.oid = k.conrelid
      JOIN pg_namespace n ON n.oid = c.relnamespace
     WHERE n.nspname = 'public'`,
  indexes: `
    SELECT tablename AS relation, indexname AS name, indexdef AS definition
      FROM pg_indexes WHERE schemaname = 'public'`,
  policies: `
    SELECT tablename AS relation, policyname AS name, permissive, roles::text[] AS roles,
           cmd AS command, qual AS using_expr, with_check AS check_expr
      FROM pg_policies WHERE schemaname = 'public'`,
  triggers: `
    SELECT c.relname AS relation, t.tgname AS name, pg_get_triggerdef(t.oid, true) AS definition,
           t.tgenabled::text AS enabled
      FROM pg_trigger t
      JOIN pg_class c ON c.oid = t.tgrelid
      JOIN pg_namespace n ON n.oid = c.relnamespace
     WHERE n.nspname = 'public' AND NOT t.tgisinternal`,
  functions: `
    SELECT p.proname AS name, pg_get_function_identity_arguments(p.oid) AS arguments,
           r.rolname AS owner, l.lanname AS language, p.prokind::text AS kind,
           p.prosecdef AS security_definer, p.provolatile::text AS volatility,
           format_type(p.prorettype, NULL) AS returns,
           CASE WHEN p.prokind IN ('f', 'p') THEN pg_get_functiondef(p.oid) END AS definition
      FROM pg_proc p
      JOIN pg_namespace n ON n.oid = p.pronamespace
      JOIN pg_roles r ON r.oid = p.proowner
      JOIN pg_language l ON l.oid = p.prolang
     WHERE n.nspname = 'public'`,
  function_grants: `
    SELECT p.proname || '(' || pg_get_function_identity_arguments(p.oid) || ')' AS object,
           COALESCE(g.rolname, 'PUBLIC') AS grantee, o.rolname AS grantor,
           a.privilege_type AS privilege, a.is_grantable AS grantable
      FROM pg_proc p
      JOIN pg_namespace n ON n.oid = p.pronamespace
      CROSS JOIN LATERAL aclexplode(p.proacl) a
      LEFT JOIN pg_roles g ON g.oid = a.grantee
      JOIN pg_roles o ON o.oid = a.grantor
     WHERE n.nspname = 'public'`,
  sequences: `
    SELECT sequencename AS name, data_type::text AS type, start_value::text AS start_value,
           min_value::text AS min_value, max_value::text AS max_value,
           increment_by::text AS increment_by, cycle, cache_size::text AS cache_size
      FROM pg_sequences WHERE schemaname = 'public'`,
  types: `
    SELECT t.typname AS name, t.typtype::text AS kind, r.rolname AS owner,
           CASE WHEN t.typtype = 'd' THEN format_type(t.typbasetype, t.typtypmod) END AS base_type,
           CASE WHEN t.typtype = 'd' THEN t.typnotnull END AS not_null,
           CASE WHEN t.typtype = 'e' THEN (SELECT array_agg(e.enumlabel::text ORDER BY e.enumsortorder)
                                             FROM pg_enum e WHERE e.enumtypid = t.oid) END AS labels,
           CASE WHEN t.typtype = 'd' THEN (SELECT array_agg(pg_get_constraintdef(k.oid, true) ORDER BY k.conname)
                                             FROM pg_constraint k WHERE k.contypid = t.oid) END AS constraints
      FROM pg_type t
      JOIN pg_namespace n ON n.oid = t.typnamespace
      JOIN pg_roles r ON r.oid = t.typowner
     WHERE n.nspname = 'public' AND t.typtype IN ('e', 'd', 'r')`,
};

/** Reads every facet in the current transaction; the caller decides the transaction's mode. */
export async function observeCatalogFacets(scope: TransactionScope): Promise<CatalogFacets> {
  const read = async <Row>(facet: keyof CatalogFacets): Promise<readonly Row[]> =>
    (await scope.query<Row>({ text: SQL[facet] })).rows;
  return {
    database_grants: await read<GrantRow>('database_grants'),
    schema_grants: await read<GrantRow>('schema_grants'),
    default_privileges: await read<DefaultPrivilegeRow>('default_privileges'),
    extensions: await read<ExtensionRow>('extensions'),
    roles: await read<RoleRow>('roles'),
    relations: await read<RelationRow>('relations'),
    relation_grants: await read<GrantRow>('relation_grants'),
    columns: await read<ColumnRow>('columns'),
    constraints: await read<ConstraintRow>('constraints'),
    indexes: await read<IndexRow>('indexes'),
    policies: await read<PolicyRow>('policies'),
    triggers: await read<TriggerRow>('triggers'),
    functions: await read<FunctionRow>('functions'),
    function_grants: await read<GrantRow>('function_grants'),
    sequences: await read<SequenceRow>('sequences'),
    types: await read<TypeRow>('types'),
  };
}

/** Accepts only the value kinds the facets produce; anything else is a serialization defect. */
export function toJson(value: unknown): JsonValue {
  if (value === null || typeof value === 'string' || typeof value === 'boolean') return value;
  if (typeof value === 'number') {
    if (!Number.isFinite(value)) throw new CatalogSerializationError('non-finite number');
    return value;
  }
  if (Array.isArray(value)) return (value as readonly unknown[]).map((item) => toJson(item));
  if (typeof value === 'object') {
    const out: Record<string, JsonValue> = {};
    for (const [key, item] of Object.entries(value as Record<string, unknown>)) {
      out[key] = toJson(item);
    }
    return out;
  }
  throw new CatalogSerializationError(`unsupported value type: ${typeof value}`);
}

/** Canonical JSON: keys sorted by code unit, arrays in their given order, no whitespace. */
export function canonicalJson(value: JsonValue): string {
  if (value === null || typeof value !== 'object') return JSON.stringify(value);
  if (Array.isArray(value)) {
    const items: readonly JsonValue[] = value;
    return `[${items.map((item) => canonicalJson(item)).join(',')}]`;
  }
  const object = value as JsonObject;
  const members = Object.keys(object)
    .sort()
    .map((key) => `${JSON.stringify(key)}:${canonicalJson(object[key] ?? null)}`);
  return `{${members.join(',')}}`;
}

/** The canonical text of a catalog: facets by name, rows by their canonical text, version last. */
export function canonicalCatalog(facets: CatalogFacets): string {
  const parts = FACET_NAMES.map((name) => {
    const rows: readonly object[] = facets[name];
    const canonicalRows = rows.map((row) => canonicalJson(toJson(row))).sort();
    return `${JSON.stringify(name)}:[${canonicalRows.join(',')}]`;
  });
  return `{"facets":{${parts.join(',')}},"version":${String(CATALOG_SERIALIZATION_VERSION)}}`;
}

export function checksumOfCanonical(canonical: string): string {
  return createHash('sha256').update(canonical, 'utf8').digest('hex');
}

export function catalogChecksumOf(facets: CatalogFacets): string {
  return checksumOfCanonical(canonicalCatalog(facets));
}

/** SHA-256 of the canonical catalog as seen by the current transaction. */
export async function catalogChecksum(scope: TransactionScope): Promise<string> {
  return catalogChecksumOf(await observeCatalogFacets(scope));
}
