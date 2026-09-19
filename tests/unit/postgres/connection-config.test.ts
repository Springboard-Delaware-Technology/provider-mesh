import { describe, expect, it } from 'vitest';

import {
  buildConnectionConfig,
  ConnectionConfigError,
  describeConnection,
} from '../../../src/platform/adapters/postgres/index.js';

const V = 'PROVIDER_MESH_DATABASE_URL';
const good =
  'postgresql://mesh_app:fake@db.example.invalid:5432/provider_mesh?sslmode=verify-full&sslrootcert=system';

describe('connection-config builder (§5.3 rule 2, A07)', () => {
  it('accepts verify-full with the system trust store and produces verifying TLS options', () => {
    const config = buildConnectionConfig(V, good);
    expect(config).toMatchObject({
      host: 'db.example.invalid',
      port: 5432,
      database: 'provider_mesh',
      user: 'mesh_app',
      sslMode: 'verify-full',
      trustStore: 'system',
      ssl: { rejectUnauthorized: true, servername: 'db.example.invalid' },
    });
    expect(buildConnectionConfig(V, 'postgresql://u:p@h/d?sslmode=verify-full').port).toBe(5432);
  });

  it.each([
    ['sslmode=disable', 'sslmode must be verify-full'],
    ['sslmode=allow', 'sslmode must be verify-full'],
    ['sslmode=prefer', 'sslmode must be verify-full'],
    ['sslmode=require', 'sslmode must be verify-full'],
    ['sslmode=verify-ca', 'sslmode must be verify-full'],
    ['sslmode=no-verify', 'sslmode must be verify-full'],
    ['', 'sslmode must be verify-full'],
    ['sslmode=verify-full&sslrootcert=/tmp/custom-ca.pem', 'sslrootcert must be system'],
    ['sslmode=verify-full&ssl=false', 'option not permitted: ssl'],
    ['sslmode=verify-full&rejectUnauthorized=false', 'option not permitted: rejectUnauthorized'],
    ['sslmode=verify-full&uselibpqcompat=true', 'option not permitted: uselibpqcompat'],
  ])('rejects "%s"', (query, rule) => {
    const url = `postgresql://mesh_app:fake@db.example.invalid/provider_mesh?${query}`;
    expect(() => buildConnectionConfig(V, url)).toThrow(new ConnectionConfigError(V, rule));
  });

  it.each([
    ['not a url', 'must be a URL'],
    ['mysql://u:p@h/d?sslmode=verify-full', 'scheme must be postgresql'],
    ['postgresql://u:p@/d?sslmode=verify-full', 'must be a URL'],
    ['postgresql://u:p@h/?sslmode=verify-full', 'database name is required'],
    ['postgresql://:p@h/d?sslmode=verify-full', 'user is required'],
    ['postgresql://u@h/d?sslmode=verify-full', 'password is required'],
    ['postgresql://u:p@h:99999/d?sslmode=verify-full', 'must be a URL'],
    ['postgresql://u:p@h:0/d?sslmode=verify-full', 'port is invalid'],
  ])('rejects malformed "%s"', (url, rule) => {
    expect(() => buildConnectionConfig(V, url)).toThrow(new ConnectionConfigError(V, rule));
  });

  it('never carries any part of the value in an error or a description', () => {
    let message = '';
    try {
      buildConnectionConfig(V, 'postgresql://mesh_app:fakepw@db.example.invalid/x?sslmode=disable');
    } catch (error) {
      message = (error as Error).message;
    }
    expect(message).toBe(
      'configuration invalid: PROVIDER_MESH_DATABASE_URL (sslmode must be verify-full)',
    );
    expect(message).not.toContain('fakepw');
    const description = describeConnection(buildConnectionConfig(V, good));
    expect(description).toBe(
      'PROVIDER_MESH_DATABASE_URL: db.example.invalid:5432/provider_mesh verify-full',
    );
    expect(description).not.toContain('fake');
    expect(description).not.toContain('mesh_app');
  });
});
