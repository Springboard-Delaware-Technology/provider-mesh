# Analytics and Learning Boundary (`analytics`)

|                                           |                           |
| ----------------------------------------- | ------------------------- |
| Architecture section                      | System Architecture §6.16 |
| Consistency boundaries (Domain Model §19) | Analytic Dataset          |
| Code under Foundation 001                 | None in this increment    |

Analytics is excluded (§1.5). **Separate-environment rule:** analytics is a separate architectural boundary (Architecture §6.16); identifiable operational data and approved analytic datasets are separated, and operational access never silently becomes research or model-training access. No analytic dataset, export, or environment exists under this package.

This directory holds no code under Foundation 001 beyond what is stated above. It exists so the
module boundary of Architecture §6 is present and subject to the boundary check (§4.3) from the
first commit. When code arrives, other modules and `src/app` import it only through `index.ts`.
