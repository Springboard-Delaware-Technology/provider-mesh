# Integration Manifold (`integration-manifold`)

|                                           |                          |
| ----------------------------------------- | ------------------------ |
| Architecture section                      | System Architecture §6.7 |
| Consistency boundaries (Domain Model §19) | Resource Transaction     |
| Code under Foundation 001                 | None in this increment   |

Source adapters and any outbound call to an external source are excluded (§1.5). The `OutboundHttp` port refuses every destination under this package (§4.4).

This directory holds no code under Foundation 001 beyond what is stated above. It exists so the
module boundary of Architecture §6 is present and subject to the boundary check (§4.3) from the
first commit. When code arrives, other modules and `src/app` import it only through `index.ts`.
