# Database tests (Foundation 001 §11)

Run by `npm run test:db` against a provisioned development-class database, as the roles the
application uses (`mesh_app`, `mesh_audit_writer`), never as a superuser (§10 step 5). The
tests read the same `PROVIDER_MESH_*` names as the application and fail, rather than skip,
when one is absent.

In CI, `scripts/ci/start-postgres-tls.sh` and `scripts/ci/provision-and-export.sh` supply
them from a per-run container. Locally, point the same names at a provisioned database that
serves TLS with a certificate the runtime trusts.

Present: connection discipline and TLS (A07), startup assertions (A09), session context
binding (§5.6 rule 2 groundwork). Arriving: migration ledger behaviour and `db:verify` (C4).
