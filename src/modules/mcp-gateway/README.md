# MCP Gateway (`mcp-gateway`)

|                                           |                                                    |
| ----------------------------------------- | -------------------------------------------------- |
| Architecture section                      | System Architecture §6.8                           |
| Consistency boundaries (Domain Model §19) | — (boundary component of the Integration Manifold) |
| Code under Foundation 001                 | None in this increment                             |

The MCP Gateway and any MCP server or client are excluded (§1.5).

This directory holds no code under Foundation 001 beyond what is stated above. It exists so the
module boundary of Architecture §6 is present and subject to the boundary check (§4.3) from the
first commit. When code arrives, other modules and `src/app` import it only through `index.ts`.
