# Audit Service (`audit`)

|                                           |                                                                                                      |
| ----------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| Architecture section                      | System Architecture §6.17                                                                            |
| Consistency boundaries (Domain Model §19) | — (audit records are a distinct record family, never derived from domain events; Domain Model §17.4) |
| Code under Foundation 001                 | None in this increment                                                                               |

The Audit Service — sole writer to `provider_mesh_audit` through the `mesh_audit_writer` credential injected by `src/app` — arrives with C5 (§5.5). The domain identity holds no privilege on the audit store (§1.4 invariant 2).

This directory holds no code under Foundation 001 beyond what is stated above. It exists so the
module boundary of Architecture §6 is present and subject to the boundary check (§4.3) from the
first commit. When code arrives, other modules and `src/app` import it only through `index.ts`.
