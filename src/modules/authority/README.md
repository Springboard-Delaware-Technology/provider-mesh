# Relationship, Authority, and Access Service (`authority`)

|                                           |                           |
| ----------------------------------------- | ------------------------- |
| Architecture section                      | System Architecture §6.10 |
| Consistency boundaries (Domain Model §19) | Authority Record          |
| Code under Foundation 001                 | None in this increment    |

The authorization engine is excluded (`SEC-D02`, `SEC-D03`; §1.5). Under Foundation 001 this module will hold only the stub `ActorContext` producer used by the isolation tests (§5.6 rule 2), arriving with C6. No engine, no policy evaluation.

This directory holds no code under Foundation 001 beyond what is stated above. It exists so the
module boundary of Architecture §6 is present and subject to the boundary check (§4.3) from the
first commit. When code arrives, other modules and `src/app` import it only through `index.ts`.
