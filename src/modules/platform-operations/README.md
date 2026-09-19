# Human Review and Platform Operations (`platform-operations`)

|                                           |                                                                      |
| ----------------------------------------- | -------------------------------------------------------------------- |
| Architecture section                      | System Architecture §6.15                                            |
| Consistency boundaries (Domain Model §19) | Human Review Case                                                    |
| Code under Foundation 001                 | Instance identity, migration status, startup assertions (§4.2, §5.3) |

- `instance-identity.ts` reads the provisioning-written `mesh_instance` marker and compares it
  with the expected instance, environment, and database role (§5.3 rules 3 and 6).
- `migration-set.ts` lists the migrations compiled into the release with their SHA-256.
- `migration-status.ts` reads the `migration_ledger` (created by C4) and compares it with the
  compiled set; an absent ledger is consistent only with an empty compiled set.
- `startup-assertions.ts` runs the above for the domain store, then pings and identity-checks
  the audit store, all in `READ ONLY` transactions (§5.3 rule 5; §5.5 rule 5). Any failure
  yields a reason code and no detail.

Human review queues are a later specification. The audit-store ledger check is wired when C4
defines the audit migration set.
