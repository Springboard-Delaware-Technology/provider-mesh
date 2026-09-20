import { mkdir, mkdtemp, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

import {
  compareIdentity,
  compareLedger,
  describeLedger,
  loadCompiledMigrationSet,
  loadCompiledMigrationSets,
  MigrationSetError,
  type InstanceMarker,
} from '../../../src/modules/platform-operations/index.js';

async function tempDir(files: Record<string, string>): Promise<string> {
  const dir = await mkdtemp(path.join(tmpdir(), 'pm-migrations-'));
  for (const [name, content] of Object.entries(files)) {
    await mkdir(path.dirname(path.join(dir, name)), { recursive: true });
    await writeFile(path.join(dir, name), content);
  }
  return dir;
}

describe('compiled migration set (§5.3 rule 4, §5.4)', () => {
  it('lists NNNN_<name>.sql in order with content hashes', async () => {
    const dir = await tempDir({
      '0002_b.sql': 'select 2;',
      '0001_a.sql': 'select 1;',
      'notes.md': 'x',
    });
    const set = await loadCompiledMigrationSet(dir);
    expect(set.map((m) => m.filename)).toEqual(['0001_a.sql', '0002_b.sql']);
    expect(set[0]?.sha256).toMatch(/^[0-9a-f]{64}$/);
    expect(set[0]?.sha256).not.toBe(set[1]?.sha256);
  });

  it('rejects a malformed name and a duplicate number', async () => {
    await expect(loadCompiledMigrationSet(await tempDir({ 'first.sql': '' }))).rejects.toThrow(
      MigrationSetError,
    );
    await expect(
      loadCompiledMigrationSet(await tempDir({ '0001_a.sql': '', '0001_b.sql': '' })),
    ).rejects.toThrow(/duplicate/);
  });

  it('loads one set per database from <root>/domain and <root>/audit', async () => {
    const root = await tempDir({
      'domain/0001_a.sql': 'select 1;',
      'domain/0002_b.sql': 'select 2;',
      'audit/0001_z.sql': 'select 3;',
    });
    const sets = await loadCompiledMigrationSets(root);
    expect(sets.domain.map((m) => m.filename)).toEqual(['0001_a.sql', '0002_b.sql']);
    expect(sets.audit.map((m) => m.filename)).toEqual(['0001_z.sql']);
  });

  it('fails when either set directory is absent', async () => {
    await expect(
      loadCompiledMigrationSets(await tempDir({ 'domain/0001_a.sql': '' })),
    ).rejects.toThrow(/audit/);
    await expect(
      loadCompiledMigrationSets(await tempDir({ 'audit/0001_a.sql': '' })),
    ).rejects.toThrow(/domain/);
  });

  it('the repository migration sets are loadable and begin with the ledger migration', async () => {
    const sets = await loadCompiledMigrationSets(path.resolve('db/migrations'));
    expect(sets.domain[0]?.filename).toBe('0001_migration_ledger.sql');
    expect(sets.audit[0]?.filename).toBe('0001_migration_ledger.sql');
    expect(sets.domain[0]?.sha256).not.toBe(sets.audit[0]?.sha256);
  });
});

describe('ledger comparison', () => {
  const compiled = [
    { filename: '0001_a.sql', sha256: 'aa' },
    { filename: '0002_b.sql', sha256: 'bb' },
  ];
  it('absent ledger matches only an empty compiled set', () => {
    expect(compareLedger([], { present: false })).toEqual({ matched: true, applied: 0 });
    expect(compareLedger(compiled, { present: false })).toMatchObject({
      matched: false,
      problem: 'ledger_absent',
    });
  });
  it('matches when every compiled file is applied with the same hash and nothing else', () => {
    expect(compareLedger(compiled, { present: true, entries: compiled })).toEqual({
      matched: true,
      applied: 2,
    });
  });
  it('reports pending, hash mismatch, and unknown applied files', () => {
    expect(
      compareLedger(compiled, { present: true, entries: [compiled[0] as never] }),
    ).toMatchObject({
      problem: 'pending',
      filename: '0002_b.sql',
    });
    expect(
      compareLedger(compiled, {
        present: true,
        entries: [compiled[0] as never, { filename: '0002_b.sql', sha256: 'xx' }],
      }),
    ).toMatchObject({ problem: 'hash_mismatch', filename: '0002_b.sql' });
    expect(
      compareLedger(compiled, {
        present: true,
        entries: [...compiled, { filename: '0003_c.sql', sha256: 'cc' }],
      }),
    ).toMatchObject({ problem: 'unknown_applied', filename: '0003_c.sql' });
  });
  it('reports the first problem in filename order, a mismatch before a later pending file', () => {
    expect(
      compareLedger(compiled, {
        present: true,
        entries: [{ filename: '0001_a.sql', sha256: 'xx' }],
      }),
    ).toMatchObject({ problem: 'hash_mismatch', filename: '0001_a.sql' });
  });
});

describe('ledger report for db:status (§5.4)', () => {
  const compiled = [
    { filename: '0001_a.sql', sha256: 'aa' },
    { filename: '0002_b.sql', sha256: 'bb' },
    { filename: '0003_c.sql', sha256: 'cc' },
  ];
  it('treats an absent ledger as everything pending', () => {
    expect(describeLedger(compiled, { present: false })).toEqual({
      present: false,
      applied: [],
      pending: compiled,
      mismatched: [],
      unknown: [],
    });
  });
  it('lists every applied, pending, mismatched, and unknown entry at once', () => {
    const report = describeLedger(compiled, {
      present: true,
      entries: [
        { filename: '0001_a.sql', sha256: 'aa' },
        { filename: '0002_b.sql', sha256: 'zz' },
        { filename: '0009_z.sql', sha256: '99' },
        { filename: '0004_d.sql', sha256: '44' },
      ],
    });
    expect(report).toEqual({
      present: true,
      applied: [{ filename: '0001_a.sql', sha256: 'aa' }],
      pending: [{ filename: '0003_c.sql', sha256: 'cc' }],
      mismatched: [{ filename: '0002_b.sql', compiledSha256: 'bb', ledgerSha256: 'zz' }],
      unknown: [
        { filename: '0004_d.sql', sha256: '44' },
        { filename: '0009_z.sql', sha256: '99' },
      ],
    });
  });
  it('is at head when the ledger holds exactly the set', () => {
    expect(describeLedger(compiled, { present: true, entries: compiled })).toMatchObject({
      applied: compiled,
      pending: [],
      mismatched: [],
      unknown: [],
    });
  });
});

describe('instance identity comparison (§5.3 rule 3)', () => {
  const marker: InstanceMarker = {
    instanceId: '543E37E2-0FFA-4576-8443-E37F1355E421',
    environment: 'development',
    databaseRole: 'domain',
    createdAt: '2026-09-19T00:00:00.000Z',
  };
  const expected = {
    instanceId: '543e37e2-0ffa-4576-8443-e37f1355e421',
    environment: 'development',
  } as const;
  it('matches case-insensitively on the UUID and exactly on the rest', () => {
    expect(compareIdentity({ ...expected, databaseRole: 'domain' }, marker)).toMatchObject({
      matched: true,
    });
    expect(compareIdentity({ ...expected, databaseRole: 'audit' }, marker)).toMatchObject({
      problem: 'database_role',
    });
    expect(
      compareIdentity({ ...expected, environment: 'ci', databaseRole: 'domain' }, marker),
    ).toMatchObject({
      problem: 'environment',
    });
    expect(
      compareIdentity({ ...expected, instanceId: 'other', databaseRole: 'domain' }, marker),
    ).toMatchObject({
      problem: 'instance_id',
    });
    expect(compareIdentity({ ...expected, databaseRole: 'domain' }, null)).toMatchObject({
      problem: 'absent',
    });
  });
});
