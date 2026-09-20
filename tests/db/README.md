# Database tests (Foundation 001 §11)

Run by `npm run test:db` against a provisioned development-class database that is at the head
of the migration sets, as the roles each test claims to be — `mesh_app`, `mesh_audit_writer`,
and, for the migration mechanism, `mesh_migrate` — never as a superuser (§10 step 5). The
tests read the same `PROVIDER_MESH_*` names as the application and the migration commands
(`PROVIDER_MESH_INSTANCE_ID`, `PROVIDER_MESH_ENVIRONMENT`, `PROVIDER_MESH_DATABASE_URL`,
`PROVIDER_MESH_AUDIT_URL`, `PROVIDER_MESH_MIGRATE_URL`, `PROVIDER_MESH_AUDIT_MIGRATE_URL`) and
fail, rather than skip, when one is absent.

In CI, `scripts/ci/start-postgres-tls.sh` and `scripts/ci/provision-and-export.sh` supply
them from a per-run container, and the workflow runs `db:rehearse`, `db:migrate`, `db:status`,
and `db:verify` before `test:db`. Locally, point the same names at a provisioned database that
serves TLS with a certificate the runtime trusts, and run `npm run db:migrate` first.

Present: connection discipline and TLS (A07), startup assertions including both ledgers (A09),
session context binding (§5.6 rule 2 groundwork), and the migration mechanism (`migrations.test.ts`):
rehearsal rollback of a synthetic extra migration (A04), the hard stop on an applied file whose
bytes changed, exercised on a copy of the migration set (A05), verification passing and detecting
an object created outside a migration inside a rolled-back transaction (A06), ledger immutability,
and the SELECT-only privileges of the application identities on the ledger (§5.2). Nothing a test
does persists: every write runs inside a transaction that rolls back, and the copies of the
migration set live in a temporary directory.
