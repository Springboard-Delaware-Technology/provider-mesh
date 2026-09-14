# Provider Mesh — Approved Corrections and Artifact Register

| Record control | Value |
|---|---|
| Record ID | PM-AMEND-001 |
| Record version | 0.1 |
| Date | September 14, 2026 |
| Decision authority | Judson Malone, Executive Director, Springboard Delaware |
| Amendment authorization | Explicit user approval on September 14, 2026, followed by instruction to execute the correction plan |
| Scope | PM-REVIEW-002 v0.1 findings F01–F05 and clarifications C01–C02, their affected references, and artifact/version records |
| Status | Approved amendments applied; revised files verified; repository placement and synchronization pending |
| Security approval | The complete Security and Audit Specification remains an approval candidate, not approved |
| Record function | Evidence of the approved amendment scope and exact resulting artifacts; this register creates no additional product rule or implementation authority |

## 1. Authorization and preserved baseline

Judson Malone approved proceeding with the corrections proposed in the cross-document audit and then instructed:

> Proceed with the approved correction plan. Revise all five documents, preserve their previous versions, and verify consistency across the complete set. Deliver the corrected files, amendment register, verification results, checksums, and Replit Agent storage prompt. Keep the complete Security and Audit Specification as an approval candidate for my final review.

The approved proposal is `PROVIDER_MESH_CROSS_DOCUMENT_AUDIT_v0.1_WIP.md`, PM-REVIEW-002 v0.1, dated September 13, 2026, SHA-256 `f627f867f7fc184e468b4f36154297afe2496fb37d13b501442715e9ecef3adc`. Its original “recommendations for review” status is historical: that file was preserved unchanged, and the later human approval is recorded here. The proposal's checksum identifies the audit; it is not the checksum of any revised specification.

The four previously approved specifications receive new approved amended versions under this authorization. Security receives draft revision 3 as a distinct approval candidate. Its complete-document approval fields remain unset. No additional approval of the seven specified corrections is being requested.

## 2. Revised document set

| Document | Version transition | Resulting status |
|---|---|---|
| Development Governance | 0.1 → 0.2 | Approved amended artifact |
| Product Constitution | 1.0 → 1.1 | Approved amended artifact |
| System Architecture | 0.1 → 0.2 | Approved amended artifact |
| Domain Model | 0.3 → 0.4 | Approved amended artifact |
| Security and Audit | 0.1-WIP / revision 2 → 0.1-WIP / revision 3 | Approval candidate — Not Approved |

Each approved amended file identifies its approver, date, prior full-artifact hash, approved amendment proposal, and canonical path. Full hashes below identify the exact revised bytes, including their approval metadata. The full-file digest is recorded externally to avoid pretending a file contains its own complete-file hash.

| Exact revised file | SHA-256 of complete file |
|---|---|
| `SPRINGBOARD_SOFTWARE_DEVELOPMENT_GOVERNANCE_v0.2_APPROVED.md` | `6ee9834c16aaf8edeeb9c5beacf8b296b57794000bbbd3dab860db22130d2ad7` |
| `PRODUCT_CONSTITUTION_v1.1_APPROVED.md` | `cfe4b23739fc66556e55621fe489bcf48bd8b5999cc7490610e90c0e14584064` |
| `SYSTEM_ARCHITECTURE_v0.2_APPROVED.md` | `f003967589d9855c2783827e25db345465f7a7d7ef5906acb354b677644fd419` |
| `DOMAIN_MODEL_v0.4_APPROVED.md` | `d3930bb06652362fe02f4cccba6a23fed9882c97be4f2012b0ca8eb6a7121b49` |
| `SECURITY_AND_AUDIT_v0.1_APPROVAL_CANDIDATE.md` | `8e6604a839fd68fed3b671e888f9288cc877dad9632e0f15d82bf9f937ff0264` |

## 3. Amendment dispositions

| ID | Affected provisions | Applied correction and resulting meaning |
|---|---|---|
| F01 | Architecture 6.5; Domain 8.4–8.5 and 22(14) retained | Replaced the combined participation-state table with independent encounter history, participation agreement lifecycle, and identity resolution/correction. Re-observation cannot renew or alter participation. Fair discovery and claim-specific evidence remain intact. |
| F02 | Governance 7.4; Security SEC-AUD-03, SEC-RESP-03, SEC-D10, SEC-T47 | An explicit, still-effective human delegation plus an approved runbook may permit bounded containment. Actors/mechanisms, triggers, resources, actions, limits, expiry/review, and subsequent review must be specified. The runbook and this specification are not the delegation. Containment only reduces access or stops exposure; it supplies no authority for disclosure, inspection, restoration, destruction, deployment, or alteration of case facts. |
| F03 | Domain 4.5, 9.9(1), 12.6, 13.5(2), 18.4(2), 22(32,44), 23.6, 26(31), 27; Security SEC-RET-03 reference | Source, version, lineage, and history preservation operate inside lawful purpose-specific retention. A sent Script is reproducible while retained. Authorized disposition may end content reconstruction; permitted accountability evidence and reconstruction limits remain explicit. Valid holds and independent custody duties continue. |
| F04 | Constitution 9.4; Architecture 16; Security SEC-GATE-02, SEC-T56 and traceability | Every constitutional control area is governed before the relevant production exposure. An inactive capability may use an explicit prohibition and enforceable disabled boundary. Actual processing, including unsolicited sensitive public input, requires its approved controls; activation later requires the applicable operating controls. |
| F05 | Architecture 6.4–6.5; Domain 8.1, 11.1–11.6, 19–21, 22, 24, 26–28; Security SEC-REF-01, SEC-T17 and traceability | Organization identity no longer depends on Provider capacity. Connections identify the offering Organization/capacity and selected Opportunity. Employer and learning responses remain attributable Connection Events and appropriate Outcome Claims. Employment Relationship/Placement Outcome can link to the opportunity and connection. Provider engagement and formal Referral retain their Provider meaning. |
| C01 | Domain 14.2–14.3, 14.6, 14.8(1), 22(21), 24(14), 26(21); Security SEC-COL-01, SEC-T15 | A Collaboration may exist as a proposed or historical record and has at most one currently effective Charter. Active activity requires effective Charter and organizational authority. Identifiable case activity additionally requires Person Participation/disclosure authority; eligible de-identified consultation follows its existing route. Formation, records, and Charter approval create no person permission. |
| C02 | Architecture 6.3 and 15(10); Security SEC-AI-01 and SEC-T52 retained | Operational Mesh model processing uses the governed Model Gateway. Separately approved external drafting, coding, and synthetic evaluation can precede that gateway within their development authority and data restrictions. They cannot bypass operational controls. |

All seven dispositions are complete at the document level. Supporting metadata records revised versions, approval scope, exact governing hashes, and the candidate's review status. None of the 17 subordinate Security decisions was silently closed.

## 4. Consequential drafting details

The following propagation choices implement the approved findings and are made explicit for review:

- **F01 terminology:** “No participation agreement” matches the Domain lifecycle's exact state language; the audit's shorter “no agreement” carried the same meaning.
- **F02 excluded actions:** A final Governance sentence makes clear that containment delegation is limited to reducing access or stopping exposure and cannot authorize the excluded actions. This expresses the audit's acceptance condition and prevents the delegation qualifier from being read as a broader grant.
- **F05 event:** `ConnectionResponseReported` is the only added named Domain Event. It carries an attributable employer, learning, or other selected-target response. `ProviderEngagementReported` retains its Provider-only meaning. No existing event was deleted or renamed.
- **C01 admission and diagram:** The join check and confidentiality paragraph now expressly distinguish identifiable and eligible de-identified activity. The existing Collaboration diagram is labeled as the identifiable case; its topology is unchanged. No new NDA, credential taxonomy, or registration step was added.
- **Security identifiers:** All 101 controls, 56 acceptance scenarios, and 17 unresolved decision identifiers are retained. SEC-T15, SEC-T17, SEC-T47, and SEC-T56 were refined; the counts do not imply that application tests were executed.
- **Scope preservation:** Constitution sections 1–8, including all constitutional articles and prohibitions, are unchanged. Core Domain identity, registration, authority, Referral definition/custody, outcomes, external transactions, and subordinate decisions remain unchanged except for the specific corrections catalogued above.

The companion `PROVIDER_MESH_APPROVED_CORRECTIONS_20260914.patch` is the complete textual before/after difference for all five specifications. It is review evidence. Canonical storage must copy the complete supplied files, rather than reconstructing them from the patch or a conversational summary.

## 5. Preserved previous versions

The five prior files and the original audit remain byte-identical. Copies are included in the package's `previous_versions/` directory. The existing original artifacts were not overwritten.

| Preserved file | SHA-256 of complete previous file |
|---|---|
| `SPRINGBOARD_SOFTWARE_DEVELOPMENT_GOVERNANCE_v0.1_APPROVED.md` | `839edb43cef4f5a675188ac7c2a7200c72139a4933bd9a49bde3ed74d121c8be` |
| `PRODUCT_CONSTITUTION_v1.0_APPROVED.md` | `51382d33f492eb9e212d3e10bd5c8ddac59313e155327bd31e46329f10bc0c41` |
| `SYSTEM_ARCHITECTURE_v0.1_APPROVED.md` | `8deb76ab714bdf89ce0029984d58107459882f9beed310a90a7f6fff93baad8d` |
| `DOMAIN_MODEL_v0.3_APPROVED.md` | `01cd42335bb2a1e9e28a1bd030a7b6faa7b39726f2a29719214a3618a11346af` |
| `SECURITY_AND_AUDIT_v0.1_WIP.md` | `140544aaa687446b507586efc0e6105e7c21a0ef057f734c381984b8d4fa9acd` |
| `PROVIDER_MESH_CROSS_DOCUMENT_AUDIT_v0.1_WIP.md` | `f627f867f7fc184e468b4f36154297afe2496fb37d13b501442715e9ecef3adc` |

The package does not relabel previous approved documents as unapproved. They remain the historical approved versions and remain operational wherever a project has not yet adopted and synchronized their successors. Development Governance v0.2 is reusable; this Provider Mesh task does not update another Springboard project's repository or operating control automatically.

## 6. Verification and remaining gates

The report `PROVIDER_MESH_CORRECTION_VERIFICATION_20260914.md` records 55 successful artifact/structure checks and the six cross-document acceptance conditions from the approved audit. The source-preservation checks, exact governing-hash checks, complete differences, identifiers, and affected rule interactions were reviewed together. No unresolved material conflict was identified within the approved correction scope.

Security's complete text still requires Judson Malone's final approval. Canonical repository placement, operating-control alignment where required, commit, and synchronization remain execution steps. Applicable subordinate decisions and a bounded implementation authorization remain necessary before implementation or exposure.

No actual repository, remote branch, application environment, production system, incident delegation, or live data was changed or independently verified by preparing this package. The Replit prompt requests and reports that separate storage evidence when executed.

## 7. Repository destinations

| Supplied file | Intended repository path |
|---|---|
| `SPRINGBOARD_SOFTWARE_DEVELOPMENT_GOVERNANCE_v0.2_APPROVED.md` | `docs/governance/SPRINGBOARD_SOFTWARE_DEVELOPMENT_GOVERNANCE.md` |
| `PRODUCT_CONSTITUTION_v1.1_APPROVED.md` | `docs/governance/PRODUCT_CONSTITUTION.md` |
| `SYSTEM_ARCHITECTURE_v0.2_APPROVED.md` | `docs/SYSTEM_ARCHITECTURE.md` |
| `DOMAIN_MODEL_v0.4_APPROVED.md` | `docs/DOMAIN_MODEL.md` |
| `SECURITY_AND_AUDIT_v0.1_APPROVAL_CANDIDATE.md` | `docs/drafts/SECURITY_AND_AUDIT_v0.1_APPROVAL_CANDIDATE.md` |

The Security path above is explicitly a draft path. `docs/SECURITY_AND_AUDIT.md` is reserved for the later, separately approved complete specification. The supporting register, verification report, patch, and repository checksum list belong under `docs/reviews/2026-09-14/` when the supplied storage prompt is executed.

Git history preserves the replaced canonical versions. The accompanying previous-version copies preserve the audited baseline independently. Repository commit and push evidence should be recorded in the execution response or a separate execution record; inserting a commit SHA into a supplied specification would change its approved bytes and checksum.
