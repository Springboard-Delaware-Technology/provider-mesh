import { createHash } from 'node:crypto';
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';

/**
 * The migration sets compiled into this release (Foundation 001 §5.3 rule 4, §5.4): every
 * `NNNN_<name>.sql` under `db/migrations/<target>`, in filename order, with the SHA-256 of its
 * bytes. There is one ledger per database and therefore one set per database (§5.4: "in each
 * database"). The migration mechanism (`db/ledger`) applies and records the same sets; startup
 * compares each ledger with its set.
 */
export interface CompiledMigration {
  readonly filename: string;
  readonly sha256: string;
}

export const MIGRATION_TARGETS = ['domain', 'audit'] as const;
export type MigrationTarget = (typeof MIGRATION_TARGETS)[number];

export interface CompiledMigrationSets {
  readonly domain: readonly CompiledMigration[];
  readonly audit: readonly CompiledMigration[];
}

export const MIGRATION_FILENAME = /^\d{4}_[a-z0-9_]+\.sql$/;

export class MigrationSetError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'MigrationSetError';
  }
}

export async function loadCompiledMigrationSet(
  directory: string,
): Promise<readonly CompiledMigration[]> {
  let entries: string[];
  try {
    entries = await readdir(directory);
  } catch {
    throw new MigrationSetError(`migration directory is not readable: ${path.basename(directory)}`);
  }
  const sqlFiles = entries.filter((name) => name.endsWith('.sql')).sort();
  const set: CompiledMigration[] = [];
  for (const filename of sqlFiles) {
    if (!MIGRATION_FILENAME.test(filename)) {
      throw new MigrationSetError(`migration filename does not match NNNN_<name>.sql: ${filename}`);
    }
    const bytes = await readFile(path.join(directory, filename));
    set.push({ filename, sha256: createHash('sha256').update(bytes).digest('hex') });
  }
  const prefixes = new Set(set.map((m) => m.filename.slice(0, 4)));
  if (prefixes.size !== set.length) throw new MigrationSetError('duplicate migration number');
  return set;
}

/** Loads `<root>/domain` and `<root>/audit`; either directory being unreadable is an error. */
export async function loadCompiledMigrationSets(root: string): Promise<CompiledMigrationSets> {
  return {
    domain: await loadCompiledMigrationSet(path.join(root, 'domain')),
    audit: await loadCompiledMigrationSet(path.join(root, 'audit')),
  };
}
