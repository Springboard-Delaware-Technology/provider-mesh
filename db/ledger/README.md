# Migration mechanism (Foundation 001 §5.4)

The one path by which schema and reference data change (Governance §12.4). Four commands, run
as `mesh_migrate` through `PROVIDER_MESH_MIGRATE_URL` (domain, `provider_mesh`) and
`PROVIDER_MESH_AUDIT_MIGRATE_URL` (audit, `provider_mesh_audit`); the running application never
holds that credential (§5.2). Only `db:migrate` writes `migration_ledger`.

| Command       | What it does                                                                                                                                                                                                                                                                                                 | Exit 0                                 | Exit 1                                                              | Exit 2 (hard stop, Governance §11.4)                                                                                 |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------- | ------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| `db:migrate`  | Applies every pending file of each set in filename order, each inside its own transaction, and records it; then re-reads the ledger and recomputes the catalog checksum to confirm the head                                                                                                                  | At head                                | A file failed; its transaction rolled back; the ledger is unchanged | Identity mismatch; hash mismatch or unexpected entry in the ledger; post-apply mismatch; uncertain transaction state |
| `db:status`   | Lists applied (with hash, time, role), pending, hash-mismatched, and unknown ledger entries                                                                                                                                                                                                                  | At head: zero pending, zero mismatches | Pending migrations exist                                            | Hash mismatch or unexpected ledger entry                                                                             |
| `db:rehearse` | Applies every pending file inside one transaction that always rolls back, ledger rows included, then confirms the ledger presence and the catalog checksum are what they were (Governance §12.3)                                                                                                             | Rolled back cleanly                    | A file failed                                                       | Identity mismatch; ledger integrity; residue after rollback                                                          |
| `db:verify`   | Confirms ledger hashes and applying role, the catalog checksum at the ledger head against the catalog now, the exact table set, forced row-level security on protected tables, policies, triggers, role attributes, exact non-owner grants, reference row counts, and connect grants (`expected-catalog.ts`) | Every check passed                     | —                                                                   | Any check failed                                                                                                     |

Options: `--database domain|audit|all` (default `all`, domain first; a hard stop on one target
stops the run) and `--migrations <root>` (a root holding `domain/` and `audit/`; the tests use
it to run the commands against a copy).

Every command first confirms, read-only, that the connection is `mesh_migrate` and that
`mesh_instance` carries the instance and environment named by `PROVIDER_MESH_INSTANCE_ID` and
`PROVIDER_MESH_ENVIRONMENT` for the target's database role (`replit.md` §9: the intended
environment is confirmed before a verifier or migration operation). CI runs the four commands
in the order rehearse, migrate, status, verify on every push (§10 step 4).

## Ledger

`migration_ledger`, created by `0001_migration_ledger.sql` in each database:

| Column           | Meaning                                                                                              |
| ---------------- | ---------------------------------------------------------------------------------------------------- |
| `filename`       | Primary key; matches `^[0-9]{4}_[a-z0-9_]+\.sql$`                                                    |
| `sha256`         | SHA-256 of the file's bytes as applied; the same function `loadCompiledMigrationSet` uses at startup |
| `applied_at`     | Server time of the transaction (`now()`)                                                             |
| `applied_by`     | `current_user`; `db:verify` requires `mesh_migrate` on every row                                     |
| `catalog_sha256` | Catalog checksum after the file's statements, before the ledger row                                  |

Rows are immutable: a `BEFORE UPDATE OR DELETE OR TRUNCATE` trigger refuses every change, even
by the owner (§1.4 invariant 7). `mesh_app` (domain) and `mesh_audit_writer` and
`mesh_audit_reader` (audit) hold `SELECT` only, which the startup assertion needs (§5.3 rule 4).

A migration transaction is: advisory lock on the ledger, `SET LOCAL search_path TO public`, the
file's statements over the simple query protocol, the catalog checksum, the ledger row. The
file's bytes are re-hashed when read for application and must equal the compiled set's hash.

## Catalog checksum

Serialization version 1 (`catalog-checksum.ts`): for the `public` schema, the relations with
their owners and row-level-security flags, columns, constraints, indexes, policies, triggers,
functions, sequences, enum and domain types, and their grants; the schema's and the database's
grants; default privileges; extensions; and the attributes of the four application roles. Rows
carry names and definitions only — no OIDs, statistics, or row data — and are serialized as
canonical JSON (keys sorted by code unit, rows sorted by their canonical text, no whitespace),
then hashed with SHA-256. The value is compared only within one database: the ledger row of the
last applied migration holds the checksum at that moment, and `db:verify` recomputes it, so any
object created, dropped, or re-granted outside a migration is reported as a hard stop. Changing
the facets or encoding is a new serialization version shipped with a new migration, whose ledger
row re-anchors the head.

## Files

| File                    | Role                                                                                                                     |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| `cli.ts`, `cli-args.ts` | Commands, options, exit codes; the only place that writes to the console                                                 |
| `connection.ts`         | `LedgerStore`: one `pg` client as `mesh_migrate` over the application's verified-TLS configuration; `rollbackOnly`       |
| `runner.ts`             | Preflight (role, identity), ledger inspection, apply and rehearse, post-apply verification, hard-stop and failure errors |
| `catalog-checksum.ts`   | Facet queries, canonical serialization, SHA-256                                                                          |
| `verify.ts`             | Observation (reads) and pure evaluation of the expected catalog                                                          |
| `expected-catalog.ts`   | The maintained expected state per database; extended by every capability that adds a migration                           |
| `ledger-rows.ts`        | Ledger row reads shared by the runner and the verifier                                                                   |

`db/**` is, with `src/platform/adapters/postgres`, the only place that may import the SQL client
(§4.3 rule 5). The mechanism imports the platform-operations public surface for the compiled
sets and the ledger comparison, so `db:status` and the startup assertion agree by construction,
and the Postgres adapter's configuration builder, so no connection here can weaken certificate
verification (§5.3 rule 2).
