import { execFileSync } from 'node:child_process';
import { realpathSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(here, '..', '..');
const configPath = path.join(repoRoot, '.dependency-cruiser.cjs');
// The package's exports map hides its bin entry; resolve the installed shim instead.
const depcruiseBin = realpathSync(path.join(repoRoot, 'node_modules', '.bin', 'depcruise'));

interface CruiseSummary {
  readonly summary: {
    readonly error: number;
    readonly violations: readonly { readonly rule: { readonly name: string } }[];
  };
}

function cruise(
  cwd: string,
  targets: readonly string[],
): { readonly exitCode: number; readonly result: CruiseSummary } {
  try {
    const stdout = execFileSync(
      process.execPath,
      [depcruiseBin, '--config', configPath, '--output-type', 'json', ...targets],
      { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] },
    );
    return { exitCode: 0, result: JSON.parse(stdout) as CruiseSummary };
  } catch (error) {
    const failed = error as { status: number | null; stdout: string };
    return { exitCode: failed.status ?? 1, result: JSON.parse(failed.stdout) as CruiseSummary };
  }
}

const RULES = [
  'F001-rule-1-modules-must-not-import-adapters',
  'F001-rule-2-modules-import-other-modules-via-index-only',
  'F001-rule-2b-app-imports-modules-via-index-only',
  'F001-rule-3-platform-must-not-import-modules',
  'F001-rule-4-only-app-imports-adapters',
];
// Rule 5 has a resolved form (client installed) and an unresolved form (client absent).
const RULE_5 = [
  'F001-rule-5-sql-client-only-in-postgres-adapter-and-db',
  'F001-rule-5-sql-client-only-in-postgres-adapter-and-db-unresolved',
];

describe('Foundation 001 §4.3 boundary check (A03)', () => {
  it('passes on the repository source tree', () => {
    const { exitCode, result } = cruise(repoRoot, ['src', 'db', 'tests', 'scripts']);
    expect(result.summary.error).toBe(0);
    expect(exitCode).toBe(0);
  });

  it('fails the deliberately violating fixture tree on every rule', () => {
    const fixtureRoot = path.join(here, 'fixtures', 'violating-tree');
    // The JSON reporter always exits 0; the CI command uses the text reporter, which does not.
    const { result } = cruise(fixtureRoot, ['src']);
    expect(result.summary.error).toBeGreaterThan(0);
    const fired = new Set(result.summary.violations.map((v) => v.rule.name));
    for (const rule of RULES) expect(fired, `rule ${rule} should fire`).toContain(rule);
    expect(
      RULE_5.some((rule) => fired.has(rule)),
      'rule 5 should fire',
    ).toBe(true);
  });
});
