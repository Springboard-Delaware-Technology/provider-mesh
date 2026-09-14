# Springboard Software Development Governance

**Document ID:** SB-SDG-001  
**Version:** 0.2  
**Status:** Approved — Controlling Software Development Governance  
**Owner:** Springboard Delaware  
**Decision authority:** Judson Malone, Executive Director  
**Scope:** Reusable governance for Springboard software projects  
**Artifact identity:** Distinct non-canonical approved artifact  
**Canonical path required for operational effect:** `docs/governance/SPRINGBOARD_SOFTWARE_DEVELOPMENT_GOVERNANCE.md`  
**Date:** September 14, 2026  
**Approved by:** Judson Malone, Executive Director  
**Approval date:** September 14, 2026  
**Previous approved version:** 0.1 — September 6, 2026  
**Prior approved artifact SHA-256:** `839edb43cef4f5a675188ac7c2a7200c72139a4933bd9a49bde3ed74d121c8be`  
**Amendment authority:** Judson Malone, September 14, 2026 — approved corrections from PM-REVIEW-002 v0.1 (F02)  
**Approved amendment proposal SHA-256:** `f627f867f7fc184e468b4f36154297afe2496fb37d13b501442715e9ecef3adc`  
**Complete-artifact checksum and amendment record:** `PROVIDER_MESH_AMENDMENT_REGISTER_20260914.md` and `SHA256SUMS.txt`  

## 1. Purpose

This document defines how Springboard directs, delegates, verifies, and accepts software-development work performed collaboratively by people and AI-enabled development systems.

It establishes a mission-oriented operating model: human leadership controls purpose, outcomes, protected invariants, exposure, and consequential risk; architecture and governance work translates that intent into durable boundaries; implementation agents exercise disciplined initiative within those boundaries.

The objective is neither unrestricted autonomy nor approval of every engineering step. The objective is reliable execution within a clearly bounded decision space.

This document is system-level governance. It is reusable across Springboard software projects. It does not define any particular product, data model, technology stack, provider, or feature.

## 2. Governing principle

Springboard adopts the following development principle:

> Control the intent, invariants, exposure, and acceptance conditions. Delegate the engineering method.

An implementation agent should be able to encounter an unanticipated but ordinary engineering problem, determine a compliant solution, and continue toward the approved outcome without seeking permission for every intermediate correction. This is disciplined initiative.

Delegated authority exists only inside the approved mission. Initiative is disciplined when it:

1. Advances the approved purpose and desired end state.
2. Preserves every controlling product, security, privacy, financial, audit, and data-integrity invariant.
3. Remains inside the authorized product and environment boundary.
4. Uses reversible or transactionally protected methods where practical.
5. Produces the required evidence of correctness.
6. Stops when a defined escalation condition occurs.

## 3. What this document governs

This document governs:

- Development roles and decision rights
- The distinction between reusable governance and project-specific control
- Work authorization and specification lifecycle
- Delegated implementation and repair authority
- Data-integrity protections
- Verification and acceptance
- Database migration control
- Git, checkpoint, attachment, and synchronization practices
- Runtime and environment exceptions
- Escalation and hard-stop conditions
- Reporting and handoff expectations
- Bootstrapping governance in a new Springboard project

It does not replace:

- A product constitution
- A system architecture
- A domain model
- A security and audit specification
- A contract or policy runtime specification
- An architecture decision record
- A bounded implementation specification
- A production runbook

## 4. Roles and decision rights

### 4.1 Human decision authority

The designated human decision authority owns the mission and retains authority over consequential choices.

The decision authority:

- Approves the product constitution and other controlling documents.
- Approves material changes in product purpose, architecture, data sensitivity, security, financial behavior, and public exposure.
- Approves bounded implementation packages when required by the work class.
- Accepts or rejects material residual risk.
- Authorizes production access, publication, deployment, destructive recovery, and use of real data.
- Approves changes to this governance model.
- Performs or authorizes final repository synchronization when required by project standing orders.

The decision authority does not need to approve ordinary implementation choices that fall within delegated authority.

### 4.2 Architecture and governance partner

The architecture and governance partner translates human intent into coherent product boundaries, system structure, implementation missions, acceptance criteria, and risk controls.

This role:

- Helps the decision authority define purpose, desired end state, and non-negotiable invariants.
- Maintains consistency among controlling documents.
- Distinguishes architecture decisions from implementation choices.
- Defines appropriately bounded implementation packages.
- Sets verification proportionate to risk.
- Reviews material exceptions and recommends decisions.
- Identifies lessons that should change reusable governance.

This role may recommend but may not infer or grant human approval.

### 4.3 Implementation agent

The implementation agent executes an approved mission and owns ordinary engineering means within its delegated decision space.

This role:

- Inspects the repository and applicable environment.
- Implements the approved outcome.
- Chooses compliant internal methods.
- Diagnoses and repairs ordinary failures.
- Maintains tests, verifiers, migrations, and documentation within the approved boundary.
- Protects secrets and environment separation.
- Reports exceptions, evidence, and final state accurately.
- Stops when an escalation condition occurs.

The implementation agent must not substitute its own product intent, weaken an invariant, or treat technical convenience as authority.

### 4.4 Reviewer

A reviewer evaluates material conformance and risk at a planned gate. A reviewer may be a human, a separate AI context, or an approved automated review process.

Review must be finite and tied to the approved acceptance criteria. A reviewer:

- Identifies material defects, security concerns, invariant violations, and unverified acceptance requirements.
- Distinguishes blocking defects from ordinary repairs and future improvements.
- Does not invent new nonmaterial proof obligations after implementation begins.
- Does not require the same behavior to be exhaustively re-proven at every layer.

### 4.5 Repository and automated controls

Git, database constraints, type systems, test suites, migration ledgers, continuous integration, and deployment controls provide durable evidence and enforcement. They are controls, not decision authorities.

## 5. Document architecture

### 5.1 System-specific documents

System-specific documents define how Springboard develops software across projects. They should not contain a particular application’s business rules or schema.

| Document | Purpose |
|---|---|
| Springboard Software Development Governance | Reusable roles, authority, workflow, integrity controls, escalation, and acceptance model |
| Approved templates | Standard structures for constitutions, architectures, ADRs, implementation specifications, and runbooks |
| Organization-wide security baseline | Minimum controls applicable to all Springboard systems, when adopted |

### 5.2 Project-specific documents

Project-specific documents define what a particular product is and how it is built.

| Document | Purpose |
|---|---|
| Product Constitution | Product identity, purpose, boundaries, and non-negotiable business rules |
| System Architecture | Durable technical structure, components, trust boundaries, and platform choices |
| Domain Model | Canonical business concepts, ownership, relationships, lifecycles, and invariants |
| Security and Audit | Project data classifications, access controls, audit requirements, and exposure gates |
| Specialized runtime documents | Durable rules for a specialized subsystem, such as a contract runtime |
| Architecture Decision Record | A material decision, its context, alternatives, consequences, and scope |
| Bounded implementation specification | The authorized outcome, change boundary, invariants, migration plan, and acceptance evidence for a particular package |
| `replit.md` or equivalent | Repository-specific standing orders adapting this governance model to the development environment |
| Code, tests, schemas, and migrations | The implemented system; evidence of current behavior, not authority to contradict controlling documents |

### 5.3 The role of `replit.md`

`replit.md` is a repository-specific operating adapter. It should:

- Identify controlling project documents and their locations.
- State the project’s product and environment boundaries.
- Translate this governance model into instructions the implementation agent can execute.
- Identify project-specific hard stops and exposure gates.
- Describe Git authentication, checkpoint, workflow, and Preview practices.
- Reference rather than duplicate durable governance wherever possible.

`replit.md` should not become a second product constitution, duplicate every implementation specification, or require human approval for ordinary engineering work already delegated by this governance model.

### 5.4 Precedence is question-specific

There is no single linear precedence order for every question.

| Question | Controlling source |
|---|---|
| How is development authority delegated? | This governance document, then the repository operating control |
| What is the product and what must it never become? | Product Constitution |
| How is the product technically structured? | System Architecture and applicable ADRs |
| What do business records mean? | Domain Model |
| What protects data and governs access or audit? | Security and Audit, consistent with the Constitution and Architecture |
| What may change in the current package? | Approved bounded implementation specification |
| What does the system currently do? | Code, database, migrations, configuration, and tests, subject to higher authority |

If controlling sources conflict materially, implementation stops for a human decision. A conflict may not be resolved silently through code or a lower-level document.

## 6. Mission brief

Every authorized implementation package must provide enough intent for disciplined initiative. The mission brief should state:

1. **Purpose** — why the work matters.
2. **Desired end state** — what must be true when the work is accepted.
3. **Essential capabilities** — the behavior or foundation that must exist.
4. **Non-negotiable invariants** — what must remain true throughout and afterward.
5. **Excluded scope** — what the mission does not authorize.
6. **Authorized environment** — local, development, staging, or production.
7. **Change boundary** — modules or path classes the work may affect.
8. **Delegated decisions** — choices the implementation agent may make without additional approval.
9. **Escalation events** — conditions requiring a human decision.
10. **Frozen acceptance evidence** — the checks required to establish completion.

The mission brief should define modules and directly affected path classes rather than attempting to predict every filename. Overly narrow filename lists can force unnecessary stops when an approved change legitimately requires a corresponding export, test, fixture, verifier, or migration metadata update.

## 7. Work classes and authorization

### 7.1 Class A — read-only diagnostic

Examples:

- Repository inspection
- Database metadata inspection
- Architecture comparison
- Dependency and runtime inventory
- Failure diagnosis without mutation

Authorization: a direct human request is sufficient. No implementation is authorized.

### 7.2 Class B — routine maintenance

Examples:

- Correcting a defect without changing approved behavior
- Refactoring inside an existing module
- Updating stale tests or verifiers to match authoritative behavior
- Documentation corrections that do not change controlling policy
- Tooling-compatible changes using existing dependencies

Authorization: a direct human request or an approved maintenance objective is sufficient when the work does not cross a protected boundary. A separate foundation specification is not required unless project standing orders say otherwise.

### 7.3 Class C — bounded implementation

Examples:

- New business capability
- New persistent entity or migration
- New authorization behavior
- New handling of sensitive or financial information
- Material API, workflow, integration, or architecture change

Authorization: an approved, canonical, synchronized bounded implementation specification is required before implementation begins.

### 7.4 Class D — controlled exposure

Examples:

- Production database access
- Real personal, financial, or contract data
- Public release or deployment
- Identity-provider activation
- Payment-provider activation
- Destructive recovery
- Security incident response

Authorization: an explicit current human decision and an applicable approved production or recovery runbook are required.

For incident containment, an explicit, still-effective human authorization may establish a bounded standing delegation for specified protective actions under an approved runbook. The delegation must identify the authorized actors or automated mechanisms, triggering conditions, affected resources, permitted actions, limits, review or expiry conditions, and subsequent human review. A runbook does not supply this delegation merely by existing.

This provision does not authorize new disclosure, exceptional content access, access restoration, destruction of records, production deployment, or other Class D activity outside the explicit delegation. Those actions retain their applicable human-authorization requirements. A standing containment delegation under this provision is limited to reducing access or stopping exposure; it cannot supply authority for the excluded actions.

## 8. Specification lifecycle

For Class C work:

1. Perform a read-only diagnostic.
2. Prepare a non-canonical draft clearly marked as not authorized.
3. Conduct human review outside the canonical repository path.
4. Record explicit human approval.
5. Create a distinct approved artifact with version, approver, approval date, and SHA-256.
6. Place the approved artifact byte-for-byte at its canonical path.
7. Commit and synchronize the canonical approved document without unrelated files.
8. Confirm the repository and authorized environment satisfy preflight requirements.
9. Begin implementation under the approved mission and delegated authority.

The lifecycle protects the distinction between draft, approval, and implementation. It must not be used to require a new document or approval for every ordinary repair within an already authorized mission.

## 9. Delegated engineering authority

Within an authorized mission, the implementation agent may perform the following without additional approval when the action preserves intent and protected invariants:

- Add, edit, move, or remove code within the approved module boundary.
- Update directly affected exports, types, schemas, tests, fixtures, mocks, and verifiers.
- Correct formatting, lint, type, build, and test failures.
- Refactor for clarity, testability, dependency injection, or deterministic behavior.
- Add meaningful tests needed to maintain approved coverage and acceptance.
- Correct stale tests when authoritative approved behavior has changed.
- Generalize a confirmed technical rule to all equivalent cases rather than repairing named examples one at a time.
- Add and remove ignored temporary diagnostic files.
- Use an already-installed dependency through another officially supported interface.
- Retry a transient development command within the project’s retry limit.
- Inspect development database metadata and execute approved read-only diagnostics.
- Rehearse an approved migration inside an unconditional rollback transaction.
- Correct syntax, ordering, or metadata consistency in an unapplied migration when its approved semantics do not change.
- Apply an approved, rehearsed migration to an authorized development database.
- Start and stop approved development workflows and perform Preview diagnostics.
- Accept automatic local checkpoint commits after validating their accumulated diff.

Delegated authority follows the approved module and directly coupled verification surfaces. It is not defeated merely because a necessary existing test or verifier was omitted from an exhaustive filename list.

## 10. Ordinary failure and bounded repair

A failed command is information, not automatically a governance event.

When formatting, lint, typecheck, tests, coverage, build, migration rehearsal, development migration, verifier, Run, Preview, endpoint, or browser checks fail, the implementation agent should:

1. Identify the root cause.
2. Classify the correction as delegated, ambiguous, or escalation-required.
3. Apply a delegated correction when available.
4. Rerun the narrowest relevant check.
5. Resume the acceptance sequence.
6. Report the correction in the final handoff.

A newly exposed failure after an earlier correction is part of the same verification pass. It does not require a new authorization merely because it was discovered later.

A repair cycle is counted by repeated unsuccessful attempts at the same root cause, not by every command or sequential defect. Unless a specification sets another limit, stop after three unsuccessful attempts at the same root cause or earlier when the correction becomes materially ambiguous.

The agent must not repair a failure by weakening an approved requirement, deleting a meaningful test, lowering a coverage threshold, broadly excluding code from coverage, or changing expected behavior to match an incorrect implementation.

## 11. Escalation and unconditional hard stops

The implementation agent must stop for a new human decision when any of the following occurs:

### 11.1 Mission or product boundary

- The required solution changes approved product purpose or business semantics.
- The work expands into a materially excluded capability.
- Controlling documents conflict or are materially ambiguous.
- A required change crosses the approved module boundary and is not a directly coupled implementation or verification surface.

### 11.2 Protected invariants

- A security, privacy, financial, audit, authorization, tenancy, ownership, or organizational-boundary invariant cannot be satisfied.
- A proposed correction would weaken validation, constraints, tests, coverage, acceptance criteria, or deny-by-default behavior.
- Real data appears where synthetic data is required.

### 11.3 Environment and exposure

- Production access is required or occurs unexpectedly.
- Publication, deployment, provider activation, or public exposure is required without explicit authorization.
- A secret or credential appears in a file, prompt, log, test, output, or commit.
- Development and production isolation cannot be established.

### 11.4 Database integrity

- A migration partially applies.
- Unexpected database objects or ledger entries appear.
- Destructive recovery is required and no approved recovery procedure applies.
- An applied migration would need to be rewritten.
- Manual migration-ledger manipulation is proposed.

### 11.5 Supply chain and platform

- A new dependency, dependency upgrade, lockfile change, runtime change, deployment change, port change, or security configuration change is required but was not previously authorized.
- The runtime or platform cannot satisfy an exposure gate required for the current environment.

### 11.6 Ambiguity and repeated failure

- The same root cause remains unresolved after the permitted repair attempts.
- Available evidence supports materially different corrections with different business or security consequences.
- Repository state contains an unexplained or unauthorized change.

These conditions are hard stops because they change mission, risk, exposure, or recoverability—not merely because an engineering command failed.

## 12. Data-integrity doctrine

Frequent approval requests are not a substitute for technical integrity controls. Each project must apply controls proportionate to its data and exposure.

### 12.1 Environment separation

- Development, staging, and production are distinct environments.
- Development uses synthetic data unless explicitly authorized otherwise.
- Production credentials are not available to ordinary development workflows.
- An environment guard must prevent a development-only verifier or destructive test from running against production.

### 12.2 Database constraints

Critical invariants should be enforced at the database layer where practical, including ownership boundaries, uniqueness, required relationships, restrictive deletion, immutable history, and bounded values.

Application validation improves feedback but does not replace database enforcement.

### 12.3 Transactional verification

Synthetic database behavior checks should run inside transactions that always roll back. Verification must confirm final emptiness when the mission requires an empty baseline.

### 12.4 Migration integrity

- Generated migration SQL must be reviewed before application.
- Dependency order must be rehearsed before application when migrations contain interdependent objects.
- An unapplied migration may be corrected within approved semantics.
- Once applied in any shared environment, a migration is immutable.
- Corrections after application use a new forward migration.
- Migration-ledger entries are created only by the approved migration mechanism.
- Migration hashes, timestamps, catalog state, and row counts are verified after application.

### 12.5 Reversibility and recovery

Prefer transactions, additive changes, feature isolation, and recoverable Git operations. Destructive changes require a specific recovery plan and human authorization.

### 12.6 Sensitive information

Secrets, passwords, tokens, session material, raw payment credentials, and unapproved personal information must not enter Git, prompts, fixtures, logs, or diagnostic output. Errors must be sanitized without suppressing information needed to diagnose the defect.

## 13. Verification and acceptance

### 13.1 Freeze acceptance before implementation

The implementation specification must define the acceptance evidence before work begins. Review may identify a genuinely omitted material requirement, but it may not continuously add nonmaterial proof obligations.

### 13.2 Verify at the right layer

Use complementary evidence rather than duplicating exhaustive proofs:

| Layer | Primary proof |
|---|---|
| Pure domain and authorization logic | Unit tests and property-oriented cases |
| Input and shared contracts | Contract tests and boundary cases |
| Database structure | Catalog and migration inspection |
| Critical database behavior | Focused transactional integration tests |
| API behavior | Request/response integration tests |
| Client behavior | Component and browser checks |
| Runtime configuration | Build, startup, health, and readiness checks |
| Production readiness | Approved security, recovery, monitoring, and exposure gates |

An executable database verifier should prove database-specific invariants. It need not independently reproduce every pure application-policy proof already established by authoritative unit tests unless the implementation specification identifies a concrete cross-layer risk.

### 13.3 Tests are evidence, not authority

When an existing test conflicts with a newly approved authoritative requirement, correct the stale test. Do not preserve an incorrect test merely because it predates the approved change.

When the system correctly enforces a requirement but a verifier expects the wrong implementation mechanism or error code, correct the verifier while preserving the required behavior.

### 13.4 Review finding classification

Every review finding must be classified:

1. **Blocking:** invariant violation, security defect, data-integrity risk, failed frozen acceptance requirement, or unexplained state.
2. **Ordinary repair:** clear defect within delegated authority; correct and continue.
3. **Future improvement:** beneficial but not required for the approved end state; record in backlog without blocking acceptance.

Independent review occurs at the planned gate. A review of the repair confirms disposition of its blocking findings; it does not restart architecture review or create an unlimited review loop.

### 13.5 Acceptance

Work is accepted when:

- The approved end state exists.
- Protected invariants remain satisfied.
- Frozen acceptance checks pass.
- Required environment and database postconditions are confirmed.
- Temporary artifacts and synthetic data are removed.
- The final diff is explained and within authority.
- Remaining nonblocking improvements are identified separately.

## 14. Git and repository control

### 14.1 Preflight

At the start of a new implementation package, establish:

- Current branch and HEAD
- Upstream reference
- Local and live remote state
- Ahead/behind count
- Working-tree and staging state
- Untracked non-ignored files
- Absence of secrets and unwanted attachments

The clean synchronized preflight is performed once at the start of the package. Continuations validate accumulated authorized state; they do not require returning to the original clean baseline.

### 14.2 Authentication boundaries

If an implementation-agent subprocess cannot authenticate to GitHub but a human-controlled shell or trusted repository UI can perform a fresh authenticated fetch, the agent may validate the resulting `FETCH_HEAD`, remote-tracking reference, commit identity, timestamp, and ahead/behind state. It should not repeatedly demand credential reconfiguration when current repository evidence establishes the required state.

### 14.3 Checkpoints

Automatic local checkpoint commits do not create or revoke implementation authority. The agent must inspect the complete accumulated diff and continue when every change is explained by the approved mission.

Stop only when a checkpoint contains an unexplained change, unauthorized scope, secret, unwanted generated artifact, or protected-document modification.

### 14.4 Commit and synchronization

Unless project standing orders provide otherwise:

- The implementation agent may create local commits or accept automatic checkpoints.
- Final push or synchronization requires human authorization.
- Publication and deployment require separate explicit authorization.
- Final synchronization must confirm a clean working tree and zero ahead/behind.

### 14.5 Uploaded and generated assets

- Files under `attached_assets/` are non-canonical working artifacts unless explicitly adopted.
- Prompt copies, draft duplicates, screenshots, and transient diagnostics must not enter a final implementation commit.
- Before commit and push, verify that no unintended attachment is tracked, staged, or untracked within the delivery boundary.
- A committed secret triggers an immediate credential and history-remediation decision.

## 15. Runtime and platform exceptions

A version mismatch does not automatically block unpublished synthetic-only development.

The decision authority may approve a temporary bounded exception when:

- The available version remains compatible with the approved implementation.
- The application is unpublished and has no real users.
- Only synthetic data is used.
- Development and production remain separated.
- Tests and builds pass on the actual runtime.
- Explicit exposure gates require reevaluation before publication, real-data use, external integration, or production deployment.

The exception should identify what event ends it. A newer platform release does not invalidate working software merely because its version number changes. Compatibility and exposure determine the gate.

## 16. Reporting doctrine

Reports should support decisions rather than reproduce every internal action.

### 16.1 Progress reporting

During implementation, report:

- Material assumptions
- Meaningful deviations from the planned method
- Hard-stop conditions
- Changes in exposure or recoverability

Ordinary successful commands and repairs may be summarized.

### 16.2 Stop report

A stop report should state:

- The actual blocker
- Why it crosses delegated authority
- The smallest decision required
- Current Git, database, environment, and recovery state
- What was not attempted

It should not ask for authorization when the correction is already delegated.

### 16.3 Final handoff

A final handoff should state:

- Accepted outcome
- Material files and database objects changed
- Migration and ledger state
- Test, coverage, build, runtime, endpoint, and browser results as applicable
- Data and environment postconditions
- Git state and synchronization status
- Deferred nonblocking improvements

## 17. Starting a new Springboard software project

Use this sequence:

1. Adopt a specific approved version of this governance document.
2. Identify the human decision authority and project roles.
3. Create the project’s Product Constitution.
4. Create the System Architecture.
5. Create the Domain Model and Security and Audit document when applicable.
6. Create specialized durable runtime documents only where the product requires them.
7. Create the repository operating control, such as `replit.md`, referencing this governance document.
8. Establish Foundation 001 for repository, runtime, database, logging, testing, and environment boundaries.
9. Use bounded specifications for subsequent Class C implementation packages.
10. Require a controlled-exposure review before real users, real data, public release, or production deployment.

Project-specific documents must not be copied from another project without replacing its business purpose, domain, security classification, architecture, repository references, providers, and exposure assumptions.

The governance method may be reused; the product definition may not be assumed.

## 18. Required alignment of repository operating controls

When this governance document is approved, each project’s `replit.md` or equivalent should be reviewed for alignment. The repository control should expressly state:

1. The implementation agent receives delegated engineering authority within an approved mission.
2. Ordinary command failures use root-cause repair and do not automatically require human authorization.
3. Directly coupled tests, fixtures, exports, verifiers, and unapplied migration metadata are within the implementation boundary unless excluded.
4. Repair limits are counted by repeated attempts at the same root cause.
5. Acceptance criteria are frozen before implementation and cannot expand through recursive review.
6. Review findings are classified as blocking, ordinary repair, or future improvement.
7. Applied migrations are immutable; unapplied migrations may be corrected within approved semantics.
8. Human-assisted authenticated Git evidence may satisfy preflight when agent subprocess authentication is unavailable.
9. Hard stops are based on changed mission, invariant, exposure, recoverability, or unexplained state—not on the mere existence of a failed command.
10. Final push, publication, deployment, production access, and destructive recovery remain human-controlled unless an approved standing order says otherwise.

Project-specific product, security, and architecture documents need not duplicate these process rules. They should be amended only when their substantive project rules require correction.

## 19. Governance maintenance

This document may be changed only through:

1. A clearly identified draft.
2. Complete human review.
3. Explicit approval by the decision authority.
4. A versioned approved artifact with SHA-256.
5. Canonical placement, commit, and synchronization.
6. Alignment review of affected repository operating controls and templates.

Lessons from implementation should improve governance when they reveal a recurring decision-right, exposure, integrity, or workflow problem. A one-time coding defect should ordinarily improve tests or tooling rather than expand permanent governance.

## 20. Approval record

**Approval status:** Approved — Controlling Software Development Governance  
**Approved by:** Judson Malone, Executive Director  
**Approval date:** September 14, 2026  
**Approved version:** 0.2  
**Controlling Git reference:** Established by the synchronized `origin/main` commit containing this exact approved version  

This is the distinct approved artifact. It becomes operational for a project only after byte-identical placement at the canonical path, commit and synchronization to that project's controlling repository, and alignment of the repository operating control. Until those steps are complete, the project's existing approved operating control remains active.

The September 14, 2026 approval authorizes the specified amendments to the previously approved version. The exact revised artifact is identified by its complete-file SHA-256 in `PROVIDER_MESH_AMENDMENT_REGISTER_20260914.md`. Prior-version and amendment-proposal hashes above identify their respective source artifacts; neither is the checksum of this revised file. Canonical placement and synchronization are recorded separately.
