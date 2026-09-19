/**
 * Composition root entry (Foundation 001 §4.2, §5.3, §5.10).
 *
 * Order: read configuration (errors name the variable), build verified-TLS stores, run the
 * read-only startup assertions and fail closed on any of them, then serve `/healthz` and
 * `/readyz`. Startup performs no database write (§5.3 rule 5).
 */
import { createHttpServer } from '../modules/access-gateway/index.js';
import { StartupAssertionError } from '../modules/platform-operations/index.js';
import { ConnectionConfigError } from '../platform/adapters/postgres/index.js';

import { composeApplication } from './compose.js';
import { ConfigError, httpConfig } from './config.js';

async function main(): Promise<void> {
  const { port } = httpConfig(process.env);
  const application = await composeApplication(process.env);

  try {
    const report = await application.assertStartup();
    console.log(
      `provider-mesh foundation: startup assertions passed; environment=${report.environment} migrations=${String(report.appliedMigrations)}`,
    );
  } catch (error) {
    await application.stores.close();
    throw error;
  }

  const { app, routes } = createHttpServer({ readiness: application.readiness });
  await app.listen({ port, host: '0.0.0.0' });
  console.log(`provider-mesh foundation: listening; routes=${String(routes.length)}`);

  const shutdown = (): void => {
    void app
      .close()
      .then(() => application.stores.close())
      .then(() => process.exit(0));
  };
  process.once('SIGINT', shutdown);
  process.once('SIGTERM', shutdown);
}

main().catch((error: unknown) => {
  // Name the failing variable or assertion code, never a value or a detail (§5.3, §5.8).
  const message =
    error instanceof ConfigError ||
    error instanceof ConnectionConfigError ||
    error instanceof StartupAssertionError
      ? error.message
      : 'startup failed';
  console.error(`provider-mesh foundation: ${message}`);
  process.exit(1);
});
