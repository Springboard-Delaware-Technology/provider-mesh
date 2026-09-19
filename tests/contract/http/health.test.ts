import { afterEach, describe, expect, it } from 'vitest';

import {
  createHttpServer,
  type ReadinessResult,
} from '../../../src/modules/access-gateway/index.js';

const ready = (): Promise<ReadinessResult> => Promise.resolve({ ready: true });
const notReady = (): Promise<ReadinessResult> =>
  Promise.resolve({ ready: false, reason: 'foundation_incomplete' });

describe('health and readiness (§5.10)', () => {
  const servers: { close(): Promise<void> }[] = [];
  afterEach(async () => {
    for (const s of servers.splice(0)) await s.close();
  });

  it('registers exactly /healthz and /readyz', () => {
    const { app, routes } = createHttpServer({ readiness: ready });
    servers.push(app);
    expect(routes.map((r) => `${r.method} ${r.url}`).sort()).toEqual([
      'GET /healthz',
      'GET /readyz',
    ]);
  });

  it('/healthz reports liveness only', async () => {
    const { app } = createHttpServer({ readiness: notReady });
    servers.push(app);
    const res = await app.inject({ method: 'GET', url: '/healthz' });
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual({ status: 'ok' });
  });

  it('/readyz is ready only when the probe says so', async () => {
    const { app } = createHttpServer({ readiness: ready });
    servers.push(app);
    const res = await app.inject({ method: 'GET', url: '/readyz' });
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual({ status: 'ready' });
  });

  it('/readyz not-ready carries a reason code and no detail', async () => {
    const { app } = createHttpServer({ readiness: notReady });
    servers.push(app);
    const res = await app.inject({ method: 'GET', url: '/readyz' });
    expect(res.statusCode).toBe(503);
    expect(res.json()).toEqual({ status: 'not_ready', reason: 'foundation_incomplete' });
  });

  it('a probe failure is a not-ready without detail, never a stack', async () => {
    const { app } = createHttpServer({
      readiness: () => Promise.reject(new Error('secret-ish detail')),
    });
    servers.push(app);
    const res = await app.inject({ method: 'GET', url: '/readyz' });
    expect(res.statusCode).toBe(500);
    expect(res.body).not.toContain('secret-ish');
    expect(res.json()).toEqual({ status: 'error' });
  });

  it('unknown routes do not echo the request', async () => {
    const { app } = createHttpServer({ readiness: ready });
    servers.push(app);
    const res = await app.inject({ method: 'GET', url: '/admin?token=abc' });
    expect(res.statusCode).toBe(404);
    expect(res.body).not.toContain('admin');
    expect(res.json()).toEqual({ status: 'not_found' });
  });

  it('responses carry no version, hostname, or configuration', async () => {
    const { app } = createHttpServer({ readiness: ready });
    servers.push(app);
    for (const url of ['/healthz', '/readyz']) {
      const res = await app.inject({ method: 'GET', url });
      const headerNames = Object.keys(res.headers).map((h) => h.toLowerCase());
      expect(headerNames).not.toContain('x-powered-by');
      expect(headerNames).not.toContain('server');
      expect(res.body).not.toMatch(/\d+\.\d+\.\d+/);
    }
  });
});
