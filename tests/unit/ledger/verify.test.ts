import { describe, expect, it } from 'vitest';

import type { CatalogFacets } from '../../../db/ledger/catalog-checksum.js';
import { catalogChecksumOf } from '../../../db/ledger/catalog-checksum.js';
import { EXPECTED_CATALOG } from '../../../db/ledger/expected-catalog.js';
import type { LedgerRow } from '../../../db/ledger/ledger-rows.js';
import { evaluateCatalog, type ObservedCatalog } from '../../../db/ledger/verify.js';

const expected = EXPECTED_CATALOG.domain;
const compiled = [{ filename: '0001_migration_ledger.sql', sha256: 'a'.repeat(64) }];

function relation(name: string, flags: { rls?: boolean } = {}): CatalogFacets['relations'][number] {
  return {
    name,
    kind: 'r',
    owner: 'mesh_migrate',
    rls_enabled: flags.rls ?? false,
    rls_forced: flags.rls ?? false,
    comment: null,
    definition: null,
  };
}

function grant(
  object: string,
  grantee: string,
  privilege: string,
): CatalogFacets['relation_grants'][number] {
  return { object, grantee, grantor: 'mesh_migrate', privilege, grantable: false };
}

function role(name: string, over: Partial<CatalogFacets['roles'][number]> = {}) {
  return {
    name,
    superuser: false,
    inherit: true,
    create_role: false,
    create_db: false,
    login: true,
    replication: false,
    bypass_rls: false,
    ...over,
  };
}

const facets: CatalogFacets = {
  database_grants: [],
  schema_grants: [],
  default_privileges: [],
  extensions: [],
  roles: ['mesh_migrate', 'mesh_app', 'mesh_audit_writer', 'mesh_audit_reader'].map((n) => role(n)),
  relations: [relation('mesh_instance'), relation('migration_ledger')],
  relation_grants: [
    grant('mesh_instance', 'mesh_migrate', 'SELECT'),
    grant('mesh_instance', 'mesh_app', 'SELECT'),
    grant('migration_ledger', 'mesh_app', 'SELECT'),
  ],
  columns: [],
  constraints: [],
  indexes: [],
  policies: [],
  triggers: [
    {
      relation: 'migration_ledger',
      name: 'migration_ledger_immutable',
      definition: '',
      enabled: 'O',
    },
  ],
  functions: [
    {
      name: 'migration_ledger_immutable',
      arguments: '',
      owner: 'mesh_migrate',
      language: 'plpgsql',
      kind: 'f',
      security_definer: false,
      volatility: 'v',
      returns: 'trigger',
      definition: null,
    },
  ],
  function_grants: [],
  sequences: [],
  types: [],
};

function headRow(catalogSha256: string): LedgerRow {
  return {
    filename: '0001_migration_ledger.sql',
    sha256: 'a'.repeat(64),
    applied_at: '2026-09-20 12:00:00+00',
    applied_by: 'mesh_migrate',
    catalog_sha256: catalogSha256,
  };
}

function observed(
  over: Partial<ObservedCatalog> = {},
  facetsOver: Partial<CatalogFacets> = {},
): ObservedCatalog {
  const f = { ...facets, ...facetsOver };
  const catalogSha256 = catalogChecksumOf(f);
  return {
    facets: f,
    catalogSha256,
    ledger: [headRow(catalogSha256)],
    rowCounts: { mesh_instance: 1 },
    connect: {
      mesh_migrate: true,
      mesh_app: true,
      mesh_audit_writer: false,
      mesh_audit_reader: false,
    },
    ...over,
  };
}

function failing(report: ReturnType<typeof evaluateCatalog>): string[] {
  return report.checks.filter((c) => !c.ok).map((c) => c.name);
}

describe('db:verify evaluation (§5.4, Governance §12.4)', () => {
  it('passes when the catalog is exactly what the expected state and the ledger say', () => {
    const report = evaluateCatalog(observed(), expected, compiled);
    expect(failing(report)).toEqual([]);
    expect(report.passed).toBe(true);
    expect(report.checks.map((c) => c.name)).toEqual([
      'ledger.present',
      'ledger.hashes',
      'ledger.applied_by',
      'catalog.checksum',
      'tables.exact',
      'views.exact',
      'policies.exact',
      'triggers.exact',
      'functions.exact',
      'functions.migration_ledger_immutable',
      'roles.mesh_migrate',
      'roles.mesh_app',
      'roles.mesh_audit_writer',
      'roles.mesh_audit_reader',
      'grants.mesh_instance',
      'grants.migration_ledger',
      'rows.mesh_instance',
      'connect.exact',
    ]);
  });

  it('fails on an absent ledger, a pending file, a hash mismatch, an unknown entry, or a foreign applier', () => {
    expect(failing(evaluateCatalog(observed({ ledger: null }), expected, compiled))).toEqual(
      expect.arrayContaining(['ledger.present', 'ledger.hashes', 'catalog.checksum']),
    );
    const more = [...compiled, { filename: '0002_next.sql', sha256: 'b'.repeat(64) }];
    expect(failing(evaluateCatalog(observed(), expected, more))).toEqual(['ledger.hashes']);
    const altered = [{ filename: '0001_migration_ledger.sql', sha256: 'c'.repeat(64) }];
    expect(failing(evaluateCatalog(observed(), expected, altered))).toEqual(['ledger.hashes']);
    expect(failing(evaluateCatalog(observed(), expected, []))).toEqual(['ledger.hashes']);
    const foreign = observed({
      ledger: [{ ...headRow(catalogChecksumOf(facets)), applied_by: 'postgres' }],
    });
    expect(failing(evaluateCatalog(foreign, expected, compiled))).toEqual(['ledger.applied_by']);
  });

  it('fails when the catalog changed since the ledger head recorded it', () => {
    const drifted = observed({ ledger: [headRow('d'.repeat(64))] });
    const report = evaluateCatalog(drifted, expected, compiled);
    expect(failing(report)).toEqual(['catalog.checksum']);
    expect(report.checks.find((c) => c.name === 'catalog.checksum')?.detail).toMatch(
      /outside a migration/,
    );
  });

  it('fails on a missing or unexpected table', () => {
    const missing = observed({}, { relations: [relation('mesh_instance')] });
    expect(failing(evaluateCatalog(missing, expected, compiled))).toContain('tables.exact');
    const extra = observed({}, { relations: [...facets.relations, relation('stray_object')] });
    const report = evaluateCatalog(extra, expected, compiled);
    expect(failing(report)).toContain('tables.exact');
    expect(report.checks.find((c) => c.name === 'tables.exact')?.detail).toBe(
      'unexpected: stray_object',
    );
  });

  it('requires both row-level-security flags on every protected table', () => {
    const protectedExpected = {
      ...expected,
      tables: [...expected.tables, 'assistance_episode'],
      protectedTables: ['assistance_episode'],
    };
    const unforced = observed(
      {},
      {
        relations: [
          ...facets.relations,
          { ...relation('assistance_episode'), rls_enabled: true, rls_forced: false },
        ],
      },
    );
    const report = evaluateCatalog(unforced, protectedExpected, compiled);
    expect(failing(report)).toEqual(['rls.forced.assistance_episode']);
    const forced = observed(
      {},
      { relations: [...facets.relations, relation('assistance_episode', { rls: true })] },
    );
    expect(failing(evaluateCatalog(forced, protectedExpected, compiled))).toEqual([]);
  });

  it('fails on an unexpected policy or trigger, or a missing one', () => {
    const policy = observed(
      {},
      {
        policies: [
          {
            relation: 'mesh_instance',
            name: 'p',
            permissive: 'PERMISSIVE',
            roles: ['public'],
            command: 'ALL',
            using_expr: 'true',
            check_expr: null,
          },
        ],
      },
    );
    expect(failing(evaluateCatalog(policy, expected, compiled))).toEqual(['policies.exact']);
    const noTrigger = observed({}, { triggers: [] });
    expect(failing(evaluateCatalog(noTrigger, expected, compiled))).toEqual(['triggers.exact']);
  });

  it('fails on an unexpected or missing view, and on a function that is missing, re-owned, or made SECURITY DEFINER', () => {
    const view = observed(
      {},
      { relations: [...facets.relations, { ...relation('stray_view'), kind: 'v' }] },
    );
    expect(failing(evaluateCatalog(view, expected, compiled))).toEqual(['views.exact']);
    const missingView = { ...expected, views: ['audit_chain_head'] };
    expect(failing(evaluateCatalog(observed(), missingView, compiled))).toEqual(['views.exact']);
    const noFunction = observed({}, { functions: [] });
    expect(failing(evaluateCatalog(noFunction, expected, compiled))).toEqual([
      'functions.exact',
      'functions.migration_ledger_immutable',
    ]);
    const definer = observed(
      {},
      { functions: facets.functions.map((f) => ({ ...f, security_definer: true })) },
    );
    const report = evaluateCatalog(definer, expected, compiled);
    expect(failing(report)).toEqual(['functions.migration_ledger_immutable']);
    expect(
      report.checks.find((c) => c.name === 'functions.migration_ledger_immutable')?.detail,
    ).toBe('unexpected: security definer true');
    const reowned = observed(
      {},
      { functions: facets.functions.map((f) => ({ ...f, owner: 'postgres' })) },
    );
    expect(failing(evaluateCatalog(reowned, expected, compiled))).toEqual([
      'functions.migration_ledger_immutable',
    ]);
    const extra = observed(
      {},
      {
        functions: [
          ...facets.functions,
          ...facets.functions.map((f) => ({ ...f, name: 'stray_fn' })),
        ],
      },
    );
    expect(failing(evaluateCatalog(extra, expected, compiled))).toEqual(['functions.exact']);
  });

  it('fails when a role gains a privileged attribute or loses login', () => {
    const bypass = observed(
      {},
      { roles: facets.roles.map((r) => (r.name === 'mesh_app' ? { ...r, bypass_rls: true } : r)) },
    );
    const report = evaluateCatalog(bypass, expected, compiled);
    expect(failing(report)).toEqual(['roles.mesh_app']);
    expect(report.checks.find((c) => c.name === 'roles.mesh_app')?.detail).toBe(
      'unexpected: bypassrls',
    );
    const nologin = observed(
      {},
      { roles: facets.roles.map((r) => (r.name === 'mesh_migrate' ? { ...r, login: false } : r)) },
    );
    expect(failing(evaluateCatalog(nologin, expected, compiled))).toEqual(['roles.mesh_migrate']);
    const absent = observed(
      {},
      { roles: facets.roles.filter((r) => r.name !== 'mesh_audit_reader') },
    );
    expect(failing(evaluateCatalog(absent, expected, compiled))).toEqual([
      'roles.mesh_audit_reader',
    ]);
  });

  it('fails when a grantee holds more, less, or is not expected at all', () => {
    const more = observed(
      {},
      {
        relation_grants: [
          ...facets.relation_grants,
          grant('migration_ledger', 'mesh_app', 'INSERT'),
        ],
      },
    );
    const report = evaluateCatalog(more, expected, compiled);
    expect(failing(report)).toEqual(['grants.migration_ledger']);
    expect(report.checks.find((c) => c.name === 'grants.migration_ledger')?.detail).toBe(
      'mesh_app holds [INSERT, SELECT] expected [SELECT]',
    );
    const less = observed(
      {},
      { relation_grants: facets.relation_grants.filter((g) => g.object !== 'migration_ledger') },
    );
    expect(failing(evaluateCatalog(less, expected, compiled))).toEqual(['grants.migration_ledger']);
    const stranger = observed(
      {},
      { relation_grants: [...facets.relation_grants, grant('mesh_instance', 'PUBLIC', 'SELECT')] },
    );
    const strangerReport = evaluateCatalog(stranger, expected, compiled);
    expect(failing(strangerReport)).toEqual(['grants.mesh_instance']);
    expect(strangerReport.checks.find((c) => c.name === 'grants.mesh_instance')?.detail).toBe(
      'unexpected grantee PUBLIC [SELECT]',
    );
  });

  it('fails on a wrong reference row count or an unexpected connect privilege', () => {
    expect(
      failing(evaluateCatalog(observed({ rowCounts: { mesh_instance: 2 } }), expected, compiled)),
    ).toEqual(['rows.mesh_instance']);
    expect(failing(evaluateCatalog(observed({ rowCounts: {} }), expected, compiled))).toEqual([
      'rows.mesh_instance',
    ]);
    const leaky = observed({
      connect: {
        mesh_migrate: true,
        mesh_app: true,
        mesh_audit_writer: true,
        mesh_audit_reader: false,
      },
    });
    const report = evaluateCatalog(leaky, expected, compiled);
    expect(failing(report)).toEqual(['connect.exact']);
    expect(report.checks.find((c) => c.name === 'connect.exact')?.detail).toBe(
      'mesh_audit_writer can connect',
    );
    const locked = observed({
      connect: {
        mesh_migrate: true,
        mesh_app: false,
        mesh_audit_writer: false,
        mesh_audit_reader: false,
      },
    });
    expect(failing(evaluateCatalog(locked, expected, compiled))).toEqual(['connect.exact']);
  });
});
