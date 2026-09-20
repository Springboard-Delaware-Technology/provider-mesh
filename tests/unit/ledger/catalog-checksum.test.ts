import { describe, expect, it } from 'vitest';

import {
  canonicalCatalog,
  canonicalJson,
  CATALOG_SERIALIZATION_VERSION,
  catalogChecksumOf,
  CatalogSerializationError,
  FACET_NAMES,
  toJson,
  type CatalogFacets,
} from '../../../db/ledger/catalog-checksum.js';

const empty: CatalogFacets = {
  database_grants: [],
  schema_grants: [],
  default_privileges: [],
  extensions: [],
  roles: [],
  relations: [],
  relation_grants: [],
  columns: [],
  constraints: [],
  indexes: [],
  policies: [],
  triggers: [],
  functions: [],
  function_grants: [],
  sequences: [],
  types: [],
};

const ledger = {
  name: 'migration_ledger',
  kind: 'r',
  owner: 'mesh_migrate',
  rls_enabled: false,
  rls_forced: false,
  comment: null,
  definition: null,
};
const marker = { ...ledger, name: 'mesh_instance' };

describe('canonical JSON', () => {
  it('sorts object keys at every depth and keeps array order', () => {
    expect(canonicalJson({ b: 1, a: { z: [3, 1, 2], y: null } })).toBe(
      '{"a":{"y":null,"z":[3,1,2]},"b":1}',
    );
  });
  it('escapes strings exactly as JSON does and emits no whitespace', () => {
    expect(canonicalJson({ 'k "q"': 'a\nb', t: true, f: false })).toBe(
      '{"f":false,"k \\"q\\"":"a\\nb","t":true}',
    );
  });
  it('is independent of the insertion order of keys', () => {
    expect(canonicalJson({ x: 1, y: 2 })).toBe(canonicalJson({ y: 2, x: 1 }));
  });
});

describe('toJson', () => {
  it('accepts the value kinds the facets produce', () => {
    expect(toJson({ a: ['x', 1, true, null], b: { c: 'd' } })).toEqual({
      a: ['x', 1, true, null],
      b: { c: 'd' },
    });
  });
  it('rejects values whose text would not be canonical', () => {
    expect(() => toJson(new Date(0))).not.toThrow(); // a Date is an object with no own keys
    expect(toJson(new Date(0))).toEqual({});
    expect(() => toJson(undefined)).toThrow(CatalogSerializationError);
    expect(() => toJson(Number.NaN)).toThrow(CatalogSerializationError);
    expect(() => toJson(10n)).toThrow(CatalogSerializationError);
    expect(() => toJson(() => 1)).toThrow(CatalogSerializationError);
  });
});

describe('catalog serialization version 1', () => {
  it('names every facet exactly once, in sorted order', () => {
    expect([...FACET_NAMES]).toEqual([...Object.keys(empty)].sort());
    expect(new Set(FACET_NAMES).size).toBe(FACET_NAMES.length);
  });

  it('ends with the version and lists facets by name', () => {
    const text = canonicalCatalog(empty);
    expect(text.endsWith(`,"version":${String(CATALOG_SERIALIZATION_VERSION)}}`)).toBe(true);
    expect(text.startsWith('{"facets":{"columns":[],"constraints":[]')).toBe(true);
  });

  it('is independent of row order and of key order within a row', () => {
    const a = canonicalCatalog({ ...empty, relations: [ledger, marker] });
    const b = canonicalCatalog({ ...empty, relations: [marker, ledger] });
    const shuffled = {
      definition: null,
      comment: null,
      rls_forced: false,
      rls_enabled: false,
      owner: 'mesh_migrate',
      kind: 'r',
      name: 'migration_ledger',
    };
    const c = canonicalCatalog({ ...empty, relations: [marker, shuffled] });
    expect(a).toBe(b);
    expect(a).toBe(c);
    expect(catalogChecksumOf({ ...empty, relations: [ledger, marker] })).toBe(
      catalogChecksumOf({ ...empty, relations: [marker, ledger] }),
    );
  });

  it('changes when any facet row changes', () => {
    const base = catalogChecksumOf({ ...empty, relations: [ledger] });
    expect(base).toMatch(/^[0-9a-f]{64}$/);
    expect(catalogChecksumOf({ ...empty, relations: [{ ...ledger, rls_forced: true }] })).not.toBe(
      base,
    );
    expect(
      catalogChecksumOf({
        ...empty,
        relations: [ledger],
        relation_grants: [
          {
            object: 'migration_ledger',
            grantee: 'mesh_app',
            grantor: 'mesh_migrate',
            privilege: 'INSERT',
            grantable: false,
          },
        ],
      }),
    ).not.toBe(base);
    expect(catalogChecksumOf(empty)).not.toBe(base);
  });

  it('has a fixed canonical form for version 1', () => {
    // If this text changes, the serialization changed: bump the version and ship a migration.
    expect(canonicalCatalog(empty)).toBe(
      '{"facets":{"columns":[],"constraints":[],"database_grants":[],"default_privileges":[],"extensions":[],"function_grants":[],"functions":[],"indexes":[],"policies":[],"relation_grants":[],"relations":[],"roles":[],"schema_grants":[],"sequences":[],"triggers":[],"types":[]},"version":1}',
    );
  });
});
