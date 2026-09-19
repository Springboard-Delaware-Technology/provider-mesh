import Fastify, { type FastifyInstance } from 'fastify';

import type { ReadinessProbe } from './readiness.js';

export interface RegisteredRoute {
  readonly method: string;
  readonly url: string;
}

export interface HttpServer {
  readonly app: FastifyInstance;
  /** Every route registered on the server; the inventory test asserts exactly two (§5.10). */
  readonly routes: readonly RegisteredRoute[];
}

/**
 * Builds the HTTP surface of the Interaction and Access Gateway (Architecture §6.1) as bounded
 * by Foundation 001 §5.10: `/healthz` and `/readyz` only. No response carries a version string,
 * hostname, configuration value, or request detail.
 */
export function createHttpServer(options: { readonly readiness: ReadinessProbe }): HttpServer {
  const app = Fastify({
    // Fastify's own logger would emit request lines; the allowlisted logger arrives with C8.
    logger: false,
    exposeHeadRoutes: false,
    routerOptions: { ignoreTrailingSlash: false },
    // Refuse oversized bodies outright; these routes carry none.
    bodyLimit: 1024,
  });

  const routes: RegisteredRoute[] = [];
  app.addHook('onRoute', (route) => {
    const methods = Array.isArray(route.method) ? route.method : [route.method];
    for (const method of methods) routes.push({ method, url: route.url });
  });

  app.setNotFoundHandler((_request, reply) => {
    void reply.code(404).send({ status: 'not_found' });
  });

  app.setErrorHandler((_error, _request, reply) => {
    void reply.code(500).send({ status: 'error' });
  });

  app.get('/healthz', () => ({ status: 'ok' }));

  app.get('/readyz', async (_request, reply) => {
    const result = await options.readiness();
    if (result.ready) return { status: 'ready' };
    return reply.code(503).send({ status: 'not_ready', reason: result.reason });
  });

  return { app, routes };
}
