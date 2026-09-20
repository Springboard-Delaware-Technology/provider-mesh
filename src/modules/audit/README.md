# Audit Service (`audit`)

|                                           |                                                                                                      |
| ----------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| Architecture section                      | System Architecture §6.17                                                                            |
| Consistency boundaries (Domain Model §19) | — (audit records are a distinct record family, never derived from domain events; Domain Model §17.4) |
| Code under Foundation 001                 | The Audit Service, the canonical serialization, chain verification, checkpoints (C5, §5.5)           |

The Audit Service is the only writer to `provider_mesh_audit`. `src/app` builds the audit-writer
connection (`PROVIDER_MESH_AUDIT_URL`, `mesh_audit_writer`) and injects it here; no other module
receives it for writing, and the domain identity holds no privilege on the audit store — it cannot
even connect (§1.4 invariant 2; A13).

## What lives here

| File                    | Role                                                                                                                                                                                                                           |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `audit-service.ts`      | `AuditService`, the `AuditSink` implementation: `append` (one transaction: `INSERT` of content columns, then the head read through `audit_chain_head` while the chain lock is still held), `chainHead`, and `exportCheckpoint` |
| `event-row.ts`          | `AuditEventInput` → `INSERT`: validation that mirrors the column domains (field names only in errors), and the split of every `Maybe<T>` into its value column and its paired `<column>_absent` reason                         |
| `canonical.ts`          | Canonical serialization version 1 and the SHA-256 over it, the TypeScript mirror of `audit_event_canonical` / `audit_event_hash` in the migration                                                                              |
| `chain-reader.ts`       | Rows in chain order in the canonical text forms (timestamps rendered by the server with six fractional digits in UTC); the head through the view                                                                               |
| `chain-verification.ts` | `ChainWalker` and `verifyChain`: recompute every hash, check each `prev_hash` against the previous `hash` (genesis for sequence 1), check `sequence` for gaps and duplicates, and check the chain against a checkpoint         |
| `checkpoint.ts`         | The checkpoint record (head sequence and hash, verified-at, verifier identity, instance), its keys in the object store, canonical JSON, parsing                                                                                |
| `foundation-events.ts`  | The events the foundation itself produces (§5.5 rule 5): `platform.startup_assertions` and `audit.checkpoint_export`                                                                                                           |
| `absence.ts`            | `UNKNOWN`, `NOT_APPLICABLE`, `absent`, `isAbsent`, `split`                                                                                                                                                                     |

## The chain (§5.5 rule 1)

`audit_event` (`db/migrations/audit/0002_audit_event.sql`) carries the `SEC-AUD-02` field groups
as columns. A `BEFORE INSERT` trigger, whose function `audit_event_chain()` is `SECURITY DEFINER`
and owned by `mesh_migrate`, takes a transaction-scoped advisory lock on the chain, reads the
head, sets `sequence` to head + 1 and `prev_hash` to the head's `hash` (64 zeros for the first
row), sets `recorded_at` to the server clock, and computes `hash` as SHA-256 over canonical
serialization version 1 of every other column. Whatever a writer supplies for those four columns
is discarded. `mesh_audit_writer` holds `INSERT` on the table and `SELECT` on the head view and
nothing else; `mesh_audit_reader` holds `SELECT`; a second trigger refuses every `UPDATE`,
`DELETE`, and `TRUNCATE`, even for the owner. The writer's insert transactions run at PostgreSQL's
default `READ COMMITTED` level; at a stricter level a concurrent append could see a stale head
and fail on the sequence's uniqueness, which fails closed.

**Canonical serialization version 1.** One JSON object; one member per column except `hash`,
keyed by column name, ordered by UTF-16 code units, no whitespace; `null` for NULL; text and
uuid as JSON strings (`to_json(text)` and `JSON.stringify` escape identically: `"` and `\`,
U+0000–U+001F as `\b \f \n \r \t` or lowercase `\u00xx`, everything else raw UTF-8); integers as
digits; timestamps as `YYYY-MM-DDTHH:MM:SS.ffffffZ` in UTC; `authority_refs` as a JSON array.
Adding or removing a column is a new serialization version, shipped by a forward migration that
records the first sequence it applies to and extends the verifier to apply each version to its
own range. A unit test pins the exact form; a database test proves the SQL and TypeScript
implementations agree on rows with quotes, backslashes, non-ASCII text, and microseconds.

**Absence.** Every nullable content column has a paired `<column>_absent` column holding
`unknown` or `not_applicable`; a check constraint requires exactly one of the pair to be null.
The port type carries this as `Maybe<T>`: a value or `{ absent: reason }`, never a bare null.

**Bounds (rule 6).** Codes (`audit_code`) are 1–128 characters of `[A-Za-z0-9_.:/-]`;
references (`audit_ref`) are 1–256 characters without C0, DEL, or C1 control characters;
`authority_refs` holds 1–64 references. No column is free text. A store error may carry a
rejected value in its detail (PostgreSQL's constraint messages do); `AuditAppendError` never
repeats it in its own message, and C8's logger must never emit the cause.

## Verification and checkpoints (rules 3–4)

`npm run audit:verify` (`db/audit/cli.ts`) connects as `mesh_audit_reader` through
`PROVIDER_MESH_AUDIT_READER_URL`, confirms the role and the instance marker, reads the latest
checkpoint from the development object store (`var/object-store`, or `--object-store <dir>`),
and walks the chain from sequence 1 through a server-side cursor in a `READ ONLY` transaction,
recomputing each hash in TypeScript. It reports the first divergence (`hash_mismatch`, `prev_hash_mismatch`,
`genesis_mismatch`, `sequence_gap`, `sequence_duplicate`, `checkpoint_hash_mismatch`,
`checkpoint_beyond_head`) as a hard stop (exit 2) with sequences and hashes only — never row
content. An empty chain verifies.

A checkpoint is exported through the `ObjectStore` port by `AuditService.exportCheckpoint`:
the application exports one after its startup assertions pass and then once an hour while it
runs (`src/app/main.ts`), and `npm run audit:checkpoint` exports one on demand as
`mesh_audit_writer`. Each export writes a dated, never-overwritten record and `latest.json`
under `audit-checkpoints/<instance-id>/`, then appends an `audit.checkpoint_export` event naming
the object key and its SHA-256, so the checkpoint and the chain reference each other. In this
package the development adapter is a local directory under the same identity as the
application; the immutable store under an identity application operators cannot administer is
recorded in `docs/infrastructure/ENVIRONMENTS.md` as required before the protected-continuity
gate (`SEC-AUD-04`). `verified_at` and `verifier_identity` say who observed the head and when;
the independent recomputation is `audit:verify`'s.

## What the foundation records (rule 5)

`platform.startup_assertions` after the §5.3 assertions pass (the assertions themselves write
nothing; the running application records the outcome once the audit store's identity and ledger
are verified) and `audit.checkpoint_export` for every export, plus the synthetic events the
tests append inside rolled-back transactions. A failed startup is not recorded: the failure may
be the audit store's own identity or reachability, and writing to an unverified store is worse
than the gap; the process reports the assertion code on its console. Migration application is
recorded by the hash-verified, immutable migration ledger (§5.4); recording it in the audit chain
as well would require the release path to hold the audit-writer credential or `mesh_migrate` to
write the audit store, which §5.2 and ADR-001 §8.2 keep apart, so it is left to the decision
authority as a follow-on. The audit-sink unavailability path (`SEC-AUD-03`, `SEC-D10`) is not
built; the foundation fails closed when the audit database is unreachable at startup.
