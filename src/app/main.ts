/**
 * Composition root entry (Foundation 001 §4.2, §5.3, §5.5, §5.10).
 *
 * Order: read configuration (errors name the variable), build verified-TLS stores, run the
 * read-only startup assertions and fail closed on any of them (§5.3 rule 5: the assertions
 * write nothing), then — now that the audit store's identity and ledger are verified — record
 * that they passed in the audit chain and export the first checkpoint (§5.5 rules 4–5), then
 * serve `/healthz` and `/readyz`. A checkpoint is exported again on a fixed schedule while the
 * process runs, and on demand by `npm run audit:checkpoint`.
 */
import { randomUUID } from 'node:crypto';

import { createHttpServer } from '../modules/access-gateway/index.js';
import { AuditAppendError, startupAssertionsEvent } from '../modules/audit/index.js';
import { StartupAssertionError } from '../modules/platform-operations/index.js';
import { ConnectionConfigError } from '../platform/adapters/postgres/index.js';

import { composeApplication } from './compose.js';
import { ConfigError, httpConfig } from './config.js';

/** §5.5 rule 4 "on a schedule": one checkpoint per hour while the process runs. */
const CHECKPOINT_INTERVAL_MS = 60 * 60 * 1000;

async function main(): Promise<void> {
  const { port } = httpConfig(process.env);
  const application = await composeApplication(process.env);
  const { instanceId } = application.instance;

  try {
    const report = await application.assertStartup();
    const { domain, audit } = report.appliedMigrations;
    console.log(
      `provider-mesh foundation: startup assertions passed; environment=${report.environment} migrations=domain:${String(domain)},audit:${String(audit)}`,
    );
    // The audit store is verified; the running application's first act is to record it.
    const recorded = await application.audit.append(
      startupAssertionsEvent({
        instanceId,
        environment: report.environment,
        eventId: randomUUID(),
        correlationId: randomUUID(),
        occurredAt: new Date().toISOString(),
        appliedMigrations: report.appliedMigrations,
      }),
    );
    const checkpoint = await application.audit.exportCheckpoint(`instance:${instanceId}:startup`);
    console.log(
      `provider-mesh foundation: audit chain at sequence ${String(recorded.sequence)}; checkpoint exported for sequence ${String(checkpoint.sequence)}`,
    );
  } catch (error) {
    await application.stores.close();
    throw error;
  }

  const { app, routes } = createHttpServer({ readiness: application.readiness });
  await app.listen({ port, host: '0.0.0.0' });
  console.log(`provider-mesh foundation: listening; routes=${String(routes.length)}`);

  const schedule = setInterval(() => {
    application.audit.exportCheckpoint(`instance:${instanceId}:schedule`).then(
      (checkpoint) => {
        console.log(
          `provider-mesh foundation: audit checkpoint exported for sequence ${String(checkpoint.sequence)}`,
        );
      },
      (error: unknown) => {
        // Name the failure code only (§5.8); the next scheduled export tries again.
        const code = error instanceof AuditAppendError ? error.code : 'unknown';
        console.error(`provider-mesh foundation: audit checkpoint export failed: ${code}`);
      },
    );
  }, CHECKPOINT_INTERVAL_MS);
  schedule.unref();

  const shutdown = (): void => {
    clearInterval(schedule);
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
    error instanceof StartupAssertionError ||
    error instanceof AuditAppendError
      ? error.message
      : 'startup failed';
  console.error(`provider-mesh foundation: ${message}`);
  process.exit(1);
});
