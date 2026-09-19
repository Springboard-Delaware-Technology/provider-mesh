# ADR-001 — Deployment and Tenancy Model

| Document control | Value |
|---|---|
| Document ID | PM-ADR-001 |
| Version | 0.1 |
| Status | Approved — Controlling ADR; operational effect requires canonical placement, commit, and synchronization |
| Document type | Architecture Decision Record (Governance §5.2) |
| Resolves | Architecture §17 "Deployment and tenancy model"; Security `SEC-D01`; the profile identification required by `SEC-PLAT-01` |
| Required before | Foundation 001 approval and any affected implementation |
| Owner | Springboard Delaware |
| Human decision authority | Judson Malone, Executive Director |
| Prepared in role | Architecture and governance partner (Governance §4.2) |
| Canonical path required for operational effect | `docs/adr/ADR-001-deployment-and-tenancy.md` |
| Approved by | Judson Malone, Executive Director, Springboard Delaware |
| Approval date | September 19, 2026 |
| Approved source candidate | `ADR-001_DEPLOYMENT_AND_TENANCY_v0.1_APPROVAL_CANDIDATE.md` — 0.1-WIP, draft revision 6 |
| Source candidate SHA-256 | `716208f16fcc5df3bd3fe24fa7871aa1178deb8f4720ade905697f635d3e1626` |
| Approval record | `docs/reviews/2026-09-19/ADR-001_v0.1_APPROVAL_RECORD.md` |
| Draft-review evidence | `docs/reviews/2026-09-19/ADR-001_v0.1_DRAFT_REVIEW_RECORD_20260919.md` |
| Controlling baselines | SB-SDG-001 v0.2; PM-PC-001 v1.1; PM-SA-001 v0.2; PM-DM-001 v0.4; PM-SEC-001 v0.1; PM-ROC-001 v0.1 |

> Approved artifact. Judson Malone approved the exact source candidate on September 19, 2026. This ADR becomes operationally controlling after this distinct approved artifact is placed byte-for-byte at `docs/adr/ADR-001-deployment-and-tenancy.md`, committed, and synchronized. The decisions this ADR defers (§3.2) and the requirements it places on Foundation 001 (§13) remain binding. Approval of this ADR does not authorize Foundation 001, implementation, vendor engagement, deployment, public exposure, or processing of real personal information.

## 1. Decision summary

Provider Mesh will be deployed as **one shared platform operated by a single steward (Springboard Delaware), serving many participating organizations, with isolation enforced as compartments inside shared managed infrastructure** rather than as separate physical systems per organization. The deployment unit will be **instance-portable**: reproducible from configuration so that a second instance, or a transfer of stewardship, is an infrastructure exercise rather than a re-architecture, without adopting a multi-operator design now.

Environments are separated into **development (synthetic only), staging, and production**, each with its own credentials, stores, and keys. The platform path is **stage-gated and assessed by component**: the platform is treated as separately assessable components (compute, relational database, object storage, key service, logging and monitoring, backups), each of which may move independently. The synthetic foundation and public-discovery stage may run, as the production environment, on the managed deployment offering of the current development platform provided the reduced profile in §6.4 is met; every component that will hold or process protected personal information must meet the full profile before the protected-continuity gate. The **relational database is provisioned in a Springboard-owned account from Foundation 001**, not the development platform's automatically provisioned database, so that the later step to a contractually protected tier is a plan change rather than a data migration.

Protected information is **stored and processed in the United States only**. Privileged access follows **named individuals, no standing production access, separate runtime identities, and a disabled break-glass path**. Encryption is **provider-managed at rest for every store plus application-level envelope encryption for restricted-class fields and all secure documents, with keys held in a key service separate from application data**.

## 2. Context

### 2.1 Why this decision is required now

Architecture §17 lists the deployment and tenancy model as the first subordinate decision and requires it before Foundation 001 approval. Security `SEC-D01` requires the same decision, together with data location, storage isolation, privileged paths, and the encryption/key profile, before Foundation 001 approval and affected implementation, with the safe default "no assumed production platform." `SEC-PLAT-01` requires the deployment ADR to identify production and nonproduction boundaries, tenancy, data locations, network entry and exit, runtime and storage identities, dependency ownership, patching, encryption, monitoring, backups, recovery, and vendor-access paths. `replit.md` §3 confirms that no runtime, database, hosting, or production platform choice has been made and that Replit's role as the development workspace does not select the production platform.

### 2.2 What the controlling documents already fix

This ADR does not decide the following; it inherits them and must remain consistent with them.

| Fixed by controlling document | Source | Effect on this decision |
|---|---|---|
| Provider Mesh is "a shared service environment" | Constitution §2.3 | One platform serving many participants, not a product each organization installs |
| Springboard Delaware is the legal platform operator and steward unless changed by constitutional amendment and an accountable transfer plan | Constitution Art. XII.7 | Exactly one steward; a second operator is a constitutional change, not a deployment option |
| Stewardship carries continuity obligations for transfer, suspension, or closure | Constitution Art. XII.10; `SEC-FAIL-04` | The deployment must be transferable without extinguishing custody, confidentiality, or audit duties |
| Springboard's platform, service-delivery, backbone, and analytic capacities are separately authorized contexts; access in one must not leak into another | Constitution Art. XII.3–5; `SEC-PRIV-01` | Springboard's own service programs are participating organizations inside the platform, not privileged operators of it |
| Each Collaboration is an independent information and authority compartment; an organization boundary is not the only isolation boundary | Domain Model §14, §22.22; `SEC-ORG-02` | Isolation must be multi-dimensional (person-purpose, organization, Collaboration), which rules out organization-only physical partitioning as sufficient |
| Tenancy design must demonstrate isolation across databases, object storage, queues, search, analytics, logs, and backups; shared infrastructure only with approved, tested isolation; no caller-supplied tenant filter trusted | `SEC-ORG-02` | Every store needs an isolation mechanism and evidence, not only the primary database |
| The six logical storage roles may initially share managed infrastructure where isolation, access control, recovery, and performance are satisfied; product selection requires an ADR | Architecture §7.4 | Shared managed infrastructure is permitted; specific products remain a Foundation 001 or ADR decision |
| Initial application is a modular monolith with ports-and-adapters integration | Architecture §15.1 | One deployable application; infrastructure dependencies sit behind ports, which is what makes platform portability achievable |
| Operational and secondary-use environments remain distinct, with a separated access and processing boundary that may be logical or physical | Architecture §15.14; `SEC-SECONDARY-02` | A separated analytic boundary is required; this ADR chooses physical separation (§5.3), which is stricter than the logical separation also permitted |
| Strong common confidentiality baseline across all SDOH domains | Architecture §10 | The profile is not weakened for "non-health" data |
| Development, previews, tests, and AI coding assistance use public, synthetic, or approved de-identified information only; no live data or production credentials in a development workspace | `SEC-DEV-01` | Development and production are separate environments with separate credentials by requirement, not convention |
| Audit records are tamper-evident and independent of the mutable business record | Architecture §6.17; Domain Model §17.4; Security §17 | The audit store needs independent integrity and a write path the application cannot alter |

### 2.3 Product direction assumed by this ADR

The decision authority has stated that Provider Mesh is designed as an eventual standalone SaaS product for 211 centers and health systems. This ADR assumes that such organizations would join as **participating organizations of the Springboard-operated platform** under the current Constitution. If a future customer requires its own separately operated instance, that is the constitutional path in Art. XII.7 and the instance-portability requirement in §4.3 is what makes it technically feasible. The decision authority confirmed this assumption on September 19, 2026 (§14, decision 1).

### 2.4 Lessons from the predecessor deployment

The decision authority supplied a diagnostic report on how Springboard's existing Portal application, hosted on the same development platform, bypasses that platform's automatically provisioned database in favor of an externally managed one. Per `replit.md` §1, nothing from that project — runtime, dependencies, vendors, approvals — is imported by this ADR. Its operational experience is legitimate context, and the following practices and findings shaped §6.3 rules 7–8 and the Foundation 001 requirements in §13.

| Predecessor practice or finding | Disposition in this ADR |
|---|---|
| A project-specific connection variable takes precedence over the platform's automatic `DATABASE_URL`, and production refuses to start against an unexpected database | Carried forward as the basis of §6.3 rule 8 |
| A separate guard prevents synthetic development seeding from targeting the production database and requires explicit confirmation | Carried forward as §6.1 rule 6 and §8.3; Foundation 001 item 12 |
| Connection strings are never logged; only a derived label is | Carried forward: §11 rule 2 |
| The production guard is a hard-coded hostname substring, which a database restore or endpoint change would break | Corrected: rule 8 requires an identity marker stored in the database and compared with per-environment configuration; a hostname check does not satisfy it |
| The variable resolution falls through two further candidates before the guard catches it | Corrected: rule 8 permits one variable in production; a missing variable is fatal |
| Database TLS is used with certificate verification disabled | Corrected: §9.1 rule 3 requires verified TLS to every store, including the database; Foundation 001 item 11 |
| Schema was bootstrapped from a manual dump; migration tooling is inconsistent; a publish can succeed against a stale schema | Corrected: §6.1 rule 2 and Governance §12.4; rule 8 adds a startup schema-state assertion; Foundation 001 item 12 |
| Reference data is seeded at runtime startup and seed failures are non-fatal | Corrected: rule 8 prohibits startup writes; seeding moves to the release path |
| The database project was created manually and cannot be reproduced from the repository | Corrected: §4.3 rule 2 (instance-portability); Foundation 001 item 13 |
| No staging environment | Corrected: §6.1 requires staging before the protected-continuity gate |

## 3. Scope

### 3.1 This ADR decides

1. The operating and tenancy model (§4).
2. The isolation architecture across all stores (§5).
3. Environment topology and the platform path by stage (§6).
4. Data location (§7).
5. Privileged access paths and runtime identities (§8).
6. The encryption and key profile (§9).
7. Network entry and exit boundaries (§10).
8. Requirements for backups, logs, telemetry, and transferability (§11).
9. Dependency ownership and patching responsibility (§11).

### 3.2 This ADR does not decide

| Deferred item | Decided in |
|---|---|
| Application runtime, language, and framework | Foundation 001 |
| Specific database, object storage, search, queue, and audit products | Foundation 001 or a product ADR (Architecture §7.4, §17) |
| Specific hosting vendor and the processor assessment for it | Foundation 001, applying the profile in §6.4 and `SEC-PLAT-05` |
| Authentication, account recovery, session rules | `SEC-D02`, Identity and Access Specification |
| Authority policy model and role catalog | `SEC-D03` |
| Legal applicability profiles, data-sharing terms, BAAs | `SEC-D04` |
| Retention durations and disposition | `SEC-D05` |
| Model providers and the development-tool profile | `SEC-D08`, AI and Model Use Policy, Foundation 001 |
| Audit contract details and delivery | `SEC-D10` |
| Entitlement-review cadence and break-glass approval | `SEC-D11` |
| Recovery objectives, backup testing, vendor exit runbooks | `SEC-D13`, production runbooks |

## 4. Decision 1 — Operating and tenancy model

### 4.1 Options considered

| Option | Description | Assessment |
|---|---|---|
| **T1 — Single steward, shared platform, compartmented (recommended)** | One production platform operated by Springboard. Participating organizations, Collaborations, and Springboard's own service programs are compartments within it. Isolation is enforced in software and in store-level controls on shared managed infrastructure. | Matches Constitution §2.3 and Art. XII.7 directly. Supports the cross-organization flows the product exists for (Referrals, Collaborations, multi-helper continuity) without cross-system joins. Lowest operating cost and staffing burden. Makes isolation testing the most important test surface in the product. |
| **T2 — Per-organization physical isolation** | A separate database (or full stack) for each participating organization. | Conflicts with the domain: a person may work with several providers, a Referral crosses two organizations, and a Collaboration is its own compartment spanning several. Person continuity would be duplicated or centralized in a way the Constitution discourages. Cost scales with organizations rather than use. Does not remove the need for Collaboration- and person-purpose-level isolation, so it adds cost without replacing the software control. Rejected as the default; may be revisited for a specific institutional participant whose legal terms require dedicated infrastructure, through a later ADR. |
| **T3 — Multi-operator / multi-instance** | Each 211 center, health system, or state runs its own Provider Mesh. | Requires a change of steward for each instance, which Art. XII.7 reserves to constitutional amendment with a transfer plan. Not available as a deployment decision. The portability requirement in §4.3 preserves the option without designing for it now. |

### 4.2 Decision

Adopt **T1**. Provider Mesh is one shared platform with one steward. Every participating organization, including any Springboard service program acting as a provider, is a participant compartment with no operating privileges.

### 4.3 Rules

1. There is exactly one production instance of Provider Mesh under this ADR. A second instance requires a new ADR and, if operated by another organization, the constitutional path in Art. XII.7.
2. The production deployment must be reproducible from versioned configuration (infrastructure definition, environment configuration, and migration ledger) so that a rebuild, transfer, or additional instance does not depend on undocumented manual setup. This is the **instance-portability requirement**.
3. Authoritative records must be stored in open, documented formats (a standard relational database and standard object storage). No authoritative record may exist only in a vendor-proprietary store that cannot be exported in a documented format.
4. Springboard's platform-steward capacity is an operating context, not a participant compartment. Platform operators have no compartment access by virtue of operating the platform (`SEC-PRIV-01`, `SEC-PRIV-02`).
5. Springboard's service programs and any backbone role it holds are ordinary participant compartments with the same isolation as any other organization (Constitution Art. XII.3–5).

## 5. Decision 2 — Isolation architecture

### 5.1 Compartment dimensions

Every protected record (Security §5.1 protected personal and restricted personal classes) carries the compartment references that authorization must evaluate. Public-class records (published provider information) carry no compartment and are not isolated.

| Dimension | Domain source | Reference carried by the record |
|---|---|---|
| Person and purpose | Domain Model §6–7, Constitution Art. XIII | Subject Mesh Person(s) or Assistance Episode, and the purpose under which the record exists |
| Organization | Domain Model §5.1, §20 | The Organization responsible for the record, in the Organization Capacity in which it acts, and the contributing Organization where different |
| Collaboration | Domain Model §14 | Collaboration and effective Charter Version, when the record exists inside a Collaboration compartment |
| Springboard capacity | Constitution Art. XII; `SEC-PRIV-01` | The represented Springboard capacity (platform, service program, backbone, analytics) when Springboard is the custodian |

A document may have several subjects (Domain Model §13, §22.33); its record carries all of them.

### 5.2 Enforcement layers

Isolation is enforced in two independent layers so that a defect in one does not by itself produce cross-compartment disclosure:

1. **Application authorization.** Every read, write, search, export, and job evaluates the instance-specific Authorization Decision (Security §7) against the compartment references on the record. This is the layer that understands purpose, authority, and Charter.
2. **Store-level enforcement.** The primary database enforces compartment scope with row-level policies bound to a server-set session context. The application sets that context from the validated actor and capacity; it is never taken from a request parameter (`SEC-ORG-02`). Object storage, queues, and search apply the equivalent: compartment metadata on every object, message, and index document, checked at retrieval by the server.

Neither layer may be disabled in production to resolve a defect. A failure in either layer restricts the affected operation (`SEC-FAIL-01`).

### 5.3 Isolation by store

| Store (Architecture §7.4) | Sharing permitted | Compartment carried | Enforcement | Evidence required |
|---|---|---|---|---|
| Transactional relational store | Shared instance across all compartments | The applicable dimensions in §5.1 on every protected row | Application authorization plus row-level policies on server-set context; application runtime identity has no policy-bypass privilege | Automated cross-compartment isolation tests in every release; policy definitions versioned and reviewed (`SEC-DEV-03`) |
| Protected object storage (documents) | Shared bucket or container permitted | Compartment and all Document Subjects as object metadata; per-object data key (§9) | Access only through the application by reference; no public or long-lived direct links; server validates compartment before issuing any short-lived access | Retrieval tests; link-expiry tests; no public-read configuration |
| Search or retrieval index | Shared index permitted | Compartment on every index document | Index built only from authorization-aware projections (Security §13.1); query results filtered server-side by the same policy before return; revoked or de-linked records removed on revocation or the index path disabled (`SEC-FAIL-01`) | Tests that a revoked record does not appear; rebuild-from-source test |
| Audit store | Logically separate from the operational database; may share a managed cluster | Compartment of the target record, actor capacity | Append-only write identity distinct from the application runtime's domain identity; no update or delete privilege for any application role; periodic hash-chained export to immutable object storage held under an identity that application operators cannot administer, so the integrity checkpoint is independent of the audit store's administrator (`SEC-AUD-04`); the durable evidence path for audit-sink unavailability is defined under `SEC-D10` | Integrity verification of the chain; demonstration that the runtime identity cannot alter audit rows |
| Job and event mechanism | Shared | Compartment context in every message | Consumer re-validates authority at execution; a queued authorization that has expired or been revoked is not honored (Security §4 "stale queued authorization") | Tests for revoked-authority jobs |
| Analytic environment | **Not shared.** Physically separate database and storage with separate credentials | Only the compartment lineage the approved Analytic Dataset requires | Data enters only through approved dataset creation (Domain Model §18); no network path from the analytic environment to operational stores except the approved loader | Demonstration that operational credentials cannot reach analytic stores and vice versa |
| Logs and telemetry | Shared | Correlation identifiers only | No protected content, secrets, or free-text personal input in logs (Architecture §12; `SEC-PLAT-03`); log vendor included in processor assessment | Log-content review in acceptance |
| Backups | Shared, encrypted | Inherits compartment metadata by copying the store | Encrypted with keys under §9; restore procedure re-applies current authorization and does not resurrect revoked access (Security §18; `SEC-DEV-03`) | Representative restore test before production exposure (`SEC-FAIL-02`) |

### 5.4 Rules

1. No store may accept a compartment scope supplied by a caller. The server derives it.
2. Cross-compartment operations that the domain permits (a Referral between two organizations, Person Participation in a Collaboration) are explicit records with their own authority (Domain Model §11–12, §14), never a widening of a compartment.
3. A defect that produces cross-compartment visibility of protected information is a critical isolation defect and blocks affected exposure (`SEC-GATE-02`).
4. Isolation tests are part of the frozen acceptance evidence for every implementation package that touches a protected store (`SEC-DEV-02`).

## 6. Decision 3 — Environment topology and platform path

### 6.1 Environments

| Environment | Purpose | Permitted data | Credentials and keys | Stage of use |
|---|---|---|---|---|
| **Development** | Implementation, previews, AI-assisted coding, tests | Public and synthetic only (`SEC-DEV-01`); no real personal information; no production credentials | Own credentials; secrets in the development platform's secret store; no production keys | From Foundation 001 |
| **Staging** | Release rehearsal on production-equivalent configuration; migration rehearsal; restore tests | Synthetic, or specifically approved de-identified material | Own credentials and keys; production-equivalent policy and configuration | Required before the protected-continuity gate (Security §24); optional earlier |
| **Production** | Real operation, including the public-discovery stage | Real information only after the applicable exposure gate; unsolicited ingress text handled under `SEC-ID-01` | Own credentials and keys; no development or staging identity can reach it | From Foundation 001 where the foundation is deployed beyond development; public exposure from the public-discovery gate; any publicly exposed deployment is production-class (rule 5) |

Rules:

1. Environments never share a database, object store, key, secret, or service identity.
2. Configuration, policy, and schema changes reach production only through the release path (`SEC-DEV-03`, `SEC-PLAT-04`), after rehearsal in staging once staging exists.
3. The development platform's automatic preview deployments are development-class environments and may not be given production credentials or exposed as a service.
4. AI development tools (Replit Agent, Claude Code, any Managed Agent) operate only in development under the development-tool profile required by `SEC-DEV-01` and `SEC-D08`, which Foundation 001 must supply.
5. **Any deployment exposed to the public is the production environment, whatever vendor hosts it.** The public-discovery stage runs in production under the reduced profile (§6.4), because public ingress receives unsolicited real personal text (`SEC-ID-01`) that must never enter a development-class environment (`SEC-DEV-01`; Governance §12.1). "Development platform" in this ADR names the vendor whose workspace is used for development; a deployment that vendor hosts for public use is production, with production credentials and none of the development environment's access.
6. **Environment guard.** Development-only seeding, verifiers, and destructive tests refuse to run against any database whose instance-identity marker (§6.3 rule 8) does not identify a development instance, and require explicit confirmation before writing (Governance §12.1).

### 6.2 Platform path options

| Option | Description | Assessment |
|---|---|---|
| **P1 — Development platform's managed deployment throughout** | Run every stage, including protected data, on the development platform's deployment and database offering. | Simplest and cheapest. Not acceptable for protected data unless that platform is assessed against the full profile (§6.4) and satisfies it, including key management separation, privileged-access controls, processor terms, and U.S. data location. This cannot be assumed; it must be evidenced. Choosing it without that evidence violates `SEC-D01`'s safe default. |
| **P2 — Production-grade managed platform from Foundation 001** | Select a managed cloud or platform-as-a-service that meets the full profile and deploy the synthetic foundation there from the start. Replit remains development only. | Avoids a migration at the moment protected data arrives. Higher setup effort and cost during a period when the application handles only synthetic and public data, with no operations staff yet named. |
| **P3 — Stage-gated, component-assessed path (recommended)** | Foundation 001 and the public-discovery stage may run on the development platform's managed deployment if the **reduced profile** in §6.4 is met. The platform is assessed as separate components (§6.5); each component that will hold or process protected information must meet the **full profile** before the protected-continuity gate, and a component that cannot is replaced. The relational database is Springboard-owned from the start. The application is written platform-agnostic from Foundation 001 so any component move is an infrastructure change. | Matches spend to risk: no protected data exists until Stage 2. The modular monolith with ports-and-adapters (Architecture §15.1) already requires infrastructure behind ports, so portability is the design, not extra work. Owning the database from the start removes the most consequential migration entirely. The risk is that a required component move is deferred past the point it is needed; §6.3 rule 4 makes it a hard gate, not a plan. |
| **P4 — Self-managed virtual machines** | Operate the stack on rented servers. | Rejected. Places patching, backup, key management, and monitoring on a staff that does not exist, contrary to `SEC-PLAT-01`'s expectation of maintained mechanisms. |

### 6.3 Decision

Adopt **P3**, with these rules:

1. From Foundation 001, the application must depend on infrastructure only through ports: relational database, object storage, key service, secret store, queue, search, audit sink, and outbound HTTP. No platform-specific service may be called directly from domain code.
2. The development platform's managed deployment offering may host the production environment for the synthetic foundation and, after its own exposure gate, the public-discovery stage, only if Foundation 001 evidences the reduced profile in §6.4. That deployment is production-class under §6.1 rule 5.
3. Before the protected-continuity gate, a production-grade platform must be selected in a product ADR or in the Stage 2 implementation specification, assessed under `SEC-PLAT-05` and, where healthcare workflows are in scope, `SEC-D04`, and evidenced against the full profile.
4. No protected personal information may be stored in a protected store, or processed for continuity, Service Connection, Referral, document, Collaboration, or any other Stage 2 or later purpose, on any platform component that has not been evidenced against the full profile. This is a hard gate under `SEC-GATE-01`, not a scheduling preference. The single exception is unsolicited personal text received at public ingress during the public-discovery stage, which the reduced profile admits only as `SEC-ID-01` and the public-discovery gate govern it: minimized at ingress, retained only as that gate permits, never written to a protected store, never forwarded to a source, model, or provider merely because it was submitted, and processed only within the approved ingress and model-processing profile. That exception creates no continuity record and does not widen the reduced profile for any other information.
5. The selection in rule 3 is not constrained to any vendor by this ADR. Any platform or component that meets the full profile is eligible, including the development platform's own offerings if they are so evidenced.
6. **Components are assessed and may move separately.** Compute, relational database, object storage, key service, logging and monitoring, and backups are distinct components with distinct processors. Passing the full profile for one component (for example, a database on a contractually protected tier) does not evidence the others. The compute component holds decrypted protected content in memory, environment secrets, and captured logs; it is a processor of protected information and requires its own assessment.
7. **The relational database is Springboard-owned from Foundation 001.** It is provisioned in an account Springboard controls, in a U.S. region Springboard selects, on whatever tier the current stage requires. It is not the database the development platform provisions automatically on publication. Before the protected-continuity gate, the same project is moved to the tier that carries the contractual protections the `SEC-D04` profile requires (a business-associate agreement where healthcare workflows are in scope) and the privileged-access controls in §8; this is a plan and configuration change on a project Springboard already owns, not a data migration. The database service selected in Foundation 001 must therefore offer the contractually protected tier and the access controls in §8 on the same database instance without a data migration; if the selected service cannot, Foundation 001 must record the migration that will be required and the gate at which it occurs.
8. **An automatically provisioned database that cannot be disabled remains unused, and its non-use is controlled.** Where the development platform provisions a database on publication and injects its connection string, all of the following apply:
   - **One variable.** In staging and production the application reads its database connection from exactly one Springboard-named configuration variable. There is no fallback to any other variable, including the platform's default. If the variable is absent, startup fails.
   - **Identity marker in the database.** At startup the application reads an instance-identity marker stored in the database it has connected to (an instance identifier and environment name written when the database was provisioned) and compares it with the expected identity supplied by per-environment configuration. It refuses to start if the marker is absent or does not match. A check on the connection hostname does not satisfy this rule, because managed-database endpoints change on restore, re-provisioning, or migration.
   - **Schema-state assertion.** At startup the application verifies that the database's migration ledger matches the schema version the deployed release expects and refuses to serve requests otherwise. The ledger itself is maintained under Governance §12.4; the assertion is this ADR's control.
   - **No startup writes.** Startup performs no writes to the database. Reference-data seeding, like schema change, occurs in the release path and is recorded in the migration ledger, so a partial failure is a failed release rather than a running application with missing data.
   - **Verified unused.** The automatically provisioned database is verified to contain no schema and no data, and that verification is recorded in every release record (`SEC-GATE-02`). Where the platform permits, its injected connection string is removed from or made unreadable to the application process.
   - **Verified transport.** Connections to the database service use TLS with certificate verification enabled (§9.1 rule 3). Disabling verification to reach a database is prohibited.
   A configuration change that alters which database the application connects to, or the expected instance identity, is a code-equivalent change under `SEC-DEV-03`.

### 6.4 Platform profile

**Reduced profile** (sufficient for the synthetic foundation and the public-discovery stage, where no protected personal information is stored beyond minimally retained unsolicited ingress text handled under `SEC-ID-01`):

- TLS for all ingress with valid certificates; encrypted storage at rest for the database and any object storage.
- Compute and stores located in the United States.
- Secrets held in the platform's secret store, never in the repository.
- Individually named accounts with multi-factor authentication for every human with platform access, and phishing-resistant authentication for privileged control-plane access (`SEC-ID-04`).
- Handling of unsolicited personal text at public ingress as required by `replit.md` §6 and the public-discovery gate (minimal retention, no protected store).
- Published security program and data-processing terms from the vendor, reviewed and recorded.

**Full profile** (required before protected personal information):

- Everything in the reduced profile.
- A key service that holds envelope-encryption keys separately from application data, with administration separable from application deployment (§9).
- Privileged-access controls sufficient for §8: time-boxed elevation, individual identities, phishing-resistant authentication on every privileged control plane (vendor consoles, database administration, key service, audit administration), audit of console and database access.
- Network egress control sufficient for §10.
- Immutable or object-locked storage for audit exports.
- Backup encryption, U.S.-only replication, tested restore.
- Processor assessment completed (`SEC-PLAT-05`): subprocessors, telemetry, support access, incident notification, data return and deletion on exit. Availability of a business-associate agreement recorded where `SEC-D04` finds healthcare workflows in scope.
- An assessed monitoring path that does not receive protected content.

The full profile is evidenced **per component**. A component's evidence covers only that component and its processor.

### 6.5 Component paths under P3

| Component | Foundation 001 and public-discovery stage | Required before the protected-continuity gate | Notes |
|---|---|---|---|
| **Compute** (application runtime, environment secrets, captured logs) | Development platform's managed deployment offering, operated as the production environment (§6.1 rule 5) and meeting the reduced profile | Assessed against the full profile as a processor of protected information: staff and support access, what workspace collaborators can read (including secrets), region, log capture, and contractual terms including business-associate agreement availability where `SEC-D04` requires it. If it cannot be evidenced, the application moves to compute that can; the move is an adapter and configuration change under §6.3 rule 1. | The compute component decrypts protected content in memory. Encrypting the database does not remove compute from scope. |
| **Relational database** | Springboard-owned managed relational database service (product named in Foundation 001), U.S. region selected by Springboard, encrypted at rest, on an inexpensive tier (§6.3 rule 7). The platform's automatically provisioned database is unused under §6.3 rule 8. | Same project on the tier carrying the contractual protections and access controls the profile requires; privileged access under §8; backups under §11. | Owning the project from the start makes this a plan change, not a migration. |
| **Object storage** (secure documents) | Not required until documents exist. The port is implemented; a development store may sit behind it for synthetic fixtures. | Assessed managed object storage, U.S.-located, encrypted, private by default, with object-lock or equivalent immutability available for audit exports, and contractual terms as above. | Documents are never stored in the relational database or in the compute component's filesystem. |
| **Key service** | Development platform's secret store behind the key-service port (§9.3 rule 6). | A real key service meeting §9.3 rules 1–5, administered separately from application deployment. | The database provider is not a key service. |
| **Logging and monitoring** | Platform logs with content exclusion (§11 rule 2). | Assessed monitoring path that receives no protected content; log retention and access recorded. | Captured stdout from the compute component counts as logging. |
| **Backups** | Provider-managed backups of the database project. | Encrypted, U.S.-only, restore tested (`SEC-FAIL-02`); restore procedure re-applies current authorization (§11 rule 1). | Follows the database component's provider. |
| **Job and event mechanism; search** | Per Foundation 001, initially within the database project if so decided. | Inherit the database component's evidence while they share it; separate assessment if moved to a distinct service. | — |

**Applying the path to the current development platform.** As described by the decision authority, the current development platform provisions a managed relational database automatically when an application is published, under the platform's own account and without the contractual protections Springboard may require; that provisioning can be bypassed but not eliminated. §6.3 rules 7 and 8 are written for that situation and apply equally to any platform with the same behavior. Naming the platform here is context, not vendor selection; selection remains a Foundation 001 decision under §3.2.

## 7. Decision 4 — Data location

1. Protected personal and restricted personal information is stored and processed only in United States regions, including backups, replicas, search indexes, queues, logs, and vendor telemetry.
2. A single primary U.S. region is used. Backups may replicate to a second U.S. region.
3. No in-state (Delaware) residency requirement is asserted by this ADR. If `SEC-D04` legal review or a data-sharing agreement (for example, HMIS/CMIS terms) imposes a location or transfer condition, it is added by amendment and enforced from that point.
4. Model providers used for Mesh operational processing must offer U.S. processing under terms that satisfy `SEC-D08`; this ADR passes the location constraint through to that decision.
5. Public-class information carries no location constraint, but the public-discovery stage still runs in the same U.S. deployment for operational simplicity.

## 8. Decision 5 — Privileged access paths and runtime identities

### 8.1 Human access

1. Every human with access to any environment's platform console, database, object storage, key service, monitoring, or audit administration holds an individually named account with multi-factor authentication, and uses phishing-resistant authentication (hardware-backed or platform-bound credentials) for privileged control-plane access (`SEC-ID-04`). Shared or root accounts are not used for routine work and, where they cannot be removed, are vaulted and audited.
2. There is **no standing human access to production data**. Production database and object-store access by a person requires a recorded operational purpose, a case or incident reference, a bounded scope, stronger authentication, time-limited elevation, and audit (`SEC-PRIV-02`). Default elevation is read-only.
3. Changes to production schema, policy, or configuration are made through the release path, not through console or direct database sessions.
4. **Break-glass access is disabled** until `SEC-D11` approves its eligible actors, permitted circumstances, scope, duration, notification, and independent review (`SEC-PRIV-03`).
5. Platform stewardship, Springboard service-program, backbone, and analytic capacities are separate represented contexts; an operator with platform elevation has no compartment access through it (`SEC-PRIV-01`).
6. Vendor and support access to any environment is part of the privileged-access inventory and the processor assessment (`SEC-PRIV-02`, `SEC-PLAT-05`).
7. The entitlement-review cadence is set by `SEC-D11`; until then, access is reviewed on every departure, role change, or suspected compromise (`SEC-PRIV-04`).

### 8.2 Runtime and storage identities

| Identity | Used by | Privileges | Must not |
|---|---|---|---|
| Application runtime (domain identity) | The deployed application serving requests | Read and write on domain schema under row-level policy; no privilege on the audit store | Bypass row-level policy; write to, alter, or delete audit rows directly; run migrations |
| Migration | The release path only | Schema changes | Be available to the running application or to any development tool |
| Job runner | Durable external work (Integration Manifold, notifications) | Scoped to the job's compartment context; outbound HTTP through the Manifold's egress path | Hold broader database privilege than the application runtime |
| Audit writer | Audit Service module, through a credential held separately from the domain identity | Append to the audit store; export to immutable storage | Read domain data beyond what the event carries; update or delete audit rows |
| Audit reader | Authorized audit review | Read audit store | Write anything |
| Analytics loader | Approved Analytic Dataset creation only | Read the approved source scope; write to the analytic environment | Be reachable from the application runtime; write to operational stores |
| Key administrator | Named humans under §9 | Manage key policy and rotation | Deploy application code |

In the modular monolith the Audit Service runs in the same process as the domain code but authenticates to the audit store with the audit-writer credential; the domain identity carries no audit privilege, so an application defect or a compromised domain credential cannot alter audit history (`SEC-AUD-04`). Each identity is per-environment. Secrets for these identities live in the environment's secret store (`SEC-PLAT-03`) and are rotated on personnel change, suspected compromise, or the schedule Foundation 001 sets.

### 8.3 Development tools

Replit Agent, Claude Code, any Managed Agent, and any other AI development tool hold development-environment credentials only, never staging or production credentials, and work only with public and synthetic material (`SEC-DEV-01`). Foundation 001 must supply the development-tool profile required by `SEC-D08`, naming each tool, its permitted material, and its contractual and retention conditions.

## 9. Decision 6 — Encryption and key profile

### 9.1 In transit

1. All ingress uses TLS 1.2 or later, preferring TLS 1.3, with HSTS, valid certificates from a public authority, and cipher suites limited to authenticated-encryption (AEAD) suites with forward secrecy. The specific protocol versions and suite list are taken from a named, maintained baseline — the platform's documented TLS policy or an equivalent published configuration — recorded in each release record and never custom-built (`SEC-PLAT-01`, `SEC-PLAT-02`).
2. All outbound connections from the Integration Manifold, Model Gateway, and notification adapters validate certificates. No adapter may disable validation to reach a source.
3. Connections between the application and its stores, including the relational database service, use authenticated encrypted transport with certificate verification enabled. A client setting that disables certificate verification (for example, accepting any server certificate to reach a managed database) is prohibited in every environment; if a store cannot be reached with verification, the store's certificate chain is fixed, not the client's verification.

### 9.2 At rest — two layers

1. **Provider-managed encryption** for every store: relational database, object storage, audit store, queue persistence, search index persistence, logs, and backups. This is the baseline and is required even for synthetic data so that configuration is production-equivalent from the start.
2. **Application-level envelope encryption** for restricted-class fields (Security §5.1) and for every secure document (Architecture §6.12). Each document and each restricted field group is encrypted with its own data key; data keys are wrapped by a key held in the key service and are stored alongside the ciphertext. A *restricted field group* is the set of restricted-class fields on one record that are encrypted and decrypted together; Foundation 001 or the applicable specification defines the groups. Envelope encryption ensures that a copy of the database or bucket alone does not disclose restricted content. It also makes cryptographic erasure available as one disposition method; cryptographic erasure, physical deletion, and archival restriction have different effects and must be validated and reported distinctly (`SEC-RET-03`).

Protected-class fields that must remain queryable (names, contact methods, Need descriptions) rely on layer 1 plus compartment isolation; this ADR does not require field-level encryption of them, and Foundation 001 or the Referral and Document Specification may extend layer 2 to specific fields where a legal profile under `SEC-D04` requires it.

### 9.3 Key service and key management

1. Envelope keys are held in a key service separate from the application database and object storage. The application runtime may request wrap and unwrap operations; it cannot export key material.
2. Key administration (policy, rotation, destruction) is separable from application deployment and is performed by named key administrators (§8.2). Privileged key operations are audited.
3. Rotation: wrapping keys rotate at least annually and on suspected compromise; rotation re-wraps data keys without re-encrypting content. Rotation and revocation events are audit events.
4. Key destruction occurs only under authorized disposition (Security §18) and is recorded so that irrecoverability is deliberate, never accidental (`SEC-PLAT-03`).
5. Key backup and recovery are part of the restore test required before production exposure (`SEC-FAIL-02`).
6. During the synthetic foundation, the key service port may be satisfied by the development platform's secret store behind the same interface; a real key service meeting rules 1–5 is part of the full profile and required before protected data.

### 9.4 Hashing and integrity

Audit chain and artifact integrity use SHA-256, consistent with the repository's approval records. Password material, where any exists after `SEC-D02`, uses a maintained password-hashing algorithm selected by the Identity and Access Specification, never a general-purpose hash.

### 9.5 Accuracy of claims

Provider Mesh must not describe itself as end-to-end encrypted. Under this profile the platform steward's application can decrypt protected content for authorized processing, and approved server-side or model processing may see plaintext within its authorized scope (`SEC-PLAT-02`). Public statements must say so accurately.

## 10. Network entry and exit

1. **Single ingress.** All user, API, and MCP traffic enters through one TLS-terminating edge into the Interaction and Access Gateway (Architecture §6.1). No store or internal service is reachable from the public network.
2. **Controlled egress.** Outbound connections to external sources, provider systems, MCP servers, model providers, and notification services originate only from the Integration Manifold, Model Gateway, and notification adapters, through an egress path that can be inventoried and, where the platform supports it, allowlisted. Domain code makes no outbound calls.
3. Outbound destinations for consequential operations are those registered under `SEC-D09`; public retrieval may discover new URLs within its approved rules.
4. Model-provider egress is limited to providers approved under `SEC-D08`.
5. The analytic environment has no inbound path from the public network and no path to operational stores except the approved loader (§5.3).

## 11. Backups, logs, telemetry, dependencies, patching, and transferability

1. Backups are encrypted, U.S.-located, taken on a schedule set in Foundation 001, and restored in a representative test before production exposure (`SEC-FAIL-02`). Restores are performed into a restricted environment; integrity is verified and post-backup revocations, corrections, deletions, subject restrictions, and credential changes are reconciled before protected access resumes, so a restore never reinstates revoked access, expired authority, or de-linked identity (`SEC-RET-04`; `SEC-DEV-03`).
2. Logs and telemetry carry correlation identifiers and technical metadata only. They do not carry protected content, unsolicited personal text, secrets, or document content (Architecture §12; `SEC-PLAT-03`). Third-party analytics, session replay, and advertising code are prohibited by default (`SEC-PLAT-05`).
3. Monitoring covers the signal families in Architecture §12; the monitoring vendor is part of the processor assessment.
4. **Dependency ownership.** The platform vendor owns the operating system, runtime base images, and managed-service maintenance for the components it provides, under terms recorded in the processor assessment (`SEC-PLAT-05`). Springboard owns the application's declared dependencies: every dependency and version is pinned in a lockfile committed to the repository; deployed versions are recorded in each release record (`SEC-PLAT-04`); the implementation agent maintains them only under a direct request or an approved maintenance objective (Governance §7.2, §9); and a dependency addition or upgrade outside prior authorization is a hard stop (`replit.md` §5).
5. **Patching.** Security patches to application dependencies follow a bounded, authorized release path and are never applied as an unreviewed production modification (`SEC-PLAT-04`). Patch cadence and the required response time for critical vulnerabilities are set in the production and incident runbooks required by `SEC-D13`; until those exist, a critical vulnerability in a deployed dependency is raised immediately to the decision authority as a maintenance objective for authorization. Platform-side patching is the vendor's responsibility, and the processor assessment records how the vendor notifies Springboard of security-relevant changes.
6. **Transferability.** To honor Constitution Art. XII.10 and `SEC-FAIL-04`, the production deployment must at all times be capable of: export of all authoritative records in documented formats; export of the audit chain with integrity evidence; transfer or re-wrap of envelope keys to a successor key service; and revocation of all credentials and vendor access on exit. The production runbooks required by `SEC-D13` describe the procedure; this ADR requires that the design not preclude it.

## 12. Consequences and accepted risks

| Consequence | Assessment |
|---|---|
| Isolation is a software and configuration control on shared infrastructure, not a physical boundary | Accepted, as Architecture §7.4 and `SEC-ORG-02` permit with approved, tested isolation. The two-layer design (§5.2) and mandatory isolation tests (§5.4) are the compensating controls. An isolation defect is a blocking defect. |
| The stage-gated platform path may require one or more component moves before Stage 2 | Accepted. The ports requirement (§6.3 rule 1) confines any move to infrastructure adapters and configuration; owning the database from the start removes the largest one. Rule 4 prevents deferral past the point protected data would arrive. |
| Two database connection strings exist in the deployment environment while the platform's automatic provisioning cannot be disabled | Accepted with the controls in §6.3 rule 8. The residual risk is a misconfiguration that connects the application to the wrong database; the startup identity assertion is the control that fails closed. |
| A contractually protected database tier does not by itself make the compute component acceptable for protected data | Accepted and made explicit in §6.3 rule 6 and §6.5. The compute assessment before Stage 2 may conclude that the application must move; the design keeps that move cheap. |
| Single primary region means a regional outage is an outage | Accepted at pilot scale. Recovery objectives are set under `SEC-D13` before production exposure; this ADR does not promise continuous availability (`SEC-FAIL-02`). |
| No standing production access slows some troubleshooting | Intended. `SEC-PRIV-02` requires it; synthetic reproduction in development is the routine path. |
| Envelope encryption adds implementation effort and a key-service dependency | Accepted for restricted-class fields and documents only. Protected-class fields rely on baseline encryption and isolation, keeping the blast radius of the added complexity small. |
| Instance-portability constrains vendor-specific convenience features | Accepted. It is what makes Art. XII.10 transfer obligations and any future second instance achievable. |
| Analytic environment separation delays any analytics work until it is provisioned | Intended. Architecture §15.14 and `SEC-SECONDARY-02` require a separated boundary; this ADR's choice of physical separation is recorded in §14 decision 6. Stage 5 is the last stage. |

## 13. Requirements this ADR places on Foundation 001

Foundation 001 must, at minimum:

1. Name the runtime, framework, relational database product, object-storage product, and job mechanism, and show each is reached through a port (§6.3 rule 1).
2. Define the development environment, its synthetic-data source, and the development-tool profile for each AI tool in use (§8.3; `SEC-D08`).
3. Evidence the reduced profile (§6.4) for whatever deployment hosts the foundation, including U.S. location and encryption at rest, or state that the foundation is not deployed beyond development.
4. Provision the relational database in a Springboard-owned account (§6.3 rule 7): record the account owner, project, region, tier, and encryption-at-rest status; name the single Springboard-specific connection variable the application reads; write the instance-identity marker at provisioning and implement the startup identity and schema-state assertions; and record the verification that the platform's automatically provisioned database, if any, contains no schema and no data (§6.3 rule 8).
5. Create the per-environment identities in §8.2 that the foundation needs (at least application runtime, migration, and audit writer) and show the application runtime cannot alter audit rows.
6. Implement compartment references and row-level policy on the first protected-class table it creates, with isolation tests, even though the data is synthetic (§5.3, §5.4).
7. Implement the key-service port with the development secret store behind it (§9.3 rule 6).
8. Configure logging to exclude content (§11 rule 2).
9. Record the backup schedule and the first restore test plan for staging (§11 rule 1).
10. State the internal event and command contract conventions or name the ADR that will, as Architecture §17 requires before core implementation.
11. Configure every database and store client with certificate verification enabled and show it in the acceptance evidence (§9.1 rule 3).
12. Establish one executable migration path — schema and reference-data changes generated, reviewed, recorded in a migration ledger, rehearsed, and applied through the release path — and the environment guard in §6.1 rule 6 (§6.1, §8.3, Governance §12.1).
13. Record the provisioning of the database project and its roles as code or as a versioned, scripted procedure sufficient to recreate it, so that the instance-portability requirement (§4.3 rule 2) is met from the first environment.

## 14. Decisions recorded by the decision authority

The following selections were made by Judson Malone, Executive Director, in the project conversation on September 19, 2026, from the options presented in draft revision 3. They resolve the open decision points of this ADR. The alternatives remain documented in §4.1 and §6.2 as considered and not adopted. These selections took effect through the approval recorded in §17.

| # | Decision | Selection | Alternatives not adopted |
|---|---|---|---|
| 1 | Tenancy model | **T1** — single steward, compartmented, instance-portable (§4). The §2.3 assumption is confirmed: SaaS customers join as participating organizations of the Springboard-operated platform. | T2 per-organization physical isolation; T3 multi-operator |
| 2 | Platform path | **P3** — stage-gated, component-assessed path with a hard gate before protected data (§6.3, §6.5) | P2 production-grade platform from Foundation 001; P1; P4 |
| 2a | Database ownership at Foundation 001 | **Springboard-owned project from the first deployment** (§6.3 rule 7) | Use the platform's automatically provisioned database for the foundation and migrate before Stage 2 |
| 3 | Data location | **U.S. only, any region** (§7); region selection follows the platform chosen at Foundation 001 or Stage 2 | U.S. only with a named region preference; in-state residency |
| 4 | Staging environment timing | **Required before the protected-continuity gate** (§6.1); earlier permitted if cost allows | Required from Foundation 001 |
| 5 | Envelope encryption scope | **Restricted-class fields and all secure documents** (§9.2); extended later only if a `SEC-D04` profile requires it | Extend to all protected-class fields |
| 6 | Analytic environment separation | **Physical separation** — separate database and storage with separate credentials (§5.3). Adopted in the reviewed draft; not presented as a separate selection; confirmed by the approval recorded in §17 | Logical separation within shared infrastructure, which `SEC-SECONDARY-02` also permits |

## 15. Acceptance evidence at later gates

This ADR is document-level. Its provisions are verified at the gates in Security §24 as follows:

| Gate | Evidence from this ADR |
|---|---|
| Synthetic foundation implementation | §13 items 1–13, including the database-ownership and non-use controls in item 4 |
| Public discovery exposure | Reduced profile (§6.4) evidenced for the hosting deployment; ingress rule (§10.1); log exclusion (§11.2); automatically provisioned database verified unused (§6.3 rule 8) |
| Protected continuity / Referral / documents | Full profile (§6.4) evidenced for every component in §6.5 that holds or processes protected information, including the compute component; isolation matrix (§5.3) tested across every store in use; §8 identities and no-standing-access in effect; §9 key service in use with restore test; staging in use |
| Collaboration / Consultant exposure | Collaboration compartment isolation tested (§5.1, §5.3) |
| Consequential integration exposure | Egress inventory (§10.2–10.3) |
| Analytics or research exposure | Analytic environment separation demonstrated (§5.3) |

## 16. Traceability

| Requirement | Source | Section here |
|---|---|---|
| Deployment and tenancy model before Foundation 001 | Architecture §17 | §4, §6 |
| Deployment, tenancy, data location, storage isolation, privileged paths, encryption/key profile | `SEC-D01` | §4–§9 |
| Security profile contents | `SEC-PLAT-01` | §6–§11 |
| Encrypt protected information | `SEC-PLAT-02` | §9 |
| Separate keys, secrets, and application data | `SEC-PLAT-03` | §8.2, §9.3 |
| Harden applications; restrict egress; release path; dependency and patch discipline | `SEC-PLAT-04` | §6.1, §10, §11 |
| Govern processor access | `SEC-PLAT-05` | §6.4, §11 |
| Enforce compartment boundaries; no caller-supplied tenant filter | `SEC-ORG-02` | §5 |
| Separate Springboard's capacities; minimize administrative exposure; break-glass disabled; entitlement review | `SEC-PRIV-01`–`04` | §4.3, §8 |
| Bounded development exposure; development-tool profile | `SEC-DEV-01`, `SEC-D08` | §6.1, §8.3 |
| Public discovery open; unsolicited text minimized | `SEC-ID-01` | §6.1, §6.4 |
| Individual accounts, MFA, phishing-resistant privileged access | `SEC-ID-04` | §6.4, §8.1 |
| Tamper detection and audit boundary | `SEC-AUD-04` | §5.3, §8.2 |
| Disposition methods distinct; restore into restricted environment | `SEC-RET-03`, `SEC-RET-04` | §9.2, §11 |
| Separated analytic boundary | `SEC-SECONDARY-02` | §5.3, §14 |
| Environment separation and guard; migration integrity | Governance §12.1, §12.4 | §6.1, §6.3 rule 8 |
| Policy and configuration as code-equivalent | `SEC-DEV-03` | §6.1, §11.1 |
| Fail safely; recovery objectives; transfer or closure | `SEC-FAIL-01`, `02`, `04` | §5.2, §11, §12 |
| Storage roles may share managed infrastructure; product selection by ADR | Architecture §7.4 | §5.3, §3.2 |
| Modular monolith with ports-and-adapters | Architecture §15.1 | §6.3 |
| Operational and secondary-use environments distinct | Architecture §15.14; Security §20 | §5.3, §10.5 |
| Audit independence and tamper evidence | Architecture §6.17; Domain Model §17.4; Security §17 | §5.3, §8.2 |
| Shared service environment; single steward; transfer obligations; separate Springboard roles | Constitution §2.3, Art. XII.3–5, XII.7, XII.10 | §2.2, §4, §11 rule 6 |
| Collaboration as compartment; documents with multiple subjects | Domain Model §14, §22.22, §22.33 | §5.1 |
| Persistence selective and purpose-limited | Constitution Art. XIII | §5.1 |

## 17. Approval record

| Field | Value |
|---|---|
| Approval status | Approved — Controlling ADR |
| Approved version | 0.1 |
| Approved by | Judson Malone, Executive Director, Springboard Delaware, acting as delegated product authority and, pending assignment of the security-owner function under Security §3.1, as the security authority for this decision |
| Approval date | September 19, 2026 |
| Approved source candidate | `ADR-001_DEPLOYMENT_AND_TENANCY_v0.1_APPROVAL_CANDIDATE.md` — 0.1-WIP, draft revision 6 |
| Source candidate SHA-256 | `716208f16fcc5df3bd3fe24fa7871aa1178deb8f4720ade905697f635d3e1626` |
| Canonical repository path | `docs/adr/ADR-001-deployment-and-tenancy.md` |
| Canonical repository reference | Pending canonical placement and synchronization |

### 17.1 Draft review record

An independent draft review under the Security §24 draft-review gate was performed on September 19, 2026 by a separate AI context that had not participated in drafting (Governance §4.4), against draft revision 4. It reported five blocking defects (environment class for public discovery; dependency ownership and patching unaddressed; contradictory audit write privilege; privileged authentication weaker than `SEC-ID-04`; a database product named contrary to §3.2), ten ordinary repairs, and three future improvements, and spot-checked 62 citations (57 correct, 5 corrected). All blocking defects and ordinary repairs, and the three future improvements, were resolved in draft revision 5. The same reviewer re-verified revision 5, confirmed every finding resolved, and reported three issues introduced by the repairs: a contradiction between the reduced profile's treatment of unsolicited ingress text and §6.3 rule 4 (resolved by the `SEC-ID-01` exception now stated in rule 4), a stale cross-reference in §16, and an inconsistent "stage of use" cell in §6.1; all three, and a correction to the home of patch cadence (`SEC-D13`), are resolved in draft revision 6. Both review reports are retained as review evidence outside the canonical path.

### 17.2 Approval and remaining steps

The exact approval statement is retained in the approval record at `docs/reviews/2026-09-19/ADR-001_v0.1_APPROVAL_RECORD.md`. The source candidate checksum above identifies the reviewed candidate; it is not the checksum of this approved file, which is recorded in the approval record.

This approved ADR remains non-operational until byte-identical canonical placement, commit, and synchronization. Approval of this ADR does not authorize Foundation 001, implementation, vendor engagement, deployment, public exposure, or processing of real personal information.
