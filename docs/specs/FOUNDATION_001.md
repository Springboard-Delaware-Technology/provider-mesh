# Foundation 001 — Repository, Runtime, Environment, and Data Boundaries

| Document control | Value |
|---|---|
| Document ID | PM-BIS-001 |
| Version | 0.1 |
| Status | Approved — Controlling bounded implementation specification; operational effect requires canonical placement, commit, and synchronization |
| Document type | Bounded implementation specification (Governance §5.2, §7.3, §8) |
| Package name | Foundation 001 (Architecture §16 item 11) |
| Work class | Class C — bounded implementation (Governance §7.3) |
| Owner | Springboard Delaware |
| Human decision authority | Judson Malone, Executive Director |
| Prepared in role | Architecture and governance partner (Governance §4.2) |
| Canonical path required for operational effect | `docs/specs/FOUNDATION_001.md` |
| Approved by | Judson Malone, Executive Director, Springboard Delaware |
| Approval date | September 19, 2026 |
| Approved source candidate | `FOUNDATION_001_v0.1_APPROVAL_CANDIDATE.md` — 0.1-WIP, draft revision 5 |
| Source candidate SHA-256 | `39a863a758d9fd5fd079f42173dd551351d0ea27b783f340de9ccf207aa03a99` |
| Approval record | `docs/reviews/2026-09-19/FOUNDATION_001_v0.1_APPROVAL_RECORD.md` |
| Draft-review evidence | `docs/reviews/2026-09-19/FOUNDATION_001_v0.1_DRAFT_REVIEW_RECORD_20260919.md` |
| Controlling baselines | SB-SDG-001 v0.2; PM-PC-001 v1.1; PM-SA-001 v0.2; PM-DM-001 v0.4; PM-SEC-001 v0.1; PM-ROC-001 v0.1; PM-ADR-001 v0.1 (commit `0d28c2b`) |

> Approved artifact. Judson Malone approved the exact source candidate on September 19, 2026. This specification becomes operationally controlling after this distinct approved artifact is placed byte-for-byte at `docs/specs/FOUNDATION_001.md`, committed, and synchronized. On that placement it authorizes the Class C work it describes, in the development environment only, under its change boundary (§1.7), invariants (§1.4), excluded scope (§1.5), and frozen acceptance evidence (§12). It does not authorize deployment, public exposure, creation of a production environment, or processing of real personal information.

## 1. Mission brief

### 1.1 Purpose

Provider Mesh has five approved specifications and one approved ADR but no code. Foundation 001 creates the repository skeleton on which every later bounded package builds: the runtime, the module boundaries of the modular monolith, the infrastructure ports, the migration and release discipline, the audit path, the compartment-isolation mechanism, the environment separation, and the automated checks that produce acceptance evidence. It builds no product feature. Its value is that every later package inherits controls that already work rather than promising to add them.

### 1.2 Desired end state

When Foundation 001 is accepted, all of the following are true:

1. The repository contains a TypeScript application on Node.js that builds, lints, typechecks, and passes its tests in continuous integration on every push and pull request.
2. The application is organized as a modular monolith with the module boundaries of Architecture §6 present as directories, and a boundary check that fails when domain code imports an adapter directly or one module imports another's internals.
3. Every infrastructure dependency (relational database, object storage, key service, secret store, job mechanism, search, audit sink, outbound HTTP) is reached only through a port with a development adapter behind it (ADR-001 §6.3 rule 1).
4. A Springboard-owned Neon Postgres project exists for development, in a U.S. region, provisioned by the scripted procedure in §6.5 with the instance-identity marker written; the application connects to it through exactly one Springboard-named variable, verifies the marker and the migration ledger at startup, and refuses to start otherwise (ADR-001 §6.3 rules 7–8).
5. Schema and reference-data changes flow only through reviewed SQL migrations recorded in a hash-verified ledger, rehearsed in a rollback transaction, and applied by one mechanism (Governance §12.4).
6. Audit events are written through the Audit Service with a credential the domain code does not hold, into a store the domain role cannot read or alter, with a hash chain and an integrity-checkpoint export through the object-storage port (ADR-001 §5.3, §8.2; `SEC-AUD-04`).
7. One protected-class table exists with compartment references, row-level security forced on, a server-set session context, and automated tests proving cross-compartment isolation and deny-by-default (ADR-001 §5.2–§5.4).
8. Domain events and commands have a defined envelope, validated against the Domain Model §21 event names, persisted transactionally with the change that produced them (Architecture §17; Domain Model §17.4).
9. Logs are structured, carry no request bodies, connection strings, secrets, or personal text, and are tested for it (ADR-001 §11 rule 2).
10. Synthetic fixtures exist, are generated rather than derived from any real case, and cannot be loaded into a non-development database (`SEC-DEV-01`; ADR-001 §6.1 rule 6).
11. The development-tool profile in §8 is in force for Claude Code and Replit Agent, and the Git route in §9 is configured with `main` protected.
12. Nothing is deployed beyond the development environment; the production deployment configuration is prepared as a document but not exercised (§6.3, §6.4).

### 1.3 Essential capabilities

The package delivers, in this order:

| # | Capability | Section |
|---|---|---|
| C1 | Repository layout, toolchain, and boundary check | §4 |
| C2 | Infrastructure ports and development adapters | §4.4 |
| C3 | Neon development project, connection discipline, startup assertions | §5 |
| C4 | Migration mechanism and ledger | §5.4 |
| C5 | Audit Service, audit store, hash chain, checkpoint export | §5.5 |
| C6 | First compartmented table, session context, row-level security, isolation tests | §5.6 |
| C7 | Event and command envelope, outbox, job runner stub | §5.7 |
| C8 | Structured logging with content exclusion | §5.8 |
| C9 | Synthetic fixtures and environment guard | §5.9 |
| C10 | Health and readiness endpoints | §5.10 |
| C11 | Continuous integration | §10 |
| C12 | Environment record, release-record template, and prepared production deployment configuration | §6 |

### 1.4 Non-negotiable invariants

Throughout and after the package:

1. Only public and synthetic material is used. Real personal information, production credentials, or a lightly renamed real case appearing anywhere is a hard stop (`SEC-DEV-01`; Governance §11.2).
2. The domain identity holds no privilege on the audit store; the audit-writer identity cannot update or delete (ADR-001 §8.2).
3. Row-level security is forced on every protected-class table, the compartment context is set only by server code from a validated actor context, and no request parameter reaches it (`SEC-ORG-02`; ADR-001 §5.2).
4. The application reads its database connection from `PROVIDER_MESH_DATABASE_URL` and nothing else; `DATABASE_URL`, `PGHOST`, and related platform-injected variables are never read (ADR-001 §6.3 rule 8).
5. Startup performs no database writes (ADR-001 §6.3 rule 8).
6. Every client connection to a store verifies the server certificate; no code path disables verification (ADR-001 §9.1 rule 3).
7. Applied migrations are immutable; the ledger is written only by the migration mechanism (Governance §12.4; `replit.md` §9).
8. No secret enters the repository, a prompt, a fixture, a log, or a test (Governance §12.6; `SEC-PLAT-03`).
9. Protected documents (`docs/**` other than the new `docs/infrastructure/**` files this package creates, `replit.md`, `CLAUDE.md`, `LICENSE`) are not modified by this package (`replit.md` §10).
10. Nothing is published, deployed, or exposed (Governance §11.3).

### 1.5 Excluded scope

Foundation 001 does not authorize, and the implementation agent must stop rather than start:

- any user-facing feature, including natural-language need expression, discovery, provider registry, HSDS projection, referrals, identity, documents, collaboration, or analytics;
- the Model Gateway, any model-provider integration, or any call to a model from application code (`SEC-AI-01`);
- the MCP Gateway or any MCP server or client;
- the Integration Manifold's source adapters or any outbound call to an external source;
- ingestion of any provider data, public or otherwise;
- the application authorization engine (`SEC-D02`, `SEC-D03`); the foundation ships a stub actor context for tests only;
- a real key service, immutable object storage, or a production monitoring vendor — ports only, with development adapters (ADR-001 §6.5);
- a staging environment (ADR-001 §14 decision 4);
- deployment to any environment beyond development, a public Preview, or a published URL (§6.4);
- creation of a production Neon project, which is deferred to the first production deployment and executed only by the decision authority (§5.1, §6.5, §17 decision 1);
- amendment of `replit.md` or `CLAUDE.md` — the follow-on items in §16 are drafted separately under their own approval.

### 1.6 Authorized environment

Development only: the Replit workspace, the Springboard-owned Neon development project (§5.1), and GitHub Actions runners with an ephemeral CI database (§10). No production credential, no production data, no public exposure.

### 1.7 Change boundary

The package may create and modify:

| Path class | Permitted |
|---|---|
| Root toolchain files | `package.json`, lockfile, `tsconfig*.json`, lint and format configuration, `.gitignore`, `.editorconfig`, `.env.example`, `.nvmrc` or equivalent |
| `.replit` | For the development workspace only: replace the current `modules = ["python-base-3.13"]` with the Node.js module for the pinned LTS line, set the Nix channel if required by that module, and set the run command to the development server and the workflow port it uses. No `[deployment]` section may be added or activated; the prepared production configuration lives in `docs/infrastructure/` (§6.3). The `[agent]` section is unchanged (`replit.md` §7) |
| `src/**` | Application code as laid out in §4 |
| `db/**` | Migrations, ledger tooling, and synthetic fixtures |
| `tests/**` | All tests and verifiers |
| `scripts/**` | Development, CI, and verification scripts |
| `.github/**` | Workflows, pull-request template, `CODEOWNERS` |
| `docs/infrastructure/**` | `ENVIRONMENTS.md`, `RELEASE_RECORD_TEMPLATE.md`, and `DEPLOYMENT_PREPARED.md` created by this package (§6.1–§6.3); no other `docs/` path |

Directly coupled exports, types, fixtures, tests, verifiers, and unapplied migration metadata are inside the boundary without being listed (Governance §6; `replit.md` §4). `attached_assets/**` is outside the boundary and never committed (`replit.md` §10).

### 1.8 Delegated decisions

Within the constraints stated in this specification, the implementation agent chooses without further approval:

- the HTTP framework (a maintained, TypeScript-first framework with first-class request validation), the SQL client, and whether an ORM or query builder sits above the SQL client, provided migrations remain plain SQL files under §5.4;
- the package manager, test runner, linter, formatter, and boundary-check tool;
- the exact Node.js minor and patch version within the pinned LTS line (§4.1) and the exact dependency versions, recorded in the lockfile;
- directory and file naming inside the layout of §4.2;
- the JSON schema library and the structured-logging library;
- the hash-chain serialization format, provided it is canonical, documented, and covered by a test;
- CI job structure, caching, and matrix, provided every check in §12 runs on every push and pull request.

A choice is not delegated if it adds a dependency with a native build step, a dependency with a known unpatched critical vulnerability, a telemetry or analytics library that transmits data off the runner, or any dependency that phones home by default (`SEC-PLAT-05`).

### 1.9 Escalation events

In addition to the unconditional hard stops in Governance §11 and `replit.md` §5, the implementation agent stops for a human decision when:

- Neon's current plan documentation does not confirm that the contractually protected tier is a plan change on an existing project (ADR-001 §6.3 rule 7); the agent records what it found and stops before writing the environment record;
- the Replit workspace cannot scope `DATABASE_URL` and related injected variables away from the application process, and the one-variable rule can be satisfied only in code (report; do not stop the package, but record it in §6.1);
- the certificate chain presented by Neon cannot be verified with the system trust store and a custom CA bundle would be needed (record the bundle source; do not disable verification);
- a required Node.js or Postgres major version is unavailable on the platform (Governance §15 exception path);
- a dependency needed for a delegated choice fails the constraints in §1.8 and no alternative exists;
- any test in §12 can pass only by weakening it;
- the repository's visibility changes such that secret scanning or push protection is no longer available (A19).

### 1.10 Frozen acceptance evidence

Section 12 is the frozen acceptance evidence for this package (Governance §13.1). Review may identify a genuinely omitted material requirement through an explicit amendment; it may not add nonmaterial proof obligations after implementation begins.

## 2. Roles and division of work

| Role | Held by | Scope in this package |
|---|---|---|
| Decision authority | Judson Malone | Approves this specification; merges to `main`; makes the §17 decisions; authorizes any push by Replit Agent |
| Implementation agent | Claude Code | Implements C1–C12 on feature branches under §9; opens pull requests; produces the handoff in §14 |
| Workspace operator | Replit Agent | Workspace configuration, Replit Secrets entry (values supplied by the decision authority, never by an agent), canonical document storage, and Class B maintenance inside the Replit workspace under `replit.md`; does not modify files inside an open Foundation 001 feature branch |
| Reviewer | A separate AI context or human (Governance §4.4) | Draft review of this specification; acceptance review of the pull request against §12 |

One package, one implementation agent. If the decision authority reassigns implementation to Replit Agent for a bounded repair, the reassignment names the branch and the repair, and Claude Code does not touch that branch until the repair is merged.

## 3. Technical baseline decisions

| Decision | Selection | Basis |
|---|---|---|
| Runtime | Node.js, current Active LTS line at package start (expected 24.x), pinned exactly in `.nvmrc` and `package.json` `engines` | §17 decision recorded September 19, 2026: team fluency, first-class Replit support, mature Postgres and HTTP ecosystems, single-language codebase; selected on the merits, not imported from the Portal (`replit.md` §1) |
| Language | TypeScript with `strict: true`, `noUncheckedIndexedAccess: true`, ES modules | Type-level enforcement of contracts (Architecture §13.4); Governance §4.5 treats the type system as a control |
| Relational database | PostgreSQL on Neon, Springboard-owned project, newest major version Neon offers as generally available at package start, pinned in the environment record; CI uses the same major | ADR-001 §6.3 rule 7, §14 decision 2a; §17 decision recorded September 19, 2026 |
| Audit store | Separate PostgreSQL database in the same Neon project, separate roles (§5.5) | ADR-001 §5.3 permits sharing a managed cluster with logical separation; independence from the administrator comes from the checkpoint export, which is a Stage 2 item |
| Object storage, key service, secret store, search, queue | Ports with development adapters only; no product selected | ADR-001 §6.5 and §9.3 rule 6 |
| Job mechanism | PostgreSQL-backed outbox and job tables in the domain database | ADR-001 §6.5 ("initially within the database project if so decided") |
| Migration format | Plain SQL files, forward-only, one ledger | Governance §12.4 |
| Continuous integration | GitHub Actions with an ephemeral PostgreSQL service container | §17 decision; `SEC-DEV-02` acceptance evidence |
| Event and command conventions | Minimal envelope defined in §5.7 | Architecture §17; §17 decision |

## 4. Repository layout and toolchain (C1, C2)

### 4.1 Toolchain

- Node.js pinned to one LTS line; the exact version in `.nvmrc` and `engines`. A version drift on the platform is handled under Governance §15, not by silently changing the pin.
- One package manager, chosen under §1.8, with its lockfile committed and installed with a frozen-lockfile flag in CI.
- Scripts exposed as `build`, `lint`, `typecheck`, `test`, `test:db`, `db:migrate`, `db:status`, `db:rehearse`, `db:verify`, `fixtures:load`, `boundary:check`, `audit:verify`.
- No script may read `DATABASE_URL`.

### 4.2 Layout

```
src/
  app/                      composition root: wiring, startup assertions, HTTP server
  modules/
    access-gateway/         Architecture §6.1  (health/readiness only in this package)
    assistance/             §6.2   (empty; README states boundary)
    model-gateway/          §6.3   (empty)
    discovery/              §6.4   (empty)
    registry/               §6.5   (empty)
    evidence/               §6.6   (empty)
    integration-manifold/   §6.7   (empty)
    mcp-gateway/            §6.8   (empty)
    person-continuity/      §6.9   (empty)
    authority/              §6.10  (stub actor context for tests; no engine)
    referral/               §6.11  (empty)
    documents/              §6.12  (empty)
    collaboration/          §6.13  (empty)
    outcomes/               §6.14  (empty)
    platform-operations/    §6.15  (instance identity, migration status)
    analytics/              §6.16  (empty; README states the separate-environment rule)
    audit/                  §6.17  (Audit Service)
  platform/
    ports/                  interfaces only
    adapters/
      dev/                  development adapters behind every port
      postgres/             SQL client, connection discipline, session context
    events/                 envelope schemas, DM §21 name registry, outbox
    logging/                structured logger with allowlist
db/
  migrations/               NNNN_<name>.sql, forward-only
  ledger/                   migration mechanism
  fixtures/                 synthetic data generator and guard
tests/
  unit/  contract/  db/  isolation/  audit/  logging/  boundary/
scripts/
.github/workflows/
scripts/provision/          environment provisioning procedure (§6.5)
docs/infrastructure/        ENVIRONMENTS.md, RELEASE_RECORD_TEMPLATE.md, DEPLOYMENT_PREPARED.md
```

An empty module contains a `README.md` naming its Architecture section, its consistency boundaries from Domain Model §19, and the statement that it holds no code under Foundation 001. Empty modules are still subject to the boundary check.

### 4.3 Boundary check

A dependency-rule tool (chosen under §1.8) enforces:

1. `src/modules/*` may import `src/platform/ports` and `src/platform/events`; it may not import `src/platform/adapters/**`.
2. A module may import another module only through that module's `index.ts` public surface; deep imports fail.
3. `src/platform/**` may not import `src/modules/**`.
4. Only `src/app/**` may import `src/platform/adapters/**`.
5. No file outside `src/platform/adapters/postgres` and `db/**` may import the SQL client.

The check runs in CI and fails the build on violation.

### 4.4 Ports and development adapters

| Port | Interface responsibility | Development adapter in this package |
|---|---|---|
| `RelationalStore` | Transaction scope, session-context binding, query execution | Postgres client to the Neon development project with verified TLS |
| `ObjectStore` | Put, get, head, delete by opaque key with metadata; no public URLs | Local filesystem under a git-ignored directory; content-addressed |
| `KeyService` | Wrap and unwrap data keys; key identifier; rotation hook | Development secret-store-backed wrapping key, clearly labeled non-production; no export of key material through the interface |
| `SecretStore` | Read named secrets at startup only | Environment variables from Replit Secrets or CI secrets |
| `JobQueue` | Enqueue with compartment context and idempotency key; claim; complete; fail-with-unknown | Postgres-backed table in the domain database |
| `SearchIndex` | Index and query by compartment | No-op adapter that records calls for tests |
| `AuditSink` | Append event; read chain head; export checkpoint | Postgres audit database (§5.5) |
| `OutboundHttp` | Request with destination allowlist and certificate verification | Adapter that refuses every destination (allowlist empty in this package) |

Every port's development adapter is selected in `src/app` from configuration, never from inside a module. A port interface may not expose a vendor type.

## 5. Data foundations (C3–C10)

### 5.1 Neon development project

The decision authority creates, in Springboard's Neon account, a project named for Provider Mesh development (not a branch of the Portal's project), in a U.S. region, on the least-cost tier that provides encryption at rest and TLS. The project contains two databases, `provider_mesh` and `provider_mesh_audit`, and the roles in §5.2. Its connection strings are entered into Replit Secrets by the decision authority; no agent sees or handles a value.

No production project is created by this package (§17 decision 1). When one is created, its provisioning follows the scripted procedure in §6.5, executed by the decision authority from outside the development workspace with a credential that never enters the workspace, CI, or any agent (ADR-001 §6.1 rule 1, §8.3).

### 5.2 Database roles

| Role | Database | Privileges | Used by |
|---|---|---|---|
| `mesh_migrate` | both | Owns all objects; DDL; writes the migration ledger | `db:migrate` and CI only; never the running application |
| `mesh_app` | `provider_mesh` | DML on domain tables under forced row-level security; `NOBYPASSRLS`; no privilege on the ledger beyond `SELECT`; no privilege on `provider_mesh_audit` | Application runtime (domain identity) |
| `mesh_audit_writer` | `provider_mesh_audit` | `INSERT` on `audit_event`; `SELECT` on the chain head view; no `UPDATE` or `DELETE` on any table | Audit Service |
| `mesh_audit_reader` | `provider_mesh_audit` | `SELECT` only | `audit:verify` and authorized review |

Roles are created by the §6.5 provisioning procedure and verified by the first migration. The job runner (§5.7) runs inside the application process as `mesh_app` and holds no broader privilege; ADR-001 §8.2's separate job-runner identity is introduced when the Integration Manifold or notification adapters first need outbound scope. The application process holds the `mesh_app` and `mesh_audit_writer` credentials as two distinct secrets; the Audit Service module is the only code that receives the second one, injected by `src/app`.

### 5.3 Connection discipline and startup assertions

1. The application reads `PROVIDER_MESH_DATABASE_URL` and `PROVIDER_MESH_AUDIT_URL`. If either is absent, startup fails with a message naming the variable. No fallback exists.
2. Both connections use `sslmode=verify-full` with the system trust store. A connection option that disables verification is rejected by the configuration builder and covered by a unit test.
3. Startup reads `mesh_instance` (one row: `instance_id`, `environment`, `created_at`) and compares it with `PROVIDER_MESH_INSTANCE_ID` and `PROVIDER_MESH_ENVIRONMENT`. Any mismatch or absence is fatal.
4. Startup reads the migration ledger and compares its head to the migration set compiled into the release. Any difference is fatal; the process must not serve requests against an unexpected schema.
5. Startup executes no `INSERT`, `UPDATE`, or `DELETE`. The assertions are read-only and covered by a test that asserts no write statement is issued during boot.
6. The instance marker is written once, by the provisioning procedure in §6.5, from values supplied at provisioning; it is never written by the application, and the migration mechanism verifies its presence rather than creating it.

### 5.4 Migration mechanism and ledger (C4)

- Migrations are files `db/migrations/NNNN_<name>.sql`, applied in filename order, each inside a transaction.
- The ledger table `migration_ledger` (in each database) records filename, SHA-256 of the file content, applied-at server time, applying role, and the catalog checksum after application. Only `db:migrate` writes it.
- `db:status` reports applied, pending, and any applied file whose current SHA-256 no longer matches the ledger; a mismatch is reported as a hard-stop condition (Governance §11.4) and fails CI.
- `db:rehearse` applies all pending migrations inside a transaction that always rolls back, on the CI database and on request in development (Governance §12.3).
- `db:verify` confirms, after application, the ledger hashes, catalog state (expected tables, roles, policies, and `FORCE ROW LEVEL SECURITY` flags), and row counts on reference tables (Governance §12.4).
- Reference data, when any exists, is inserted by migrations, not by startup code.
- The first migration set verifies the roles and `mesh_instance` created by §6.5, then creates `migration_ledger`, the audit schema (§5.5), the event outbox and job tables (§5.7), and the first compartmented table (§5.6).

### 5.5 Audit Service and audit store (C5)

The Audit Service (`src/modules/audit`) is the only writer to `provider_mesh_audit`.

`audit_event` columns implement the `SEC-AUD-02` field groups: event identity (`event_id`, `event_type`, `schema_version`, `correlation_id`, `causation_id`); actor (`actor_id`, `actor_kind`, `delegating_actor_id`, `represented_org_id`, `represented_unit_id`, `represented_capacity`); time (`occurred_at`, `recorded_at`, `external_time`, `time_uncertainty`); action and target (`operation`, `target_type`, `target_id`, `target_version`, `subject_scope`, `destination_ref`); authority (`authorization_decision_id`, `authority_refs`, `policy_version`, `purpose`); execution (`result` in `attempted | completed | failed | unknown`, `reason_code`, `before_version`, `after_version`, `external_receipt`); accountability (`review_ref`, `origin_channel`, `retention_class`); integrity (`sequence`, `prev_hash`, `hash`). Every nullable field distinguishes unknown from not applicable by a paired reason column or a documented sentinel; the choice is delegated and tested.

Rules:

1. The Audit Service supplies content columns only. A `BEFORE INSERT` trigger whose function is owned by `mesh_migrate` and declared `SECURITY DEFINER` takes a transaction-scoped advisory lock on the chain, reads the current head, assigns `sequence` as head + 1, sets `prev_hash` to the head's `hash`, and computes `hash` as SHA-256 over a canonical serialization (documented in the migration, RFC 8785-style key ordering and encoding) of every column except `hash`. Any client-supplied value for `sequence`, `prev_hash`, or `hash` is overwritten by the trigger, so the writer cannot forge chain position. Concurrent appends serialize on the lock; `audit:verify` recomputes each row's hash and checks that `prev_hash` equals the previous row's `hash` and that `sequence` has no gaps or duplicates.
2. No role except `mesh_migrate` holds `UPDATE`, `DELETE`, or `TRUNCATE` on `audit_event`; `mesh_migrate` is never used by a running process. A test executed as `mesh_app` and as `mesh_audit_writer` proves each is denied.
3. `audit:verify` recomputes the chain from sequence 1 and reports the first divergence, gap, or duplicate.
4. A checkpoint (head sequence, head hash, verified-at, verifier identity) is exported through the `ObjectStore` port on a schedule and on demand. In this package the development adapter receives it; the immutable store under an identity that application operators cannot administer, and retention protection, are not built here and are recorded in `ENVIRONMENTS.md` as required before the protected-continuity gate (`SEC-AUD-04`; ADR-001 §5.3).
5. Audit writes in this package are limited to the events the foundation itself produces: startup assertions passed or failed, migration applied, fixture load attempted, checkpoint exported, and the test events used to prove the mechanism. The audit-sink unavailability path (`SEC-AUD-03`, `SEC-D10`) is not built here; the foundation fails closed if the audit database is unreachable at startup.
6. Free-text fields are bounded in length and covered by the logging exclusion test in §5.8.

### 5.6 First compartmented table and row-level security (C6)

The first protected-class table is `assistance_episode`, the root of the Assistance Episode consistency boundary (Domain Model §19). This package establishes only its identity, compartment, lifecycle, and accountability fields; Expressions, Needs, and the rest of Domain Model §7 are added by the bounded specification that introduces them, through forward migrations.

Columns: `episode_id` (opaque UUID, Domain Model §4.1); compartment references per ADR-001 §5.1 — `subject_person_id` (nullable: an episode may exist without permanent person identity, Domain Model §7.7 invariant 1), `purpose_code`, `responsible_org_id` (nullable), `responsible_capacity` (nullable), `contributing_org_id` (nullable; set only where different from the responsible Organization), `collaboration_id` (nullable), `charter_version_id` (nullable; required whenever `collaboration_id` is set, enforced by a check constraint), `springboard_capacity` (nullable); `lifecycle_state` as an unconstrained text column whose vocabulary is reserved to the Assistance specification (Domain Model §7.5 enumerates eight states; this package writes only `open` in fixtures and adds no check constraint, so the later specification fixes the vocabulary by forward migration without rewriting this one); `opened_at`, `paused_at`, `closed_at`, `recorded_at` (Domain Model §4.2); `sensitivity_class` defaulting to `protected` (Security §5.1); `origin_channel`; `created_by_actor_id`; `correction_state`; `row_version`.

Row-level security:

1. `ALTER TABLE ... ENABLE ROW LEVEL SECURITY` and `FORCE ROW LEVEL SECURITY` are set in the migration that creates the table; `db:verify` checks both flags on every table in a maintained list of protected tables.
2. The session context is a set of transaction-local settings (`mesh.actor_id`, `mesh.person_ids`, `mesh.org_ids`, `mesh.collab_ids`, `mesh.purpose`, `mesh.capacity`) written by `RelationalStore` at transaction start from a validated `ActorContext` object. No HTTP handler, query parameter, header, or body value can reach these settings except through that object, which in this package is produced only by the test stub in `src/modules/authority`.
3. Policies grant visibility when the row's `responsible_org_id` is in `mesh.org_ids`, or its `collaboration_id` is in `mesh.collab_ids`, or its `subject_person_id` is in `mesh.person_ids`; a transaction with no context sees no rows and can insert none. The policy shape is provisional and will be superseded by forward migrations when the Identity and Access Specification (`SEC-D02`, `SEC-D03`) defines the authority model; the mechanism (server-set context, forced policies, `NOBYPASSRLS` on `mesh_app`) is durable.
4. Isolation tests run as `mesh_app` against two synthetic compartments and prove: A cannot read B; A cannot update or delete B; A cannot insert a row claiming B's compartment; no context yields no rows; a context value injected through a request is ignored; the table owner path is not available to `mesh_app`.

### 5.7 Event and command envelope, outbox, and job runner (C7)

Envelope (`src/platform/events`), validated by JSON schema at construction:

| Field | Meaning |
|---|---|
| `event_id` | Opaque UUID |
| `event_name` | One of the Domain Model §21 canonical names; the registry file lists all of them and the schema rejects any other value |
| `occurred_at`, `recorded_at` | Relevant time and Mesh recording time, distinct (Domain Model §4.2) |
| `source` | `system`, `actor`, or `external`, with the actor or external source reference |
| `uncertainty` | A Domain Model §4.4 term, or `unknown` |
| `external_reference` | Namespaced identifier, nullable |
| `correlation_id`, `idempotency_key` | As required by Architecture §11.2 |
| `causation_id` | The event or command that caused this one; this package's convention, consistent with `SEC-AUD-02`'s correlation/causation identifiers |
| `compartment` | The ADR-001 §5.1 references applicable to the event |
| `payload_version`, `payload` | Versioned body; payload schemas are defined by the specification that introduces the event |

Commands carry `command_id`, `command_name`, the `ActorContext` reference, `authority_ref`, `idempotency_key`, target boundary and identifier, `payload_version`, and `payload`.

Rules: a domain event is written to `domain_event_outbox` in the same transaction as the aggregate change it describes (Domain Model §19 consistency boundaries); the job runner claims outbox rows with `FOR UPDATE SKIP LOCKED`, invokes in-process subscribers, and marks delivered or failed-unknown; a job or event without compartment context is rejected. An Audit Event is never derived from a domain event or vice versa (Domain Model §17.4). In this package the only subscriber is a test recorder.

### 5.8 Structured logging (C8)

- JSON lines; fields limited to an allowlist (`time`, `level`, `msg`, `correlation_id`, `module`, `event`, `duration_ms`, `status`, `error_code`, and named technical identifiers); any other field is dropped, and the drop is counted.
- Request and response bodies, query strings, headers, connection strings, tokens, and the contents of any column classified protected or restricted are never logged. A redaction filter additionally scrubs values matching connection-string and bearer-token patterns and is unit-tested.
- Errors are logged with code and stack, never with the failing input (Governance §12.6).
- A test drives the application through startup, a failed startup assertion, a migration, an audit write, and an isolation test, captures all log output, and asserts that no fixture value, secret value, or connection string appears.

### 5.9 Synthetic fixtures and environment guard (C9)

- `db/fixtures/generate.ts` produces deterministic synthetic data from a seed: organizations named `Synthetic Organization NN`, people named `Synthetic Person NNNN`, fictional Delaware-style addresses that do not resolve to real premises, and episodes across at least two organizations, two collaborations, and anonymous cases. No field is copied, transformed, or "anonymized" from any real record (`SEC-DEV-01`).
- `fixtures:load` refuses to run unless the connected database's `mesh_instance.environment` is `development` or `ci` (CI is a development-class environment under ADR-001 §6.1 rule 3; its marker identifies it as such) and `--confirm-development` is passed; it refuses any connection whose host is not the recorded development or CI host (ADR-001 §6.1 rule 6; Governance §12.1).
- Fixtures are loaded inside a transaction in `test:db` and rolled back; a test confirms the database is empty of fixture rows afterward (Governance §12.3).

### 5.10 Health and readiness (C10)

- `GET /healthz` returns process liveness only.
- `GET /readyz` returns ready only when the database connection is open, the instance marker matched, the migration ledger matched, and the audit sink is reachable; otherwise it returns not-ready with a reason code and no detail.
- Neither endpoint returns version strings, hostnames, or configuration.
- The HTTP server binds to the port the platform supplies. The only routes that exist are `/healthz` and `/readyz`; a route-inventory test asserts that no other route is registered. The Replit development URL is treated as not private (`replit.md` §7); because the two routes carry no data, no configuration, and no version string, their reachability creates no exposure of information, and it is recorded as such in `ENVIRONMENTS.md`.

## 6. Environments and prepared deployment (C12)

### 6.1 Environment record

`docs/infrastructure/ENVIRONMENTS.md`, created by this package, records for the development environment, as a checklist with every field present: Neon account owner; project name; region; plan tier; Postgres major version; encryption-at-rest status; the databases and roles; the names (never values) of the secrets; the instance identifier; the CI database configuration and its development-class status; the evidence for ADR-001 §6.3 rule 7 (Neon plan documentation consulted, date, and whether the protected tier is a same-project change); the backup schedule, set for this package as the provider's continuous backup with the point-in-time-restore window of the chosen tier, stated in days; the first restore-test plan (procedure, restricted target environment, integrity and revocation-reconciliation checks per `SEC-RET-04`, and the gate before which it must be executed — the protected-continuity gate); the statement that no automatically provisioned database exists for this repository because nothing has been published, which is the available evidence for ADR-001 §6.3 rule 8's verified-unused control until a publication occurs, at which point the release record (§6.2) carries the verification; the development-tool subscription tiers and terms under §8; and the statement in §5.10 about the development URL. It also records, if applicable, that `DATABASE_URL` and related variables could not be scoped away from the process and are ignored by code under §5.3 rule 1.

### 6.2 Release-record template

`docs/infrastructure/RELEASE_RECORD_TEMPLATE.md` implements `SEC-GATE-02`: governing artifact versions and checksums, deployed commit, dependency versions from the lockfile, CI run identifiers, completed checks from §12, reviewer findings and dispositions, resolved blockers, permitted residual risks, the automatically provisioned database's verified-unused status (ADR-001 §6.3 rule 8), and the human exposure approval. No release record is completed by this package.

### 6.3 Prepared production deployment configuration

The package prepares, without exercising, the production deployment configuration as a document, `docs/infrastructure/DEPLOYMENT_PREPARED.md`: build and run commands, the list of required secret names, the startup assertion behavior, and the `[deployment]` stanza that would be added to `.replit` at that time. No `[deployment]` section is written to the live `.replit` (A26). Any deployment or Preview that exposes the application beyond the workspace is Class D controlled exposure (Governance §7.4) and requires its own explicit decision and release record; this specification does not grant it.

### 6.4 What is not created

No staging environment, no production project or deployment, no public URL, no monitoring vendor, no key service, no immutable object store, no independent audit-checkpoint identity, no executed restore test. Each is recorded in `ENVIRONMENTS.md` as "not established; required before <gate>" with the gate from ADR-001 §15.

### 6.5 Provisioning as code

`scripts/provision/` contains a versioned, idempotent procedure sufficient to recreate an environment's database from nothing (ADR-001 §4.3 rule 2, §13 item 13): create the Neon project in a named region and tier, create the two databases, create the four roles with their grants, write the instance marker from supplied `instance_id` and `environment` values, and print the secret names whose values the operator must then record. It is parameterized by environment and runs with a credential supplied at invocation and never stored. It is executed only by the decision authority, from outside any agent context, with an account credential that no agent ever holds (ADR-001 §8.1, §8.3); the run date and resulting identifiers are recorded in `ENVIRONMENTS.md`. Agents may author and test the script against the CI container; they never run it against a Neon account. Where Neon's API or CLI does not expose a step, the script prints the exact console action and pauses; the procedure is still the single source for recreation. A dry run against the CI container, exercising every step the container supports, is part of CI (A27).

## 7. Security controls in scope

### 7.1 Bounded threat assessment (`SEC-BOUND-02`)

| Element | In this package |
|---|---|
| Data flows | Synthetic fixtures → development and CI databases; audit events → audit database → checkpoint via the object-store port to a local development store; logs → workspace and CI console. No real personal information, no external source, no model, no notification, no outbound HTTP. |
| Actors | Decision authority (approves, merges, supplies secrets); Claude Code (implementation agent, feature branches); Replit Agent (workspace operator); GitHub Actions (CI, no secrets); Neon (database processor for synthetic data). |
| Trust boundaries | Replit workspace ↔ Neon (verified TLS, role-scoped credentials); GitHub ↔ CI runner (no secrets; ephemeral database); agents ↔ repository (scoped credentials; protected `main`); domain identity ↔ audit store (no privilege). |
| Misuse cases and the control that addresses each | Application connects to the platform's automatically provisioned database (one-variable rule, identity marker — §5.3); a secret enters a prompt, file, or log (secret scanning, redaction, `.env.example` names only — §5.8, §9); a fixture is derived from a real case (generation from seed; review in PR — §5.9); fixtures loaded into a non-development database (environment guard — §5.9); `mesh_app` bypasses row-level security (`NOBYPASSRLS`, forced RLS, `db:verify` — §5.6); domain code alters audit history (no privilege; trigger; chain verification — §5.5); an applied migration is edited (ledger hash check fails CI — §5.4); a dependency introduces malicious or phone-home code (constraints, audit, lockfile — §1.8, §10); an agent pushes to `main` (branch protection — §9); the CI database persists data (ephemeral container — §10). |
| Dependencies | Node.js LTS, PostgreSQL, Neon, GitHub Actions, the delegated libraries under §1.8. |
| Failure behavior | Startup fails closed on any assertion (§5.3); CI fails the job on any check (§10); partial migration is a hard stop (§13); audit database unreachable at startup is fatal (§5.5 rule 5). |

### 7.2 Controls exercised

`SEC-DEV-02` requires each implementation specification to name its applicable controls. The following are exercised by this package; each maps to acceptance evidence in §12.

| Control | How this package satisfies it | Evidence |
|---|---|---|
| `SEC-BOUND-01` | Not exercised: no authorization decision is made in this package (the engine is excluded, §1.5). The module boundary check (A03) is a structural control under Architecture §15.1, not a policy-evaluation control | — |
| `SEC-BOUND-02` | §7.1 | A01 |
| `SEC-DATA-01`–`03` | Data class of this package: public and synthetic only; no protected-class or restricted-class personal information is present (Security §5.1). `sensitivity_class` column on the first table; logging exclusion | A16, A17 |
| `SEC-ORG-02` | Forced row-level security, server-set context, isolation tests | A10–A12 |
| `SEC-PRIV-02` | No standing human access is introduced; agents hold development credentials only | A20 |
| `SEC-PLAT-02` | Verified TLS to both databases | A07 |
| `SEC-PLAT-03` | Secrets by name only; `.env.example` with placeholders; secret scanning | A19, A21 |
| `SEC-PLAT-04` | Lockfile; dependency review; no native-build or phone-home dependencies | A02, A22 |
| `SEC-AUD-02` | Audit event contract columns | A13 |
| `SEC-AUD-04` | Partially exercised: restricted append, hash chain, and verification are built (A13–A14); the checkpoint export is exercised only through the development adapter (A15). The **independent** integrity checkpoint under an identity application operators cannot administer, and retention protection, are not built here and are recorded in §6.4 as required before the protected-continuity gate. This package does not claim `SEC-AUD-04` satisfied | A13–A15 (partial) |
| `SEC-DEV-01` | Development-tool profile; synthetic fixtures; environment guard | A17, A20 |
| `SEC-DEV-03` | Migrations, policies, and configuration under version control and CI | A04–A06 |
| `SEC-DEV-04` | Escalation events in §1.9 | — |
| `SEC-FAIL-01` | Startup fails closed on any assertion failure | A08, A09 |
| `SEC-GATE-01` | Synthetic-foundation gate only; no exposure | A23 |

Controls not exercised (identity, authority policy, disclosure, documents, model processing, integrations, retention schedules, recovery objectives, monitoring) remain inactive and their capabilities disabled; their register entries (`SEC-D02`–`SEC-D07`, `SEC-D09`, `SEC-D11`–`SEC-D16`) are unchanged by this package. `SEC-D17` (verification baseline, finite test scope, severity thresholds, release evidence) is supplied for this package by §11 and §12; it remains open for later packages.

## 8. Development-tool profile (`SEC-D08`, `SEC-DEV-01`)

This profile approves external AI development tools for this repository. It does not approve any model for Mesh operational processing (`SEC-AI-01`).

| Tool | Approved role | Permitted material | Prohibited material | Credentials held | Safeguards |
|---|---|---|---|---|---|
| Claude Code (Anthropic) | Implementation agent (Governance §4.3) and architecture partner (§4.2) | Repository content; the approved specifications; public reference material; synthetic fixtures; CI output; development-environment diagnostics | Real personal information of any kind; production credentials; any non-public Springboard document not in the repository; Portal case records | Development database credentials (two roles) and a scoped GitHub credential under §9; nothing for production | Secrets supplied by environment, never pasted into prompts; `CLAUDE.md` effort and role protocol; commits attributed; every change reviewed in a pull request |
| Replit Agent (Replit) | Workspace operator (§2) | Same as above within the Replit workspace | Same | Workspace secrets as configured by the decision authority; Shell Git route under `replit.md` §8.2 | `replit.md` standing orders; no edits inside an open feature branch |

Contractual and retention conditions: before implementation begins, the decision authority records in `ENVIRONMENTS.md` the subscription tier held for each tool and the vendor's stated data-use and retention terms for that tier as of that date (§17 decision 3). Implementation does not start until that record exists; it is a precondition under §1.9, not only acceptance evidence. If a tier's terms permit training on submitted content, the tool may receive only repository content already public and synthetic material, which is already the whole of the permitted set; the record makes that explicit.

A Managed Agent, or any other tool, is added by amending this profile through a new approved revision, not by use.

## 9. Git route and branch protection

1. `main` is protected: pull requests required, at least one approval by the decision authority, required status checks from §10, no force pushes, no direct pushes by any agent (Governance §14.4; `replit.md` §8.4). The decision authority retains the repository-administrator bypass for the direct-to-`main` canonical document storage route established in `replit.md` §8.2–§8.4; that bypass is used only for approved document adoption and never for code.
2. Claude Code holds a GitHub credential scoped to this repository only, with contents and pull-request write permission and nothing broader — either a fine-grained token or a GitHub app installation limited to this repository, whichever the decision authority provisions — rotated or revoked on package completion or suspected exposure, and never written to any file. It pushes only to branches named `f001/<topic>` and opens pull requests to `main`.
3. Replit Agent uses the human-controlled Shell route in `replit.md` §8.2 for canonical document storage and Class B work; it does not push to `f001/*` branches.
4. Every pull request carries the §14 handoff in its description. The decision authority merges; merging is the human authorization for that synchronization.
5. Secret scanning and push protection are enabled on the repository (the repository is public, for which both are provided at no cost; a change of repository visibility that removes either is an escalation event under §1.9); `CODEOWNERS` assigns `docs/**`, `replit.md`, `CLAUDE.md`, and `LICENSE` to the decision authority so any change to a protected document requires that review.
6. The preflight in `replit.md` §8.1 is performed once at package start from a fresh fetch and recorded in the first pull request.

## 10. Continuous integration (C11)

A GitHub Actions workflow runs on every push and pull request:

1. Checkout; install the pinned Node.js; install dependencies with a frozen lockfile.
2. `lint`, `typecheck`, `boundary:check`, `build`.
3. Start a PostgreSQL service container at the pinned major version; run the §6.5 procedure's container-supported steps to create both databases, the four roles with their grants, and a CI instance marker with `environment = ci`.
4. `db:rehearse` (rollback), then `db:migrate`, then `db:status` (must report zero pending and zero hash mismatches), then `db:verify`.
5. `test` (unit and contract), `test:db` (isolation, audit privilege, chain verification, logging exclusion, startup assertions, fixture guard) — all as the roles they claim to be, never as the container superuser.
6. Dependency audit against the package manager's advisory database; a critical or high advisory without a documented exception fails the job (`SEC-PLAT-04`).
7. Verify no file in the diff matches secret patterns (in addition to GitHub push protection).

CI holds no secret. The service container is the only database it touches. Every job's log is retained as acceptance evidence for the pull request that produced it.

## 11. Verification layers

Per Governance §13.2:

| Layer | Proof in this package |
|---|---|
| Pure logic | Unit tests: envelope validation, event-name registry, hash canonicalization, redaction filter, connection-config builder |
| Contracts | Contract tests for every port interface against its development adapter |
| Database structure | `db:verify` catalog inspection: tables, roles, grants, policies, forced-RLS flags, ledger |
| Critical database behavior | Transactional integration tests: isolation, audit privilege, chain trigger, outbox atomicity, fixture guard |
| API behavior | Request tests for `/healthz` and `/readyz` in ready and each not-ready state |
| Runtime configuration | Build; startup with correct, missing, and mismatched configuration |
| Production readiness | Not applicable; no exposure in this package |

## 12. Frozen acceptance evidence

Acceptance is established when every item below is evidenced in the pull request and its CI run. Each is blocking.

| ID | Evidence | Proves |
|---|---|---|
| A01 | §7.1 is unchanged from the approved specification or amended by approval; `ENVIRONMENTS.md` contains every field enumerated in §6.1, each populated or explicitly marked not applicable with a reason | `SEC-BOUND-02`, §6.1 |
| A02 | Lockfile committed; `engines` and `.nvmrc` pinned; dependency list reviewed against §1.8 constraints in the PR description | §4.1, `SEC-PLAT-04` |
| A03 | `boundary:check` passes; a deliberately violating fixture file fails it (tested) | §4.3 |
| A04 | `db:rehearse` completes with rollback; database empty afterward | Governance §12.3 |
| A05 | `db:migrate` then `db:status` reports zero pending, zero mismatches; modifying an applied migration's bytes causes `db:status` to fail (tested in CI on a copy) | Governance §12.4 |
| A06 | `db:verify` passes: expected tables, roles, grants, policies, forced-RLS flags, ledger hashes, reference row counts | Governance §12.4 |
| A07 | Connection-config builder rejects any option disabling certificate verification; both live connections report `verify-full` | ADR-001 §9.1 rule 3 |
| A08 | Startup fails when `PROVIDER_MESH_DATABASE_URL` is absent even though `DATABASE_URL` is set; with both set to different hosts, the only connection attempted is to the `PROVIDER_MESH_DATABASE_URL` host (observed at the socket layer in the test); a repository-wide static check finds no reference to `DATABASE_URL`, `PGHOST`, `PGDATABASE`, `PGUSER`, or `PGPASSWORD` outside that check itself | ADR-001 §6.3 rule 8 |
| A09 | Startup fails on missing or mismatched instance marker and on ledger mismatch; passes when both match; issues no write statements during boot | ADR-001 §6.3 rule 8 |
| A10 | Isolation: compartment A cannot read, update, delete, or insert into compartment B as `mesh_app` | ADR-001 §5.4 |
| A11 | Isolation: no context yields no rows; request-supplied context values are ignored | `SEC-ORG-02` |
| A12 | `mesh_app` has `NOBYPASSRLS`; every protected table has both RLS flags forced | ADR-001 §5.2 |
| A13 | `audit_event` columns cover every `SEC-AUD-02` field group; `mesh_app` is denied all access to the audit database; `mesh_audit_writer` is denied `UPDATE`, `DELETE`, `TRUNCATE` | ADR-001 §8.2 |
| A14 | A client-supplied `sequence`, `prev_hash`, or `hash` is overwritten by the trigger, so a forged chain position never lands; `audit:verify` detects a row altered afterwards (altered as `mesh_migrate` in a test copy), a gap, and a duplicate | `SEC-AUD-04` |
| A15 | Checkpoint export through the `ObjectStore` port succeeds and is readable back | §5.5 rule 4 |
| A16 | Logging exclusion test passes across startup, failed startup, migration, audit write, and isolation run | §5.8 |
| A17 | Fixture loader refuses a non-development marker and refuses without `--confirm-development`; loads and rolls back cleanly in `test:db` | §5.9 |
| A18 | Outbox row and aggregate change commit or roll back together; envelope schema rejects an event name not in Domain Model §21 | §5.7 |
| A19 | `.env.example` contains names only; repository secret scanning and push protection enabled (settings evidence in PR) | `SEC-PLAT-03` |
| A20 | Development-tool profile recorded with tiers and terms in `ENVIRONMENTS.md` before the first implementation commit (commit timestamps evidence it); no production credential exists in the repository, in CI secrets, or among the Replit Secret names, and no production environment exists | §8 |
| A21 | `main` branch protection configured as §9 rule 1; `CODEOWNERS` present; Claude Code credential scope evidenced by the token's permission summary (not the token) | §9 |
| A22 | Dependency audit clean or every advisory documented with an exception approved by the decision authority | §10 step 6 |
| A23 | Nothing deployed: no Replit deployment exists for the repository and therefore no automatically provisioned database exists; `ENVIRONMENTS.md` states both | §6.4, ADR-001 §6.3 rule 8 |
| A24 | CI workflow present and green on the final commit of the pull request, including the §6.5 dry run | §10 |
| A25 | Final handoff (§14) complete; working tree clean; branch merged by the decision authority | Governance §13.5 |
| A26 | `.replit` contains no `[deployment]` section; its `modules`, Nix channel, and run command match §1.7; `[agent]` unchanged | §1.7, §6.3 |
| A27 | `scripts/provision/` exists, is parameterized by environment, was executed for development with its run recorded in `ENVIRONMENTS.md`, and its container-supported steps run in CI | §6.5, ADR-001 §13 item 13 |
| A28 | Port contract tests pass for every port in §4.4 against its development adapter | §4.4, §11 |

## 13. Failure cases, rollback, and recovery

- The package adds files only; rollback of any step is a Git revert on the feature branch. Nothing in `main` is modified except by merge.
- The development database can be dropped and recreated from migrations at any time in this package; its content is synthetic. No production project exists in this package.
- A partial migration in CI fails the job; the container is discarded. A partial migration in development is a hard stop (Governance §11.4): report, do not repair the ledger by hand.
- A secret appearing in any file, log, or output is a hard stop with credential rotation by the decision authority (Governance §14.5).
- Repair attempts follow the three-attempt rule per root cause (Governance §10).

## 14. Handoff

The pull request description, and the final report in the session, state per `replit.md` §11: outcome; material changed paths; this specification's version and checksum; each §12 item with its evidence link; remaining blockers; deferred nonblocking improvements; branch, commit, working-tree state, upstream, ahead/behind; database postconditions (development database at ledger head, fixtures rolled back); and an explicit statement that nothing was deployed or exposed.

## 15. Register effects

| Register entry | Effect of this package |
|---|---|
| `SEC-D01` | Already resolved by ADR-001; this package implements its Foundation 001 requirements (ADR-001 §13 items 1–13; see §18) |
| `SEC-D08` | Development-tool profile resolved for this repository's development work (§8). The operational model-provider profile remains unresolved |
| `SEC-D10` | Audit contract implemented at the schema level; durable delivery, buffering, and failure policy remain unresolved |
| All others | Unchanged |

## 16. Follow-on items (not part of this package)

1. Companion amendments to `replit.md` and `CLAUDE.md` recording the two-agent division of work in §2 and the Git route in §9, each through its own approved revision.
2. Approval of `CLAUDE.md` as an operating adapter (currently a draft).
3. The Stage 2 items recorded in `ENVIRONMENTS.md` as not established: real key service, immutable checkpoint store under an independent identity, staging environment, monitoring vendor, full-profile assessment of the compute component (ADR-001 §6.5).
4. The audit-sink unavailability path (`SEC-AUD-03`, `SEC-D10`).
5. The query-first discovery rule stated by the decision authority, to be recorded as an ADR before the Discovery Service package.
6. Replacement of the provisional row-level policy shape when the Identity and Access Specification is approved.

## 17. Decisions recorded by the decision authority

The following selections were made by Judson Malone, Executive Director, in the project conversation on September 19, 2026, from the options presented in draft revision 3. Together with the decisions recorded earlier the same day (runtime, database service, scope, registered tools, Git route, use of GitHub Actions, event conventions — incorporated in §3, §8, §9, §10, and §5.7), they resolve every open point of this specification. They took effect through the approval recorded in §19.

| # | Decision | Selection | Alternatives not adopted |
|---|---|---|---|
| 1 | Production Neon project timing | **Deferred to the first production deployment**, provisioned by the decision authority from outside any agent context with §6.5 (§5.1, §1.5) | Create now by the same human-executed route |
| 2 | Audit store placement | **Separate database in the same Neon project**, separate roles (§3, §5.2, §5.5) | Separate Neon project |
| 3 | Development-tool subscription tiers and terms (`SEC-D08`, `SEC-DEV-01`) | **Claude Code under Claude Max (individual)** — Anthropic's consumer terms; chats and coding sessions, including Claude Code, are used to improve Claude only when the account's "Help improve our AI models" setting is on (Anthropic privacy center, updated March 16, 2026). The decision authority set that setting to **off** on September 19, 2026 and confirmed it in the project conversation; `ENVIRONMENTS.md` records that state, and any later change to it is recorded there before the next implementation commit. **Replit Agent under Replit Pro 100, billed annually ($1,080/year)** — Replit's privacy policy (updated August 3, 2026) does not state whether code or Agent prompts train models and does not name the AI providers processing Agent prompts; the record states that gap. Neither condition widens the permitted material in §8, which is public repository content and synthetic material only | — (values supplied, not a choice) |
| 4 | `.replit` edits | **Authorized as bounded in §1.7**: Node.js module replacing `python-base-3.13`, Nix channel if required, run command and workflow port; no `[deployment]` section; `[agent]` unchanged (A26) | Forbid |
| 5 | CI database | **PostgreSQL service container at the pinned major** (§10) | Neon branch per CI run |

## 18. Traceability to ADR-001 §13

| ADR-001 §13 item | Where satisfied |
|---|---|
| 1 Runtime, framework, database, object storage, job mechanism through ports | §3, §4.4 |
| 2 Development environment, synthetic data, development-tool profile | §5.1, §5.9, §8 |
| 3 Reduced profile or statement of no deployment | §6.4 (no deployment) |
| 4 Springboard-owned database, single variable, identity marker, assertions, auto-provisioned database verified unused | §5.1, §5.3, A08, A09; verified-unused evidenced by A23 and §6.1 (no publication, so none exists), carried by the release record thereafter |
| 5 Per-environment identities; runtime cannot alter audit | §5.2 (including the job runner as `mesh_app`), §5.5, A13 |
| 6 Compartment references (all of ADR-001 §5.1) and row-level policy on first protected table with isolation tests | §5.6, A10–A12 |
| 7 Key-service port with development store behind it | §4.4 |
| 8 Logging excludes content | §5.8, A16 |
| 9 Backup schedule and first restore-test plan | §6.1 sets the schedule (continuous backup, stated point-in-time window) and records the restore-test plan; execution is recorded in §6.4 as required before the protected-continuity gate |
| 10 Event and command contract conventions | §5.7 |
| 11 Certificate verification on every client | §5.3, A07 |
| 12 One migration path; environment guard | §5.4, §5.9 |
| 13 Provisioning recorded as code or scripted procedure | §6.5, A27 |

## 19. Approval record

| Field | Value |
|---|---|
| Approval status | Approved — Controlling bounded implementation specification |
| Approved version | 0.1 |
| Approved by | Judson Malone, Executive Director, Springboard Delaware, acting as delegated product authority and, pending assignment of the security-owner function under Security §3.1, as the security authority for this decision |
| Approval date | September 19, 2026 |
| Approved source candidate | `FOUNDATION_001_v0.1_APPROVAL_CANDIDATE.md` — 0.1-WIP, draft revision 5 |
| Source candidate SHA-256 | `39a863a758d9fd5fd079f42173dd551351d0ea27b783f340de9ccf207aa03a99` |
| Canonical repository path | `docs/specs/FOUNDATION_001.md` |
| Canonical repository reference | Pending canonical placement and synchronization |

### 19.1 Draft review record

An independent draft review under the Security §24 draft-review gate was performed on September 19, 2026 by a separate AI context that had not participated in drafting (Governance §4.4). Against draft revision 1 it reported seven blocking defects (an invariant contradicting the change boundary; a `.replit` boundary that could not produce the baseline; incomplete compartment references; an episode lifecycle constraint reserved to a later specification; two controls overclaimed; a production-marker path requiring a production credential in the workspace; provisioning not delivered as code), nineteen ordinary repairs, and three future improvements. All were resolved in revision 2. Against revision 2 it reported six issues introduced by the repairs, two blocking (an account-level credential placed with an agent; a role-provisioning contradiction between CI and the migration mechanism), resolved in revision 3, which it verified with the verdict "Ready for approval candidate". Revisions 4 and 5 record the §17 selections and the values they require, and change no other text. Both review reports are retained as review evidence outside the canonical path.

### 19.2 Approval and remaining steps

The exact approval statement is retained in the approval record at `docs/reviews/2026-09-19/FOUNDATION_001_v0.1_APPROVAL_RECORD.md`. The source candidate checksum above identifies the reviewed candidate; it is not the checksum of this approved file, which is recorded in the approval record.

This approved specification remains non-operational until byte-identical canonical placement, commit, and synchronization, followed by the Class C preflight in `replit.md` §4 and §8 and the precondition in §8 (development-tool terms recorded in `ENVIRONMENTS.md`). It authorizes the work in §1 within the development environment and nothing beyond it. Approval of this specification authorizes the Class C work it describes, in the development environment only, and nothing beyond it.
