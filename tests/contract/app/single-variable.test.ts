/**
 * A08 (ADR-001 §6.3 rule 8): the application connects only to the host named by
 * PROVIDER_MESH_DATABASE_URL, observed at the socket layer, even when platform-injected
 * variables point elsewhere; and startup fails when the Springboard-named variable is absent
 * even though DATABASE_URL is set. This file is the one place outside the static check that
 * may name the platform variables (scripts/check-db-env-names.sh excludes it by name).
 */
import { createServer, type AddressInfo, type Server } from 'node:net';

import { afterEach, describe, expect, it } from 'vitest';

import { ConfigError } from '../../../src/app/config.js';
import { createStores, storeConfigs } from '../../../src/app/compose.js';

interface Probe {
  readonly server: Server;
  port: number;
  connections: number;
}

async function listen(): Promise<Probe> {
  const probe: Probe = { server: createServer(), port: 0, connections: 0 };
  probe.server.on('connection', (socket) => {
    probe.connections += 1;
    socket.destroy();
  });
  await new Promise<void>((resolve) => probe.server.listen(0, '127.0.0.1', resolve));
  return Object.assign(probe, { port: (probe.server.address() as AddressInfo).port });
}

function url(port: number): string {
  return `postgresql://mesh_app:fake@127.0.0.1:${String(port)}/provider_mesh?sslmode=verify-full&sslrootcert=system`;
}

const PLATFORM = [
  'DATABASE_URL',
  'PGHOST',
  'PGPORT',
  'PGDATABASE',
  'PGUSER',
  'PGPASSWORD',
  'PGSSLMODE',
] as const;

describe('one Springboard-named variable (A08)', () => {
  const saved = new Map<string, string | undefined>();
  const probes: Probe[] = [];
  afterEach(async () => {
    for (const [k, v] of saved) {
      if (v === undefined) Reflect.deleteProperty(process.env, k);
      else process.env[k] = v;
    }
    saved.clear();
    for (const p of probes.splice(0))
      await new Promise<void>((r) => {
        p.server.close(() => {
          r();
        });
      });
  });
  const setEnv = (k: string, v: string): void => {
    if (!saved.has(k)) saved.set(k, process.env[k]);
    process.env[k] = v;
  };

  it('fails when PROVIDER_MESH_DATABASE_URL is absent even though DATABASE_URL is set', () => {
    const env = { DATABASE_URL: url(1), PROVIDER_MESH_AUDIT_URL: url(1) };
    expect(() => storeConfigs(env)).toThrow(
      new ConfigError('PROVIDER_MESH_DATABASE_URL', 'missing'),
    );
  });

  it('connects only to the PROVIDER_MESH host, never to the platform-injected one', async () => {
    const platform = await listen();
    const mesh = await listen();
    probes.push(platform, mesh);
    // Every platform variable points at the decoy, including the process environment the
    // SQL client could read if a parameter were left unspecified.
    setEnv('DATABASE_URL', url(platform.port));
    setEnv('PGHOST', '127.0.0.1');
    setEnv('PGPORT', String(platform.port));
    setEnv('PGDATABASE', 'decoy');
    setEnv('PGUSER', 'decoy');
    setEnv('PGPASSWORD', 'decoy');
    setEnv('PGSSLMODE', 'disable');

    const stores = createStores(
      storeConfigs({
        ...Object.fromEntries(PLATFORM.map((k) => [k, process.env[k]])),
        PROVIDER_MESH_DATABASE_URL: url(mesh.port),
        PROVIDER_MESH_AUDIT_URL: url(mesh.port),
      }),
    );
    try {
      await expect(stores.domain.ping()).rejects.toBeDefined();
      await expect(stores.audit.ping()).rejects.toBeDefined();
    } finally {
      await stores.close();
    }
    expect(mesh.connections).toBeGreaterThanOrEqual(2);
    expect(platform.connections).toBe(0);
  });
});
