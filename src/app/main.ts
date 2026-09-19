/**
 * Composition root (Foundation 001 §4.2). Wiring, startup assertions, and the HTTP server.
 *
 * Under this increment the server answers `/healthz` and reports `/readyz` as not ready with
 * reason `foundation_incomplete`: the database connection (C3), migration ledger (C4), and audit
 * sink (C5) that readiness depends on are not built yet. Startup performs no database access and
 * no write (§5.3 rule 5).
 */
import { createHttpServer, type ReadinessProbe } from '../modules/access-gateway/index.js';

import { ConfigError, httpConfig } from './config.js';

const readiness: ReadinessProbe = () =>
  Promise.resolve({ ready: false, reason: 'foundation_incomplete' });

async function main(): Promise<void> {
  const { port } = httpConfig(process.env);
  const { app, routes } = createHttpServer({ readiness });
  await app.listen({ port, host: '0.0.0.0' });
  console.log(`provider-mesh foundation: listening; routes=${String(routes.length)}`);

  const shutdown = (): void => {
    void app.close().then(() => process.exit(0));
  };
  process.once('SIGINT', shutdown);
  process.once('SIGTERM', shutdown);
}

main().catch((error: unknown) => {
  // Name the failing variable, never its value (§5.3 rule 1; §5.8).
  const message = error instanceof ConfigError ? error.message : 'startup failed';
  console.error(`provider-mesh foundation: ${message}`);
  process.exit(1);
});
