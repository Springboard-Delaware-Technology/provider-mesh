import { createHash } from 'node:crypto';
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';

/**
 * The migration set compiled into this release (Foundation 001 §5.3 rule 4, §5.4): every
 * `NNNN_<name>.sql` under `db/migrations`, in filename order, with the SHA-256 of its bytes.
 * The migration mechanism (C4) applies and records the same set; startup compares the two.
 */
export interface CompiledMigration {
  readonly filename: string;
  readonly sha256: string;
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
    throw new MigrationSetError('migration directory is not readable');
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
