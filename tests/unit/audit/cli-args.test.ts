import { describe, expect, it } from 'vitest';

import { AuditCliUsageError, parseAuditCliArgs, USAGE } from '../../../db/audit/cli-args.js';

describe('audit command line arguments', () => {
  it('parses the two commands and their options', () => {
    expect(parseAuditCliArgs(['verify'])).toEqual({
      command: 'verify',
      objectStoreRoot: null,
      batchSize: null,
      identity: null,
    });
    expect(
      parseAuditCliArgs(['checkpoint', '--object-store', '/tmp/x', '--identity', 'ops:manual']),
    ).toMatchObject({ command: 'checkpoint', objectStoreRoot: '/tmp/x', identity: 'ops:manual' });
    expect(parseAuditCliArgs(['verify', '--batch', '25'])).toMatchObject({ batchSize: 25 });
  });
  it('rejects a missing or unknown command, option, or value', () => {
    expect(() => parseAuditCliArgs([])).toThrow(AuditCliUsageError);
    expect(() => parseAuditCliArgs(['rewrite'])).toThrow(/unknown command/);
    expect(() => parseAuditCliArgs(['verify', '--batch'])).toThrow(/positive number/);
    expect(() => parseAuditCliArgs(['verify', '--batch', '0'])).toThrow(/positive number/);
    expect(() => parseAuditCliArgs(['verify', '--force'])).toThrow(/unknown option/);
    expect(() => parseAuditCliArgs(['checkpoint', '--object-store'])).toThrow(/requires a value/);
  });
  it('documents the roles and exit codes', () => {
    expect(USAGE).toMatch(/mesh_audit_reader/);
    expect(USAGE).toMatch(/mesh_audit_writer/);
    expect(USAGE).toMatch(/Exit codes: 0 ok; 1 an ordinary failure;/);
  });
});
