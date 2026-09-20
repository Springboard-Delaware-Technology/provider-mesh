import {
  describeLedger,
  type CompiledMigration,
} from '../../src/modules/platform-operations/index.js';
import type { TransactionScope } from '../../src/platform/ports/index.js';

import { catalogChecksumOf, observeCatalogFacets, type CatalogFacets } from './catalog-checksum.js';
import type { ExpectedCatalog } from './expected-catalog.js';
import { ledgerHead, readLedgerRows, toLedgerState, type LedgerRow } from './ledger-rows.js';
import { MIGRATION_ROLE } from './runner.js';

/**
 * `db:verify` (Foundation 001 §5.4; Governance §12.4): after application, confirm the ledger
 * hashes, the catalog state (expected tables, roles, policies, triggers, grants, forced
 * row-level-security flags), the row counts on reference tables, and that the catalog checksum
 * recorded at the ledger head is the catalog's checksum now. Observation is one set of reads
 * in the caller's transaction; evaluation is pure, so the checks are unit-testable.
 */
export interface ObservedCatalog {
  readonly facets: CatalogFacets;
  readonly catalogSha256: string;
  readonly ledger: readonly LedgerRow[] | null;
  readonly rowCounts: Readonly<Record<string, number>>;
  readonly connect: Readonly<Record<string, boolean>>;
}

const IDENTIFIER = /^[a-z_][a-z0-9_]*$/;

function quoteIdentifier(name: string): string {
  if (!IDENTIFIER.test(name)) throw new Error(`not a plain identifier: ${name}`);
  return `"${name}"`;
}

export async function observeCatalog(
  scope: TransactionScope,
  expected: ExpectedCatalog,
): Promise<ObservedCatalog> {
  const facets = await observeCatalogFacets(scope);
  const ledger = await readLedgerRows(scope);
  const present = new Set(
    facets.relations.filter((r) => r.kind === 'r' || r.kind === 'p').map((r) => r.name),
  );
  const rowCounts: Record<string, number> = {};
  for (const table of Object.keys(expected.referenceRowCounts)) {
    if (!present.has(table)) continue;
    const result = await scope.query<{ n: number }>({
      text: `SELECT count(*)::int AS n FROM ${quoteIdentifier(table)}`,
    });
    rowCounts[table] = result.rows[0]?.n ?? -1;
  }
  const connect: Record<string, boolean> = {};
  for (const role of [...expected.connect.allowed, ...expected.connect.denied]) {
    const result = await scope.query<{ can: boolean }>({
      text: 'SELECT has_database_privilege($1, current_database(), $2) AS can',
      values: [role, 'CONNECT'],
    });
    connect[role] = result.rows[0]?.can === true;
  }
  return { facets, catalogSha256: catalogChecksumOf(facets), ledger, rowCounts, connect };
}

export interface CheckResult {
  readonly name: string;
  readonly ok: boolean;
  readonly detail: string;
}

export interface VerificationReport {
  readonly passed: boolean;
  readonly checks: readonly CheckResult[];
}

function setDifference(expected: readonly string[], observed: readonly string[]): string {
  const missing = expected.filter((e) => !observed.includes(e));
  const unexpected = observed.filter((o) => !expected.includes(o));
  const parts: string[] = [];
  if (missing.length > 0) parts.push(`missing: ${missing.join(', ')}`);
  if (unexpected.length > 0) parts.push(`unexpected: ${unexpected.join(', ')}`);
  return parts.join('; ');
}

function objectKey(o: { readonly relation: string; readonly name: string }): string {
  return `${o.relation}.${o.name}`;
}

export function evaluateCatalog(
  observed: ObservedCatalog,
  expected: ExpectedCatalog,
  compiled: readonly CompiledMigration[],
): VerificationReport {
  const checks: CheckResult[] = [];
  const check = (name: string, ok: boolean, detail: string): void => {
    checks.push({ name, ok, detail });
  };

  // Ledger: present, every compiled file applied with its hash, nothing else, by mesh_migrate.
  const report = describeLedger(compiled, toLedgerState(observed.ledger));
  check(
    'ledger.present',
    observed.ledger !== null,
    observed.ledger === null ? 'absent' : 'present',
  );
  const ledgerProblems = [
    ...report.pending.map((p) => `pending ${p.filename}`),
    ...report.mismatched.map((m) => `hash mismatch ${m.filename}`),
    ...report.unknown.map((u) => `unexpected entry ${u.filename}`),
  ];
  check(
    'ledger.hashes',
    ledgerProblems.length === 0,
    ledgerProblems.length === 0
      ? `${String(report.applied.length)} applied, all hashes match`
      : ledgerProblems.join('; '),
  );
  const foreign = (observed.ledger ?? []).filter((row) => row.applied_by !== MIGRATION_ROLE);
  check(
    'ledger.applied_by',
    foreign.length === 0,
    foreign.length === 0
      ? `every row applied by ${MIGRATION_ROLE}`
      : foreign.map((row) => `${row.filename} by ${row.applied_by}`).join('; '),
  );

  // Catalog checksum: what the head recorded is what the catalog is now.
  const head = ledgerHead(observed.ledger);
  check(
    'catalog.checksum',
    head !== null && head.catalog_sha256 === observed.catalogSha256,
    head === null
      ? 'no ledger head to compare with'
      : head.catalog_sha256 === observed.catalogSha256
        ? `${observed.catalogSha256} matches ledger head ${head.filename}`
        : `catalog ${observed.catalogSha256} differs from ledger head ${head.filename} (${head.catalog_sha256}): the catalog changed outside a migration`,
  );

  // Tables: exactly the expected set.
  const tables = observed.facets.relations
    .filter((r) => r.kind === 'r' || r.kind === 'p')
    .map((r) => r.name);
  const tableDiff = setDifference(expected.tables, tables);
  check('tables.exact', tableDiff === '', tableDiff === '' ? tables.join(', ') : tableDiff);

  // Row-level security flags on every protected table (§5.6 rule 1, A12).
  for (const table of expected.protectedTables) {
    const relation = observed.facets.relations.find((r) => r.name === table);
    const ok = relation !== undefined && relation.rls_enabled && relation.rls_forced;
    check(
      `rls.forced.${table}`,
      ok,
      relation === undefined
        ? 'table absent'
        : `enabled=${String(relation.rls_enabled)} forced=${String(relation.rls_forced)}`,
    );
  }

  // Policies and triggers: exactly the expected sets.
  const policyDiff = setDifference(
    expected.policies.map(objectKey),
    observed.facets.policies.map(objectKey),
  );
  check(
    'policies.exact',
    policyDiff === '',
    policyDiff === '' ? `${String(expected.policies.length)} policy(ies)` : policyDiff,
  );
  const triggerDiff = setDifference(
    expected.triggers.map(objectKey),
    observed.facets.triggers.map(objectKey),
  );
  check(
    'triggers.exact',
    triggerDiff === '',
    triggerDiff === '' ? `${String(expected.triggers.length)} trigger(s)` : triggerDiff,
  );

  // Role attributes (§5.2; A12: NOBYPASSRLS).
  for (const role of expected.roles) {
    const row = observed.facets.roles.find((r) => r.name === role.name);
    const problems: string[] = [];
    if (row === undefined) problems.push('absent');
    else {
      if (row.superuser !== role.superuser) problems.push('superuser');
      if (row.bypass_rls !== role.bypassRls) problems.push('bypassrls');
      if (row.create_db !== role.createDb) problems.push('createdb');
      if (row.create_role !== role.createRole) problems.push('createrole');
      if (row.login !== role.login) problems.push('login');
      if (row.replication !== role.replication) problems.push('replication');
    }
    check(
      `roles.${role.name}`,
      problems.length === 0,
      problems.length === 0 ? 'attributes as expected' : `unexpected: ${problems.join(', ')}`,
    );
  }

  // Grants: every non-owner grantee on every expected table holds exactly what is expected.
  for (const table of expected.tables) {
    const owner = observed.facets.relations.find((r) => r.name === table)?.owner;
    const byGrantee = new Map<string, string[]>();
    for (const grant of observed.facets.relation_grants) {
      if (grant.object !== table || grant.grantee === owner) continue;
      const list = byGrantee.get(grant.grantee) ?? [];
      list.push(grant.privilege);
      byGrantee.set(grant.grantee, list);
    }
    const expectedForTable = expected.relationGrants.filter((g) => g.relation === table);
    const problems: string[] = [];
    for (const g of expectedForTable) {
      const held = [...(byGrantee.get(g.grantee) ?? [])].sort();
      const wanted = [...g.privileges].sort();
      if (held.join(',') !== wanted.join(',')) {
        problems.push(`${g.grantee} holds [${held.join(', ')}] expected [${wanted.join(', ')}]`);
      }
      byGrantee.delete(g.grantee);
    }
    for (const [grantee, privileges] of byGrantee) {
      problems.push(`unexpected grantee ${grantee} [${[...privileges].sort().join(', ')}]`);
    }
    check(
      `grants.${table}`,
      problems.length === 0,
      problems.length === 0
        ? expectedForTable.map((g) => `${g.grantee}=${g.privileges.join('+')}`).join(' ') ||
            'owner only'
        : problems.join('; '),
    );
  }

  // Reference row counts.
  for (const [table, count] of Object.entries(expected.referenceRowCounts)) {
    const n = observed.rowCounts[table];
    check(
      `rows.${table}`,
      n === count,
      n === undefined ? 'table absent' : `${String(n)} row(s), expected ${String(count)}`,
    );
  }

  // Connect privileges: deny by default (§5.2).
  const connectProblems: string[] = [];
  for (const role of expected.connect.allowed) {
    if (observed.connect[role] !== true) connectProblems.push(`${role} cannot connect`);
  }
  for (const role of expected.connect.denied) {
    if (observed.connect[role] !== false) connectProblems.push(`${role} can connect`);
  }
  check(
    'connect.exact',
    connectProblems.length === 0,
    connectProblems.length === 0
      ? `allowed: ${expected.connect.allowed.join(', ')}; denied: ${expected.connect.denied.join(', ')}`
      : connectProblems.join('; '),
  );

  return { passed: checks.every((c) => c.ok), checks };
}
