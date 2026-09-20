export const COMMANDS = ['verify', 'checkpoint'] as const;
export type AuditCommand = (typeof COMMANDS)[number];

export interface AuditCliArgs {
  readonly command: AuditCommand;
  /** Root of the development object store; `null` selects `var/object-store`. */
  readonly objectStoreRoot: string | null;
  /** Rows read per query while walking the chain (`verify`). */
  readonly batchSize: number | null;
  /** The verifier identity recorded in the checkpoint (`checkpoint`). */
  readonly identity: string | null;
}

export class AuditCliUsageError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AuditCliUsageError';
  }
}

export const USAGE = `usage: db/audit/cli.ts <verify|checkpoint> [--object-store <dir>] [--batch <rows>] [--identity <label>]

  verify      recompute the audit chain from sequence 1 as mesh_audit_reader and report the first
              divergence, gap, or duplicate; check the chain against the latest exported checkpoint
  checkpoint  export a checkpoint of the chain head through the object-store port as
              mesh_audit_writer and record the export as an audit event

verify reads PROVIDER_MESH_INSTANCE_ID, PROVIDER_MESH_ENVIRONMENT, and PROVIDER_MESH_AUDIT_READER_URL;
checkpoint reads the first two and PROVIDER_MESH_AUDIT_URL. Exit codes: 0 ok; 1 an ordinary failure;
2 a hard-stop condition (wrong role, identity mismatch, chain divergence, gap, duplicate, checkpoint
mismatch or truncation, unreadable checkpoint).`;

function isCommand(value: string): value is AuditCommand {
  return (COMMANDS as readonly string[]).includes(value);
}

export function parseAuditCliArgs(argv: readonly string[]): AuditCliArgs {
  const [command, ...rest] = argv;
  if (command === undefined) throw new AuditCliUsageError('a command is required');
  if (!isCommand(command)) throw new AuditCliUsageError(`unknown command: ${command}`);
  let objectStoreRoot: string | null = null;
  let batchSize: number | null = null;
  let identity: string | null = null;
  for (let i = 0; i < rest.length; i += 1) {
    const option = rest[i];
    const value = rest[i + 1];
    if (option === '--object-store') {
      if (value === undefined) throw new AuditCliUsageError('--object-store requires a value');
      objectStoreRoot = value;
      i += 1;
    } else if (option === '--batch') {
      if (value === undefined || !/^[1-9]\d{0,5}$/.test(value)) {
        throw new AuditCliUsageError('--batch requires a positive number of rows');
      }
      batchSize = Number(value);
      i += 1;
    } else if (option === '--identity') {
      if (value === undefined) throw new AuditCliUsageError('--identity requires a value');
      identity = value;
      i += 1;
    } else {
      throw new AuditCliUsageError(`unknown option: ${option ?? ''}`);
    }
  }
  return { command, objectStoreRoot, batchSize, identity };
}
