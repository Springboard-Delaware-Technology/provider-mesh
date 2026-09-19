# Human Review and Platform Operations (`platform-operations`)

|                                           |                           |
| ----------------------------------------- | ------------------------- |
| Architecture section                      | System Architecture §6.15 |
| Consistency boundaries (Domain Model §19) | Human Review Case         |
| Code under Foundation 001                 | None in this increment    |

Under Foundation 001 this module will hold instance identity and migration-status reporting (§4.2), arriving with C3 and C4. Human review queues are a later specification.

This directory holds no code under Foundation 001 beyond what is stated above. It exists so the
module boundary of Architecture §6 is present and subject to the boundary check (§4.3) from the
first commit. When code arrives, other modules and `src/app` import it only through `index.ts`.
