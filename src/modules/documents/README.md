# Secure Document Service (`documents`)

|                                           |                           |
| ----------------------------------------- | ------------------------- |
| Architecture section                      | System Architecture §6.12 |
| Consistency boundaries (Domain Model §19) | Document Record           |
| Code under Foundation 001                 | None in this increment    |

Documents are excluded (§1.5).

This directory holds no code under Foundation 001 beyond what is stated above. It exists so the
module boundary of Architecture §6 is present and subject to the boundary check (§4.3) from the
first commit. When code arrives, other modules and `src/app` import it only through `index.ts`.
