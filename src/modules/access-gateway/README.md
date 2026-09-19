# Interaction and Access Gateway (`access-gateway`)

|                                           |                                                         |
| ----------------------------------------- | ------------------------------------------------------- |
| Architecture section                      | System Architecture §6.1                                |
| Consistency boundaries (Domain Model §19) | — (channel and session control; no record family owned) |
| Code under Foundation 001                 | `/healthz` and `/readyz` only (§5.10)                   |

The HTTP server answers liveness and readiness and nothing else; a route-inventory test asserts
that no other route is registered. Neither response carries a version string, hostname,
configuration, or request detail. Readiness re-runs the read-only startup assertions of
`platform-operations` (database reachable, instance marker matched, migration ledger matched,
audit store reachable and its marker matched) and reports a reason code when any fails.
