# Provider Mesh — Environment Record

| Document control | Value |
|---|---|
| Governing specification | Foundation 001 (PM-BIS-001 v0.1), §6.1, §8, §17 |
| Governing ADR | ADR-001 (PM-ADR-001 v0.1), §6.1, §6.3 rules 7–8, §6.5, §11 |
| Maintained by | Implementation agent under Foundation 001; values supplied by the decision authority |
| Record status | Development environment provisioned September 19, 2026; production, staging: not established |

This file records facts about environments. It contains no secret values — only the names of secrets and where they are held. Any change to which database the application connects to, or to the expected instance identity, is a code-equivalent change (ADR-001 §6.3 rule 8; `SEC-DEV-03`).

## 1. Development environment

### 1.1 Database (relational store component)

| Field | Value |
|---|---|
| Provider and product | Neon, managed PostgreSQL |
| Account owner | Springboard Delaware organization on Neon (the organization that also holds the Portal's project); decision authority is the console owner |
| Plan tier | Scale (organization plan; see §1.3 for the ADR-001 rule 7 evidence) |
| Project name | `provider-mesh-development` |
| Project ID | `young-queen-65824293` |
| Region | `aws-us-east-1` (AWS US East 1, N. Virginia) — United States, per ADR-001 §7 |
| Default branch | `production` (Neon's default branch name; it is the development environment's only branch — the Mesh environment name is `development`, carried by the instance marker) |
| Branch ID | `br-calm-shape-avyvl0um` |
| Postgres major version | 18 (selected at project creation and confirmed from the project Settings page; pinned here; CI uses the same major) |
| Encryption at rest | Provider-managed (Neon encrypts storage at rest by default); verified TLS in transit on every connection (`sslmode=verify-full`, system trust store) |
| Endpoint host (pooled) | `ep-lively-mud-avlwhu96-pooler.c-11.us-east-1.aws.neon.tech` |
| Created | 2026-09-19 14:43:10 (console time) by Judson Malone |
| Provisioned by | Procedure A (Neon console) in `scripts/provision/README.md`: project and databases created in the console; roles, grants, and markers by `console/A_domain_db.sql` and `console/B_audit_db.sql`; passwords rotated by `console/C_rotate_passwords.sql` from `mesh_admin` on the same day |
| Provisioning run | September 19, 2026, by the decision authority, from a browser outside any agent context; console owner role `provider_mesh_owner` |

### 1.2 Databases and roles

| Database | Owner | Purpose | May connect |
|---|---|---|---|
| `provider_mesh` | `mesh_migrate` | Domain store (Foundation 001 §5.2) | `mesh_migrate`, `mesh_app` |
| `provider_mesh_audit` | `mesh_migrate` | Audit store (§5.5) | `mesh_migrate`, `mesh_audit_writer`, `mesh_audit_reader` — `mesh_app` denied at connect |
| `mesh_admin` | `provider_mesh_owner` | Empty; exists so the Neon SQL Editor (which connects as the selected database's owner) has a database whose owner can manage roles. Used only for password rotation (`console/C_rotate_passwords.sql`) | Console owner only; all four application roles denied |

| Role | Attributes verified | Notes |
|---|---|---|
| `mesh_migrate` | LOGIN, NOSUPERUSER, NOBYPASSRLS, NOCREATEDB, NOCREATEROLE, NOINHERIT | Owns both application databases and their `public` schema; runs migrations; never used by the running application |
| `mesh_app` | LOGIN, NOSUPERUSER, NOBYPASSRLS, NOCREATEDB, NOCREATEROLE | Application runtime (domain identity); no privilege on the audit database |
| `mesh_audit_writer` | LOGIN, NOSUPERUSER, NOBYPASSRLS, NOCREATEDB, NOCREATEROLE | Audit Service; INSERT on `audit_event` granted by migration; no UPDATE/DELETE |
| `mesh_audit_reader` | LOGIN, NOSUPERUSER, NOBYPASSRLS, NOCREATEDB, NOCREATEROLE | Audit verification and authorized review; SELECT only |
| `provider_mesh_owner` | Neon console owner (member of `neon_superuser`) | Holds ADMIN OPTION on the four roles because it created them; the console/privileged path (ADR-001 §8.1) |

Roles were created in SQL, not through the Neon console or API, so they are not members of `neon_superuser`. The verification queries in steps A, B, and C confirmed no role carries SUPERUSER, BYPASSRLS, CREATEDB, or CREATEROLE.

### 1.3 Instance marker

| Field | Value |
|---|---|
| `PROVIDER_MESH_INSTANCE_ID` | `543e37e2-0ffa-4576-8443-e37f1355e421` |
| `PROVIDER_MESH_ENVIRONMENT` | `development` |
| Present in | `provider_mesh.mesh_instance` (`database_role = domain`) and `provider_mesh_audit.mesh_instance` (`database_role = audit`); verified identical on September 19, 2026 |
| Writable by | Provisioning only; `mesh_app`, `mesh_audit_writer`, and `mesh_audit_reader` have SELECT only |

### 1.4 ADR-001 §6.3 rule 7 evidence — protected tier on the same project

Neon's HIPAA compliance is a self-serve feature of the Scale plan, enabled first at the organization level (with acceptance of Neon's Business Associate Agreement) and then per project, including for an existing project, without recreating it; enabling it forces a compute restart and cannot be reversed. Source: Neon documentation, "HIPAA Compliance" (neon.com/docs/security/hipaa), consulted September 19, 2026. The development project is on the Scale plan. Therefore the move to the contractually protected tier required before the protected-continuity gate is a same-project configuration change, not a data migration. HIPAA is **not** enabled on this project; it is a Stage 2 step for the decision authority.

### 1.5 Backups and restore

| Field | Value |
|---|---|
| Backup mechanism | Neon provider-managed continuous backup with point-in-time restore (branch-based) |
| Retention window | 7 days (the project's history window, raised from 1 day on 2026-09-19; Settings → Postgres → History window) |
| First restore-test plan | Before the protected-continuity gate: create a restore branch from a chosen point in time into a restricted target (a Neon branch not reachable by the application roles), verify `mesh_instance` and the migration ledger, reconcile any post-backup revocations, corrections, deletions, and credential changes (`SEC-RET-04`), record the result, then delete the restore branch. Not yet executed. |

### 1.6 Compute component (Replit workspace)

| Field | Value |
|---|---|
| Platform | Replit workspace `provider-mesh`, Replit Pro 100 plan, billed annually |
| Role of the workspace | Development environment only (Foundation 001 §1.6). No deployment exists; no Preview is exposed as a service |
| Automatically provisioned database | None. Because nothing has been published, Replit has not provisioned a database; `DATABASE_URL`, `PGHOST`, `PGDATABASE`, `PGUSER`, and `PGPASSWORD` are absent from the workspace (verified from the Secrets panel, September 19, 2026). This is the available evidence for ADR-001 §6.3 rule 8's verified-unused control until a publication occurs, at which point the release record carries the verification |
| Secrets visibility | Replit shows that secrets are accessible to anyone with access to the App. The workspace has one collaborator (the decision authority). This is one reason the compute component requires its own full-profile assessment before protected data (ADR-001 §6.5) |
| Pre-existing secret removed | `SESSION_SECRET`, created automatically by Replit at workspace creation and unused by the repository, was deleted on September 19, 2026 so that the secret list matches the specification exactly |

### 1.7 Secrets held (names only)

All held in Replit Secrets for the `provider-mesh` workspace. Values entered by the decision authority on September 19, 2026 from the step C result; never recorded anywhere else.

| Name | Role in URL | Database | Used by |
|---|---|---|---|
| `PROVIDER_MESH_INSTANCE_ID` | — | — | Startup assertion (§5.3 rule 3) |
| `PROVIDER_MESH_ENVIRONMENT` | — | — | Startup assertion (§5.3 rule 3) |
| `PROVIDER_MESH_DATABASE_URL` | `mesh_app` | `provider_mesh` | Application runtime — the only database variable the application reads (§5.3 rule 1) |
| `PROVIDER_MESH_AUDIT_URL` | `mesh_audit_writer` | `provider_mesh_audit` | Audit Service (§5.5) |
| `PROVIDER_MESH_MIGRATE_URL` | `mesh_migrate` | `provider_mesh` | `db:migrate`, `db:status`, `db:verify` only |
| `PROVIDER_MESH_AUDIT_MIGRATE_URL` | `mesh_migrate` | `provider_mesh_audit` | Audit-store migrations only |
| `PROVIDER_MESH_AUDIT_READER_URL` | `mesh_audit_reader` | `provider_mesh_audit` | `audit:verify` |

All five URLs carry `?sslmode=verify-full&sslrootcert=system` and the pooled endpoint host. Rotation: `console/C_rotate_passwords.sql` from `mesh_admin`; update all seven values afterwards.

### 1.8 Migration ledger

| Field | Value |
|---|---|
| Mechanism | `db/ledger` (Foundation 001 C4, §5.4): `db:migrate`, `db:status`, `db:rehearse`, `db:verify`, run as `mesh_migrate` through `PROVIDER_MESH_MIGRATE_URL` and `PROVIDER_MESH_AUDIT_MIGRATE_URL` from the Replit workspace; only `db:migrate` writes `migration_ledger` |
| Development ledger state | **Not yet migrated.** The C4 branch was implemented and verified against a local and a CI database only; no agent session holds the development secrets. Before the application is started against this project, the decision authority (or a Replit session holding the secrets) runs `npm run db:rehearse && npm run db:migrate && npm run db:status && npm run db:verify` in the workspace and records the date and the `db:status` output here. Until then, startup and `/readyz` report `migration_ledger_mismatch` against this project, by design (§5.3 rule 4) |
| First migration set | `db/migrations/domain/0001_migration_ledger.sql` and `db/migrations/audit/0001_migration_ledger.sql`: each verifies the four roles, the connect grants, and the single `mesh_instance` row for its database role, then creates `migration_ledger` with an immutability trigger and SELECT-only grants for the application identities |

### 1.9 Neon features present and unused

The project overview lists AI Gateway (shown "Enabled" by default), Data API, BetterAuth, Object storage, and Functions. None is configured or used. Foundation 001 excludes model processing (`SEC-AI-01`) and any exposure path other than the application; these remain unused until a bounded specification authorizes one. IP restrictions: none set. VPC: not configured.

## 2. CI environment

| Field | Value |
|---|---|
| Class | Development-class (ADR-001 §6.1 rule 3) |
| Database | Ephemeral PostgreSQL 18 container in GitHub Actions (`scripts/ci/start-postgres-tls.sh`); no persistent data; no secrets |
| Transport | TLS, served with a certificate issued by a CA generated for that run; the application trusts it through `NODE_EXTRA_CA_CERTS`, which extends the runtime trust store and never disables verification, so CI exercises the same `sslmode=verify-full` path as development (Foundation 001 §5.3 rule 2, invariant 6) |
| Provisioning | `scripts/provision/provision.sh --target container --environment ci` on every run through `scripts/ci/provision-and-export.sh`, creating both databases, the four roles with grants, and a marker with `environment = ci` |
| Migrations | On every run, after provisioning and before `test:db`: `db:rehearse` (rollback), `db:migrate`, `db:status` (must report zero pending and zero mismatches), `db:verify` (§10 step 4; A04–A06), as `mesh_migrate` through the per-run `PROVIDER_MESH_MIGRATE_URL` and `PROVIDER_MESH_AUDIT_MIGRATE_URL` |
| Instance ID and role passwords | Generated per run by the provisioning script, exported to the job environment under the same seven `PROVIDER_MESH_*` names the application reads, masked in the job log, and discarded with the runner; never recorded |

## 3. Development-tool profile (`SEC-D08`, Foundation 001 §8, §17 decision 3)

Recorded before the first implementation commit, as §8 requires.

| Tool | Subscription held | Vendor data-use and retention terms as of September 19, 2026 | Recorded state |
|---|---|---|---|
| Claude Code (Anthropic) | Claude Max, individual | Anthropic consumer terms. Chats and coding sessions, including Claude Code, are used to improve Anthropic models only when the account's "Help improve our AI models" setting is on (Anthropic Privacy Center, "Is my data used for model training?", updated March 16, 2026). | Setting confirmed **off** by the decision authority on September 19, 2026. Any later change is recorded here before the next implementation commit. |
| Replit Agent (Replit) | Replit Pro 100, billed annually ($1,080/year) | Replit's privacy policy (updated August 3, 2026) does not state whether code or Agent prompts are used to train models and does not name the AI providers that process Agent prompts. | Recorded as a gap. Permitted material is unaffected: public repository content and synthetic material only. |

Neither condition widens the permitted material in Foundation 001 §8.

## 4. Environments not established

| Environment or component | Status | Required before |
|---|---|---|
| Staging | Not established | Protected-continuity gate (Foundation 001 §17 decision 4) |
| Production Neon project | Not established; deferred (§17 decision 1); provisioned by the decision authority with `scripts/provision/` when needed | First production deployment |
| Production deployment | Not established; configuration prepared in `DEPLOYMENT_PREPARED.md` only | Class D decision and release record (Governance §7.4) |
| Real key service | Not established; development secret store behind the port | Protected-continuity gate (ADR-001 §9.3) |
| Immutable object store and independent audit-checkpoint identity | Not established | Protected-continuity gate (ADR-001 §5.3; `SEC-AUD-04`) |
| Monitoring vendor | Not established | Protected-continuity gate (ADR-001 §6.5) |
| Executed restore test | Not executed; plan in §1.5 | Protected-continuity gate (`SEC-FAIL-02`) |
| Full-profile assessment of the compute component | Not performed | Protected-continuity gate (ADR-001 §6.5) |
| HIPAA enablement on the Neon project | Not enabled | Protected-continuity gate (ADR-001 §6.3 rule 7) |

## 5. Change log

| Date | Change | By |
|---|---|---|
| 2026-09-19 | Development environment provisioned (project, three databases, four roles, markers); secrets entered; `SESSION_SECRET` removed; tool profile recorded | Judson Malone (console and Replit); record drafted by the implementation agent |
| 2026-09-19 | Pending fields completed from the Neon console: §1.1 branch ID, §1.1 Postgres major version confirmed, §1.5 retention window | Values supplied by Judson Malone; recorded by the implementation agent |
| 2026-09-19 | History window raised from 1 day to 7 days in the Neon console (Settings → Postgres → History window); §1.5 retention window updated | Judson Malone (console); recorded by the implementation agent |
| 2026-09-19 | §2 CI environment: TLS container with a per-run CA and per-run role credentials, recorded with Foundation 001 C3 | Implementation agent |
| 2026-09-20 | §1.8 migration ledger added with Foundation 001 C4: mechanism, first migration set, and the development database's not-yet-migrated state with the human step that closes it; §2 CI migration steps | Implementation agent |
