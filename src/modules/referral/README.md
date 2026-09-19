# Referral Service (`referral`)

|                                           |                              |
| ----------------------------------------- | ---------------------------- |
| Architecture section                      | System Architecture §6.11    |
| Consistency boundaries (Domain Model §19) | Referral; Service Connection |
| Code under Foundation 001                 | None in this increment       |

Referrals and service connections are excluded (§1.5). Their separate status dimensions (Domain Model §11–§12) are a later Max-effort design item.

This directory holds no code under Foundation 001 beyond what is stated above. It exists so the
module boundary of Architecture §6 is present and subject to the boundary check (§4.3) from the
first commit. When code arrives, other modules and `src/app` import it only through `index.ts`.
