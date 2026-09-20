# Human Review and Platform Operations (`platform-operations`)

|                                           |                                                                      |
| ----------------------------------------- | -------------------------------------------------------------------- |
| Architecture section                      | System Architecture §6.15                                            |
| Consistency boundaries (Domain Model §19) | Human Review Case                                                    |
| Code under Foundation 001                 | Instance identity, migration status, startup assertions (§4.2, §5.3) |

- `instance-identity.ts` reads the provisioning-written `mesh_instance` marker and compares it
  with the expected instance, environment, and database role (§5.3 rules 3 and 6).
- `migration-set.ts` lists the migrations compiled into the release with their SHA-256: one set
  per database, `db/migrations/domain` and `db/migrations/audit` (§5.4: one ledger in each
  database).
- `migration-status.ts` reads a `migration_ledger` and compares it with its compiled set.
  `compareLedger` yields the first difference for the startup assertion; `describeLedger` yields
  the full listing (applied, pending, hash mismatches, unknown entries) for `db:status`. An
  absent ledger is consistent only with an empty compiled set, so an unmigrated database fails
  the assertion once a set exists.
- `startup-assertions.ts` runs the above for the domain store, then for the audit store, all in
  `READ ONLY` transactions (§5.3 rule 5; §5.5 rule 5). Any failure yields a reason code and no
  detail.

The ledger is written only by the migration mechanism in `db/ledger` (C4, §5.4), which imports
this module's set loader and comparison so that `db:status` and startup agree by construction.
Human review queues are a later specification.
