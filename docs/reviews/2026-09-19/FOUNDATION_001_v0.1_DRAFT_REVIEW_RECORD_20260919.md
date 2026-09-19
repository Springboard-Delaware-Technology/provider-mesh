# Foundation 001 v0.1 — Draft Review Record

| Record field | Value |
|---|---|
| Document reviewed | Foundation 001 — Repository, Runtime, Environment, and Data Boundaries, Document ID PM-BIS-001 |
| Gate | Security §24, "Draft review" row; Governance §8 step 3 (human review outside the canonical path) |
| Reviewer | A separate AI context (Claude Opus 5, launched as an independent agent) that did not participate in drafting — permitted under Governance §4.4 |
| Drafter | Claude Fable 5.1, acting in the architecture and governance partner role (Governance §4.2), in the project conversation with the decision authority |
| Review date | September 19, 2026 |
| Decision authority | Judson Malone, Executive Director, Springboard Delaware |
| Outcome | Verdict "Ready for approval candidate" on draft revision 3; revisions 4 and 5 recorded decision-authority selections only |
| Repository location | `docs/reviews/2026-09-19/FOUNDATION_001_v0.1_DRAFT_REVIEW_RECORD_20260919.md` |

This record is review evidence. It approves nothing and authorizes nothing.

## 1. Artifacts reviewed

| Revision | SHA-256 | Role in review |
|---|---|---|
| Draft revision 1 | `d7eb4fc661562a05d97e9c190dd5d375a7aa5b2e0a80c0879c271375121f7aa5` | Initial independent review |
| Draft revision 2 | `a2528e6334b168805b646b5f75dea12c6228ab5f3b95c96bd458dab3fb10826f` | Re-verification; six issues introduced by the repairs |
| Draft revision 3 | `7b2671a09674ca13c2d68b87c45501b46d3b6f48f89d54f8e1a13d1d88b22d0c` | Final verification; verdict ready |
| Draft revision 4 | `1963913f9aef14735d1670b77d6cc5a39346873f6b50f9ff2b4c5d8d68be0e8f` | §17 selections recorded; §19.1 review record added; no other change |
| Draft revision 5 / approval candidate `FOUNDATION_001_v0.1_APPROVAL_CANDIDATE.md` | `39a863a758d9fd5fd079f42173dd551351d0ea27b783f340de9ccf207aa03a99` (63,881 bytes) | §17 decision 3 values recorded (model-improvement setting off; Replit billing cadence); no other change |

Controlling documents used by the reviewer: SB-SDG-001 v0.2, PM-PC-001 v1.1, PM-SA-001 v0.2, PM-DM-001 v0.4, PM-SEC-001 v0.1, PM-ROC-001 v0.1 (all verified against the September 14, 2026 manifest at commit `f5b6885`), and PM-ADR-001 v0.1 at `docs/adr/ADR-001-deployment-and-tenancy.md` (commit `0d28c2b`), together with the draft `CLAUDE.md` and the live `.replit`.

## 2. Review instructions given

The reviewer was asked to perform the draft-review gate's minimum evidence and specifically to check: Governance §6 mission-brief completeness; ADR-001 §13 traceability item by item; conformance with ADR-001 (roles and identities, the six rule-8 sub-controls, audit placement, environment separation); Security conformance (`SEC-AUD-02`, `SEC-AUD-04`, `SEC-DEV-01`, `SEC-PLAT-03`, `SEC-ORG-02`, `SEC-AI-01`, `SEC-D08` profile completeness); Domain Model conformance of the first table (§4, §7, §19, §21, §22); scope discipline against Governance §7.4 and `replit.md` §3/§7; implementability; internal consistency; and citation accuracy (at least 25 spot-checks). Findings were to be classified as blocking, ordinary repair, or future improvement (Governance §13.4).

## 3. Round 1 — review of draft revision 1 (verbatim reviewer report)

> ## Independent draft review — FOUNDATION_001 v0.1-WIP (560 lines)
>
> **Verdict: Not ready — blocking defects.** The document is structurally strong (Governance §6's ten elements are all present and substantive; §4.2's seventeen module names match Architecture §6.1–§6.17 exactly; no table column mismatches; all A-numbers and C-numbers resolve). Seven defects must be repaired before an approval candidate.
>
> ### Blocking defects
>
> **B1. Line 73 contradicts lines 109, 356, 360, 463, 482, 485.** Invariant 9 ("Protected documents (`docs/**`, …) are not modified by this package") forbids what §1.7 permits and §6.1/§6.2 require — creating `docs/infrastructure/ENVIRONMENTS.md` and `RELEASE_RECORD_TEMPLATE.md`. Three acceptance items (A01, A20, A23) depend on files an invariant forbids. Governance §11.1 makes a material internal conflict a hard stop. Repair: except `docs/infrastructure/**` in invariant 9.
>
> **B2. Line 103 — change boundary cannot produce the stated baseline.** The repository's actual `.replit` is `modules = ["python-base-3.13"]`. The Node.js/TypeScript baseline in §3 requires changing `modules`, which the permitted list ("Run and build commands and Nix channel") excludes. Under Governance §11.5 and replit.md §7 the agent must stop on its first action. Add `modules` (and ports, if a Run workflow is used) or state the exact permitted end state.
>
> **B3. Line 303 — compartment references incomplete against ADR-001 §5.1 (ADR §13 item 6).** ADR §5.1 names, as references carried by the record, the *contributing* Organization "where different" and the effective *Charter Version* alongside the Collaboration. Neither appears. Applied migrations are immutable (Governance §12.4), so the omission is durable.
>
> **B4. Line 303 — `lifecycle_state` in `open | paused | closed`, cited to Domain Model §21.1.** §21.1 lists event *names*; the episode lifecycle is Domain Model §7.5, which enumerates eight states (open for clarification, active in discovery, awaiting choice, preparing handoff, referred, paused, closed procedurally, reopened). A three-value CHECK in the first, immutable migration fixes product semantics reserved to the Assistance specification (Governance §11.1). Repair: omit the constraint and record the vocabulary as reserved, or enumerate §7.5.
>
> **B5. Lines 389 and 398 — §7.2 names two controls as satisfied that this package does not satisfy.** (a) `SEC-BOUND-01` requires equivalent policy evaluation at every entry and exit; it is an authorization control, and §1.5 line 85 excludes the authorization engine. The module-import check (A03) is unrelated. (b) `SEC-AUD-04` requires "restricted append, **independent** integrity checkpoints, **retention protections**, and verification," and states that a chain held entirely under one administrator is insufficient. Here the checkpoint lands in a local filesystem dev adapter under the same operator (lines 236, 295), with no retention protection — as §3 line 160 and §5.5 rule 4 themselves say. SEC-PRIV-04 forbids marking an unsatisfied mandatory requirement as passed. Reword both rows as partially exercised, with the deferred elements named.
>
> **B6. Lines 252, 272, 523 — §17 decision 1 has no compliant mechanism.** §5.3 rule 6 has the instance marker written by the migration mechanism, which §5.2 runs as `mesh_migrate` from `db:migrate`/CI. Writing a *production* marker therefore requires a production credential in the development workspace or CI. ADR-001 §8.3 forbids that absolutely ("development tools hold development-environment credentials only, never staging or production credentials"), and ADR §6.1 rule 1 forbids environments sharing a secret or service identity. §5.1 line 250 puts connection strings in Replit Secrets without excluding production. Either specify a human-executed provisioning path outside the development workspace, or recommend deferral.
>
> **B7. Line 547 — ADR-001 §13 item 13 is not satisfied.** Item 13 requires provisioning of the database project *and* its roles "as code or as a versioned, scripted procedure sufficient to recreate it" (ADR §4.3 rule 2). §6.1 records *facts* (owner, project, region, tier, version, encryption, databases, roles, secret names, marker, CI config, backup setting, restore plan) — a record is not a procedure. Roles are covered by the first migration; the Neon project, region, tier, two databases and marker values are not, and no acceptance item covers item 13. Add a versioned `scripts/provision/` or `docs/infrastructure/PROVISIONING.md` and an A-item.
>
> ### Ordinary repairs
>
> 1. **Line 356** — records the provider's backup *setting*; ADR §11 rule 1 requires the schedule to be *set* in Foundation 001 (item 9).
> 2. **Lines 538, 356, 485** — state in §6.1 and A23 that no automatically provisioned database exists because nothing is published; that is the only available evidence for item 4's "verified unused," and §6.2 only creates an uncompleted template.
> 3. **Lines 342, 435** — `ci` is not an ADR §6.1 environment; declare CI development-class (ADR §6.1 rule 3) so the rule 6 guard's "does not identify a development instance" test is satisfiable.
> 4. **§5.2** — no identity named for the job runner, which ADR §8.2 lists and §5.7/§4.4 build. State it runs as `mesh_app` and holds no broader privilege.
> 5. **Line 391** — `SEC-DATA-01`–`03` mapped to "A14, A16"; A14 is the audit chain test. Should be A16/A17.
> 6. **Lines 523–529** — §17 decisions 2, 3, 4 and 5 are already decided in the text (§3 lines 160, 164; §5.1 line 250; §1.7 line 103; §10), and line 529 says tools and CI "are not reopened here" while decisions 3 and 5 reopen exactly those. Label them ratification of drafted defaults.
> 7. **Lines 288, 292** — the audit hash protocol is ambiguous: `sequence` is database-assigned but `hash` covers the row, and the spec does not say whether the trigger or the Audit Service computes `hash`, nor how concurrent appends serialize against the head. Two engineers would build materially different mechanisms.
> 8. **Line 470 (A08)** — setting `DATABASE_URL` to an invalid value and confirming no attempt does not prove the variable is never read. Restate as "no connection attempted to any host other than `PROVIDER_MESH_DATABASE_URL`," plus a repository-wide static check (§4.1 already implies one).
> 9. **Line 482 (A20)** — "no production credential exists anywhere" is an unbounded negative; bound it to the repository, CI secrets and Replit Secret names.
> 10. **Line 463 (A01)** — "the environment record … is complete" is not testable; enumerate §6.1's fields as a checklist.
> 11. **Line 426** — "public repositories receive both at no cost" assumes the repository is public. If private, push protection requires paid Secret Protection and A19 is unevidenceable. Add an escalation event.
> 12. **Line 422** — required pull requests on `main` conflict with the established direct-to-main documentation workflow in replit.md §8.4. State whether the decision authority retains administrator bypass for canonical document storage.
> 13. **Lines 364, 103** — keep the prepared production deployment configuration in a document under `docs/infrastructure/**` rather than an active `.replit` deployment section, and add an acceptance item that `.replit` contains no active deployment section (Governance §7.4; replit.md §8.3).
> 14. **Line 350** — "not exposed beyond the Replit workspace" has no control and no acceptance item; replit.md §7 warns against assuming a development URL is private. Bind to loopback or add an item.
> 15. **§7.2** — SEC-DEV-02 requires the *data class* to be named. Add "public and synthetic only; no protected or restricted personal class present" in Security §5.1 terms.
> 16. **Line 416, A20** — §8 approves the tools but defers the contractual/retention conditions SEC-DEV-01 requires. Since the tools operate from the first commit, make recording them a §1.9 precondition, not only acceptance evidence.
> 17. **Line 405** — the enumeration stops at `SEC-D13`; Security §23 runs to `SEC-D17`. §15 should also state that §11/§12 supply the `SEC-D17` verification baseline for this package.
> 18. **Line 288** — SEC-AUD-02's Actor group names organization/**unit**/capacity; the column list omits unit.
> 19. **Line 303** — nullable `subject_person_id` is cited to Domain Model §22.4; the on-point rule is §7.7 invariant 1.
>
> ### Future improvements
>
> - §11's port contract tests appear in no A-item; A24 covers them only indirectly.
> - Record the provisional row-level policy's version in `db:verify` so the superseding migration (§16 item 6) is verifiable.
> - Confirm the `ObjectStore` dev adapter's git-ignored directory is also covered by the §10 step 7 secret scan.
>
> ### ADR-001 §13 coverage
>
> | # | Status |
> |---|---|
> | 1 Runtime/framework/DB/object storage/jobs via ports | Satisfied (§3, §4.4) |
> | 2 Dev environment, synthetic source, tool profile | Satisfied (§5.1, §5.9, §8) — see repair 16 |
> | 3 Reduced profile or no-deployment statement | Satisfied (§6.4, §1.2 item 12, A23) |
> | 4 Springboard DB, one variable, marker, assertions, auto-DB verified unused | **Partial** — first four satisfied (§5.3, A08, A09); "verified unused" not stated or evidenced (repair 2) |
> | 5 Per-environment identities; runtime cannot alter audit | **Partial** — §5.2, §5.5, A13 cover the three required; job-runner identity unaddressed (repair 4) |
> | 6 Compartment references and RLS on first protected table | **Partial** — isolation satisfied (§5.6, A10–A12); references incomplete (B3) |
> | 7 Key-service port over dev secret store | Satisfied (§4.4) |
> | 8 Logging excludes content | Satisfied (§5.8, A16) |
> | 9 Backup schedule and first restore-test plan | **Partial** — plan present; schedule not set (repair 1) |
> | 10 Event and command contract conventions | Satisfied (§5.7, A18) |
> | 11 Certificate verification on every client | Satisfied (§5.3 rule 2, A07) |
> | 12 One migration path; environment guard | Satisfied (§5.4, §5.9, A04–A06, A17) — see repair 3 |
> | 13 Provisioning as code or scripted procedure | **Missing** (B7) |
>
> ### Citation spot-check
>
> 42 checked, 36 correct, 6 incorrect or imprecise.
>
> Incorrect: line 303 "Domain Model §21.1" for `lifecycle_state` (states are §7.5); line 303 "§22.4" for anonymous episodes (should be §7.7 invariant 1); line 389 `SEC-BOUND-01` mapped to the module boundary check; line 391 `SEC-DATA-01`–`03` mapped to A14; line 398 `SEC-AUD-04` claimed satisfied; line 324 attributes `causation_id` to Architecture §11.2, which names only correlation and idempotency keys.
>
> Verified correct include: Governance §4.2–§4.5, §5.2, §6, §7.3, §7.4, §10, §11.2–§11.4, §12.1, §12.3, §12.4, §12.6, §13.1, §13.2, §13.5, §14.4, §14.5, §15; ADR-001 §5.1, §5.3, §6.1 rule 6, §6.3 rules 1/7/8, §6.5, §8.2, §9.1 rule 3, §11 rule 2, §14 decision 4, §15; Architecture §6.1–§6.17 (all seventeen module names), §13.4, §16 item 11, §17; Domain Model §4.1, §4.2, §4.4, §17.4, §19, §21; Security §5.1, SEC-AUD-02, SEC-DEV-01, SEC-DEV-02, SEC-ORG-02, SEC-GATE-02, SEC-RET-04, SEC-PLAT-03; replit.md §1, §5, §7, §8.1, §8.2, §8.4, §9, §10, §11. The ADR-001 baseline reference on line 15 (`0d28c2b`) is also correct — the ADR was placed at that commit.
>
> ### Scope discipline
>
> No Class D authorization is granted and no Constitution §7 prohibition is engaged; §1.5's exclusions match replit.md §3/§7 and ADR §3.2. §2's two-agent division is consistent with replit.md §8.2 (repair 12 is the one friction point). The only scope concern is repair 13 (a production deployment section written into the live `.replit`).

The drafter verified the reviewer's factual claims (the live `.replit` contents, Domain Model §7.5 and §7.7, the `SEC-D14`–`SEC-D17` register entries, Architecture §11.2) against the controlling documents before applying repairs. All were accurate. All seven blocking defects, nineteen ordinary repairs, and three future improvements were addressed in draft revision 2.

## 4. Round 2 — re-verification of draft revision 2 (verbatim reviewer report)

> ## Verification — Foundation 001 draft revision 2 (569 lines, SHA-256 a2528e63… confirmed)
>
> **B1–B7: all RESOLVED.** B1 line 73 (exception matches line 109). B2 line 103 + A26 line 494. B3 line 304 (`contributing_org_id`, `charter_version_id` with check constraint). B4 line 304 (unconstrained text; DM §7.5/§7.7 cited correctly). B5 lines 395, 404. B6 lines 253, 532. B7 §6.5 lines 372–374, A27 line 495, §18 line 556.
>
> **Ordinary repairs 1–19: all RESOLVED.** 1 line 358; 2 lines 358/491/547; 3 line 344; 4 line 264; 5 line 397; 6 lines 532–538; 7 line 293; 8 line 476; 9 line 488; 10 line 469; 11 lines 137/432; 12 line 428; 13 lines 366/494; 14 line 352; 15 line 397; 16 line 422; 17 line 411; 18 line 289; 19 line 304.
>
> **Mechanical checks.** Table column counts: no mismatches anywhere. A-numbers: 28 defined, A01–A28 contiguous, none referenced-undefined. §6.5 and the new `causation_id` row are well-formed. §15/§7.2 now account for all seventeen `SEC-D` entries.
>
> ### New defects introduced by the repairs
>
> **N1 (blocking) — line 374.** "(or by Claude Code with the development credential)". A Neon credential able to create a project, databases and roles is an account control-plane credential, not a development-database credential. This contradicts line 251 ("no agent sees or handles a value"), ADR-001 §8.3 (development tools hold development-environment credentials only) and ADR-001 §8.1 (named individuals, phishing-resistant authentication for privileged control-plane access). Nothing bounds the credential to one project — the same key reaches the Portal's production project in the same account. Repair: delete the parenthesis; §6.5 is executed by the decision authority only.
>
> **N2 (blocking) — line 441 vs lines 264, 283.** CI step 3 still creates "both databases and the four roles **from the first migration**", while §5.2 and §5.4 now say §6.5 creates them and the first migration only *verifies* them. A06/A27 cannot both pass as written. Repair: CI step 3 runs the §6.5 container-supported steps for databases and roles too.
>
> **N3 (ordinary) — line 482 (A14).** "Chain trigger rejects an insert with a wrong `prev_hash`", but §5.5 rule 1 now has the trigger *overwrite* any client-supplied `prev_hash`. As written A14 is unsatisfiable. Restate as: a forged `prev_hash`/`sequence`/`hash` is overwritten, and `audit:verify` detects a row altered afterwards.
>
> **N4 (ordinary) — line 215.** The §4.2 tree omits `DEPLOYMENT_PREPARED.md` and `scripts/provision/`.
>
> **N5 (ordinary) — stale cross-references.** Line 40 cites §6.4 for the prepared configuration (now §6.3). Lines 89 and 501 still describe a production project "created under §17 decision 1", which now defers.
>
> **N6 (minor) — line 293.** SECURITY DEFINER is a property of the trigger *function*, not the trigger.
>
> **Verdict: Not ready** — N1 places a privileged control-plane credential with an AI development tool contrary to ADR-001 §8.1/§8.3 and the spec's own §5.1, and N2 is a role-provisioning contradiction that two acceptance items depend on. N3–N6 are one-line corrections. No other repair introduced a conflict with a controlling document; revision 3 should be approvable.

All six were resolved in draft revision 3.

## 5. Round 3 — verification of draft revision 3 (verbatim reviewer report)

> ## Verification — Foundation 001 draft revision 3 (570 lines, SHA-256 7b2671a0… confirmed)
>
> **N1 RESOLVED — line 375.** §6.5 now reads "executed only by the decision authority, from outside any agent context, with an account credential that no agent ever holds (ADR-001 §8.1, §8.3); … Agents may author and test the script against the CI container; they never run it against a Neon account." Consistent with lines 252 and 254 and with A27 (line 496), which no longer claims agent execution.
>
> **N2 RESOLVED — line 442.** CI step 3 now runs "the §6.5 procedure's container-supported steps to create both databases, the four roles with their grants, and a CI instance marker." Agrees with lines 265, 274 and 284 (migration verifies, does not create).
>
> **N3 RESOLVED — line 483.** A14 restated as overwrite-then-verify, matching §5.5 rule 1 (line 294).
>
> **N4 RESOLVED — lines 215, 216.**
>
> **N5 RESOLVED — line 40 (§6.3, §6.4), line 89 (production project deferred), line 501 ("No production project exists in this package").**
>
> **N6 RESOLVED — line 294**, SECURITY DEFINER declared on the function.
>
> **No new conflicts.** Cross-references resolve; A01–A28 contiguous with none referenced-undefined; §18 rows 4, 9 and 13 still match their targets; §17 decision 1 agrees with §1.5, §5.1 and §13. **Table column counts: no mismatches anywhere in the document.**
>
> **Verdict: Ready for approval candidate** — all seven original blocking defects, nineteen ordinary repairs, and six repair-induced defects are resolved, with no controlling-document conflict remaining.
>
> (Note for the record, not a finding: the three future improvements from the first review — a marker for the provisional policy version and secret-scan coverage of the ObjectStore dev directory — remain open and are non-blocking.)

## 6. Revisions 4 and 5

Revision 4 replaced the §17 open-decision table with the decision authority's recorded selections (September 19, 2026) and added §19.1. Revision 5 recorded the values §17 decision 3 requires: the Claude "Help improve our AI models" setting confirmed off by the decision authority on September 19, 2026, and Replit Pro 100 billed annually. The drafter verified by diff that neither revision touched any section reviewed in rounds 1–3 other than §17, the version line, the review notice, and §19. Revision 5 is the approval candidate.

## 7. Summary

| Round | Blocking | Ordinary | Future | Introduced by repairs | Disposition |
|---|---|---|---|---|---|
| 1 (rev. 1) | 7 | 19 | 3 | — | All resolved in rev. 2 |
| 2 (rev. 2) | 0 | 0 | 0 | 6 (2 blocking) | All resolved in rev. 3 |
| 3 (rev. 3) | 0 | 0 | 0 | 0 | Ready for approval candidate |

Citation spot-check: 42 checked in round 1; 36 correct as written; 6 corrected in revision 2. ADR-001 §13 coverage: all thirteen items satisfied as of revision 3.

## 8. Limits of this review

This is a document-level review of conformance to the controlling documents. It is not evidence that any system enforces the specification's provisions, does not assess any vendor, and does not close any `SEC-D` register entry. It does not substitute for the human approval required by Governance §8 step 4.
