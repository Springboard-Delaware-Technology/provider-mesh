/**
 * Audit commands (Foundation 001 §4.1, §5.5): `audit:verify` (rule 3) as `mesh_audit_reader`
 * through PROVIDER_MESH_AUDIT_READER_URL, and `audit:checkpoint` (rule 4, on demand) as
 * `mesh_audit_writer` through PROVIDER_MESH_AUDIT_URL. Neither reads any other database
 * variable (A08). Output carries sequences, hashes, counts, and object keys; never row content,
 * a connection string, or a credential (SEC-AUD-02: audit metadata remains protected).
 */
import {
  CONFIG_NAMES,
  ConfigError,
  DEFAULT_OBJECT_STORE_ROOT,
  instanceConfig,
  readRequired,
} from '../../src/app/config.js';
import {
  AuditAppendError,
  AuditService,
  CheckpointError,
  readLatestCheckpoint,
  verifyChain,
  type ChainVerificationReport,
} from '../../src/modules/audit/index.js';
import { FilesystemObjectStore } from '../../src/platform/adapters/dev/index.js';
import {
  buildConnectionConfig,
  ConnectionConfigError,
  describeConnection,
  PostgresRelationalStore,
} from '../../src/platform/adapters/postgres/index.js';

import { AuditCliUsageError, parseAuditCliArgs, USAGE, type AuditCliArgs } from './cli-args.js';
import { AuditStopError, preflightAuditStore } from './preflight.js';

export const EXIT = { ok: 0, failure: 1, stop: 2 } as const;

const READER_ROLE = 'mesh_audit_reader';
const WRITER_ROLE = 'mesh_audit_writer';

const out = (line: string): void => {
  console.log(line);
};
const err = (line: string): void => {
  console.error(line);
};

function describeReport(report: ChainVerificationReport): void {
  if (report.head === null) {
    out('  chain: empty (0 rows)');
  } else {
    out(
      `  chain: ${report.rows.toString()} row(s) verified from sequence 1; head sequence ${report.head.sequence.toString()} hash ${report.head.hash}`,
    );
  }
  const target = report.checkpoint.target;
  if (target === null) {
    out('  checkpoint: none exported yet');
  } else {
    out(
      `  checkpoint: latest at sequence ${target.sequence.toString()} hash ${target.hash}: ${report.checkpoint.status}`,
    );
  }
}

async function runVerify(args: AuditCliArgs, objects: FilesystemObjectStore): Promise<number> {
  const env = process.env;
  const expected = instanceConfig(env);
  const config = buildConnectionConfig(
    CONFIG_NAMES.auditReaderUrl,
    readRequired(env, CONFIG_NAMES.auditReaderUrl),
  );
  out(`audit:verify (${describeConnection(config)}; object store ${objects.root})`);
  const store = new PostgresRelationalStore(config);
  try {
    const preflight = await preflightAuditStore(store, READER_ROLE, expected);
    out(
      `  identity: instance ${preflight.marker.instanceId} environment ${preflight.marker.environment} role audit matched; connected as ${preflight.role}`,
    );
    const latest = await readLatestCheckpoint(objects, expected.instanceId);
    const checkpoint =
      latest === null ? null : { sequence: BigInt(latest.sequence), hash: latest.hash };
    if (latest !== null) {
      out(`  checkpoint: read ${latest.verifiedAt} by ${latest.verifierIdentity}`);
    }
    const report = await store.transaction(
      null,
      (scope) =>
        verifyChain(scope, {
          checkpoint,
          ...(args.batchSize === null ? {} : { batchSize: args.batchSize }),
        }),
      { readOnly: true },
    );
    describeReport(report);
    if (report.problem !== null) {
      err(
        `  DIVERGENCE at sequence ${report.problem.sequence.toString()}: ${report.problem.kind} (${report.problem.detail})`,
      );
      err(
        '  hard stop (SEC-AUD-04): the audit chain does not verify; report to the decision authority',
      );
      return EXIT.stop;
    }
    out(`  verified: chain intact${checkpoint === null ? '' : ', checkpoint matched'}`);
    return EXIT.ok;
  } finally {
    await store.close();
  }
}

async function runCheckpoint(args: AuditCliArgs, objects: FilesystemObjectStore): Promise<number> {
  const env = process.env;
  const expected = instanceConfig(env);
  const config = buildConnectionConfig(
    CONFIG_NAMES.auditUrl,
    readRequired(env, CONFIG_NAMES.auditUrl),
  );
  out(`audit:checkpoint (${describeConnection(config)}; object store ${objects.root})`);
  const store = new PostgresRelationalStore(config);
  try {
    const preflight = await preflightAuditStore(store, WRITER_ROLE, expected);
    out(
      `  identity: instance ${preflight.marker.instanceId} environment ${preflight.marker.environment} role audit matched; connected as ${preflight.role}`,
    );
    const service = new AuditService(store, objects, expected, { originChannel: 'cli' });
    const identity = args.identity ?? `audit:checkpoint:${preflight.role}`;
    const checkpoint = await service.exportCheckpoint(identity);
    out(
      `  exported: sequence ${String(checkpoint.sequence)} hash ${checkpoint.hash} verified-at ${checkpoint.verifiedAt} by ${checkpoint.verifierIdentity}`,
    );
    const head = await service.chainHead();
    out(`  chain: head sequence ${String(head?.sequence ?? 0)} after recording the export`);
    return EXIT.ok;
  } finally {
    await store.close();
  }
}

async function main(argv: readonly string[]): Promise<number> {
  const args = parseAuditCliArgs(argv);
  const objects = new FilesystemObjectStore(args.objectStoreRoot ?? DEFAULT_OBJECT_STORE_ROOT);
  const exit =
    args.command === 'verify' ? await runVerify(args, objects) : await runCheckpoint(args, objects);
  out(
    `audit:${args.command}: ${exit === EXIT.ok ? 'ok' : exit === EXIT.stop ? 'HARD STOP' : 'not ok'} (exit ${String(exit)})`,
  );
  return exit;
}

function describe(error: unknown): { readonly line: string; readonly exit: number } {
  if (error instanceof AuditCliUsageError)
    return { line: `${error.message}\n${USAGE}`, exit: EXIT.failure };
  if (error instanceof AuditStopError) {
    return { line: `HARD STOP: ${error.code}: ${error.detail}`, exit: EXIT.stop };
  }
  if (error instanceof CheckpointError) {
    return { line: `HARD STOP: checkpoint_unreadable: ${error.message}`, exit: EXIT.stop };
  }
  if (error instanceof AuditAppendError) {
    return { line: error.message, exit: EXIT.failure };
  }
  if (error instanceof ConfigError || error instanceof ConnectionConfigError) {
    return { line: error.message, exit: EXIT.failure };
  }
  if (error instanceof Error)
    return { line: `${error.name}: ${error.message}`, exit: EXIT.failure };
  return { line: 'failed', exit: EXIT.failure };
}

main(process.argv.slice(2)).then(
  (code) => {
    process.exitCode = code;
  },
  (error: unknown) => {
    const { line, exit } = describe(error);
    err(`db/audit: ${line}`);
    process.exitCode = exit;
  },
);
