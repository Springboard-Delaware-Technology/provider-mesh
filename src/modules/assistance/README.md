# Assistance Orchestrator (`assistance`)

|                                           |                          |
| ----------------------------------------- | ------------------------ |
| Architecture section                      | System Architecture §6.2 |
| Consistency boundaries (Domain Model §19) | Assistance Episode       |
| Code under Foundation 001                 | None in this increment   |

Every user-facing feature, including natural-language need expression, is excluded (§1.5). The `assistance_episode` table root is created by migration under C6 (§5.6) without any orchestration code.

This directory holds no code under Foundation 001 beyond what is stated above. It exists so the
module boundary of Architecture §6 is present and subject to the boundary check (§4.3) from the
first commit. When code arrives, other modules and `src/app` import it only through `index.ts`.
