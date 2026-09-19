# Provider and Service Registry (`registry`)

|                                           |                                            |
| ----------------------------------------- | ------------------------------------------ |
| Architecture section                      | System Architecture §6.5                   |
| Consistency boundaries (Domain Model §19) | Mesh Provider; Opportunity; Concept Scheme |
| Code under Foundation 001                 | None in this increment                     |

The provider registry, HSDS projection, and ingestion of any provider data are excluded (§1.5).

This directory holds no code under Foundation 001 beyond what is stated above. It exists so the
module boundary of Architecture §6 is present and subject to the boundary check (§4.3) from the
first commit. When code arrives, other modules and `src/app` import it only through `index.ts`.
