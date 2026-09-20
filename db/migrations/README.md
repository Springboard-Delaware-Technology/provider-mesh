# Migrations (Foundation 001 §5.4)

Plain SQL files `NNNN_<name>.sql`, forward-only, applied in filename order, each inside its own
transaction, and recorded in the hash-verified `migration_ledger` of the database they target.
One ledger per database, so one set per database:

| Directory | Database              | Applied through                                    | Ledger read at startup as |
| --------- | --------------------- | -------------------------------------------------- | ------------------------- |
| `domain/` | `provider_mesh`       | `PROVIDER_MESH_MIGRATE_URL` (`mesh_migrate`)       | `mesh_app`                |
| `audit/`  | `provider_mesh_audit` | `PROVIDER_MESH_AUDIT_MIGRATE_URL` (`mesh_migrate`) | `mesh_audit_writer`       |

Rules for every file:

- The name matches `^[0-9]{4}_[a-z0-9_]+\.sql$`; numbers are unique within a directory and the set
  is applied in that order.
- No transaction control (`BEGIN`, `COMMIT`, `ROLLBACK`, `SAVEPOINT`): the mechanism wraps each
  file in a transaction, and `db:rehearse` wraps the whole pending set in one that always rolls
  back. A statement that cannot run inside a transaction block fails the rehearsal, which is the
  point.
- Unqualified names resolve in `public`; the mechanism sets `search_path` to `public` for the
  transaction.
- Applied migrations are immutable (§1.4 invariant 7). `db:status` fails as a hard stop when an
  applied file's bytes no longer hash to the ledger's SHA-256, and `db:migrate` refuses to apply
  anything on top of such a ledger. A correction is a new forward migration.
- Reference data, when any exists, is inserted here, never by startup code.
- The mechanism, the ledger columns, the catalog checksum, and the commands are described in
  `db/ledger/README.md`.

`0001_migration_ledger.sql` in each directory verifies what provisioning (§6.5) created — the four
roles without privileged attributes, the connect grants, the single `mesh_instance` row with the
right `database_role` — and then creates `migration_ledger` with its immutability trigger and
SELECT-only grants.

`audit/0002_audit_event.sql` (C5, §5.5) creates `audit_event` with the `SEC-AUD-02` field groups
and a paired `<column>_absent` reason for every nullable column, the value domains, canonical
serialization version 1 (`audit_event_canonical`, `audit_event_hash`), the `SECURITY DEFINER`
chain trigger that assigns `sequence`, `prev_hash`, `hash`, and `recorded_at` under an advisory
lock, the append-only trigger, the `audit_chain_head` view, and the grants that leave the writer
with `INSERT` and the head view only. The file documents the serialization; `src/modules/audit`
mirrors it. Later capabilities add the outbox and job tables (C7, §5.7) and the first
compartmented table (C6, §5.6) as further files.
