# Provider Mesh — Foundation 001 v0.1 Approval and Issuance Record

| Record field | Value |
|---|---|
| Document | Foundation 001 — Repository, Runtime, Environment, and Data Boundaries — PM-BIS-001 |
| Document type | Bounded implementation specification (Governance §5.2, §7.3); Class C authorization on canonical placement |
| Approved version | 0.1 |
| Approved by | Judson Malone, Executive Director, Springboard Delaware, acting as delegated product authority and, pending assignment of the security-owner function under Security §3.1, as the security authority for this decision |
| Approval date | September 19, 2026 |
| Source candidate | `FOUNDATION_001_v0.1_APPROVAL_CANDIDATE.md` — 0.1-WIP, draft revision 5 |
| Source candidate SHA-256 | `39a863a758d9fd5fd079f42173dd551351d0ea27b783f340de9ccf207aa03a99` |
| Source candidate size | 63,881 bytes |
| Distinct approved artifact | `FOUNDATION_001_v0.1_APPROVED.md` |
| Complete approved artifact SHA-256 | `19fe5118479f6c3ea2e10149d6f7c59fd5d21217f3109417f2a6f95ac94c6945` |
| Approved artifact size | 65,500 bytes |
| Canonical destination | `docs/specs/FOUNDATION_001.md` |
| Draft-review evidence | `FOUNDATION_001_v0.1_DRAFT_REVIEW_RECORD_20260919.md` — SHA-256 `70d2fe55faade71cdfc35ed10ccc4229a5fa5fea2f15842fee8345ef057b8689` (22,187 bytes) — destination `docs/reviews/2026-09-19/` |
| Repository placement, commit, and synchronization | Pending; not performed or attested by this issuance record |
| Authority granted on placement | Class C implementation of the specified package in the development environment only, subject to the preflight in `replit.md` §4 and §8 and the §8 precondition (development-tool terms recorded) |
| Deployment, public exposure, production environment, and real personal-information processing authority | None |

## 1. Exact human approval statement

The following statement was supplied by Judson Malone in the project conversation. Formatting is retained.

> I, Judson Malone, Executive Director of Springboard Delaware, acting as delegated product authority and — pending assignment of the security-owner function under Security §3.1 — as the security authority for this decision, approve Foundation 001 — Repository, Runtime, Environment, and Data Boundaries, Document ID PM-BIS-001, candidate version 0.1-WIP, draft revision 5, for issuance as approved version 0.1.
> This approval applies to the exact file:
> `FOUNDATION_001_v0.1_APPROVAL_CANDIDATE.md`
> Candidate SHA-256:
> `39a863a758d9fd5fd079f42173dd551351d0ea27b783f340de9ccf207aa03a99`
> I authorize preparation of the distinct approved artifact and its storage prompt for canonical placement at `docs/specs/FOUNDATION_001.md`, together with placement of the approval record and draft-review evidence at `docs/reviews/2026-09-19/`.
> On canonical placement and synchronization, this approval authorizes the Class C work the specification describes, in the development environment only, under its change boundary, invariants, excluded scope, and frozen acceptance evidence. It does not authorize deployment, public exposure, creation of a production environment, or processing of real personal information.
> Approved by: Judson Malone, Executive Director
> Approval date: September 19, 2026

## 2. Issuance changes

The exact candidate was verified against the approved checksum before preparing a separate approved file. The candidate remains unchanged. The approved file differs from the candidate only by the administrative substitutions below; the candidate checksum must not be used to verify the approved file.

| Location | Administrative change |
|---|---|
| Document control — Version | `0.1-WIP, draft revision 5` → `0.1` |
| Document control — Status | Review-artifact status → "Approved — Controlling bounded implementation specification; operational effect requires canonical placement, commit, and synchronization" |
| Document control — canonical path | "Proposed canonical path" renamed "Canonical path required for operational effect"; six rows added recording approver, approval date, approved source candidate, source candidate SHA-256, approval record path, and draft-review evidence path |
| Notice paragraph | Review notice replaced by the approved-artifact notice, stating the authority the placement confers (Class C, development only, under §1.4, §1.5, §1.7, §12) and what it does not confer |
| §17 introduction | "They take effect through approval of the resulting artifact under Governance §8" → "They took effect through the approval recorded in §19" |
| §19 approval table | Placeholder fields completed with approval status, version, approver and capacities, date, source candidate, candidate checksum, canonical path, and pending canonical reference |
| §19 closing paragraph | Replaced by §19.2 "Approval and remaining steps," which points to this record and states the preflight and precondition that follow placement |

These are 7 administrative substitutions. Sections 1–18 of the approved file are byte-identical to the candidate except for the single §17 sentence listed above. No mission-brief element, invariant, exclusion, change-boundary entry, delegated decision, escalation event, technical decision, control mapping, tool-profile term, Git rule, CI step, acceptance item (A01–A28), or traceability entry was changed.

## 3. Focused verification results

**Result: integrity and structure checks passed on September 19, 2026.** These checks verify document issuance; they are not application tests and are not evidence that any part of the package has been built.

- The source candidate hashes to `39a863a758d9fd5fd079f42173dd551351d0ea27b783f340de9ccf207aa03a99`, matching the approval statement.
- Sections 1–18 of the approved file are byte-identical to the candidate except for the one §17 sentence in section 2.
- All 19 numbered sections remain present and in order; §19.2 is the only added heading.
- All 17 Markdown tables retain consistent column counts.
- The 28 acceptance items A01–A28 are unchanged and contiguous.
- The draft-review evidence record hashes to `70d2fe55faade71cdfc35ed10ccc4229a5fa5fea2f15842fee8345ef057b8689`.

## 4. Draft review evidence

The candidate completed the Security §24 draft-review gate through three rounds of independent review by a separate AI context (Governance §4.4): seven blocking defects, nineteen ordinary repairs, and three future improvements on draft revision 1; six issues introduced by the repairs (two blocking) on draft revision 2; and a clear verdict on draft revision 3. Revisions 4 and 5 recorded the decision authority's selections and required values only. The complete reviewer reports, the checksums of each revision, and the drafter's verification of the reviewer's factual claims are retained in the draft-review record.

## 5. Governing artifact dependencies

| Canonical path | Approved version | Complete-file SHA-256 verified at repository commit `f5b6885` |
|---|---|---|
| `docs/governance/SPRINGBOARD_SOFTWARE_DEVELOPMENT_GOVERNANCE.md` | 0.2 | `6ee9834c16aaf8edeeb9c5beacf8b296b57794000bbbd3dab860db22130d2ad7` |
| `docs/governance/PRODUCT_CONSTITUTION.md` | 1.1 | `cfe4b23739fc66556e55621fe489bcf48bd8b5999cc7490610e90c0e14584064` |
| `docs/SYSTEM_ARCHITECTURE.md` | 0.2 | `f003967589d9855c2783827e25db345465f7a7d7ef5906acb354b677644fd419` |
| `docs/DOMAIN_MODEL.md` | 0.4 | `d3930bb06652362fe02f4cccba6a23fed9882c97be4f2012b0ca8eb6a7121b49` |
| `docs/SECURITY_AND_AUDIT.md` | 0.1 | `a2369403483425c58e7ef0c152e99e5b814bb6f1e15f59712790d016a94620f0` |
| `docs/adr/ADR-001-deployment-and-tenancy.md` | 0.1 | `0183776dcd6bafd210e7e434203bf67c145c0573269647fb03b3034166ed2b5a` |

`replit.md` (PM-ROC-001 v0.1) governs repository practice for the placement below. The specification's §16 records that companion amendments to `replit.md` and `CLAUDE.md`, and approval of `CLAUDE.md`, are follow-on items outside this package.

## 6. Remaining steps and preserved boundaries

1. Place the approved artifact byte-for-byte at `docs/specs/FOUNDATION_001.md` (creating `docs/specs/`), this record at `docs/reviews/2026-09-19/FOUNDATION_001_v0.1_APPROVAL_RECORD.md`, and the draft-review record at `docs/reviews/2026-09-19/FOUNDATION_001_v0.1_DRAFT_REVIEW_RECORD_20260919.md`.
2. Verify each placed file's SHA-256 against this record before committing.
3. Commit the three files without unrelated changes and synchronize to `origin/main` under `replit.md` §8.
4. Record the resulting commit hash as the canonical repository reference in a placement-evidence entry; this record does not assert that placement has occurred.
5. Before implementation begins: record the development-tool tiers and terms in `docs/infrastructure/ENVIRONMENTS.md` (specification §8, §17 decision 3); provision the development database by the §6.5 procedure, executed by the decision authority; supply the development credentials by name to Replit Secrets and the scoped GitHub credential to Claude Code (§9); and perform the Class C preflight in `replit.md` §4 and §8.1.

Placement makes Foundation 001 the controlling bounded implementation specification for its package. It resolves `SEC-D08` for this repository's development work and supplies the `SEC-D17` verification baseline for this package only. It does not authorize any later package, any deployment or Preview beyond the development workspace, or any processing of real personal information.
