# Audit tests (Foundation 001 §5.5, A13–A15)

Run by `npm run test:db` against a provisioned development-class database at the head of the
audit migration set, as the roles each test claims to be: `mesh_audit_writer`
(`PROVIDER_MESH_AUDIT_URL`), `mesh_audit_reader` (`PROVIDER_MESH_AUDIT_READER_URL`), `mesh_app`
(`PROVIDER_MESH_DATABASE_URL`, to prove it cannot connect), and `mesh_migrate`
(`PROVIDER_MESH_AUDIT_MIGRATE_URL`) for the tamper cases. Absent configuration fails the tests
rather than skipping them.

| File                 | Proves                                                                                                                                                                                                                                                                                                                                                                                                |
| -------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `privileges.test.ts` | A13: every `SEC-AUD-02` field group is a column; `mesh_app` cannot connect; the writer may insert and read the head and is denied `SELECT`, `UPDATE`, `DELETE`, `TRUNCATE`; the reader is denied every write; the owner is refused updates by the append-only trigger; only the chain function is `SECURITY DEFINER`                                                                                  |
| `chain.test.ts`      | A14: a client-supplied `sequence`, `prev_hash`, `hash`, or `recorded_at` is overwritten; concurrent appends serialize on the advisory lock; every row links to its predecessor and hashes as the TypeScript canonicalization recomputes (and as the store's own function does); the verifier detects a row altered afterwards, a gap, a duplicate, a broken link, and a truncation below a checkpoint |
| `service.test.ts`    | A15 and the `AuditSink` contract (A28): the service appends content only, rejects an invalid event by field name before any statement, exports a checkpoint that is readable back from the object store, and records the export with the object's key and digest; the columns and absence pairs the service writes, read back as the owner                                                            |
| `cli.test.ts`        | `audit:verify` as `mesh_audit_reader`: verifies the live chain printing positions and hashes only; hard stops as the wrong role or for a foreign instance                                                                                                                                                                                                                                             |

Nothing persists. Every write runs inside a transaction that rolls back; the Audit Service is
driven through a savepoint-backed store inside that transaction, and the tamper cases alter rows
as `mesh_migrate` — after disabling the append-only trigger, as a tampering administrator
would — inside the same rolled-back transaction, which is the "test copy" of A14. Checkpoints go
to a temporary directory. The CI workflow additionally runs `audit:checkpoint` and `audit:verify`
against the per-run database after `test:db`.
