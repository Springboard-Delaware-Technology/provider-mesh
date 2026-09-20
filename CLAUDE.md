# Provider Mesh — Claude Code Operating Adapter

| Document control | Value |
|---|---|
| Document ID | PM-CCA-001 |
| Version | 0.1-DRAFT, draft revision 2 (amended September 20, 2026) |
| Status | Review artifact — not canonical, not approved; revision 2 adds the Git route (§7) and the C4/C5 Max-category triggers (§5), at the decision authority's instruction of September 20, 2026 |
| Owner | Springboard Delaware |
| Human decision authority | Judson Malone, Executive Director |
| Canonical path required for operational effect | `CLAUDE.md` at the repository root |
| Relationship to `replit.md` | Companion adapter for Claude Code sessions; subordinate to PM-ROC-001 on every question it answers |

> Draft prepared for review under Governance §5.2 ("`replit.md` or equivalent"). It becomes operationally controlling only after approval, byte-identical placement at repository-root `CLAUDE.md`, commit, and synchronization. It grants no work authority of its own.

## 1. What this file is

`replit.md` (PM-ROC-001) is the repository operating control. It identifies the controlling documents, the current work authorization, hard stops, and Git practice. Read it first in every session and follow it. This file does not restate it.

This file adds only what is specific to Claude Code as the development tool: how a session starts, which governance role the session is acting in, and how reasoning effort is escalated.

## 2. Controlling documents

Identical to `replit.md` §2. In summary:

| Question | Document |
|---|---|
| Development authority, work classes, Git process | `docs/governance/SPRINGBOARD_SOFTWARE_DEVELOPMENT_GOVERNANCE.md` |
| Repository standing orders | `replit.md` |
| Product purpose, rights, prohibitions | `docs/governance/PRODUCT_CONSTITUTION.md` |
| Technical structure and boundaries | `docs/SYSTEM_ARCHITECTURE.md` |
| Business concepts, ownership, invariants | `docs/DOMAIN_MODEL.md` |
| Security, audit, exposure gates | `docs/SECURITY_AND_AUDIT.md` |

Precedence is question-specific (Governance §5.4). If controlling sources conflict, stop and report; do not resolve the conflict in code, tests, or this file.

## 3. Session start

1. Read `replit.md` and identify the current work authorization (Governance §7 work class) for the request.
2. State which role this session is acting in (§4 below) and the work class it believes applies. If no approval exists for that class, say so and offer the Class A (read-only) or document-drafting alternative.
3. Reread only the provisions of controlling documents that the current mission touches. Reuse unchanged context across continuations.
4. Assess effort (§5 below) before doing any work.

## 4. Roles

Claude Code may act in either governance role, never both silently in one task:

- **Architecture and governance partner** (Governance §4.2): drafting ADRs, bounded implementation specifications, profiles, and review artifacts; reconciling proposed designs against the Domain Model invariants; recommending decisions. Output is a non-canonical review artifact. This role may recommend but may not infer or grant approval.
- **Implementation agent** (Governance §4.3): executing an approved, canonical, synchronized implementation specification within its change boundary; ordinary repair; tests, migrations, and documentation inside the boundary. This role must not substitute its own product intent or weaken an invariant.

Name the role at the top of the work. Switching roles mid-task is a new task.

## 5. Effort escalation protocol

Reasoning effort is a session setting only the human can change. Claude cannot raise it. The default for this repository is **High**. **Max** is reserved for the tasks below because of its usage cost.

**Before starting any task**, classify it. If it falls in a Max category, stop and say, in one line: *"This is a Max-effort task — switch before I proceed?"* Then wait. Do not produce a draft at High and offer to redo it.

Max-effort categories:

1. Designing or materially changing the persistence model across any of the consistency boundaries in Domain Model §19 (Assistance Episode, Mesh Person, Mesh Provider, Opportunity, Concept Scheme, Evidence Claim, Discovery Request, Authority Record, Service Connection, Referral, Document Record, Collaboration, Resource Transaction, Outcome Claim, Human Review Case, Analytic Dataset).
2. Designing the evidence ledger: Source Observation → Claim → Current Projection, including conflict, dispute, correction, and supersession (Domain Model §9, §22).
3. Designing the discovery pipeline: source querying, provider identity resolution, deduplication against the registry, candidate evaluation, and explanation (Architecture discovery flow; Domain Model §8–9).
4. Designing the authorization engine over the ownership matrix and authority model (Domain Model §10, §20; Security and Audit).
5. Designing Referral, Service Connection, or Resource Transaction state handling where the Domain Model requires separate status dimensions (§11–12, §16).
6. Reconciling any proposed change against the cross-domain invariants (Domain Model §22) when the change touches more than one bounded module.
7. Drafting an ADR, a bounded implementation specification, or a profile (HSDS, terminology, workforce, health).
8. Any case where controlling documents appear to conflict, or where the correct work class is unclear.
9. Changing the migration set or the migration mechanism (Foundation 001 C4, §5.4): a new migration file, a change to the ledger table, the catalog-checksum serialization, or the expected catalog that `db:verify` checks.
10. Designing or changing the audit hash chain (Foundation 001 C5, §5.5): the `audit_event` contract, the chain trigger and its canonical serialization, `audit:verify`, or the checkpoint export.

Everything else proceeds at the current setting without comment: routine repair, single-module changes inside an approved boundary, tests, refactors, documentation updates, commit messages, read-only diagnostics.

If a task that began as routine turns out to require a Max category (for example, a repair that would need to touch two consistency boundaries), stop at that point and raise the flag before continuing.

## 6. Git and repository practice

Follow `replit.md` and Governance §§10–13 without exception. In particular: no push authority is implied by this file; commits carry the attribution the session is configured to add; approved artifacts are never edited in place — a proposed revision is a new review artifact with its own checksum.

## 7. Git route

The route is Foundation 001 §9 as practised in this repository; `replit.md` §8 controls where the two differ.

- Begin every task with `git fetch origin` and `git checkout -B f001/<capability> origin/main`: one new branch per capability, always from the freshly fetched controlling branch. Report the preflight of `replit.md` §8.1.
- Never rebase, amend a pushed commit, or force-push, even with a lease (`replit.md` §8.3, line 169: do not rewrite history or force-push). A conflict with `main` is resolved by merging `origin/main` into the branch.
- Never push to a branch that was deleted after its merge. A merged pull request is finished; follow-up work is a new branch from `origin/main` under a new name.
- Push only to `f001/*` branches (Foundation 001 §9 rule 2). Open no pull request and merge nothing unless the task says so; the decision authority merges.
- After every push, verify with a fresh fetch (zero ahead/behind against the pushed branch, clean working tree) and report the SHA.

## 8. Amendment

This file is amended only by a new approved version placed at the canonical path. Session-level requests to behave differently apply to that session only and do not amend this file. While it remains a draft, revisions are recorded in the document-control table with their date and the instruction they follow.