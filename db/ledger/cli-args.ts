import {
  MIGRATION_TARGETS,
  type MigrationTarget,
} from '../../src/modules/platform-operations/index.js';

export const COMMANDS = ['migrate', 'status', 'rehearse', 'verify'] as const;
export type Command = (typeof COMMANDS)[number];

export interface CliArgs {
  readonly command: Command;
  readonly targets: readonly MigrationTarget[];
  /** Root holding `domain/` and `audit/`; `null` selects the repository's `db/migrations`. */
  readonly migrationsRoot: string | null;
}

export class CliUsageError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CliUsageError';
  }
}

export const USAGE = `usage: db/ledger/cli.ts <migrate|status|rehearse|verify> [--database domain|audit|all] [--migrations <root>]

  migrate   apply every pending migration, each in its own transaction, and record it in the ledger
  status    report applied, pending, hash-mismatched, and unknown ledger entries
  rehearse  apply every pending migration inside one transaction that always rolls back
  verify    confirm ledger hashes, catalog state, grants, role attributes, and reference row counts

Reads PROVIDER_MESH_INSTANCE_ID, PROVIDER_MESH_ENVIRONMENT, PROVIDER_MESH_MIGRATE_URL, and
PROVIDER_MESH_AUDIT_MIGRATE_URL. Exit codes: 0 ok; 1 pending (status) or an ordinary failure;
2 a hard-stop condition (identity mismatch, hash mismatch, unexpected ledger entry, failed verification).`;

function isCommand(value: string): value is Command {
  return (COMMANDS as readonly string[]).includes(value);
}

function isTarget(value: string): value is MigrationTarget {
  return (MIGRATION_TARGETS as readonly string[]).includes(value);
}

export function parseCliArgs(argv: readonly string[]): CliArgs {
  const [command, ...rest] = argv;
  if (command === undefined) throw new CliUsageError('a command is required');
  if (!isCommand(command)) throw new CliUsageError(`unknown command: ${command}`);
  let targets: readonly MigrationTarget[] = MIGRATION_TARGETS;
  let migrationsRoot: string | null = null;
  for (let i = 0; i < rest.length; i += 1) {
    const option = rest[i];
    const value = rest[i + 1];
    if (option === '--database') {
      if (value === undefined) throw new CliUsageError('--database requires a value');
      if (value === 'all') targets = MIGRATION_TARGETS;
      else if (isTarget(value)) targets = [value];
      else throw new CliUsageError(`--database must be domain, audit, or all (got ${value})`);
      i += 1;
    } else if (option === '--migrations') {
      if (value === undefined) throw new CliUsageError('--migrations requires a value');
      migrationsRoot = value;
      i += 1;
    } else {
      throw new CliUsageError(`unknown option: ${option ?? ''}`);
    }
  }
  return { command, targets, migrationsRoot };
}
