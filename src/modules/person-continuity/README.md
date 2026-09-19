# Person Continuity and Identity Service (`person-continuity`)

|                                           |                          |
| ----------------------------------------- | ------------------------ |
| Architecture section                      | System Architecture §6.9 |
| Consistency boundaries (Domain Model §19) | Mesh Person              |
| Code under Foundation 001                 | None in this increment   |

Identity is excluded (§1.5). Basic discovery must remain useful without registration or a Mesh Person ID (replit.md §6).

This directory holds no code under Foundation 001 beyond what is stated above. It exists so the
module boundary of Architecture §6 is present and subject to the boundary check (§4.3) from the
first commit. When code arrives, other modules and `src/app` import it only through `index.ts`.
