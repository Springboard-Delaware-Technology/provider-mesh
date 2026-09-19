# Evidence and Claim Ledger (`evidence`)

|                                           |                          |
| ----------------------------------------- | ------------------------ |
| Architecture section                      | System Architecture §6.6 |
| Consistency boundaries (Domain Model §19) | Evidence Claim           |
| Code under Foundation 001                 | None in this increment   |

The evidence ledger (Source Observation → Claim → Current Projection) is a later bounded specification.

This directory holds no code under Foundation 001 beyond what is stated above. It exists so the
module boundary of Architecture §6 is present and subject to the boundary check (§4.3) from the
first commit. When code arrives, other modules and `src/app` import it only through `index.ts`.
