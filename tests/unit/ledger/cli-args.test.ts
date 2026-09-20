import { describe, expect, it } from 'vitest';

import { CliUsageError, parseCliArgs, USAGE } from '../../../db/ledger/cli-args.js';

describe('migration command line arguments', () => {
  it('defaults to both databases and the repository migration root', () => {
    expect(parseCliArgs(['status'])).toEqual({
      command: 'status',
      targets: ['domain', 'audit'],
      migrationsRoot: null,
    });
  });
  it('selects one database or all, and an alternative root', () => {
    expect(parseCliArgs(['migrate', '--database', 'audit'])).toMatchObject({
      command: 'migrate',
      targets: ['audit'],
    });
    expect(parseCliArgs(['verify', '--database', 'all', '--migrations', '/tmp/x'])).toEqual({
      command: 'verify',
      targets: ['domain', 'audit'],
      migrationsRoot: '/tmp/x',
    });
  });
  it('rejects a missing or unknown command, option, or value', () => {
    expect(() => parseCliArgs([])).toThrow(CliUsageError);
    expect(() => parseCliArgs(['drop'])).toThrow(/unknown command/);
    expect(() => parseCliArgs(['status', '--database'])).toThrow(/requires a value/);
    expect(() => parseCliArgs(['status', '--database', 'both'])).toThrow(/domain, audit, or all/);
    expect(() => parseCliArgs(['status', '--force'])).toThrow(/unknown option/);
    expect(() => parseCliArgs(['rehearse', '--migrations'])).toThrow(/requires a value/);
  });
  it('documents the exit codes', () => {
    expect(USAGE).toMatch(/Exit codes: 0 ok; 1 pending \(status\) or an ordinary failure;/);
    expect(USAGE).toMatch(/2 a hard-stop condition \(identity mismatch, hash mismatch/);
  });
});
