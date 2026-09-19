# Model Gateway (`model-gateway`)

|                                           |                                                                       |
| ----------------------------------------- | --------------------------------------------------------------------- |
| Architecture section                      | System Architecture §6.3                                              |
| Consistency boundaries (Domain Model §19) | — (no boundary root; a governed processing path, not a record family) |
| Code under Foundation 001                 | None in this increment                                                |

The Model Gateway, any model-provider integration, and any call to a model from application code are excluded (§1.5; `SEC-AI-01`).

This directory holds no code under Foundation 001 beyond what is stated above. It exists so the
module boundary of Architecture §6 is present and subject to the boundary check (§4.3) from the
first commit. When code arrives, other modules and `src/app` import it only through `index.ts`.
