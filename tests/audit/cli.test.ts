import { execFileSync } from 'node:child_process';
import { realpathSync } from 'node:fs';
import { mkdtemp } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

import { requireAuditEnv } from './support.js';

const env = requireAuditEnv();
const repoRoot = path.resolve(import.meta.dirname, '..', '..');
const tsx = realpathSync(path.join(repoRoot, 'node_modules', '.bin', 'tsx'));

interface CliResult {
  readonly code: number;
  readonly stdout: string;
  readonly stderr: string;
}

/** Runs the real command line as CI does, with the test's own environment. */
function cli(args: readonly string[], overrides: Record<string, string> = {}): CliResult {
  try {
    const stdout = execFileSync(process.execPath, [tsx, 'db/audit/cli.ts', ...args], {
      cwd: repoRoot,
      env: { ...process.env, ...overrides },
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    return { code: 0, stdout, stderr: '' };
  } catch (error) {
    const failed = error as { status: number | null; stdout: string; stderr: string };
    return { code: failed.status ?? -1, stdout: failed.stdout, stderr: failed.stderr };
  }
}

describe('audit:verify as mesh_audit_reader (§5.5 rule 3, A14)', () => {
  it('verifies the live chain from sequence 1, printing positions and hashes only', async () => {
    const objects = await mkdtemp(path.join(tmpdir(), 'pm-audit-cli-'));
    const result = cli(['verify', '--object-store', objects, '--batch', '3']);
    expect(result.code, result.stderr).toBe(0);
    expect(result.stdout).toMatch(/^audit:verify \(PROVIDER_MESH_AUDIT_READER_URL: /);
    expect(result.stdout).toMatch(/connected as mesh_audit_reader/);
    expect(result.stdout).toMatch(
      /chain: (empty \(0 rows\)|\d+ row\(s\) verified from sequence 1; head sequence \d+ hash [0-9a-f]{64})/,
    );
    expect(result.stdout).toMatch(/checkpoint: none exported yet/);
    expect(result.stdout).toMatch(/audit:verify: ok \(exit 0\)/);
    expect(result.stdout).not.toMatch(/postgres(ql)?:\/\//);
    expect(result.stdout).not.toMatch(/synthetic-actor/);
  });

  it('is a hard stop as the wrong role, for a foreign instance, and without its variable', async () => {
    const objects = await mkdtemp(path.join(tmpdir(), 'pm-audit-cli-'));
    const wrongRole = cli(['verify', '--object-store', objects], {
      PROVIDER_MESH_AUDIT_READER_URL: env['PROVIDER_MESH_AUDIT_URL'] ?? '',
    });
    expect(wrongRole.code).toBe(2);
    expect(wrongRole.stderr).toMatch(/HARD STOP: wrong_role: connected as mesh_audit_writer/);
    const foreign = cli(['verify', '--object-store', objects], {
      PROVIDER_MESH_INSTANCE_ID: '00000000-0000-4000-8000-000000000000',
    });
    expect(foreign.code).toBe(2);
    expect(foreign.stderr).toMatch(/HARD STOP: identity_mismatch/);
    const missing = cli(['verify', '--object-store', objects], {
      PROVIDER_MESH_AUDIT_READER_URL: '',
    });
    expect(missing.code).toBe(1);
    expect(missing.stderr).toMatch(/configuration missing: PROVIDER_MESH_AUDIT_READER_URL/);
    expect(cli(['rewrite']).code).toBe(1);
  });
});
