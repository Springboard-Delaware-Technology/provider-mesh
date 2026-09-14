# Provider Mesh — Security and Audit Specification

| Document control | Value |
|---|---|
| Document ID | PM-SEC-001 |
| Version | 0.1 |
| Approved source candidate | 0.1-WIP, draft revision 3 — September 14, 2026 |
| Status | Approved — Controlling Security and Audit Specification — No Implementation Authority |
| Artifact identity | Distinct non-canonical approved artifact |
| Approved by | Judson Malone, Executive Director, Springboard Delaware |
| Approval date | September 14, 2026 |
| Prepared for | Judson Malone, Executive Director, Springboard Delaware |
| Original draft date | September 13, 2026 |
| Revision date | September 14, 2026 |
| Complete-document approval | Judson Malone expressly approved the exact candidate for issuance as approved version 0.1 on September 14, 2026 |
| Approved candidate SHA-256 | `8e6604a839fd68fed3b671e888f9288cc877dad9632e0f15d82bf9f937ff0264` |
| Complete approved artifact checksum | Recorded in `SECURITY_AND_AUDIT_v0.1_APPROVAL_RECORD.md` and `SECURITY_AND_AUDIT_v0.1_SHA256SUMS.txt` |
| Previous draft SHA-256 | `140544aaa687446b507586efc0e6105e7c21a0ef057f734c381984b8d4fa9acd` |
| Canonical path required for operational effect | `docs/SECURITY_AND_AUDIT.md` |
| Canonical repository reference | Pending canonical placement, commit, and synchronization |
| Controlling product documents | Product Constitution v1.1; System Architecture v0.2; Domain Model v0.4 |
| Development governance | Springboard Software Development Governance v0.2 |
| Implementation authority | None; this specification does not authorize implementation, deployment, production exposure, or processing of real personal information |

> **Operational-effect notice:** This distinct approved artifact becomes operationally controlling after byte-identical canonical placement, commit, and synchronization under Springboard Software Development Governance. Approval does not resolve the 17 open subordinate decisions or authorize implementation, deployment, production exposure, or processing of real personal information.

## 1. Purpose and governing position

This specification defines how Provider Mesh must protect information, validate authority, constrain automated actions, preserve accountable evidence, and respond when something goes wrong. It operationalizes the approved product decisions without redefining a Person, Provider, Relationship, Referral, Collaboration, Claim, or other domain concept.

The governing position is:

> Access is a decision about a particular actor, represented capacity, purpose, action, information, recipient, context, and time. Neither a role label nor technical access establishes permission.

The Mesh must offer useful, low-friction discovery without requiring registration, conventional identity documents, a clinical relationship, or broad disclosure consent. More consequential actions require proportionately stronger controls. Security must protect housing, education, workforce, benefits, recovery, and other SDOH information as well as healthcare information; equal protection does not mean identical legal rules or equal access.

The specification covers chat and structured interfaces, APIs, MCP, internal modules, scheduled and background work, external integrations, documents, notifications, model processing, derived projections, operational administration, analytics, and audit. It applies whether these functions share a modular-monolith deployment or later use separately deployed services.

### 1.1 Normative terms and control identifiers

“Must” states a mandatory requirement of this approved specification. “Should” states a recommendation whose departure requires a recorded rationale. “May” identifies an option within otherwise valid authority. Document approval does not itself authorize implementation or exposure; the controlling governance and applicable implementation and exposure gates remain binding.

Controls use stable identifiers such as `SEC-AUTH-01`. Acceptance scenarios use `SEC-T01`; unresolved deployment or policy decisions use `SEC-D01`. The logical fields and controls here do not prescribe database tables, a cloud provider, a policy language, or a graph database.

An unresolved required decision disables the affected capability. It is not permission to choose an undocumented default. Decisions necessary before implementation remain implementation gates even when a later exposure gate is also identified.

### 1.2 What this document does not do

It does not establish blanket HIPAA compliance, legal authority to disclose, a staffed 24-hour service, or a new Springboard power over provider decisions. It does not approve a vendor, production deployment, retention schedule, research project, general-purpose model-training use, or particular identity-proofing product. Specialized specifications and approved implementation work must complete the bounded decisions identified in section 23.

### 1.3 Applying rules together

Evaluate the rules for the actual actor, purpose, information, action, and stage of work. Requirements for identifiable disclosure apply when identifiable information is disclosed; they do not create an identity or consent requirement for public discovery. Requirements for protected operational use do not grant or automatically prohibit separately authorized security maintenance, historical custody, or synthetic development.

All applicable conditions must be satisfied together. An approved workflow may cover several necessary technical steps without a new human confirmation for each step, but it must not silently expand purpose, recipients, information, or authority. Explicit qualifications in sections 6–8, 10–14, 17–18, and 20–24 define their limited scope; they are not general permissions to disregard a mandatory control. A genuine unresolved conflict remains subject to `SEC-GOV-01`.

## 2. Controlling sources and change discipline

The original governing artifacts were reread in full during preparation and the September 13, 2026 cross-document audit. This revision incorporates the September 14, 2026 approved amendments and uses the exact amended artifacts below. These are hashes of the complete revised approved files; prior-version and amendment-proposal hashes in their approval records identify different artifacts.

| Approved artifact | Document ID / version | SHA-256 of approved artifact |
|---|---|---|
| `PRODUCT_CONSTITUTION_v1.1_APPROVED.md` | PM-PC-001 / 1.1 | `cfe4b23739fc66556e55621fe489bcf48bd8b5999cc7490610e90c0e14584064` |
| `SYSTEM_ARCHITECTURE_v0.2_APPROVED.md` | PM-SA-001 / 0.2 | `f003967589d9855c2783827e25db345465f7a7d7ef5906acb354b677644fd419` |
| `DOMAIN_MODEL_v0.4_APPROVED.md` | PM-DM-001 / 0.4 | `d3930bb06652362fe02f4cccba6a23fed9882c97be4f2012b0ca8eb6a7121b49` |
| `SPRINGBOARD_SOFTWARE_DEVELOPMENT_GOVERNANCE_v0.2_APPROVED.md` | SB-SDG-001 / 0.2 | `6ee9834c16aaf8edeeb9c5beacf8b296b57794000bbbd3dab860db22130d2ad7` |

The approved amended artifacts acquire operational effect only through the required canonical placement, repository synchronization, and applicable operating-control alignment. This approved artifact does not attest to the live repository, branch, synchronization, deployment, or completion of those steps. The superseded source files remain preserved. The amendment register records the approval scope and previous/current hashes.

**SEC-GOV-01 — Preserve controlling meaning.** The Constitution governs purpose, agency, institutional authority, and prohibitions; the Architecture governs structure and boundaries; the Domain Model governs meaning and invariants; this specification governs security and audit consistent with all three. A security implementation must not resolve a material conflict by silently changing a higher-level rule. Refer the conflict to the accountable human authority.

**SEC-GOV-02 — Separate approval from execution.** Review, document approval, canonical byte-identical placement, commit and synchronization, implementation approval, and production exposure are separate acts. Approval of this specification alone must not activate any integration or authorize use of real personal information. Approved source artifacts must remain unchanged by this drafting process.

## 3. Security objectives and accountable roles

The controls protect six outcomes: people can reach appropriate help; unauthorized parties cannot learn or act beyond their authority; consequential information retains its source and uncertainty; legitimate work survives disruption; decisions remain reconstructable; and people can obtain accountable review and remedy.

### 3.1 Functional responsibility

The functions below require an identified human owner before the relevant exposure. They do not require separate departments, but conflicting approvals and privileged actions require the separation specified here.

| Function | Accountable responsibility | Limit |
|---|---|---|
| Springboard Board | Institutional governance and reserved constitutional or secondary-use decisions | Does not grant every staff member access to operational records |
| Delegated product authority | Product approvals and acceptance of permitted residual risk | Cannot waive constitutional prohibitions through a release decision |
| Security owner | Technical controls, access review, incident coordination, security evidence | Is not the authority for provider eligibility or professional findings |
| Privacy and authority reviewer | Scope, disclosure, retention, rights, conflicts, and required legal consultation | Must document authority; cannot create it by approving a ticket |
| Platform operations | Authorized maintenance, recovery, monitoring, and technical response | Has no routine unrestricted person-record access |
| Organization administrator | Validated staff affiliation and permitted organizational assignments | Cannot grant person-specific access outside valid authority |
| Provider / contributing institution | Its representations, intake, service decisions, records, and disclosures | Does not control the person's entire Mesh continuity record |
| Collaboration authority / sponsor | Charter obligations and accountable sponsored participation | Does not create person authority through membership or invitation alone |
| Person or authorized representative | Goals, voluntary choices, and actions within the representative's validated scope | Authority over one person does not automatically cover another |
| Independent reviewer where required | Conflict-sensitive review, elevated-access review, and applicable legal/privacy review | Must be authorized for the information actually needed |

**SEC-GOV-03 — Name owners and preserve role separation.** The operating register must identify these owners, delegated powers, coverage, and escalation routes. A person may hold several functions, but the system must record the active represented capacity and enforce its limits. Self-approval of exceptional access to protected records is prohibited unless an approved emergency procedure explicitly permits a narrowly bounded action and requires independent subsequent review.

## 4. Trust boundaries and threat model

The principal threats are not limited to outside attackers. They include mistaken identity links, well-intentioned over-sharing, compromised accounts, abusive or coercive helpers, excessive organization-administrator access, malicious source content, unauthorized secondary use, misleading evidence, and unavailable controls during urgent assistance.

| Boundary | Representative failure | Required control location |
|---|---|---|
| Public assistance to protected continuity | A name lookup exposes another person's participation | Access Gateway and Person Continuity service |
| Account to Mesh Person | Control of a recycled phone number exposes an old record | Identity and recovery workflow |
| Organization to person or Collaboration | Staff role or common membership supplies blanket access | Relationship, Authority, and Access service |
| Platform to Springboard provider or backbone work | Operator privileges become service-record access or ranking preference | Active-capacity controls and independent audit |
| Untrusted source to model or tool | A webpage, PDF, email, or tool description instructs disclosure | Model Gateway, Integration Manifold, and output/action validation |
| Canonical record to graph, search, or AI context | A derived index leaks a hidden relationship or revoked record | Projection construction and authorized retrieval |
| Mesh to external recipient | Wrong recipient, excess data, replay, or stale queued authorization | Referral, Document, and integration execution boundaries |
| Operations to analytics | Service authority becomes research or training authority | Separate analytics approval, access, and release boundary |
| Runtime to audit and recovery stores | An operator changes history or a backup restores withdrawn access | Independent integrity controls and recovery checks |

**SEC-BOUND-01 — Enforce at every entry and exit.** Equivalent actions must receive equivalent policy evaluation whether requested through chat, a form, an API, MCP, a direct internal call, a job, or an administrative interface. Hiding a UI button is not authorization. Network location, a successful login, a service credential, or a known organization is not sufficient trust.

**SEC-BOUND-02 — Maintain a bounded threat assessment.** Each implementation specification must identify its data flows, actors, misuse cases, trust boundaries, dependencies, and failure behavior. Changes that add a recipient, data class, processing purpose, external write, model provider, or isolation mechanism require review before activation. Review must be finite and tied to acceptance criteria, not an unbounded demand for additional analysis.

## 5. Information classification and legal applicability

### 5.1 Protection classes

These classes express handling requirements, not a universal ranking of people or SDOH domains. Classifications apply to fields, documents, relationships, queries, and outputs where necessary, not only whole records.

| Class | Examples | Default handling |
|---|---|---|
| Public | Intentionally published provider contacts, service descriptions, public requirements | Approved public use with provenance, integrity, and license controls; no implied right to attach personal history |
| Internal operational | Nonpublic configuration descriptions, operational procedures, nonpersonal coordination metadata | Authenticated, purpose-limited staff or service access; no public release by default |
| Protected personal | Names, contact methods, Needs, Assistance Episodes, participation, referrals, employment or education history | Explicit purpose and authority; field and recipient scope; protected transport/storage; consequential-access audit |
| Restricted personal | Information whose disclosure presents heightened harm or additional legal/contractual restrictions, including protected location or sensitive clinical, recovery, justice, disability, or incentive evidence | Protected-personal controls plus applicable restrictions, stronger assurance or human review where required, and explicit release boundaries |
| Security secret | Password material, credentials, encryption keys, recovery codes, bearer tokens | Dedicated secret handling; never ordinary narrative, analytics content, model context, or routine logs; narrowly scoped issuance messages follow SEC-NOTIFY-02 |

**SEC-DATA-01 — Classify context, not stereotypes.** A housing record is not less deserving of protection than a health record. A workforce incentive claim can reveal disability, benefit receipt, or justice involvement. A public organization name combined with a private person–organization edge may be restricted information. The combined disclosure determines handling; labels such as “student,” “expert,” “provider,” or “recovery-friendly employer” do not decide access.

**SEC-DATA-02 — Preserve handling metadata.** Protected records and derivatives must retain applicable subject associations, source/custodian, sensitivity, purpose limits, recipient restrictions, authority references, retention rule, and material legal/contractual tags. Unknown classification must not default to public. Ingestion must restrict an unresolved item to an approved inspection environment with sufficient authority, confidentiality, isolation, and retention controls for the accepted input classes. That environment may perform only the necessary scanning, subject identification, classification, minimization, or redaction before ordinary use. A model-based inspection step also requires an approved Model Gateway profile for that input; uncertainty is not permission to send it to a public-only processor. If adequate inspection cannot be provided, quarantine or reject the affected item. General search, sharing, and other processing remain blocked until the required handling is established.

**SEC-DATA-03 — Minimize collection and disclosure.** Collect only what the authorized activity requires. Registration must not demand every field supported by HMIS, C-CDA, education, or workforce schemas. Discovery queries must omit identity and sensitive detail not needed by the source. Use a redacted or purpose-specific projection where it can satisfy the request. Source language and consequential evidence must be preserved within the applicable retention boundary, not copied into every downstream representation.

### 5.2 Applicability register

**SEC-LEGAL-01 — Resolve the actual relationship.** Before enabling a class of real-data workflow and its permitted recipient conditions, qualified privacy/legal review must identify the responsible entities, their capacities, jurisdictions, record sources, permitted purposes, collection and disclosure bases, confidentiality obligations, individual rights, contracts, required notices, retention/disposition duties, and incident-notification rules. Record the decision, evidence, effective period, reviewer, and re-review triggers. A data label or signed NDA is not this analysis.

Routine instances, including sponsored Consultants, may apply an existing approved applicability profile and validated standing authority without a fresh legal review for each recipient or meeting. The system must establish that the instance fits the profile; a materially new entity role, purpose, jurisdiction, record restriction, contract condition, or unresolved conflict requires appropriate review before affected disclosure. This reuse does not turn a permitted recipient category into blanket person-specific consent.

The review must consider the following when implicated; it must not assume that every regime applies to every participant:

| Context | Applicability question to resolve before exposure |
|---|---|
| Healthcare | Are the parties covered entities, business associates, or other recipients for this workflow; which agreements and restrictions apply? |
| Substance-use treatment records | Does 42 CFR Part 2 apply to this source and record; what consent, redisclosure, notice, or other conditions must be enforced? |
| Education | Is the disclosure of covered education records involved, and what authority, recipient conditions, and rights apply? |
| Homeless services and survivor safety | Which HMIS, funder, provider, victim-service, location-safety, and data-sharing restrictions govern the specific record and system? |
| Workforce, rehabilitation, and incentives | What program, disability, employment, and funding restrictions govern eligibility evidence and reporting; what may the employer actually receive? |
| Children, representatives, and contested authority | Who may authorize this specific action now; what limits, safety concerns, or conflicts require independent review? |
| Justice, compulsory, or legal demands | What verified instrument and lawful scope apply; who evaluates challenge, notice, and disclosure limits? |
| Cross-jurisdiction processing | Which state or other applicable privacy, breach, contract, location, and transfer rules affect the activity? |

HIPAA applies to covered entities and business associates, not simply to every organization that encounters health-related information. FERPA applicability also depends on the institution and record context. The required workflow analysis must use current law, not just a technical standard or this specification. [HHS covered-entity guidance](https://www.hhs.gov/hipaa/for-professionals/covered-entities/index.html), [Department of Education FERPA applicability](https://studentprivacy.ed.gov/faq/which-educational-agencies-or-institutions-does-ferpa-apply).

HHS's Part 2 guidance describes distinct confidentiality rules for covered substance-use disorder records. A general Collaboration agreement must not be assumed to resolve those rules. [HHS Part 2 guidance](https://www.hhs.gov/hipaa/for-professionals/regulatory-initiatives/fact-sheet-42-cfr-part-2-final-rule/index.html).

**SEC-LEGAL-02 — No invented exception hierarchy.** The engine must not assume consent overrides a legal prohibition, that a professional duty authorizes every disclosure, or that a court-related label grants unrestricted access. Unresolved material conflicts produce a bounded human review and interim restriction. Public assistance and appropriate emergency information remain available without waiting for the disputed disclosure.

## 6. Authentication, identity, and accessible recovery

### 6.1 Separate the questions

| Question | Relevant domain record or control |
|---|---|
| Who is interacting with the system? | Actor, Account, Session, authentication evidence |
| Which real person does a continuity record concern? | Mesh Person and identity-association evidence |
| Does this Account's Actor represent that person? | Actor–Person Association, separately assessed |
| In what organizational or personal capacity is the actor acting? | Validated affiliation and active represented capacity |
| What can this actor do in this instance? | Current Authorization Decision |

**SEC-ID-01 — Public discovery stays open.** Basic public discovery must work without a permanent Person ID or conventional identity proof. Optional registration must be separable from discovery and provider intake. Anonymous does not mean the submitted text contains no personal information: the ingress workflow must minimize, protect, and limit retention of volunteered sensitive content. Automatic processing may occur only within an approved ingress and model-processing profile whose authority and data eligibility cover the actual operation. Text must not be forwarded to a search engine, model, or provider merely because it was submitted. This rule permits governed natural-language processing without requiring a new consent prompt for every message; it does not authorize an external case disclosure or permanent registration.

**SEC-ID-02 — Registration is bounded.** Mesh Registration Authorization may cover the internal continuity activities defined in Domain Model section 6.5. It must not be bundled with external disclosure, a Helping Relationship, Collaboration participation, an external identity link, research, or training. The notice and authorization evidence must identify what was accepted and its version. Refusing optional sharing must not prevent basic discovery.

**SEC-ID-03 — Bind assurance to the action.** The Identity and Access Specification must map permitted actions to authentication, identity-association, represented-capacity, and recovery requirements. The mapping must support provisional and incomplete information. It must not create a universal trust score for a person or imply government-ID verification where only sponsor assertion or contact confirmation occurred. A lower-assurance public route must remain available when a protected action cannot proceed.

**SEC-ID-04 — Protect staff and privileged accounts.** Actors exercising organizational staff access to protected records, and privileged platform operators, must use individual accounts and multifactor authentication. Privileged control-plane access must use phishing-resistant authentication. These requirements follow the access being exercised, not the participant's employment status elsewhere. A sponsored guest who is employed by an organization may use the approved guest profile for a genuinely session-bounded consultation; the guest profile cannot expose staff capabilities or bypass staff authentication by changing a label. The approved identity profile must address accessible enrollment and recovery and keep anonymous discovery available. No shared staff passwords or universal person-record account are permitted.

**SEC-ID-05 — Protect sessions and delegation.** Validate token issuer, audience, intended client, scope, expiration, and revocation as applicable. Protect browser sessions against theft, fixation, request forgery, and unauthorized cross-origin use. Configure approved finite session, inactivity, reauthentication, and invitation limits by action class before activation. Switching organization or capacity must replace the active context, not union privileges. Logout or session revocation ends protected use of that session. Role removal and suspected compromise restrict the affected identities, capabilities, and delegated work. They must not silently revoke unrelated valid person authority. An already authorized background operation may continue after ordinary logout only where its delegation explicitly permits independent execution and current authority remains valid; logout is never sufficient evidence of revocation or continued permission by itself.

**SEC-ID-06 — Recovery must not be a shortcut to a dossier.** A phone, email address, household contact, or name/date-of-birth match is not sufficient evidence for a consequential account–person reassociation. Support approved alternatives for unstable contact, shared devices, disability, and lack of conventional identification. Recovery must record its evidence, reviewer or mechanism, assurance, affected sessions, and safe-notification decisions. A recovered account must not automatically acquire disputed links or a helper's authority. Changes to contact or recovery methods require appropriate reauthentication or assisted review.

**SEC-ID-07 — Make association errors reversible.** Candidate matching must not itself expose another person's record or merge identities. Consequential link, merge, de-link, and reversal actions require the specified assurance and authority, source-linked evidence, and audit. A dispute must restrict affected use while permitting safe unrelated assistance. Reversal must repair current access, projections, pending disclosures, and derived associations while preserving legitimate history.

**SEC-ID-08 — Minimize shared-device residue.** Protected views must support clear sign-out, bounded sessions, and approved cache/download behavior. Sensitive detail must not appear unnecessarily in browser titles, notifications, URLs, autocomplete, or locally persisted chat state. The interface must explain the limits of public devices and offer assisted alternatives without claiming that the platform can erase screenshots or other externally retained copies.

The identity profile should use NIST's separation of proofing, authentication, and federation as a reference, while explicitly adapting action requirements to the Mesh's accessible, proportionate model. This is not a claim of NIST assurance-level conformance. [NIST SP 800-63-4](https://csrc.nist.gov/pubs/sp/800/63/4/final).

## 7. Instance-specific authorization

### 7.1 Policy model

**SEC-AUTH-01 — Combine role, relationship, authority, and context.** Role-based access control defines maximum potential capabilities. Relationship information establishes relevant involvement. Attributes establish conditions. Validated Authority Records and confidentiality coverage establish the applicable permission and obligations. An allow decision requires every applicable condition, not an arithmetic score or a majority of favorable signals. Public discovery may be authorized by the approved public-access policy without a Person record, person-specific Authority Record, or NDA. For protected activity, a required relationship, authority, or confidentiality condition cannot be marked inapplicable simply because it is missing.

The decision must account for:

1. The Human or Automated Actor, current session or service identity, and any originating actor and delegation chain.
2. Active organization, unit, service/program/location, role, and represented capacity where relevant.
3. The requested purpose and distinct action: discover, read, summarize, change, link, disclose, download, export, transmit, reserve, or administer, for example.
4. Target records and versions, all materially affected subjects, required fields, and sensitivity.
5. The relevant relationship and validated authority, including scope, conditions, status, and effective period.
6. Recipient identity, destination, confidentiality coverage, and permitted retention or onward use where applicable.
7. Person Participation and effective Charter scope for Collaboration work.
8. Authentication and identity-association assurance, environment, time, operational limits, and material uncertainty.
9. Applicable prohibitions, legal/contractual constraints, policy version, and required safeguards.

**SEC-AUTH-02 — Enforce server-side and constrain the result.** The common authorization service must supply decisions to every enforcement point. Data access must be limited to the authorized subject, rows/objects, fields, versions, operations, and recipient. Object identifiers, possession of a URL, client-supplied organization IDs, and front-end state do not supply authority. Reading does not automatically permit a separately retained copy, export, model-processing purpose, or disclosure elsewhere. Necessary bounded technical steps, such as transient buffering to render an authorized view, may be included in the approved operation under their handling and retention controls; they do not require a new human confirmation for each internal step.

### 7.2 Decision outcomes

| Outcome | Meaning | Permitted continuation |
|---|---|---|
| `allow` | Required conditions are established for the exact scope | Execute only that scope and satisfy attached obligations |
| `deny` | A confirmed applicable prohibition, known-invalid basis, or established scope limit blocks the requested operation | Do not disclose or act; explain a safe alternative or route to challenge the determination where appropriate |
| `defer` | No confirmed block or mandatory human-review condition applies, but a required confirmation, authentication step, or operational dependency is unavailable | Do not act; ask a necessary bounded question or report the dependency problem, according to what is actually missing |
| `review_required` | Material conflict, disputed applicability, or a consequence rule requires an authorized human decision | Create a bounded review; restrict affected activity pending resolution |

Apply the outcomes in this order: a confirmed block produces `deny`; otherwise a required human decision produces `review_required`; otherwise an unmet resolvable condition produces `defer`; only a fully satisfied request produces `allow`. A review cannot waive a confirmed prohibition, though an authorized appeal may establish that a factual or applicability determination was wrong. All three non-allow outcomes withhold the affected operation. A technical outage must not be presented as a missing consent form or as provider ineligibility.

Evaluate the authority actually relied upon for the requested scope. The mere presence of an unused expired or revoked historical record does not negate an independently valid basis. Applicable prohibitions and the actual scope of withdrawal still govern; any continued use on another basis must meet `SEC-CONF-04` and be recorded, rather than silently substituting authority to evade withdrawal.

If a request can safely be narrowed, evaluate the reduced scope as its own request. Do not silently execute part of an action that the person authorized only as a complete transaction. A permitted redacted informational view may be offered without revealing excluded information or hidden relationships.

**SEC-AUTH-03 — No silent grants.** Missing, expired, withdrawn, disputed, or materially ambiguous authority must not become an allow decision. A refusal or explanatory message must not reveal the existence of another person's hidden record, relationship, or restriction. Denial of a protected operation must not be represented as provider ineligibility or refusal of basic assistance.

**SEC-AUTH-04 — Evaluate current authority at use.** Validate authority both when preparing a consequential action and immediately before protected access or external execution. Bind approval to recipient, purpose, payload/version, action, and applicable conditions. A material change requires reevaluation and renewed human authorization when outside the approved action. Standing authority may be reused when sufficient; rechecking does not mean obtaining a new form at every step.

Queued jobs, scheduled exports, retries, webhook-driven work, and long-lived sessions must not rely solely on authority captured when they began. Revocation and policy changes must invalidate affected cached decisions. A cached allow may be used only under an approved mechanism that detects applicable changes and enforces current restrictions; a time-to-live alone is insufficient justification for continued prohibited access.

The execution contract must define an ordered commitment boundary: the last enforceable authority check and the start of the specific release or external attempt must be protected against a concurrent authority change. If revocation takes effect first, the attempt must not begin. If release or handoff occurred first under valid authority, later revocation governs further use and remaining undisclosed material; it does not make already released bytes retractable. Streaming, live sessions, and batch operations must have bounded continuing checks and interrupt affected remaining disclosure. An uncertain external result is reconciled under `SEC-INT-06`, not retried under the earlier allow decision. This ordering must be implemented and tested rather than left as an assumed timing window.

**SEC-AUTH-05 — Treat automated actors as constrained delegates.** Service identities require a named owner, approved capabilities, bounded purpose, resource scope, credential lifecycle, and audit. A job performing a delegated action must carry the originating authority and current execution context. It cannot obtain more authority than the applicable delegation and service permission together permit. A legitimate system-maintenance purpose requires its own authority; “system” is not an unrestricted role.

### 7.3 Logical Authorization Decision record

**SEC-AUTH-06 — Retain the basis without duplicating the case.** A protected decision record must contain, directly or through controlled references:

| Field group | Required meaning |
|---|---|
| Identity and correlation | Decision ID, request/correlation ID, actor, originating actor when different, session/service identity |
| Representation | Active role, organization/unit, represented capacity, applicable relationship references |
| Request | Purpose, action, target identifiers/versions, affected-subject scope, requested recipient/destination |
| Basis | Authority and confidentiality references/versions, relevant Charter/participation references, assurance and restrictions evaluated |
| Evaluation | Policy/evaluator version, trusted evaluation time, allow/deny/defer/review outcome, reason codes |
| Obligations | Permitted fields/action, redactions, expiration, recipient conditions, required human review or other safeguards |
| Execution linkage | Resulting action/audit references, actual execution time and outcome, or nonexecution reason |

The record must distinguish an authorization to act from evidence that the action actually happened. While relevant evidence is legitimately retained, a later reviewer must be able to reconstruct the material basis under the retention schedule. Approved disposition may limit later reconstruction; record that limit rather than retaining otherwise unauthorized content indefinitely. Raw documents, passwords, full conversations, and unnecessary personal detail must not be copied into decision logs.

## 8. Authority, confidentiality, and revocation

**SEC-CONF-01 — Keep involvement, permission, and obligation separate.** A Relationship describes involvement; an Authority Record records a claimed or validated basis for action; a Confidentiality Obligation records how a recipient is bound. An asserted Authority Record must not be treated as validated merely because it exists. Consent is one authority basis; an ROI is one instrument; neither is a universal substitute for all other applicable authority.

**SEC-CONF-02 — Reuse sufficient coverage.** The system must evaluate the scope and continuing validity of existing authority and confidentiality coverage before asking for additional instruments. Coverage may arise from an applicable professional, employment, institutional, contractual, legal, or accepted confidentiality obligation. A general NDA may supply sufficient confidentiality coverage without supplying disclosure authority. A role change or new meeting does not by itself require a new NDA or ROI; a change beyond existing scope may require additional authority or terms.

The evidence must identify the obligated party, basis or agreement version, covered purposes/information/recipients, acceptance or other validation, effective period, exceptions, and continuing obligations. Where the same reliable evidence suffices, it should be referenced rather than repeatedly collected. Uncertain material coverage produces one proportionate validation step or human review, not silent permission.

**SEC-CONF-03 — Keep helpers independently bounded.** A person may have several Helping Relationships. Each must retain its accepted scope, represented capacity, authority, confidentiality coverage, time, and status. One helper must not see another helper's activity merely because both help the same person. Shared access requires its own sufficient authority. Informal public co-navigation need not create a formal Helping Relationship; an invitation alone does not activate protected helping access.

**SEC-CONF-04 — Apply withdrawal prospectively and precisely.** Revocation, expiry, suspension, and relationship termination must stop future reliance on the affected basis. They must restrict associated sessions, pending actions, links, queries, and projections as applicable. They must not silently erase a legitimate prior disclosure, provider custody, or audit history, nor terminate an unrelated valid authority.

If another lawful basis is proposed for continued use, it must be independently validated, purpose-limited, recorded, and explained where appropriate. The platform must not silently substitute a broad “operations” basis to defeat a person's withdrawal. Provide understandable information about what stops, what must remain, which external recipients may retain lawful copies, and how to request review.

## 9. Organizational isolation and privileged operations

**SEC-ORG-01 — Scope affiliation and offboarding.** Validate that a staff actor represents the relevant organization, unit, service, program, or location. Delegated administrators may grant only capabilities within their own valid administration scope. Joining an organization, a Provider's participation, or an employer's capacity must not create person authority. Removal, suspension, or expiry of affiliation must revoke affected future access, including delegated jobs and tokens, without rewriting the historical record of authorized work.

**SEC-ORG-02 — Enforce compartment boundaries.** Each Collaboration is an independent information and authority compartment; an organization boundary is not the only isolation boundary. The tenancy design must demonstrate person-, organization-, Collaboration-, and purpose-specific isolation across databases, object storage, queues, search, analytics, logs, and backups. Shared infrastructure is permissible only with approved, tested isolation. No tenant-filter parameter supplied by a caller may be trusted without server validation.

**SEC-PRIV-01 — Separate Springboard's capacities.** Platform stewardship, direct service provision, Collaboration backbone work, and analytic stewardship must have explicit, separately authorized contexts. Funding, infrastructure administration, organizational membership, or backbone status does not confer general custody or access. Access acquired through one capacity must not leak into another. Administrative tools and discovery ranking must not favor a provider merely because it participates, funds the platform, or is affiliated with Springboard. Disclosure of that affiliation does not cure preferential treatment. Recommendations must follow the person's Need, relevant constraints, and accountable evidence.

**SEC-PRIV-02 — Minimize administrative exposure.** Routine operations must use technical metadata and synthetic examples where sufficient. Person-specific troubleshooting requires a recorded operational purpose, case or incident reference, bounded scope, stronger authentication, finite elevation, and audit. Database, object-store, backup, key-management, vendor-console, and audit-administration access must be included in privileged-access review. Product-layer controls do not excuse an unrestricted administrative back door.

**SEC-PRIV-03 — Exceptional access is not an emergency permission generator.** A break-glass mechanism must remain disabled until its eligible actors, independently valid authority, permitted circumstances, information scope, duration, notification, and independent review are approved and tested. It may implement a lawful exceptional workflow; it cannot manufacture legal authority, provide a blanket consent override, or authorize prohibited secondary use. Record the initiating human, reason, scope, access, duration, and review outcome. Ordinary support inconvenience is not sufficient justification.

**SEC-PRIV-04 — Review entitlements and exceptions.** Access review must cover staff, organizational delegates, guests, service identities, inactive accounts, vendor access, and privileged grants. An approved operating profile must set review intervals and accountable reviewers. Material role changes, departures, charter changes, suspected compromise, and authority disputes require event-driven review without waiting for a periodic cycle. Time-limited risk exceptions must identify compensating controls, owner, scope, expiration, and closure evidence; they cannot waive a constitutional prohibition or unresolved legal authority.

A risk acceptance may address permitted residual risk or an alternative that demonstrably satisfies the mandatory control. It must not mark an unsatisfied mandatory requirement as passed, authorize access missing a required condition, or bypass an exposure gate. A departure from a mandatory requirement outside an expressly defined exception requires amendment by the authority that controls that requirement before affected use. The protective-containment qualification in `SEC-AUD-03` and the bounded exceptional-access process in `SEC-PRIV-03` apply only within their stated scopes.

## 10. Service Connections, Referrals, and notifications

**SEC-REF-01 — Authorize the actual connection.** A public phone number, website, or provider candidate may be displayed without creating a Referral. Contacting a provider on someone's behalf, completing a form, sending an application, booking an appointment, or making a formal Referral requires authority appropriate to that action and information. Do not force every consultation or direct connection into a provider-service Referral. For an employer or learning connection, bind the selected Organization, offering capacity, Opportunity, actual action, information, and recipient under Domain Model section 11. Preserve the requirements snapshot and record responses as attributable Connection Events and appropriate Outcome Claims; do not imply Provider status, Provider engagement, or a formal Referral from application, admission, hiring, or placement.

**SEC-REF-02 — Bind the handoff.** A Referral must bind the selected Provider and receiving point of contact, Service Connection, purpose, Script version, information scope, Document References, authority, and transport. Before transmission, the person or authorized actor must be able to review what is being sent, to whom, and why. The executor must validate the current recipient and approved payload. A changed destination, additional subject, expanded purpose, or material payload change must not inherit approval automatically.

**SEC-REF-03 — Preserve transport and custody evidence.** Record preparation, authorization, attempted transport, delivery evidence, acknowledgment, provider response, procedural disposition, and Outcome Claims distinctly. A successful API call or opened message is not acceptance, enrollment, eligibility, or service receipt. Preserve the sent Script/version and applicable evidence snapshot within the retention schedule. A receiving provider's legitimate record custody is separate from continued access through a Mesh link.

### 10.1 Channel handling

| Channel or action | Baseline disclosure rule |
|---|---|
| In-product protected view | Current authorization for each relevant record, subject, and operation |
| Email, SMS, or push notification | Minimum safe notice and an opaque protected pointer; no case narrative, diagnosis, benefit status, unsafe location, or unnecessary provider-context disclosure by default |
| Secure link or invitation | Recipient-bound, purpose-bound, expiring and revocable within Mesh control; possession alone does not authorize protected content |
| Protected external API or portal submission | Approved recipient/capability, permitted payload, authenticated channel, current authority, and bounded receipt evidence |
| Telephone or in-person coordination | Validate recipient and disclosure scope proportionately; record the material authorized action and reported result without pretending the Mesh observed every exchange |
| Download, print, or export | Separately authorized copying/custody action with warning about retention and recall limits |

**SEC-NOTIFY-01 — Make contact safe.** Capture permitted contact methods and relevant safety restrictions without excessive collection. A contact channel does not prove identity or imply consent to disclose through it. Verify changes appropriately and withhold affected notices from unsafe, obsolete, or disputed contacts until safe handling is established. A shared contact may be used when the person or authorized representative selects it, the approved contact profile finds the intended message appropriate, and its content and timing respect the person's safety restrictions. Shared use alone must not exclude someone from assistance; it also must not be treated as private communication. Even a notification that names a sensitive provider can reveal participation. The approved channel profile must address message templates, failed delivery, forwarding, previews, expiry, and alternatives for people without stable digital access.

**SEC-NOTIFY-02 — Prevent token and context leakage.** Routine notices must not expose durable credentials, unrestricted access tokens, internal object identifiers as authority, or personal detail in URL parameters and logs. An approved enrollment, invitation, authentication, or recovery workflow may issue a purpose-bound verification code or token through its approved channel. Such a token must be expiring, revocable where applicable, resistant to replay, and usable only for its specified step; it must not independently grant protected-record access. The identity profile must define recipient binding and any additional confirmation or authentication. Neither the token nor the full token-bearing URL may enter logs, analytics, model context, referrer headers, or preview content.

Link-preview crawlers and email security scanners must not receive protected content, redeem a one-time verification step, accept invitations, or execute consequential actions merely by fetching a URL. Issuance of a bounded verification token is the sole credential-delivery qualification to the routine-notification prohibition here and in `SEC-PLAT-03`; it does not permit sending stored passwords, API keys, master recovery secrets, or document-access bearer tokens by ordinary notice. Any other approved channel variation must retain applicable authority, safeguards, and recipient handling; the platform must not claim it can recall an external message or attachment.

## 11. Secure documents and custody

**SEC-DOC-01 — Protect the asset and its representations.** Store protected document assets in approved encrypted storage with opaque identifiers, controlled metadata, immutable versions, integrity hashes, and purpose-bound references. Possession of a Document Record or its metadata must not grant access to the asset. Each preview, extraction, download, export, disclosure, and reference creation must use its own authorized operation and produce required evidence.

**SEC-DOC-02 — Account for multiple subjects.** A Document Subject association must remain sourced, contestable, and distinct from the uploader, author, custodian, referral target, or account holder. For multi-person documents, determine sufficient authority for every materially affected subject and disclosed portion. This does not mean collecting a separate consent from everyone when another valid authority applies. Use an authorized excerpt or reliable redaction if it meets the purpose; otherwise withhold the affected disclosure and seek review. An unidentified or disputed subject is not permission to disclose the whole asset.

**SEC-DOC-03 — Isolate intake and processing.** Validate size, type, and content expectations; isolate uploads pending approved malware and content-safety checks. Sandboxed parsers and converters must not execute document macros or make uncontrolled network requests. Protected preview must handle active content safely. If validation or scanning is unavailable, the affected content remains quarantined rather than silently trusted. Public help may continue without that asset.

Redaction must remove the underlying information from the released representation, including hidden layers, text extraction, attachments, metadata, and thumbnails as applicable. Black rectangles alone are not evidence of redaction. The release must identify the derived version and retain authorized provenance to the source without exposing the hidden content.

**SEC-DOC-04 — Control release and continued access.** Access links must enforce recipient, reference, action, version, current authority, expiry, and revocation conditions at use. Where a storage mechanism cannot enforce these conditions, protected release must pass through a control that can. Raw long-lived bearer URLs to protected objects are not an adequate default. Download restrictions limit platform functionality; they must not be described as preventing photographs, screenshots, or all subsequent copying.

**SEC-DOC-05 — Preserve separate custody and disposal.** Ending one reference does not automatically delete an asset still retained under another valid purpose or hold. Retaining an asset does not keep an expired reference accessible. Versions, copies, external transfers, corrections, legal holds, and eventual disposal must remain attributable. The document-retention profile must distinguish source assets, derived processing results, references, and custody evidence.

## 12. Collaborations and low-friction Consultants

**SEC-COL-01 — Require both governance and person authority.** A proposed or historical Collaboration record may exist without current operational authority and has at most one currently effective Charter Version. Active protected Collaboration work requires a currently effective approved Charter and valid organizational participation. Identifiable case work also requires applicable Person Participation and disclosure authority. The de-identified consultation route in `SEC-COL-04` does not require a Mesh Person link or Person Participation record merely to identify a discussion whose disclosure is authorized without identifying a person. Charter approval and effective date are distinct. A gap or termination must not extend active case access. Historical custody, correction, audit, and rights review may continue only under their independently valid authority and retention controls; they do not reactivate Collaboration access. Overlapping Collaborations must not share membership, information, or outcome attribution automatically.

**SEC-COL-02 — Keep sponsored admission simple and accountable.** An authorized Collaboration Member may sponsor an outside Consultant for a bounded Case Review. “Expert” describes contextual relevance; it is not a universal credential class, Provider type, formal membership, or direct relationship with the help-seeker.

The admission workflow must support capturing the following at joining, without a separate credentialing project:

1. A session-bound invitation identifying the sponsor, invited participant, reason for inclusion, scope, and expiration.
2. The sponsor's assertion of identity, relevance, and any credentials or affiliation actually claimed; record these as assertions, not independent Springboard verification.
3. The participant's confirmation that they are the invited person and confirmation of the applicable affiliation or represented capacity, at the assurance level appropriate to the consultation.
4. Acceptance of the general Case Review confidentiality agreement, or verified reuse of sufficient existing coverage.
5. Validation that the current Charter and the applicable disclosure authority cover the invited participant and proposed information: Person Participation for identifiable case work, or the approved de-identified route in `SEC-COL-04`; additional authority only if existing scope is insufficient.
6. Recorded admission, attendance/access period, applicable scope, departure, and termination of session access.

An authorized facilitator must be able to capture sponsor and participant confirmations during the meeting when the approved joining method supports it. The process must not require a conventional identity document, independent professional credential verification, a new NDA for each meeting, or a Provider enrollment solely because the participant is called an expert. Higher assurance or additional restrictions remain necessary when the actual information or action requires them.

**SEC-COL-03 — Limit consultation to the authorized session.** By default a Consultant receives only the prepared case material and discussion authorized for that review; no general Mesh Person search, unrelated document history, unauthorized information about other helpers' activity, or continuing access. An authorized case summary may include relevant helper contributions within its disclosure scope. Session termination, removal, or loss of current authority must end further access according to the continuing-disclosure rule in `SEC-AUTH-04`. Rejoining requires current validation. A continuing confidentiality obligation survives access termination according to its terms.

The agreement should cover permitted consultation use, unauthorized disclosure, copying, recording and retention limits, incident reporting, termination of access, and continuing confidentiality. It must not be presented as the help-seeker's disclosure authorization. Reuse of the agreement does not reuse a prior session's invitation or scope.

**SEC-COL-04 — Treat the meeting itself as disclosure.** Control the live roster, displayed material, screen sharing, chat, captions, attachments, and any recording or transcription. When the roster changes, the facilitator and system must limit further disclosure to the current authorized audience. Pause affected content if authorization is uncertain. Recordings, transcripts, and AI meeting assistants require explicit applicable authority and approved processing; they must not be silently enabled by a conferencing default or an invited participant's bot.

A sufficiently de-identified consultation may proceed without linking the discussion to a Mesh Person or creating a Person Participation record for that discussion, as permitted by Domain Model section 14.6. This requires an approved Charter and release profile, sufficient authority to prepare and use the derivative for consultation, and an assessment of re-identification risk for the actual audience and context. Removing names alone is insufficient. If discussion or combined details become identifiable, pause that material until the required Person Participation and disclosure authority are established. The de-identified route creates no general secondary-use permission. Screenshots or remembered information cannot be technically recalled; the terms and participant accountability remain important.

**SEC-COL-05 — Make changes of relationship deliberate.** Consultant guidance remains an attributable contribution, not automatically a verified finding. Consultation does not create a Referral, Service Connection, Helping Relationship, Provider Engagement, eligibility determination, or ongoing service duty. A later direct assignment, contact with the person, service provision, document retention beyond scope, or ongoing participation requires the appropriate new or amended relationship and authority before it occurs.

**SEC-COL-06 — Authorize referral contribution separately.** Receipt of a Referral does not authorize a provider to contribute its contents to a Collaboration. Validate the contribution's purpose, document custody, participant scope, and person authority independently. Charter changes must trigger examination of affected grants; they must not silently enlarge existing person-specific scope.

## 13. Evidence integrity, search, and graph projections

**SEC-EVID-01 — Preserve accountable meaning.** Security controls must protect the source language, source identity, observation/effective times, uncertainty, and correction history of consequential Claims. A provider's own claim is authoritative only within its legitimate scope. No signature, hash, successful integration, repeated observation, or AI summary by itself establishes the truth of a claim, a person's identity, or a service outcome.

**SEC-EVID-02 — Govern consequential vocabulary changes.** Classification assertions and mappings must retain source, status, scheme/version, and responsible actor. AI may propose a classification or candidate concept; only authorized stewardship may adopt canonical terminology. Term adoption, mapping changes, merges, and deprecations must be audited when they affect consequential behavior. A new taxonomy label must not automatically grant access, downgrade confidentiality, or convert an employment opportunity into a provider-service relationship.

### 13.1 Authorization-aware projections

The approved Architecture permits derived indexes and projections. A knowledge graph, vector index, summary store, or GraphRAG implementation may be evaluated within that boundary, but this specification selects none of them and creates no second canonical system of record.

**SEC-GRAPH-01 — Connectivity does not grant authority.** If a graph is used, every exposed node, edge, property, path explanation, and derived result must be permitted for the current purpose and audience. A path from a person to a helper, provider, employer, or Collaboration is evidence of a represented relationship, not a transitive access grant. A public provider vertex does not make a private participation edge public.

**SEC-GRAPH-02 — Filter before the model or recipient sees the data.** Construct requester-facing retrieval and model context from information that the intended recipient and approved processor may use for that purpose. Authorization must constrain joins, traversals, vector retrieval, document chunks, and source excerpts before requester-facing model-context assembly or result exposure. Output screening is an additional safeguard, not permission to give an unauthorized record to that model context first. Trusted indexing, policy, classification, and redaction services may process broader records only under their own explicitly scoped system authority, approved processor eligibility, and isolation. Such preparation is a separate authorized processing operation; its broader context must never be reused as the requester's context.

A recipient may receive a properly authorized redacted or de-identified derivative without permission to read the entire source document. The release decision must cover the derivative's actual content, purpose, audience, and applicable source restrictions. Lineage and citations must use an authorized excerpt or safe reference; they must not reveal hidden source content or relationships. Permission to receive the derivative does not authorize requesting its unredacted source.

Counts, facets, autocomplete, recommendations, similarity scores, error messages, and path existence can reveal hidden participation. Queries must not expose these signals from unauthorized data. A separately approved analytic aggregate may be released under its own authority and disclosure controls; ordinary search permission is not that approval.

**SEC-GRAPH-03 — Protect derivatives and caches.** Embeddings, OCR text, summaries, and inferred relationships are not anonymous merely because they differ from source text. Apply relevant source restrictions and any additional sensitivity created by combination. Any reduced classification or broader permitted audience for a redacted or de-identified release requires the approved release profile, sufficient authority, evidence of the transformation and risk assessment, and a distinct derived version. A transformation alone never relaxes a legal or contractual restriction. Derivatives must retain protected lineage and material uncertainty; permissions must be evaluated for the derived disclosure itself. Shared caches must not mix actor, subject, organization, Collaboration, purpose, policy, or authority contexts in ways that expose protected material.

**SEC-GRAPH-04 — Propagate change safely.** Revocation, correction, de-linking, subject disputes, retention disposal, and restriction changes must make affected derived content unavailable for prohibited uses at the next access decision, including while physical index updates are pending. Rebuild or remove derivatives as required, test for stale leakage, and maintain protected lineage needed for accountability. Rebuilding a graph or index must not create a new evidence source or restore an invalid authority.

## 14. AI and model-processing boundary

**SEC-AI-01 — Use the Model Gateway for Mesh model processing.** Model use within the Mesh application and its operational data workflows requires an approved task, processing purpose, input/output scope, provider/model configuration, data-class eligibility, retention and logging terms, and accountable owner. The Model Gateway must enforce these conditions for inference, embeddings, OCR or document analysis using models, transcription, summarization, classification, and evaluation, including isolated preparation permitted by `SEC-DATA-02` and `SEC-GRAPH-02`. Do not bypass this operational boundary through an SDK, browser plugin, meeting assistant, developer console, or generic tool.

External AI assistance used to draft specifications, write code, or test with permitted development material is governed by `SEC-DEV-01` and an approved development-tool profile. It does not require a production Mesh gateway to exist first. It must not receive live Mesh case records, operational credentials, or an unapproved derivative. A gateway prototype may be built and tested under an approved bounded synthetic implementation; that does not authorize protected operational processing before the gateway controls pass their applicable gate.

**SEC-AI-02 — Approve the processor, not just the product name.** Before protected information is sent, verify the specific service tier, configuration, deployment/processing locations, subprocessors, confidentiality terms, retention and deletion behavior, human-access conditions, security controls, incident cooperation, and applicable agreements. A vendor's advertised capabilities or a general enterprise subscription is not sufficient evidence. An absent or expired processing approval blocks that model path; public, synthetic, or manual alternatives may remain available within their own approved scope.

No model vendor or confidential-processing arrangement is approved by this specification. A public-facing natural-language service must address the likelihood of unsolicited sensitive input before launch; a disclaimer alone does not make forwarding such input safe.

**SEC-AI-03 — Keep instructions and authority outside untrusted content.** Treat source pages, documents, retrieved snippets, messages, metadata, model outputs, and tool descriptions as untrusted content for action selection. Validate tool names, parameters, destinations, and effects against the real request and current authorization. The model must not approve its own disclosure, alter policy, adopt canonical terms, merge identity, invent consent, commit a provider, or confirm an outcome. Human review and deterministic controls must mediate consequential actions.

Human authorization may be captured in a specific approval or a valid standing delegation for the bounded operation. Deterministic execution checks remain required; the wording above does not demand a fresh human click for every internal step, unchanged retry, or scheduled action that remains within that delegation. Material changes or mandatory review conditions still require the appropriate new human decision.

Prompts, classifiers, and content filters may reduce risk but are not the authorization boundary. Restrict available tools and outbound destinations so a manipulated model cannot use its context as a path to arbitrary disclosure. Render model-produced links and markup safely; do not automatically fetch embedded remote content that can leak private context.

**SEC-AI-04 — Minimize and isolate model context.** Supply only the authorized information needed for the task. Separate people, purposes, organizations, Collaborations, and sessions; previous access does not justify retaining or reusing context after authority changes. Secrets must remain outside model context. If reliable restriction of an existing session's context is not possible, discontinue that context and construct a newly authorized one. A logging or debugging feature must not create an unapproved transcript repository.

**SEC-AI-05 — Preserve evidence and reviewability.** Consequential output must identify that it is AI-derived, its authorized source references, relevant processing time and model/configuration version, and material limitations. Record review, acceptance, dispute, and correction distinctly from generation. Structured extraction must not erase narrative disagreement or become professional judgment through repetition. Do not retain hidden model reasoning as the required audit explanation; retain the policy basis, source-linked output, and accountable human decision.

**SEC-AI-06 — Enforce the constitutional training boundary.** Identifiable or confidential personal information must not train a general-purpose or third-party model. Any other training use of Mesh-derived personal information remains prohibited unless authorized by constitutional amendment. An ROI, vendor opt-out setting, Board research approval, or a description such as “quality improvement” cannot waive that boundary. Bounded development and evaluation of Mesh instructions, classifications, retrieval methods, and decision-support logic using public, synthetic, or appropriately de-identified information requires approved controls and must not be used to relabel prohibited training.

## 15. External integrations, MCP, and Resource Transactions

**SEC-INT-01 — Register capabilities, not blanket trust.** Each integration must identify the external system and accountable owner, permitted operations, current endpoint or governed destination rules, authentication, scopes, input/output contracts, data classes, processing conditions, version, limits, expected evidence, and failure/reconciliation behavior. An approved public-discovery retrieval capability may encounter new public source URLs within its destination and safety rules without separately onboarding every website as a protected integration. That flexibility does not authorize protected data submission, credential sharing, or an external write. Provider identity is distinct from an endpoint, MCP server, integration credential, participation agreement, or vendor. Changes to a consequential capability's contract or destination require review before use.

**SEC-INT-02 — Protect credentials and messages.** Use scoped service credentials through approved secret management, not shared human passwords or model-visible tokens. Authenticate and authorize each protocol as applicable. Validate incoming callbacks, signatures or equivalent origin proof, audience, correlation, freshness, and replay resistance under the approved integration profile. Do not let an inbound message directly assert a new Mesh authority or bypass domain-state validation. Prevent credential forwarding or token reuse for an unintended recipient.

**SEC-INT-03 — Constrain retrieval and network effects.** Validate URLs, redirects, resolved destinations, file types, and response limits. Prevent server-side access to unintended internal services, cloud metadata, local files, or credential endpoints. Public discovery may reach previously unknown legitimate sources through a constrained retrieval boundary; it does not authorize arbitrary external writes. Apply source licenses, rate/cost limits, and approved collection scope. Untrusted source content must never be treated as a tool-execution instruction.

**SEC-INT-04 — Apply the same policy through MCP.** MCP resources, tools, and prompts must use approved authentication, authorization scopes, actor representation, and audit. Client or server identity alone must not supply person authority. Tool metadata is untrusted until governed registration; a read-only capability must not silently become a write. Version-specific protocol and security details require the integration ADR. MCP is an external interoperability boundary, not the sole internal control mechanism.

**SEC-INT-05 — Authorize writes at execution and retry.** A hold, reservation, release, form submission, appointment request, or other consequential external action requires an authorized Resource Transaction or applicable bounded action record. Bind the exact target, subject scope, action, parameters, authority, and idempotency/correlation identifiers. Validate current authority before each execution or retry. A retry must not duplicate the action, expand the payload, or use a changed recipient without review.

**SEC-INT-06 — Preserve unknown results and external authority.** Record attempted execution and response evidence. A timeout or interrupted response must remain unknown until reconciled; do not treat it as success or failure and blindly retry. The external system remains authoritative for its holds, reservations, releases, acceptance, and service decisions. Cancellation after Mesh revocation may require an authorized external action and reconciliation; revoking Mesh access does not prove an external reservation was canceled. Availability, reservation, admission, and actual service receipt remain separate.

## 16. Infrastructure, encryption, and secret management

**SEC-PLAT-01 — Select and document the security profile.** The deployment ADR must identify production and nonproduction boundaries, tenancy, data locations, network entry/exit, runtime and storage identities, dependency ownership, patching, encryption, monitoring, backups, recovery, and vendor-access paths. Use maintained security mechanisms and supported cryptographic libraries; do not implement custom cryptography. The initial modular-monolith architecture does not require a distributed security platform, but it does require demonstrable separation of authority.

**SEC-PLAT-02 — Encrypt protected information.** Mesh-managed digital transfer of protected information must use authenticated encrypted transport; protected information at rest must be encrypted in transactional storage, objects, audit storage, approved temporary storage, and backups. The approved profile must specify currently acceptable protocol/cipher configurations, certificate validation, key management, rotation/revocation, and recovery. Human-mediated telephone or in-person coordination follows the approved channel rules in section 10, including recipient validation, appropriate setting, minimum disclosure, and required action evidence; ordinary speech must not be represented as cryptographically protected. That human route must not become an unapproved plaintext digital export or bypass of Mesh access controls. Encryption does not replace authority or minimization. Claims of end-to-end encryption must accurately describe who can decrypt, including approved server-side or model processing.

**SEC-PLAT-03 — Separate keys, secrets, and application data.** Keep credentials and cryptographic keys out of source control, approved documents, logs, issue trackers, prompts, ordinary notifications, and ordinary database exports. Purpose-bound verification-token issuance may occur only under `SEC-NOTIFY-02`; that qualification does not permit exposing durable credentials or encryption keys. Use scoped, revocable identities and an approved secret/key service or equivalent controlled mechanism. Separate the ability to administer key policy from ordinary application access where practicable; audit privileged key access and changes. Key backup, rotation, destruction, and recovery must not accidentally expose retained data or make records irrecoverable before authorized disposition.

**SEC-PLAT-04 — Harden applications and dependencies.** Implement the applicable web/API controls for injection, unsafe deserialization, unauthorized object access, request forgery, cross-site scripting, unsafe uploads, mass assignment, and session misuse. Restrict application database identities and network egress. Review dependencies and material updates, record deployed versions, and prevent secrets or real personal data from entering build artifacts. Security patches require a bounded, authorized release path rather than an unreviewed production modification.

**SEC-PLAT-05 — Govern processor access.** Hosting, monitoring, support, document conversion, notification, conferencing, and model vendors must receive only approved data for approved purposes under applicable terms. Include their administrators, subprocessors, backups, telemetry, and incident access in the assessment. Third-party analytics, session replay, advertising pixels, and similar code must not receive protected page or interaction content through a default installation. Vendor offboarding must include credential revocation and required disposition/return of retained information.

## 17. Audit, evidence, and security monitoring

### 17.1 Distinct records

A Domain Event describes a domain transition. An Audit Event records an accountable attempted or completed action and its security-relevant basis. A technical log supports operations. An Outcome Claim describes reported change for a person or population. These records may reference one another but must not be substituted for one another.

**SEC-AUD-01 — Record consequential activity.** Audit must cover at least:

- Authentication and recovery events, session revocation, staff/role/delegation changes, and privileged elevation.
- Registration authorization, Actor–Person association, external identity linking, merges, disputes, de-links, and reversals.
- Authority and confidentiality assertion, validation, grant, amendment, expiry, withdrawal, and scope changes.
- Protected access requests and their allow, deny, defer, or review-required decisions, including search/export and model-context release.
- Document intake, subject association, reference, preview/access, processing, download, disclosure, correction, hold, and disposal as consequentially applicable.
- Referral authorization, actual transmission attempts, recipient/payload changes, response evidence, withdrawal, and external Resource Transaction execution/reconciliation.
- Charter and participation changes; Consultant sponsorship, confidentiality acceptance/reuse, admission, scope, departure, and recording/transcription activation.
- Consequential Claim corrections and vocabulary/mapping adoption; protected projection construction and release; secondary-use approval, dataset access/export, and result release.
- Security-policy and configuration changes, vendor/credential changes, incident actions, audit access/export, integrity checks, and recovery/disposition actions.

Repeated low-level internal reads may be represented by a bounded operation record only when it identifies the accessed scope and preserves required reconstruction. Sampling must not remove evidence of required protected disclosures or consequential changes. Public browsing may use minimized, bounded security telemetry without creating permanent person continuity.

The audit service's authenticated append, acknowledgment, and integrity-check machinery must preserve the original event's attributable delivery and integrity evidence; each internal bookkeeping step does not require an infinite chain of new Authorization Decisions and Audit Events about itself. Reading audit history, exporting evidence, changing audit policy, or exercising administration remains a separately authorized and audited operation. Any unavailable actor, decision, or delivery evidence must be marked with its reason and limits rather than invented.

### 17.2 Logical Audit Event contract

**SEC-AUD-02 — Record who, under what authority, did what, and what actually resulted.** The audit contract must include the following meanings, with unavailable values explicitly distinguished from known values:

| Field group | Required meaning |
|---|---|
| Event identity | Unique event ID, event type, schema version, correlation/causation IDs |
| Actor | Human or service actor, originating actor/delegation when applicable, active represented organization/unit/capacity |
| Time | Trusted server event/recorded time, external source time if relevant, and uncertainty or clock anomaly where material |
| Action and target | Operation, target IDs/versions, affected subject scope, recipient/destination reference where applicable |
| Authority | Authorization Decision ID, relevant authority/confidentiality references, policy version, purpose |
| Execution | Attempted/completed/failed/unknown result, safe reason code, relevant before/after version references, external receipt or reconciliation reference |
| Accountability | Required reviewer/incident/case reference, origin channel, applicable retention/disposition class |
| Integrity | Mechanism-specific sequence/checkpoint or integrity evidence supporting detection of alteration and gaps |

Audit identifiers and association metadata can themselves reveal sensitive relationships; they remain protected. Free-text reasons must be constrained and reviewed for unnecessary personal detail. Record version references and approved evidence manifests rather than copying full payloads into each event. Never log passwords, recovery codes, access tokens, session cookies, raw secrets, or unrestricted conversations/documents.

**SEC-AUD-03 — Make execution and evidence durably consistent.** A protected release, new access grant, or ordinary consequential domain mutation must not proceed without durable recording of its authorization and attempt. The implementation must specify atomic recording or an equivalent durable mechanism so committed work cannot silently lose required evidence. External operations cannot be made atomic merely by writing a local event: persist the intent, then record the external attempt and result, preserving an unknown state when interrupted and reconciling it later.

If the central audit destination is unavailable, those operations may continue only through an approved, durable, access-controlled buffering mechanism that preserves integrity, order/correlation as required, capacity limits, and eventual reconciliation. If no compliant evidence path is available, deny or defer them. An in-memory best-effort log is not sufficient. Public information and independently authorized safe alternatives should remain available.

Preauthorization means an explicit, current human delegation recognized under Development Governance section 7.4, together with the applicable approved runbook. The Security specification itself is not that delegation.

Audit failure must not prevent a pre-authorized protective action that only reduces access or stops exposure, such as terminating a session, disabling a compromised credential, applying a restrictive block, or disconnecting an affected endpoint. Use available durable evidence paths; if all are unavailable, apply the restriction under the approved failure/incident policy, preserve whatever trustworthy evidence is available, and record the action and evidence gap when recording recovers. This narrow qualification permits no new disclosure, access grant, inspection of protected content, alteration of case facts, destruction of records, or deletion of audit history. It is not break-glass access and does not authorize ordinary protected work to continue without evidence. Restoration of access again requires normal authority and durable audit.

**SEC-AUD-04 — Detect tampering and protect the audit boundary.** Application operators must not be able to silently rewrite audit history. The audit design must detect unauthorized alteration, deletion, insertion, truncation, replay, and relevant gaps, using an approved combination of restricted append, independent integrity checkpoints, retention protections, and verification. A hash chain stored entirely under the same unrestricted administrator is not sufficient evidence against that administrator's rewriting. Tamper-evident does not mean infallible or proof that the underlying real-world claim was true.

Approved, attributable disposition under section 18 is distinct from unauthorized deletion. Integrity mechanisms must preserve permitted verification evidence and identify the scope and limits of lawful disposal or known recording gaps. They must not mislabel an authorized disposal as tampering or treat unexplained missing records as lawful disposal.

Verify integrity on an approved schedule and after restore, migration, or suspected compromise. Audit privileged access to the audit system itself. Separate administration, evidence export, and investigation permissions to the extent required by the threat model and role-conflict controls.

**SEC-AUD-05 — Make review usable and bounded.** During the applicable retention period, authorized reviewers must be able to reconstruct the material actor, authority, payload/version, recipient, timing, and outcome of an action from the evidence legitimately retained, without unrestricted access to every case. The retention schedule must identify when underlying content and accountability metadata have different lifetimes. After authorized disposal, report what can still be established and what can no longer be reconstructed; a hash or version reference cannot recreate deleted content. Exported evidence must include provenance, completeness limits, and integrity verification where applicable. A person's request for an explanation or disclosure history must use a rights-aware projection; it must not dump other people's information, credentials, or sensitive investigative details.

**SEC-AUD-06 — Monitor for actionable risks.** Detection must address suspicious account/recovery changes, repeated denied access, unusual downloads/exports, cross-compartment attempts, abnormal service credentials, unexpected destinations, privilege changes, failed audit delivery/integrity, stale authorization, and unexpected model or external-tool activity. Record defined alert ownership, escalation, and response commitments. Monitoring must not become general surveillance, punitive profiling, or a new repository of intimate narrative. A security alert is not an eligibility or service-outcome determination.

## 18. Retention, correction, disposition, and recovery copies

**SEC-RET-01 — Approve retention by record family and purpose.** Before real information in a record family is retained, approve its collection purpose, custodian, legal/contractual basis, retention trigger and duration, deletion or archival method, holds, derivative treatment, backup expiry, owner, and review interval. No universal “retain forever” rule is permitted. An unresolved schedule must not authorize a pilot to accumulate real records indefinitely.

The schedule must distinguish at least:

| Record family | Distinctions the schedule must preserve |
|---|---|
| Anonymous or transient assistance | Session processing, deliberately saved evidence, and minimized security telemetry; no automatic permanent transcript |
| Registration and continuity | Account, association evidence, contact methods, registration authority, and justified operational history |
| Authority and confidentiality | Effective authority versus evidence needed to explain a past authorized action |
| Provider and opportunity evidence | Stable identity anchors, source observations, volatile claims, and requirements relied upon in a transaction |
| Referrals and Service Connections | Drafts, transmitted versions, procedural records, and attributable outcome evidence |
| Documents | Source assets, immutable versions, references, subjects, derived excerpts/OCR, and external custody evidence |
| Collaboration | Charter/participation history, notes/tasks, attendance, Consultant obligations, recordings, and transcripts |
| Audit, incidents, and complaints | Integrity and remedy needs, access restrictions, legal holds, and lawful disposal |
| Derived data | Search indexes, graphs, embeddings, summaries, caches, temporary files, and model/vendor copies |
| Analytics | Approved datasets, lineage, outputs, release evidence, and re-identification risk |
| Backups and recovery artifacts | Backup expiry, isolated restore, restriction/deletion replay, and authorized custody transfer |

**SEC-RET-02 — Separate correction from rewriting history.** Correct current Claims, identity associations, document subjects, and projections through attributable supersession, amendment, dispute, or reversal. Preserve the material history necessary for accountability under its valid retention purpose. Historical information must not remain in ordinary current views as though it were still accurate. A record's append-oriented design does not exempt it from lawful disposition.

**SEC-RET-03 — Execute disposition comprehensively.** Approved disposition must address authoritative records, objects, indexes, graph edges, embeddings, caches, temporary exports, queued work, vendor-held copies, and backup lifecycle as applicable. Preserve only the minimum permitted disposition evidence. Legal holds require a recorded basis, scope, owner, review, and release; they do not grant general operational use of held content. Physical deletion, archival restriction, and cryptographic erasure have different effects and must not be reported as interchangeable without validation.

Consistent with Domain Model sections 4.5 and 12.6, immutable versions and tamper-evident history prohibit silent alteration while records are retained; they do not require perpetual retention. A valid hold or separate custody purpose may require restricted retention after operational access ends. Apply the schedule to both evidence and underlying content, record authorized disposition, and make any resulting reconstruction limit explicit under `SEC-AUD-05`. Ending active Collaboration or helper access does not by itself delete lawfully retained historical records or grant continued access to them.

**SEC-RET-04 — Do not resurrect old permissions on restore.** Backups must remain encrypted, access-controlled, and subject to a finite approved schedule. Restore into a restricted environment; verify integrity and reconcile post-backup revocations, corrections, deletions, subject restrictions, and credential changes before protected access resumes. Where immediate selective deletion from a backup is not feasible under an approved method, isolate that copy from ordinary use, expire it under schedule, and enforce the relevant restrictions on any restore. Never promise deletion from external custody that the Mesh cannot verify.

## 19. Human review, incidents, and remedy

### 19.1 Route to the institution holding authority

**SEC-RESP-01 — Provide a meaningful review route.** People and participants must be able to raise identity disputes, access conflicts, incorrect representations, provider-representation concerns, unsafe contact, suspected misuse, and privacy/security incidents. The record must identify the issue, consequence/urgency, relevant evidence, responsible authority, interim protection, notices, decision, remedy, and appeal/escalation path. Provide accessible assisted channels; an account problem must not make account login the only complaint route.

Provide understandable notices and a route to request access to one's information, an explanation of its use or disclosure, correction, withdrawal, and applicable export or disposition rights. Validate the requester's identity and representative authority proportionately, route requests involving another custodian appropriately, and apply applicable rights, exceptions, safety restrictions, and response periods. Being named as a Document Subject does not automatically authorize every part of a multi-person record. Record the response and safe explanation of any limit, with a route to challenge it; do not promise unconditional deletion, universal ownership, or unrestricted access to other people's information.

Springboard is accountable for Mesh identity associations, generated representations, platform access/disclosures, and its correction/complaint processes. Providers remain accountable for their own professional, eligibility, intake, and service decisions. Collaboration authorities and contributors retain their defined responsibilities. Multi-party harms require coordination, not dismissal at an organizational boundary.

**SEC-RESP-02 — State support commitments honestly.** Publish approved staffed hours, expected response periods, urgent security-reporting routes, and limitations. Do not imply immediate human monitoring of every chat, clinical judgment, or 24-hour Springboard navigation or emergency response. A serious safety concern must receive appropriate emergency or specialized assistance information without waiting in an ordinary platform-review queue. Security escalation does not automatically authorize wider case disclosure or transfer responsibility to Springboard as a provider.

### 19.2 Security incident lifecycle

**SEC-RESP-03 — Operate under approved incident authority.** Before real-data exposure, approve an incident runbook covering intake, triage, scope, containment, evidence preservation, affected parties, lawful notification, recovery, review, and closure. Name decision-makers and backups. Preauthorization means an explicit, current human delegation recognized under the controlling development governance, together with the applicable approved runbook. The Security specification itself is not that delegation. Development Governance section 7.4 requires the delegation to identify actors or mechanisms, triggers, resources, permitted actions, limits, review or expiry conditions, and subsequent human review. Pre-authorized containment may include disabling a compromised credential, suspending a connector, blocking a disclosure path, or restricting an affected projection. Broader destructive action, exceptional disclosure, or a new operational responsibility requires the appropriate authority.

Containment must preserve evidence and safe assistance where feasible. Uncertainty about the full incident scope must not be described as absence of exposure. Record known, suspected, and unconfirmed impact distinctly, including whether data were accessible, actually accessed, transmitted, or altered when evidence supports the distinction.

**SEC-RESP-04 — Determine and meet actual notification obligations.** Privacy/legal review must establish applicable notification recipients, content, deadlines, contracts, and responsible sender for each incident. Do not invent a single notification deadline for all regimes. Coordinate with providers, processors, and affected people using safe contact methods; preserve the decision and timing. This specification is not legal advice or an incident-specific determination of a reporting duty.

**SEC-RESP-05 — Repair downstream effects.** Recovery must examine wrong-person associations, exposed references, copied documents, poisoned sources, derived summaries/graphs, queued transactions, affected recommendations, and external recipients. Record corrections, access changes, requested external remedies, what cannot be recalled, residual risk, and follow-up ownership. Independent review must address conflicts of interest, systemic causes, and whether a policy or test needs amendment. AI must not be assigned institutional responsibility for the incident.

## 20. Analytics, learning, and prohibited secondary uses

**SEC-SECONDARY-01 — Require a separate purpose and authority.** An operational role or service ROI does not by itself authorize population analytics, research, model development, commercial reuse, separate eligibility/risk scoring, or external enforcement. Each secondary-use activity must identify purpose and public/client benefit, authority, approved population/fields, recipient, processing boundary, safeguards, retention, release criteria, and accountable owner. Longitudinal population analysis and research require the Board-approved policy specified by the Constitution. Identifiable research also requires specific authorization beyond ordinary service use and independent legal and privacy review.

Bounded audit, access enforcement, incident detection, and reliability measurement necessary to operate the Mesh may use independently validated operational/security authority under sections 7, 17, and 19; they are not automatically research merely because they count events or compare patterns. They remain minimized, purpose-limited, and restricted to approved owners, and cannot reuse a withdrawn service basis by relabeling the use. Expanding them into population analysis, client profiling, externally released analytic products, or model development requires the applicable separate authority and controls. Likewise, helping a person compare published provider requirements under an authorized assistance workflow is distinct from making the provider's eligibility determination or introducing a separate scoring program. Classify the actual purpose and effect; a label such as “operational” never decides the boundary.

**SEC-SECONDARY-02 — Isolate access and assess disclosure.** Approved analytics must use a separated access and processing boundary, whether logically or physically implemented under the deployment design. Operational staff must not acquire analytic privileges automatically. Pseudonymization, aggregation, and de-identification are safeguards, not independent authority or guarantees against re-identification. Assess small cohorts, rare combinations, geography, linkability, longitudinal changes, and repeated-query differencing before release. Approved controls must govern re-identification access and attempts; ordinary analysts may not reverse the protection.

**SEC-SECONDARY-03 — Preserve meaning and enforce prohibitions.** Analysis must distinguish demand, attempted access, provider response, service receipt, coordination, individual outcome, and population change, with coverage gaps and uncertainty. Overlapping Collaborations must not manufacture independent outcome credit. Sale of personal information, behavioral advertising based on personal needs, and punitive profiling remain prohibited absent constitutional amendment. Model-training restrictions in `SEC-AI-06` remain binding even within an approved research environment. The Mesh's enforcement of its own participation and security rules does not create general governmental, criminal-justice, or provider enforcement authority.

## 21. Secure development and change control

**SEC-DEV-01 — Keep development exposure bounded.** Development, previews, tests, documentation examples, and AI coding assistance must use public, synthetic, or specifically approved appropriately de-identified information. Live personal data, production credentials, or unrestricted production backups must not be copied into a development workspace for convenience. Synthetic data must not be a lightly renamed real case whose details remain identifying. External exposure and production actions remain separate approvals under the development-governance standard.

A development-tool profile must approve the applicable external AI tool, permitted development material, contractual/retention conditions, and safeguards without depending on a yet-unbuilt production Model Gateway. A bounded specification may approve public reference material or synthetic fixtures; the synthetic foundation gate does not include protected real-person records or re-identifiable case derivatives. Public service-directory contact information used within an approved public-reference purpose is not permission to import that individual's private history.

**SEC-DEV-02 — Make security controls testable in bounded work.** Each implementation specification must name the applicable control IDs, permitted files/systems, excluded work, data class, acceptance criteria, failure cases, review evidence, and rollback/recovery approach. Freeze the acceptance scope for review; resolve new material findings through an explicit amendment or follow-up task rather than endless scope expansion. A passing document review is not evidence that an unbuilt system enforces the controls.

**SEC-DEV-03 — Review policy and configuration as code-equivalent changes.** Authorization rules, role mappings, model configurations, capability registrations, retention jobs, templates, dependency upgrades, schemas, and environment settings can change effective access without ordinary application code changes. Version and review them, test their effect, audit activation, and retain rollback or forward-repair procedures. A rollback must not reactivate expired authority, restore a revoked credential, or discard required audit evidence.

**SEC-DEV-04 — Stop at authority and exposure blockers.** Stop the affected work when governing documents conflict, required approval is absent, credentials/permissions are rejected, protected data unexpectedly appears, supply-chain trust is unresolved, or an action exceeds the bounded specification. Do not bypass a gate by changing credentials, using another transport, or reclassifying real data without authority. Preserve a safe diagnostic record and route the decision to the accountable human.

A failed command or stale authentication session is not automatically a new governance decision. Ordinary repair, authorized reauthentication, or an already authorized alternative transport may proceed within the existing scope when it preserves the same permission, exposure, and evidence requirements. This qualification does not permit evading an access denial or acquiring broader credentials. A true invariant, authority, or exposure blocker still requires the governing escalation process.

## 22. Availability, degraded operation, and continuity

**SEC-FAIL-01 — Fail safely by capability.** A failed control must restrict the affected protected operation while preserving independent safe assistance where feasible. Do not weaken authorization because a source, model, or support queue is unavailable. Safe alternatives use public information or information independently and legitimately held for the alternative workflow; they must not bypass a failed Mesh control to retrieve or disclose protected Mesh content.

| Failure | Required behavior |
|---|---|
| Authorization service or necessary authority evidence unavailable | No new protected allow decision; offer public information or an approved assisted route |
| Identity ambiguity or disputed account recovery | Restrict affected linkage/access; do not merge or expose candidates to resolve uncertainty |
| Audit service unavailable | Pause releases, grants, and ordinary domain mutations unless the approved durable evidence path works; permit only the access-reducing protective actions and later gap accounting specified in SEC-AUD-03 |
| Model unavailable or not approved for the data | Use approved structured/manual handling or public/synthetic scope; do not switch silently to another processor |
| External source unavailable or information stale | State uncertainty and refresh/fallback limits; do not invent current capacity or authority |
| External transaction times out | Preserve unknown result, avoid duplicate effects, and reconcile with the external system |
| Document scanner, parser isolation, or subject review unavailable | Keep affected material restricted; use safe information that does not depend on it |
| Revocation cannot be propagated to a projection immediately | Block affected use through current authorization or disable the affected projection path |
| Collaboration authority or roster uncertain | Pause affected disclosures; do not let a still-open meeting link extend authority |
| Human review is outside staffed hours | State the actual availability and safe interim restriction; route urgent safety needs appropriately |

**SEC-FAIL-02 — Approve recovery objectives and test restoration.** Before production exposure, define recovery-time and recovery-point objectives by capability and record family, dependency assumptions, backup frequency, restore procedure, reconciliation obligations, and authorized operators. Test representative restores and loss scenarios, including audit integrity and revoked/deleted-data controls. Do not claim zero data loss or continuous availability without evidence and an approved operating commitment.

**SEC-FAIL-03 — Control abuse without excluding legitimate help.** Apply approved request, payload, concurrency, tool-cost, and storage limits; protect against automated enumeration, resource exhaustion, and malicious uploads. Controls must consider shared networks, public devices, accessibility, and low-bandwidth use, with an appropriate assisted alternative. A rate limit or fraud suspicion must not silently become a permanent person-level service exclusion.

**SEC-FAIL-04 — Plan transfer or closure.** A platform shutdown, provider departure, vendor failure, or platform-steward transfer must preserve applicable custody, notice, export, retention, confidentiality, and disposition duties. Identify who can receive records under what authority, what must remain restricted, and how access/credentials will end. Institutional or technical transition does not create new ownership of personal information.

## 23. Required decision and operating registers

The following decisions remain unresolved by this approved specification. Their safe defaults are enforceable boundaries, not placeholders permitting implicit implementation. The required owner is a function to be assigned to an accountable human; it is not a claim that Springboard has already staffed that function.

| ID | Required decision / evidence | Responsible approval and subordinate home | Required gate / safe default |
|---|---|---|---|
| SEC-D01 | Deployment, tenancy, data location, storage isolation, privileged paths, encryption/key profile | Product and security authority; deployment ADR / Foundation 001 | Resolve before Foundation 001 approval and affected implementation; no assumed production platform |
| SEC-D02 | Authentication, account recovery, sessions, invitation limits, step-up rules, action-specific assurance and identity matching | Product, security, and privacy authority; Identity and Access Specification | Resolve before affected identity implementation and protected use; no automatic match/merge or credential-based dossier access |
| SEC-D03 | Authority validation evidence, permitted bases, conflict rules, role/capacity catalog, policy versioning, revocation enforcement | Privacy and security authority with legal review where applicable; authority-policy profile / Identity and Access | No protected allow decision without a complete applicable policy |
| SEC-D04 | Legal applicability profiles, permitted recipient conditions, data-sharing terms, processor contracts, notices, rights, incident duties | Authorized privacy/legal reviewers and accountable institutions; applicability register | Before the workflow/recipient class is enabled; routine covered instances reuse the profile, while materially new or unresolved scope requires review |
| SEC-D05 | Record-family retention durations/triggers, holds, archival/disposal, vendor and backup expiry | Privacy/legal, security, and record custodians; retention schedule / Referral and Document Specification | Before retaining affected real information; no indefinite pilot retention |
| SEC-D06 | Recipient binding, permitted transport, document release, redaction, safe-contact templates, link behavior | Privacy and security authority with workflow owner; Referral and Document Specification | Before affected transfer implementation/exposure; no uncontrolled protected links or case-content notifications |
| SEC-D07 | General confidentiality agreement, sponsor authority, joining/roster checks, identifiable and de-identified release profiles, recording/transcription, attendance and session limits | Collaboration authority, privacy and security reviewers; Collaboration Charter Standard / Identity and Access | Before protected Case Review; identifiable work requires Person Participation, eligible de-identified work uses SEC-COL-04, and sufficient existing confidentiality coverage is reusable |
| SEC-D08 | Approved operational model/provider configurations and separate development-tool profiles; data eligibility, purposes, retention, contracts, subprocessors, evaluation | Product, privacy, and security authority; AI and Model Use Policy / model and development-tool registers | Before the applicable model use; governed development may precede the operational gateway, while Mesh runtime processing must use it; no unapproved protected processing or prohibited training |
| SEC-D09 | Integration/MCP identity, scopes, protocol/version, destination rules, callbacks, idempotency, reconciliation, credential lifecycle | Security authority and integration owner; Integration and Resource Transaction Specification / ADR | Before capability implementation/activation; approved public retrieval may discover new URLs within its rules, while consequential operations require their own approved contract |
| SEC-D10 | Audit contract, durable delivery/buffering, protective-action failure policy and explicit standing delegation under Development Governance 7.4, integrity independence, log redaction, retention and access review | Security/privacy authority; audit implementation specification and operating profile | Before affected exposure; no unaudited release or grant, with only SEC-AUD-03 access-reducing containment permitted during total audit failure |
| SEC-D11 | Entitlement-review cadence, elevation limits, segregation, any break-glass conditions and independent review | Security/product authority with applicable privacy/legal approval; privileged-access runbook | Before privileged protected use; exceptional access disabled until approved |
| SEC-D12 | Support ownership/hours, response commitments, incident triage and notification, escalation and remedy | Product, security, privacy/legal, and relevant institutional authorities; operating model / incident runbook | Before exposure creating those obligations; no unstaffed service promise |
| SEC-D13 | Recovery objectives, backup testing, restoration restriction replay, vendor exit and platform transfer | Product/security and record custodians; production and continuity runbooks | Before production exposure; no unverified recovery or custody promise |
| SEC-D14 | Secondary analytic purposes, dataset access, de-identification, cohort/repeated-query safeguards, release and retention | Board policy plus designated oversight; Research and Secondary Use Policy | Before affected secondary use; independently authorized operational/security measurement follows SEC-SECONDARY-01 and supplies no population-research or model-development grant |
| SEC-D15 | Projection lineage, query/graph/index permission filtering, cache keys, revocation/correction propagation | Security authority and discovery/data owner; Discovery and Evidence / projection implementation specification | Before protected indexing/retrieval; no graph or search access bypass |
| SEC-D16 | Approved vocabulary schemes/versions, classification stewardship, sensitive mapping review and audit | Domain stewards and privacy/security reviewers; Terminology and Discovery Specification / relevant profiles | Before consequential governed adoption; AI proposals remain provisional |
| SEC-D17 | Applicable verification baseline, finite test scope, severity/remediation thresholds, release evidence and exceptions | Product/security authority and authorized reviewer; bounded implementation specification | Before implementation approval and release review; no conformance assertion from this specification alone |

Each register entry must identify its version, owner, approval evidence, effective date, scope, dependencies, expiry or review trigger, and superseded decision where applicable. Register changes that materially alter product meaning require the appropriate higher-level approval; a configuration edit cannot amend the Constitution or Domain Model.

## 24. Approval and exposure gates

**SEC-GATE-01 — Activate capabilities only with their controls.** Staging the product is permissible, but maturity stage does not waive protections. A feature not yet authorized must remain disabled rather than accessible behind a warning.

| Gate | Minimum evidence to proceed | What the gate does not authorize |
|---|---|---|
| Draft review | Controlling-source match; semantic/traceability review; identified open decisions; focused privacy/security and usability review | Canonical approval, code changes, or real-data processing |
| Document approval and placement | Explicit approval of exact artifact/version; approver/date; hash; canonical byte identity; repository commit and synchronization evidence under governance | Implementation, deployment, or closure of unresolved subordinate decisions |
| Synthetic foundation implementation | Approved bounded implementation specification, applicable approved controls/ADRs and development tools, named scope and tests, permitted synthetic/public material, safe environment | Private or restricted real-person records, unapproved case derivatives, production credentials, or public pilot exposure |
| Public discovery exposure | Approved ingress, source/model and notification boundaries, handling of unsolicited personal text, minimal retention, abuse controls, truthful support and incident arrangements | Registration, protected sharing, or automatic external action |
| Protected continuity / Referral / documents | Applicable identity, authority, legal/vendor, isolation, encryption, audit, retention, rights, recipient, and recovery controls implemented and tested | Unapproved Collaboration access, additional recipients, or secondary use |
| Collaboration / Consultant exposure | Effective Charter; Person Participation for identifiable work or approved de-identified release under SEC-COL-04; joining/confidentiality, roster/session, and recording/transcription controls | General Consultant record access or automatic provider-service relationships |
| Consequential integration exposure | Approved capability contract, current authority enforcement, payload/recipient validation, idempotency, unknown-result reconciliation, scoped credentials, audit | Other operations offered by the same endpoint or MCP server |
| Analytics or research exposure | Separate approved purpose and authority, applicable Board policy and independent review, dataset and release safeguards | Prohibited model training, sale, advertising, or punitive profiling |

**SEC-GATE-02 — Require evidence for the exact release.** The release record must identify governing artifact versions, deployed configuration/code versions, completed applicable tests, reviewer findings, resolved blockers, permitted residual risks, named operating owners, and human exposure approval. Tests of a previous configuration do not prove a materially changed one. Critical unresolved authority, disclosure, identity-association, isolation, or audit-integrity defects block affected exposure.

Apply gates to the approved capability, environment, processing purpose, and data class under Constitution section 9.4. For each applicable constitutional control area, identify either the approved controls for active use or the prohibition and disabled boundary for inactive use. “Not applicable” must explain the actual capability and data-flow boundary; it cannot conceal active processing. A missing detailed research operating profile does not block an otherwise authorized public-discovery stage when research is prohibited and enforceably disabled; missing controls needed to protect unsolicited personal input do block that public stage. Approval to build or test a control with synthetic material is distinct from approval to expose real information through it. Protective restriction under `SEC-AUD-03` reduces an existing exposure during failure and cannot be cited as approval to launch or continue an unsafe service. Risk acceptance follows `SEC-PRIV-04` and does not turn an unsatisfied gate into a pass.

## 25. Acceptance and adversarial scenarios

These are acceptance scenarios for applicable future implementations, not executed application tests. Use synthetic data and controlled recipients. Each applicable bounded implementation must supply reproducible setup, action, expected result, actual result, and evidence, including negative cases and failure paths. The reviewer must identify which controls are covered and why any scenario is not applicable to that bounded scope.

### 25.1 Identity, authority, and participation

| ID | Scenario | Required result / primary controls |
|---|---|---|
| SEC-T01 | An unregistered person seeks housing or training; another enters sensitive narrative into public chat | Basic discovery works without permanent identity; volunteered sensitive text does not escape through unapproved processing or retention. `SEC-ID-01`, `SEC-DATA-01`, `SEC-DATA-02`, `SEC-DATA-03` |
| SEC-T02 | A person registers but refuses provider sharing; a schema offers many optional health/workforce fields | Bounded registration succeeds without blanket ROI or universal collection. `SEC-ID-02`, `SEC-DATA-03` |
| SEC-T03 | Two people share name/date of birth or a contact number; one asks to recover an account | No automatic merge or candidate disclosure; appropriate accessible recovery and dispute route. `SEC-ID-03`, `SEC-ID-06`, `SEC-ID-07` |
| SEC-T04 | Staff lacks MFA; a privileged account uses a phishable factor; a session changes organization | Protected staff/privileged paths enforce their profile; capacity switching does not union access. `SEC-ID-04`, `SEC-ID-05` |
| SEC-T05 | A person signs out on a shared device; a protected link is copied | Protected session/local-state policy is enforced; the copied identifier alone is not authority for protected-record access. `SEC-ID-08`, `SEC-AUTH-02` |
| SEC-T06 | A valid role tries another person's record, forbidden fields, or an export through chat/API/MCP | Equivalent denial or bounded result on every path; no hidden-record existence leak. `SEC-BOUND-01`, `SEC-AUTH-01`, `SEC-AUTH-02`, `SEC-AUTH-03` |
| SEC-T07 | An assertion, expired grant, NDA alone, or unresolved legal instrument is offered as permission | Apply section 7.2: a known expired grant cannot authorize the action; resolvable missing evidence may defer; disputed legal applicability requires review. No case permits disclosure without satisfied conditions. `SEC-AUTH-03`, `SEC-CONF-01`, `SEC-LEGAL-01`, `SEC-LEGAL-02` |
| SEC-T08 | Two independent helpers work with the same person; one needs additional scope | Existing adequate coverage is reused; no automatic view of the other helper's work; obtain only missing authority. `SEC-CONF-02`, `SEC-CONF-03` |
| SEC-T09 | Authority is revoked after preparation but before a queued disclosure or retry | Current restriction blocks execution and cached access; history and independent valid bases remain correctly bounded. `SEC-AUTH-04`, `SEC-CONF-04` |
| SEC-T10 | An automated worker substitutes its service credential for missing person authority | Service and delegation limits both apply; decision records show originating and executing actors. `SEC-AUTH-05`, `SEC-AUTH-06` |
| SEC-T11 | Staff leaves an organization; an administrator grants beyond their scope; two Collaborations overlap | Affected sessions/jobs lose access; no cross-person or cross-compartment privilege inheritance. `SEC-ORG-01`, `SEC-ORG-02` |
| SEC-T12 | A Springboard operator also provides services or backbone support | Separate active capacities; no general case access or preference based on participation, funding, or Springboard affiliation, whether disclosed or not. `SEC-GOV-03`, `SEC-PRIV-01`, `SEC-PRIV-02` |
| SEC-T13 | An operator requests break-glass access or an expired privileged exception | Disabled/unapproved elevation fails; approved bounded elevation has authority, expiry, and independent review. `SEC-PRIV-03`, `SEC-PRIV-04` |
| SEC-T14 | A guest Consultant joins under a sponsor's assertion, existing general NDA, and approved applicability profile | Same-meeting confirmation and covered authority admit only the authorized session; no needless new credentialing/ROI/NDA or repeated legal review of an already covered instance. `SEC-COL-01`, `SEC-COL-02`, `SEC-COL-03`, `SEC-LEGAL-01` |
| SEC-T15 | A guest leaves, a roster changes, a Charter lapses, a proposed/historical Collaboration record remains, or a meeting bot joins | Further affected disclosure stops; a retained record or future Charter does not grant active access, and historical review requires independent authority. No unapproved recording/transcription or continued guest access. `SEC-COL-01`, `SEC-COL-03`, `SEC-COL-04` |
| SEC-T16 | A Consultant agrees to serve the person; a provider contributes a received Referral to a Collaboration | New scope/relationship and contribution authority are deliberately validated; no automatic transition. `SEC-COL-05`, `SEC-COL-06` |

### 25.2 Disclosure, inference, and external actions

| ID | Scenario | Required result / primary controls |
|---|---|---|
| SEC-T17 | A public candidate is displayed, then the user requests contact, an employer application, a learning application, an apprenticeship combining paid work and learning, or a formal Provider handoff | Discovery, direct Service Connection, and Referral remain distinct. Bind target, offering capacity, opportunity, actual action, recipient, authority, and relied-upon evidence; preserve employer/learning responses and sourced outcomes without fabricated Provider status or a service Referral. `SEC-REF-01`, `SEC-REF-02`, `SEC-REF-03`; Domain 8, 11 |
| SEC-T18 | The recipient, Script, attached document, purpose, or subject changes after Referral approval | Execution does not inherit stale approval; required review binds the actual version and recipient. `SEC-REF-02`, `SEC-AUTH-04` |
| SEC-T19 | A notification goes to a shared/unsafe contact or is opened by a preview crawler | No unauthorized case content or meaningful participation detail; no crawler-triggered action. `SEC-NOTIFY-01`, `SEC-NOTIFY-02` |
| SEC-T20 | A user may read metadata but requests the document asset; a copied link is expired or revoked | Separate content/action authorization; release checks current reference, version, and recipient. `SEC-DOC-01`, `SEC-DOC-04` |
| SEC-T21 | An uploaded household document contains another subject's data; redaction leaves hidden text | Release is limited by all affected authority; hidden content is removed or disclosure withheld. `SEC-DOC-02`, `SEC-DOC-03` |
| SEC-T22 | An upload is malicious, parsing attempts external access, or scanning fails | Isolate/quarantine the asset, block active/network effects, and preserve safe alternative assistance. `SEC-DOC-03` |
| SEC-T23 | A document reference expires while another valid custody purpose remains | The reference loses access without false deletion of other legitimate custody. `SEC-DOC-05`, `SEC-RET-01` |
| SEC-T24 | A directory misclassifies a service; AI proposes a new canonical term; a signed claim is wrong | Source/status/version and correction remain visible; neither signature nor AI establishes truth or adopted meaning. `SEC-EVID-01`, `SEC-EVID-02` |
| SEC-T25 | Graph paths, counts, autocomplete, or vector results can reveal a hidden recovery or benefits relationship | No unauthorized node/edge/property/inference reaches requester or model; public vertices confer no private-edge access. `SEC-GRAPH-01`, `SEC-GRAPH-02` |
| SEC-T26 | A shared cache, embedding, or old summary retains revoked or corrected information | Current authorization blocks stale leakage; lineage, invalidation, and rebuild preserve restrictions. `SEC-GRAPH-03`, `SEC-GRAPH-04` |
| SEC-T27 | A webpage, PDF, tool description, or generated link tells the agent to export secrets or records | No new authority, arbitrary destination, or execution; safe rendering and constrained tools prevent the side effect. `SEC-AI-03`, `SEC-INT-03` |
| SEC-T28 | A model vendor is unapproved for the data, changes terms, or a chat retains earlier broader context | Gateway blocks affected processing; scoped context is rebuilt or stopped; no silent vendor fallback. `SEC-AI-01`, `SEC-AI-02`, `SEC-AI-04` |
| SEC-T29 | AI summary changes a provider's judgment or disputed narrative into a verified outcome | Derived status, sources, human review, and correction remain explicit. `SEC-AI-05`, `SEC-EVID-01` |
| SEC-T30 | An endpoint advertises a new write tool; a callback is forged/replayed; a credential has wrong audience | Unregistered changes and unauthorized messages fail; no token forwarding or authority manufacture. `SEC-INT-01`, `SEC-INT-02`, `SEC-INT-04` |
| SEC-T31 | A reservation times out; a delivery succeeds but the provider has not accepted; a retry occurs after revocation | Unknown result is reconciled without duplicate effects or stale authority; delivery, acceptance, reservation, and outcome stay separate. `SEC-INT-05`, `SEC-INT-06`, `SEC-REF-03` |

### 25.3 Operations, audit, retention, and release

| ID | Scenario | Required result / primary controls |
|---|---|---|
| SEC-T32 | Deployment exposes an object store, secret, vendor console, or cross-tenant administrative path | Isolation, encryption, secret handling, privileged scope, and processor limits prevent unauthorized access. `SEC-PLAT-01`, `SEC-PLAT-02`, `SEC-PLAT-03`, `SEC-PLAT-04`, `SEC-PLAT-05` |
| SEC-T33 | Audit delivery fails before release, local commit crashes, or an external response is lost | Required evidence is durable; absent a compliant path, releases, grants, and ordinary domain mutations pause; only SEC-AUD-03 protective restrictions remain permitted, with later evidence-gap accounting. External uncertainty is preserved. `SEC-AUD-01`, `SEC-AUD-02`, `SEC-AUD-03` |
| SEC-T34 | An administrator alters or truncates audit history or exports an investigation | Integrity checks detect relevant tampering/gaps; audit access is itself controlled and recorded; export has bounded provenance. `SEC-AUD-04`, `SEC-AUD-05` |
| SEC-T35 | Logs or alert payloads receive tokens, narratives, or suspicious access patterns | Secrets/content are not copied into routine telemetry; actionable alerts reach an assigned owner without punitive profiling. `SEC-AUD-02`, `SEC-AUD-06` |
| SEC-T36 | A correction, deletion, legal hold, or retention expiry affects documents and derivatives | Current views are corrected; all applicable copies/projections are handled; lawful retained history is restricted and attributable. `SEC-RET-01`, `SEC-RET-02`, `SEC-RET-03` |
| SEC-T37 | A backup predates revocations, deletions, or credential changes | Restricted restore reconciles changes and verifies integrity before access; recovery objectives are demonstrated. `SEC-RET-04`, `SEC-FAIL-02` |
| SEC-T38 | A locked-out person reports a wrong association or requests access/correction; an urgent concern arrives after hours | Accessible, rights-aware review and accurate support commitments; no disclosure of other subjects' information; urgent safety information is not held for ordinary review. `SEC-RESP-01`, `SEC-RESP-02` |
| SEC-T39 | A cross-provider incident requires containment, notifications, correction, and external follow-up | Named human authority, lawful notification assessment, evidence, coordinated remedy, and recall limits are recorded. `SEC-RESP-03`, `SEC-RESP-04`, `SEC-RESP-05` |
| SEC-T40 | Staff requests longitudinal research, a small-cohort export, repeated aggregate queries, training, or advertising use | Separate authority and release safeguards apply; constitutional prohibitions cannot be waived by service consent or ordinary approval. `SEC-SECONDARY-01`, `SEC-SECONDARY-02`, `SEC-SECONDARY-03`, `SEC-AI-06` |
| SEC-T41 | A coding task receives real case data, encounters an approval blocker, or changes authorization configuration | Work stops within scope where required; reviewed/versioned changes and synthetic evidence govern implementation. `SEC-DEV-01`, `SEC-DEV-02`, `SEC-DEV-03`, `SEC-DEV-04` |
| SEC-T42 | A model, authority service, source, scanner, or human queue fails; a shared network hits abuse limits | Capability-specific safe degradation; no broadened permissions, invented facts, or permanent service exclusion. `SEC-FAIL-01`, `SEC-FAIL-03` |
| SEC-T43 | A provider leaves, a processor closes, or the platform transfers stewardship | Controlled notice/custody/disposition, credential termination, and authorized continuity; no new ownership by transfer. `SEC-FAIL-04`, `SEC-PLAT-05` |
| SEC-T44 | A release cites an unapproved draft, lacks a named owner, changes a trust boundary, or has unresolved material defects | No implied approval; bounded threat review, exact-version evidence, and affected exposure gates are enforced. `SEC-GOV-01`, `SEC-GOV-02`, `SEC-GOV-03`, `SEC-BOUND-02`, `SEC-GATE-01`, `SEC-GATE-02` |

### 25.4 Rule-interaction regression scenarios

These scenarios specifically exercise the rule interactions corrected in draft revision 2 and the affected governing clarifications incorporated in revision 3. They supplement the existing acceptance scope for future implementations of the affected controls; they are not claims that application tests ran during document review.

| ID | Interacting rules / scenario | Required result / primary controls |
|---|---|---|
| SEC-T45 | Public discovery has no person-specific grant; a protected request has a confirmed prohibition, disputed authority, missing confirmation, an unused historical grant, or unavailable dependency | Apply relevant conditions and ordered outcomes to the actual authority basis; no protected allow with missing conditions, blanket rejection because of an unrelated expired record, unnecessary public registration, or consent prompt for a technical outage. `SEC-ID-01`, `SEC-AUTH-01`, `SEC-AUTH-02`, `SEC-AUTH-03`, `SEC-CONF-04` |
| SEC-T46 | A person logs out while a separately delegated job is pending; revoke its authority before, during, and after the release commitment boundary | Logout ends session access; separately delegated work still needs current authority. Revocation ordered first prevents the attempt; prior completed release remains history, further disclosure stops, and unknown external effects are reconciled without stale retries. `SEC-ID-05`, `SEC-AUTH-04`, `SEC-AUTH-05`, `SEC-CONF-04`, `SEC-INT-06` |
| SEC-T47 | All durable audit paths fail while a compromised session must be blocked; compare a valid explicit standing delegation with a runbook alone; audit recording and review later resume | Only the specified access reduction within the still-effective human delegation proceeds; a runbook alone grants no authority. No inspection, disclosure, or destruction is authorized. Record evidence gaps honestly, avoid recursive audit requirements, and require normal authority/evidence before restoring access. `SEC-AUD-01`, `SEC-AUD-03`, `SEC-RESP-03`, `SEC-FAIL-01`; Development Governance 7.4 |
| SEC-T48 | A Charter ends, an audit/source retention period expires, and a lawful historical rights review or hold remains | End active Collaboration access, preserve only separately authorized custody, honor holds, distinguish lawful disposal from tampering, and state post-disposal reconstruction limits. `SEC-COL-01`, `SEC-AUTH-06`, `SEC-AUD-04`, `SEC-AUD-05`, `SEC-RET-03` |
| SEC-T49 | A sponsored expert is employed by an organization; a review uses either an authorized helper summary or eligible de-identified material | Guest scope uses its approved assurance profile without staff privileges; relevant authorized helper contributions may be discussed. The approved de-identified route requires no artificial Person link; identifiable discussion requires Person Participation. `SEC-ID-04`, `SEC-COL-01`, `SEC-COL-02`, `SEC-COL-03`, `SEC-COL-04` |
| SEC-T50 | A person selects a safe shared contact, receives a bounded verification token, and uses approved telephone coordination | Message content/timing follow the contact profile; token is not broad record authority and does not leak through logging/previews; the human channel retains recipient, authority, and evidence controls without a false encryption claim. `SEC-NOTIFY-01`, `SEC-NOTIFY-02`, `SEC-PLAT-02`, `SEC-PLAT-03` |
| SEC-T51 | An unclassified upload or anonymous sensitive message needs inspection before ordinary use | Only the approved isolated preparation route handles it; model inspection requires sufficient processor eligibility; general retrieval/disclosure remains blocked until handling is established. `SEC-DATA-02`, `SEC-ID-01`, `SEC-DOC-03`, `SEC-AI-01` |
| SEC-T52 | A synthetic implementation uses an approved external coding assistant before the Mesh gateway exists and tests an approved public retrieval port with a new URL | Bounded development can proceed without a production gateway; operational model use and protected submissions remain gated; discovering a permitted public source does not require onboarding it as a protected integration. `SEC-AI-01`, `SEC-DEV-01`, `SEC-INT-01`, `SEC-GATE-01`, `SEC-GATE-02` |
| SEC-T53 | A recipient may receive a redacted derivative but cannot view the full source; a preparation service has broader source authority | Isolated authorized preparation is permitted; only the authorized derivative enters requester-facing model context; its lineage/citations disclose no forbidden source material and its release does not create raw-source access. `SEC-DOC-02`, `SEC-GRAPH-02`, `SEC-GRAPH-03`, `SEC-AI-01`, `SEC-AI-04` |
| SEC-T54 | Security staff count failed access events, then propose using the same records for population research or model development | Minimized monitoring uses its independent operational/security authority; proposed new purposes require separate approvals and remain subject to the constitutional training prohibition. `SEC-AUD-06`, `SEC-SECONDARY-01`, `SEC-SECONDARY-02`, `SEC-AI-06` |
| SEC-T55 | A provider's membership, funding, or Springboard affiliation is disclosed and offered as a ranking advantage | Disclosure does not permit affiliation-based preference; recommendations remain based on Need, constraints, and evidence. `SEC-PRIV-01` |
| SEC-T56 | An owner accepts residual risk, a credential expires, or an unrelated later-stage profile is unfinished | A valid alternative may satisfy a control; acceptance cannot waive an unsatisfied mandatory gate. Authorized reauthentication/repair may proceed without expanding access. Independent ready capabilities remain separately assessable when inactive areas have explicit prohibitions and enforceable disabled boundaries; actual unsolicited personal input still requires approved controls, and later activation requires the full applicable operating controls. `SEC-PRIV-04`, `SEC-DEV-04`, `SEC-GATE-01`, `SEC-GATE-02` |

Passing these scenarios is necessary where applicable, but does not establish legal compliance, comprehensive penetration-test coverage, or the correctness of every external source. The implementation review must also apply the approved technical verification profile and record its limitations.

## 26. Traceability to the approved product model

References to Constitutional Articles are to Constitution section 6. Architecture and Domain Model references identify their numbered sections. This matrix locates implementation of controlling intent; it does not incorporate an external standard as a new product constitution.

| Controlling requirement | Architecture / Domain Model anchors | Security and Audit sections |
|---|---|---|
| Article I — Human need and agency | Architecture 6.2, 8.1; Domain 7, 10 | 1, 5–8, 19, 22 |
| Article II — Discovery is primary | Architecture 6.4, 9; Domain 8–9, 24 | 5–6, 10, 13, 15, 22 |
| Article III — Evidence and uncertainty | Architecture 6.6, 9.1; Domain 4, 9, 15 | 7, 10, 13–15, 17–18 |
| Article IV — Open but bounded natural language | Architecture 6.1–6.3; Domain 7 | 1, 5–6, 14, 22, 24 |
| Article V — Capability subordinate to permission | Architecture 6.3, 6.7–6.8, 6.10; Domain 10, 16 | 4, 7–9, 14–15 |
| Article VI — Proportionate, contestable identity | Architecture 6.9, 8.3; Domain 6 | 6–7, 18–19 |
| Article VII — Bounded relationship authority | Architecture 6.10; Domain 5, 10 | 3, 6–9, 12 |
| Article VIII — Confidentiality follows information | Architecture 6.10–6.13, 10; Domain 10, 12–14 | 5, 7–14, 16–20 |
| Article IX — Bounded Referral, no guaranteed outcome | Architecture 6.11, 6.14, 8.2; Domain 11–13, 15–16 | 10–11, 15, 17, 19 |
| Article X — Provider independent of representation/membership | Architecture 6.5, 6.7, 9.2; Domain 8 | 5, 9–10, 13, 15 |
| Article XI — Governed Collaboration | Architecture 6.13, 8.4; Domain 14 | 7–9, 12, 17, 20 |
| Article XII — Separate platform, provider, and backbone authority | Architecture 5.2, 6.15; Domain 5, 17, 20 | 3, 9, 19, 22 |
| Article XIII — Selective, purpose-limited persistence | Architecture 4.8, 7; Domain 4.5, 6, 9.9, 12.6, 13.5, 18.4, 23.6 | 5–6, 8, 11, 13–14, 17–18 |
| Article XIV — Authorized learning and prohibited uses | Architecture 6.16; Domain 15, 18 | 13–14, 18, 20–21, 24 |
| Article XV — Useful and honest growth | Architecture 14; Domain 8–9, 16, 23 | 1, 4–5, 10, 13, 15, 22, 24 |
| Article XVI — Human accountability, correction, remedy | Architecture 6.15, 6.17; Domain 17, 20–22 | 3, 6–7, 13–14, 17–19 |
| Article XVII — Escalation follows authority | Architecture 6.15, 11; Domain 17 | 3, 7, 19, 22–24 |
| Registration is not ROI; contextual personas are not access roles | Architecture 6.9–6.10; Domain 5.3, 6.5, 10 | 5–8 |
| Multiple independently bounded helpers | Architecture 6.10; Domain 10.4–10.5 | 7–8 |
| Consultants: sponsor assertion, reusable confidentiality, bounded consultation | Architecture 6.10, 6.13; Domain 14.6 | 6, 8, 12 |
| Multi-subject documents and distinct custody | Architecture 6.12; Domain 12.7, 13 | 5, 10–11, 18 |
| Employment/training/rehabilitation capacities and sensitive incentive evidence | Architecture 4.5, 13.2; Domain 5, 8.8–8.10, 23.4 | 5, 9–10, 13, 20 |
| Governed terminology and source-native claims | Architecture 6.4, 6.6; Domain 9.8–9.9, 22 | 5, 13, 17, 23 |
| Purpose-bound external schemas and rebuildable projections | Architecture 7.3–7.4, 13; Domain 23 | 5–6, 13–15, 18, 20 |
| Resource Transactions, external authority, unknown results | Architecture 8.5, 11.2; Domain 16.4–16.5 | 7, 15, 17, 22 |
| No source rewrite, approval/execution separation, bounded review | Constitution 8–9; Architecture 16–17; Domain 25; Governance 5, 7–8, 11–14, 17 | 1–2, 21, 23–25, 28 |
| Constitution 9.4 — Active controls and inactive capability prohibitions | Architecture 16; Constitution 9.4 | 23–25 |
| Development Governance 7.4 — Explicit standing incident delegation | Development Governance 7.4 | 17, 19, 23, 25 |
| Employer and learning connection meaning | Architecture 6.4–6.5; Domain 8, 11, 19–21 | 10, 13, 17–18, 25 |

## 27. External reference posture

These primary sources were checked while preparing the source drafts. They inform review and later version-pinned profiles; they do not independently establish legal applicability, confer authority, override approved Mesh doctrine, or certify implementation.

| Reference | Bounded use in the Mesh |
|---|---|
| [NIST SP 800-63-4 — Digital Identity Guidelines](https://csrc.nist.gov/pubs/sp/800/63/4/final) | Reference for distinct proofing, authentication, and federation decisions; map explicitly to Mesh actions and accessible alternatives |
| [OWASP ASVS 5.0.0](https://github.com/OWASP/ASVS/tree/v5.0.0) | Candidate version-pinned technical verification baseline; select applicable requirements and review level in SEC-D17 before claiming conformance |
| [OWASP Authorization Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html) | Reference for least-privilege, default-deny, and request-level enforcement testing; Mesh authority semantics remain in the approved Domain Model |
| [OWASP Logging Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Logging_Cheat_Sheet.html) | Reference for event design, sensitive-data exclusions, protection, and operational failure testing; Mesh retention/authority rules control actual logging |
| [OWASP LLM Prompt Injection Prevention](https://cheatsheetseries.owasp.org/cheatsheets/LLM_Prompt_Injection_Prevention_Cheat_Sheet.html) | Reference threat patterns and layered defenses; not a guarantee that prompts or guardrail models can enforce permission |
| [HHS Covered Entities and Business Associates](https://www.hhs.gov/hipaa/for-professionals/covered-entities/index.html) | Starting point for workflow-specific HIPAA role analysis, not universal Mesh legal status |
| [HHS 42 CFR Part 2 guidance](https://www.hhs.gov/hipaa/for-professionals/regulatory-initiatives/fact-sheet-42-cfr-part-2-final-rule/index.html) | Starting point for covered-record confidentiality review; validate applicable current requirements before exposure |
| [U.S. Department of Education FERPA applicability](https://studentprivacy.ed.gov/faq/which-educational-agencies-or-institutions-does-ferpa-apply) | Starting point for institution/record-specific education privacy review, not a universal student-data permission model |

No exhaustive legal or security-framework crosswalk is claimed. Applicable domain profiles, legal instruments, contracts, and technical standards must be versioned and reviewed when adopted; a changing web page must not silently change production policy.

## 28. Review status, next action, and approval record

### 28.1 Status of this artifact

This is the distinct approved version 0.1 issued from the exact candidate 0.1-WIP, draft revision 3, approved by Judson Malone on September 14, 2026. The approval changes record status and former draft references; they do not amend the approved control requirements. The source candidate and the four governing artifacts remain unchanged. Canonical placement, commit, synchronization, and applicable operating-control alignment remain to be evidenced. No application code, production configuration, provider integration, access grant, repository execution, or deployment is represented as completed by this document.

The document-level acceptance criteria retained from the approved candidate are:

1. All constitutional protections and Domain Model distinctions remain intact.
2. Mandatory controls are separated from unresolved parameter, legal, staffing, and vendor decisions.
3. Public discovery, registration, independent helping, and sponsored consultation remain proportionate and usable.
4. Authorization covers all channels and derived representations, including graphs and model context.
5. Audit supports reconstruction without becoming an unrestricted personal-data copy.
6. Revocation, correction, retention, lawful custody, external transactions, and recovery have compatible failure semantics.
7. The named decision owners, acceptance scenarios, and exposure gates are sufficient to bound the next approved work.

Application security tests in section 25 have not been executed by drafting this document. No independent legal review, penetration test, certification, or vendor approval is implied.

### 28.2 Consistency review completed in draft revision 2

The September 13, 2026 review examined all 28 sections and the interactions among their controls, decision gates, and acceptance scenarios. It used the original draft with SHA-256 `294a04cdba839cb7c4ff1981279676a510e5b1b9e6ef692d79d574d0fc46dcef` as the baseline and checked relevant passages against the unchanged approved governing sources in section 2. This was a document consistency review, not an independent legal opinion or application-security test.

| Finding group | Conflicting or ambiguous interaction in revision 1 | Resolution in revision 2 | Regression scenario |
|---|---|---|---|
| CR-01 | Missing conditions could produce either deny or defer without a stated rule; protected-request language could impose person authority on public discovery or reject valid authority because of an unrelated historical record | Ordered deny/review/defer/allow outcomes, evaluation of the actual authority basis, explicit applicability, and bounded internal steps within an authorized operation | SEC-T45 |
| CR-02 | Logout and revocation were grouped together; current checks did not specify their interaction with background jobs and an in-flight release | Scope logout to the session, validate independent delegation, and require an ordered release/revocation boundary with continuing checks | SEC-T46 |
| CR-03 | The durable-audit prerequisite could prevent stopping an active exposure during audit failure; auditing the audit machinery could imply recursion | Permit only pre-authorized access reduction during total audit failure, record evidence gaps, and distinguish append bookkeeping from privileged audit access | SEC-T47 |
| CR-04 | Universal reconstruction/immutability wording could defeat finite retention; expired Collaboration authority could be read as blocking all lawful historical custody | Apply evidence duties during legitimate retention, distinguish authorized disposal from tampering, and require separate authority for historical custody/review | SEC-T48 |
| CR-05 | Staff MFA followed employment status; Consultant access wording excluded even authorized helper contributions; the de-identified route still appeared to require Person Participation | Apply assurance to the access actually exercised, permit authorized review material, and implement the Domain Model's separately governed de-identified consultation route | SEC-T49 |
| CR-06 | Blanket shared-contact, credential-message, and encrypted-transport language conflicted with accessible contact, verification invitations, and human telephone coordination | Permit profile-approved safe shared contact and bounded verification issuance; distinguish controlled digital transfer from governed human communication | SEC-T50 |
| CR-07 | Classification had to be known before processing, although limited processing may be necessary to determine classification | Define isolated authorized inspection with processor eligibility and restrict all ordinary use until handling is established | SEC-T51 |
| CR-08 | All-model wording could require an operational gateway before AI-assisted development; per-endpoint registration could block new public discovery sources | Separate approved development tooling from Mesh operational model use and register a governed public-retrieval capability without treating every new URL as a protected integration | SEC-T52 |
| CR-09 | Requiring source permissions for every recipient could prevent legitimate redacted/de-identified release, while broader processing risked leaking into requester context | Separate authorized preparation from recipient release; protect lineage and keep broader preparation context out of requester-facing retrieval/model processing | SEC-T53 |
| CR-10 | A broad ban on operational authority for analytics/enforcement could prohibit required security monitoring | Distinguish independently authorized operational/security measurement from population research, new scoring, external enforcement, and model development | SEC-T54 |
| CR-11 | Prohibiting only undisclosed Springboard preference implied disclosed preference was acceptable | Enforce the Constitution's prohibition on preference merely because of participation, funding, or Springboard affiliation | SEC-T55 |
| CR-12 | Risk exceptions could be read as waiving mandatory gates; credential failures as forbidding authorized repair; unfinished later-stage decisions as blocking independent ready work | Keep mandatory gates binding, permit only scoped authorized repair/reauthentication, and apply readiness requirements to the actual stage, environment, and data | SEC-T56 |

The control passages, decision register, failure table, exposure gates, and affected acceptance scenarios were reconciled together. No remaining material internal rule conflict was identified in this pass. The 17 unresolved subordinate decisions remain explicit implementation or exposure dependencies, not discretionary overrides. Draft revision 2 contains 101 controls and 56 proposed acceptance scenarios. No application test result or conformance certification is implied by those counts.

### 28.2.1 Cross-document reconciliation in draft revision 3

Judson Malone initially approved the PM-REVIEW-002 v0.1 corrections on September 14, 2026 and instructed that the complete specification remain an approval candidate for final review. The later explicit approval of the complete candidate is recorded in section 28.4. The approved audit proposal has SHA-256 `f627f867f7fc184e468b4f36154297afe2496fb37d13b501442715e9ecef3adc`. The prior Security draft revision 2 has SHA-256 `140544aaa687446b507586efc0e6105e7c21a0ef057f734c381984b8d4fa9acd` and remains preserved.

| Approved finding | Reconciliation in this candidate |
|---|---|
| F01 | Uses Architecture v0.2 and Domain v0.4, which preserve independent Provider encounter, participation, and identity dimensions |
| F02 | SEC-AUD-03 and SEC-RESP-03 expressly require a still-effective human delegation plus the runbook; SEC-D10 and SEC-T47 carry that requirement |
| F03 | SEC-RET-03 references the Domain's retention boundary and Script rule; SEC-AUD-05 and SEC-T48 retain honest post-disposal reconstruction limits |
| F04 | SEC-GATE-02 applies Constitution 9.4 to active controls and inactive prohibitions/disabled boundaries; SEC-T56 exercises that distinction |
| F05 | SEC-REF-01 and SEC-T17 preserve Organization capacity, Opportunity, action, evidence, responses, and outcomes for employer and learning connections |
| C01 | SEC-COL-01 and SEC-T15 distinguish a Collaboration record from active authority; SEC-COL-04 and SEC-T49 preserve eligible de-identified consultation |
| C02 | The corrected Architecture gateway scope agrees with SEC-AI-01 and SEC-T52; approved external development assistance does not bypass operational controls |

Revision 3 retains all 101 control identifiers, all 56 proposed acceptance identifiers, and all 17 unresolved decision identifiers. The companion amendment register and verification report record the finite document-level reconciliation. No application-security test, legal determination, production approval, or closure of an unresolved subordinate decision is implied.

### 28.3 Recommended next action

The complete source candidate has received explicit human approval. Place this distinct approved version byte-for-byte at `docs/SECURITY_AND_AUDIT.md`, record the exact artifact checksum and repository evidence, and follow the approved governance for commit, synchronization, and operating-control alignment. The accompanying Replit Agent prompt defines that documentation storage task. Repeating completed structural checks is unnecessary unless a later change creates a concrete risk.

After canonical placement and synchronization, resolve only the subordinate profiles and decisions needed for the next bounded implementation stage. The approved Architecture and Domain Model determine which specifications are required; this document does not authorize a broad implementation program or reopen the canonical Domain Model merely to choose graph technology.

### 28.4 Approval record

| Approval field | Value |
|---|---|
| Approval status | Approved — Controlling Security and Audit Specification |
| Approved version | 0.1 |
| Approved by | Judson Malone, Executive Director, Springboard Delaware |
| Approval date | September 14, 2026 |
| Approved source candidate | `SECURITY_AND_AUDIT_v0.1_APPROVAL_CANDIDATE.md` — version 0.1-WIP, draft revision 3 |
| Approved source SHA-256 | `8e6604a839fd68fed3b671e888f9288cc877dad9632e0f15d82bf9f937ff0264` |
| Complete approved artifact SHA-256 | Recorded in `SECURITY_AND_AUDIT_v0.1_APPROVAL_RECORD.md` and `SECURITY_AND_AUDIT_v0.1_SHA256SUMS.txt` |
| Canonical repository path | `docs/SECURITY_AND_AUDIT.md` |
| Canonical repository reference | Pending canonical placement, commit, and synchronization |
| Implementation or exposure authorization | None |

Approval was explicit, version-specific, and bound to the source-candidate checksum above. The user authorized preparation of this distinct approved artifact and its Replit Agent storage prompt. The unresolved subordinate decisions and implementation gates remain binding. This approval does not authorize implementation, deployment, production exposure, or processing of real personal information.

This approved artifact includes approval metadata and updated status references, so its complete-file checksum differs from the source-candidate checksum. Use the approved artifact's own checksum for canonical byte verification. The original candidate, prior amendment register, verification report, and storage prompt remain preserved as historical records; their earlier pending-approval statements do not override this later complete-document approval.
