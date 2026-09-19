import { describe, expect, it } from 'vitest';

import {
  CONFIG_NAMES,
  ConfigError,
  DEFAULT_PORT,
  httpConfig,
  instanceConfig,
  readRequired,
} from '../../src/app/config.js';

describe('configuration names (§5.3, A08)', () => {
  it('uses only Springboard-named variables plus the platform port', () => {
    for (const name of Object.values(CONFIG_NAMES)) {
      expect(name === 'PORT' || name.startsWith('PROVIDER_MESH_')).toBe(true);
    }
  });

  it('names the missing variable and nothing else', () => {
    expect(() => readRequired({}, CONFIG_NAMES.databaseUrl)).toThrow(
      new ConfigError(CONFIG_NAMES.databaseUrl, 'missing'),
    );
    expect(() =>
      readRequired({ PROVIDER_MESH_DATABASE_URL: '  ' }, CONFIG_NAMES.databaseUrl),
    ).toThrow(/missing: PROVIDER_MESH_DATABASE_URL$/);
  });

  it('never echoes a value in an error', () => {
    const secretLooking = 'postgresql://mesh_app:fake@example.invalid/provider_mesh';
    let message = '';
    try {
      instanceConfig({ PROVIDER_MESH_INSTANCE_ID: secretLooking });
    } catch (error) {
      message = (error as Error).message;
    }
    expect(message).not.toContain('fake@example');
    expect(message).toBe('configuration invalid: PROVIDER_MESH_INSTANCE_ID');
  });
});

describe('http port (§5.10)', () => {
  it('defaults when the platform supplies nothing', () => {
    expect(httpConfig({})).toEqual({ port: DEFAULT_PORT });
    expect(httpConfig({ PORT: '' })).toEqual({ port: DEFAULT_PORT });
  });
  it('accepts a valid port and rejects malformed ones', () => {
    expect(httpConfig({ PORT: '8080' })).toEqual({ port: 8080 });
    for (const bad of ['0', '70000', 'abc', '80 ']) {
      expect(() => httpConfig({ PORT: bad })).toThrow(/invalid: PORT$/);
    }
  });
});

describe('instance identity (§5.3 rule 3)', () => {
  const id = '543e37e2-0ffa-4576-8443-e37f1355e421';
  it('reads a UUID and a known environment', () => {
    expect(
      instanceConfig({ PROVIDER_MESH_INSTANCE_ID: id, PROVIDER_MESH_ENVIRONMENT: 'ci' }),
    ).toEqual({
      instanceId: id,
      environment: 'ci',
    });
  });
  it('rejects an unknown environment', () => {
    expect(() =>
      instanceConfig({ PROVIDER_MESH_INSTANCE_ID: id, PROVIDER_MESH_ENVIRONMENT: 'prod' }),
    ).toThrow(/invalid: PROVIDER_MESH_ENVIRONMENT$/);
  });
});
