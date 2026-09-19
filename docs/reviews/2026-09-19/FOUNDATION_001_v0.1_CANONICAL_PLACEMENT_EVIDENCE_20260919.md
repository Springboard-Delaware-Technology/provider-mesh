# Provider Mesh — Foundation 001 v0.1 Canonical Placement and Synchronization Evidence

| Record field | Value |
|---|---|
| Document | Foundation 001 — Repository, Runtime, Environment, and Data Boundaries — PM-BIS-001, approved version 0.1 |
| Approval record | `docs/reviews/2026-09-19/FOUNDATION_001_v0.1_APPROVAL_RECORD.md` |
| Governance steps evidenced | Governance §8 steps 6–7: byte-identical canonical placement; commit and synchronization of the approved documents without unrelated files |
| Canonical repository reference | Commit `3a1a06964497ec72947993d0507f9e2cd55e3186` (`3a1a069`) on `main`, `Springboard-Delaware-Technology/provider-mesh` |
| Parent commit | `f5b688555df5ee64214f4f17e862e8873db76efc` |
| Commit author | Judson Malone, from the Replit Shell (`replit.md` §8.2 human-controlled route) |
| Commit time | 2026-09-19T16:45:46+00:00 (12:45 local, America/New_York) |
| Commit message | `docs: adopt approved Foundation 001 bounded implementation specification v0.1 with approval and review records` |
| Verification performed by | Claude (architecture and governance partner role), by fresh fetch of `origin/main` into an independent clone on September 19, 2026 |
| Result | Foundation 001 v0.1 is canonically placed and synchronized; it is the controlling bounded implementation specification for its package and Class C implementation is authorized subject to the preconditions in section 5 |

## 1. Files placed by the commit

The commit adds exactly three files and changes nothing else (`git show --name-status`: three `A` entries; 854 insertions, 0 deletions).

| Canonical path | Expected SHA-256 (from the approval record) | Verified SHA-256 on `main` at `3a1a069` | Size (bytes) | Result |
|---|---|---|---|---|
| `docs/specs/FOUNDATION_001.md` | `19fe5118479f6c3ea2e10149d6f7c59fd5d21217f3109417f2a6f95ac94c6945` | `19fe5118479f6c3ea2e10149d6f7c59fd5d21217f3109417f2a6f95ac94c6945` | 65,500 | OK |
| `docs/reviews/2026-09-19/FOUNDATION_001_v0.1_APPROVAL_RECORD.md` | `3034015f1fc0942cebd9a7921bdf6248bbf580df4eca8807d74ad8fa8872bd27` | `3034015f1fc0942cebd9a7921bdf6248bbf580df4eca8807d74ad8fa8872bd27` | 9,479 | OK |
| `docs/reviews/2026-09-19/FOUNDATION_001_v0.1_DRAFT_REVIEW_RECORD_20260919.md` | `70d2fe55faade71cdfc35ed10ccc4229a5fa5fea2f15842fee8345ef057b8689` | `70d2fe55faade71cdfc35ed10ccc4229a5fa5fea2f15842fee8345ef057b8689` | 22,187 | OK |

Verification method: `git pull origin main` into a clone independent of the Replit workspace, then `sha256sum -c` against the expected values. All three reported `OK`. The decision authority's own `sha256sum` in the Replit Shell before commit produced the same three values.

## 2. Synchronization evidence

User-supplied Shell output for the push, retained verbatim:

```
~/workspace$ git add docs/specs/FOUNDATION_001.md docs/reviews/2026-09-19/FOUNDATION_001_v0.1_APPROVAL_RECORD.md docs/reviews/2026-09-19/FOUNDATION_001_v0.1_DRAFT_REVIEW_RECORD_20260919.md
git commit -m "docs: adopt approved Foundation 001 bounded implementation specification v0.1 with approval and review records"
git push origin main
[main 3a1a069] docs: adopt approved Foundation 001 bounded implementation specification v0.1 with approval and review records
 3 files changed, 854 insertions(+)
 create mode 100644 docs/reviews/2026-09-19/FOUNDATION_001_v0.1_APPROVAL_RECORD.md
 create mode 100644 docs/reviews/2026-09-19/FOUNDATION_001_v0.1_DRAFT_REVIEW_RECORD_20260919.md
 create mode 100644 docs/specs/FOUNDATION_001.md
Enumerating objects: 13, done.
Counting objects: 100% (13/13), done.
Delta compression using up to 8 threads
Compressing objects: 100% (8/8), done.
Writing objects: 100% (9/9), 35.34 KiB | 11.78 MiB/s, done.
Total 9 (delta 3), reused 0 (delta 0), pack-reused 0 (from 0)
remote: Resolving deltas: 100% (3/3), completed with 3 local objects.
To https://github.com/Springboard-Delaware-Technology/provider-mesh
   f5b6885..3a1a069  main -> main
```

The independent clone's fresh fetch resolved `origin/main` to `3a1a069`, confirming the remote state matches the pushed commit. Working tree clean after fetch.

## 3. Controlling baselines unchanged

After the fetch: `sha256sum -c` against the September 14, 2026 manifest reported `OK` for all eight entries, and `docs/adr/ADR-001-deployment-and-tenancy.md` still hashes to `0183776dcd6bafd210e7e434203bf67c145c0573269647fb03b3034166ed2b5a` as recorded in its approval record. The five controlling specifications, ADR-001, and the September 14 evidence records are byte-identical to their approved versions at `3a1a069`.

## 4. Repository history for the September 19 delivery

| Commit | Content | Route |
|---|---|---|
| `cca62cb` | `LICENSE` (All Rights Reserved) and `CLAUDE.md` operating adapter draft (PM-CCA-001 v0.1-DRAFT, not approved) | Replit Shell |
| `0d28c2b` | ADR-001 v0.1 approved artifact, approval record, and draft-review record | Replit Shell |
| `f5b6885` | Canonical placement evidence for ADR-001 v0.1 | Replit Shell |
| `3a1a069` | Foundation 001 v0.1 approved artifact, approval record, and draft-review record | Replit Shell |

## 5. Effect and preconditions to implementation

With this placement, Foundation 001 v0.1 is the controlling bounded implementation specification for its package (Governance §7.3). Class C implementation is authorized in the development environment only, within the specification's change boundary (§1.7), invariants (§1.4), excluded scope (§1.5), and frozen acceptance evidence (§12).

Before implementation begins, the specification and its approval record require:

1. The development-tool tiers and terms recorded in `docs/infrastructure/ENVIRONMENTS.md` (specification §8, §17 decision 3): Claude Max with "Help improve our AI models" off; Replit Pro 100 billed annually. This record is the first file the package creates and is a precondition under §1.9.
2. The development Neon project provisioned by the §6.5 procedure, executed only by the decision authority from outside any agent context.
3. The development database credentials entered into Replit Secrets by name by the decision authority, and a repository-scoped GitHub credential supplied to Claude Code under §9.
4. The Class C preflight in `replit.md` §4 and §8.1 from a fresh fetch, recorded in the first pull request.

This placement resolves `SEC-D08` for this repository's development work and supplies the `SEC-D17` verification baseline for this package only. It does not authorize any later package, any deployment or Preview beyond the development workspace, creation of a production environment, or processing of real personal information.

This record is evidence of placement. It is not an approved artifact and carries no authority of its own.
