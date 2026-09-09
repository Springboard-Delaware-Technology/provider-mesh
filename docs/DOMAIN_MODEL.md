# Provider Mesh Domain Model

**Document ID:** PM-DM-001  
**Version:** 0.3  
**Status:** Approved — Controlling Domain Model — No Implementation Authority  
**Owner:** Springboard Delaware  
**Decision authority:** Judson Malone, Executive Director  
**Approved by:** Judson Malone, Executive Director  
**Approval date:** September 9, 2026  
**Scope:** Canonical business concepts, relationships, consistency boundaries, lifecycles, ownership, and invariants  
**Canonical filename:** `DOMAIN_MODEL.md`  
**Artifact identity:** Distinct non-canonical approved artifact  
**Canonical path required for operational effect:** `docs/DOMAIN_MODEL.md`  
**Controlling product document:** Provider Mesh Product Constitution v1.0  
**Controlling architecture:** Provider Mesh System Architecture v0.1  
**Development governance:** Springboard Software Development Governance v0.1  
**Draft date:** September 9, 2026  
**Revision basis:** Domain Model v0.1 structured review; Open Referral user personas; subsequent registration, helping-relationship, confidentiality, and consultant-participation decisions; and September 9, 2026 exploration of cross-domain person projections, workforce participation, and governed terminology growth  
**Approved source SHA-256:** `f817fbbe5cc07bd1567f8732de31360017dc9b525cee43614b8a353bdee15b05`  

> **Operational-effect notice:** This is the distinct approved Domain Model artifact. It becomes operationally controlling when placed byte-for-byte at the canonical repository path and synchronized in accordance with Springboard Software Development Governance. Approval of this Domain Model does not authorize implementation, production use, handling of real personal information, provider participation, external integration, or public release.

## 1. Purpose

This Domain Model defines the shared business language of Provider Mesh. It identifies the things the Mesh may represent, the relationships among them, who is accountable for them, how their state may change, and which rules must remain true throughout those changes.

The model translates the approved Product Constitution and System Architecture into concepts precise enough to govern later security, data, interface, integration, and implementation specifications. It does not define database tables, storage products, API routes, user-interface layouts, programming classes, model prompts, or deployment topology.

The model is designed to prevent five recurring errors:

1. treating a record as though it were the person, provider, service, or event it describes;
2. treating one identifier, source, status, or organizational view as universally authoritative;
3. allowing technical access or organizational participation to imply authority;
4. collapsing discovery, referral, collaboration, service delivery, and outcome into one ambiguous case record; and
5. converting missing observation into a negative fact or a completed workflow.

### 1.1 Revision scope

Version 0.3 incorporates the material findings identified in the structured review of Version 0.1 and the subsequent cross-domain review. It adds or clarifies:

- Service Connection as a first-class record distinct from Referral;
- intrinsic Need lifecycle separate from Outcome Claims;
- Mesh Registration and the association between a Human Actor and Mesh Person;
- Authority Record as the general authority concept;
- separate Provider encounter, participation, and identity-correction lifecycles;
- Resource Transactions for availability, holds, reservations, release, expiration, and reconciliation;
- Document Subject associations;
- contextual use personas informed by Open Referral;
- multiple concurrent Helping Relationships;
- simplified confidentiality and disclosure rules;
- low-friction participation by sponsored Expert Consultants in Case Review;
- domain standards as purpose-bound projections rather than universal person or Provider schemas;
- Organization capacities for employers, training providers, vocational-rehabilitation providers, apprenticeship sponsors, and work-based-learning hosts;
- Learning Opportunities, Employment Opportunities, Credentials, Competencies, Occupations, Employment Relationships, and employment incentives as concepts distinct from general Services;
- selective persistence and refresh rules for workforce opportunities and requirements; and
- governed terminology growth from source-native observations through mapped, candidate, adopted, deprecated, or superseded concepts.

These changes refine the model without changing the approved Product Constitution or System Architecture.

## 2. Modeling doctrine

### 2.1 Reality, records, and representations

A **real-world subject** exists independently of the Mesh. A person, provider, service, organization, location, document, conversation, or service event is not created merely because the Mesh records it.

A **domain record** is the Mesh account of a subject, transaction, authority, or event. The record is authoritative only for the part of reality the Mesh is legitimately responsible for recording.

A **claim** is a proposition about a subject. It requires a source, time, basis, and uncertainty state.

A **projection** is an assembled view created from domain records and claims for a defined purpose. A projection is not a new source of authority merely because it is convenient or current-looking.

A **derived representation** is a classification, summary, match, recommendation, score, or extraction produced from source material. It must retain derivation and correction information.

### 2.2 Canonical meaning does not require one physical schema

The concepts in this document are canonical business meanings. A later implementation may store them in several physical systems or combine closely related records where integrity and access rules permit. It may not combine concepts in a way that erases the distinctions required here.

External standards may project into or out of these concepts. No external standard becomes the complete internal domain merely because the Mesh supports its exchange format.

### 2.3 Normative terms

- **Must** identifies a required invariant or behavior.
- **Must not** identifies a prohibited condition or transition.
- **May** identifies a permitted capability that remains subject to authority and subordinate controls.
- **Should** identifies a preferred approach that may be varied through an approved subordinate decision without changing the model’s meaning.

### 2.4 Identity, authority, and knowledge remain separate

The model treats these as three independent questions:

1. **Identity:** Who or what does this record represent?
2. **Authority:** Who may view, contribute, disclose, decide, or act for this purpose?
3. **Knowledge:** What is supported, by which source, as of what time, and with what limitations?

An answer to one question must not be used as an automatic answer to either of the others.

## 3. Domain partitions

The domain is separated into purpose-bound areas. These areas may interact through explicit references and events, but each retains its own rules and accountable records.

| Domain area | Governing question |
|---|---|
| Actors and organizations | Who is participating, and in what represented capacity? |
| Person continuity | When do separate interactions or identifiers concern the same person? |
| Registration and helping relationships | When does a person establish continuing use of the Mesh, and who is authorized to assist them? |
| Assistance and need | What help is being sought, by whom, and under what circumstances? |
| Provider, service, and opportunity | What real service-capable entity, employer, offering, opportunity, place, or access pathway is represented? |
| Evidence and discovery | What supports a claim, and why is a candidate relevant now? |
| Terminology and classification | Which vocabulary expressed a meaning, how was it mapped, and what status and authority does that mapping have? |
| Relationship, authority, and access | What permits a particular actor to use particular information or perform an action? |
| Service connection | What attempt was made to connect the person to help, whether or not a formal Referral was created? |
| Referral | What authorized handoff is being made to which provider for what purpose? |
| Secure documents | What protected artifact is referenced, who controls access, and who has custody? |
| Collaboration | What multi-party agenda, membership, and information compartment govern collective work? |
| Narrative, tasks, and outcomes | What was reported, assigned, attempted, or observed after assistance began? |
| Integration capability | What external source or action can be reached, by which governed capability? |
| Review, correction, and audit | How are consequential actions made accountable and errors remedied? |
| Analytics and learning | Under what separate authority may operational records support collective analysis? |

## 4. Shared record semantics

### 4.1 Internal identifiers

Each durable Mesh record has an opaque, non-semantic internal identifier. An identifier must not encode a person’s name, date of birth, organization, diagnosis, need, geography, status, or other mutable or sensitive meaning.

Internal identifiers are unique within their record type. If a globally unique identifier is later chosen, global uniqueness does not make records interchangeable across types.

External identifiers must always be stored with the issuing namespace and, where applicable, the issuing organization or system. The same character sequence from two namespaces does not establish identity.

### 4.2 Time

The model distinguishes:

| Time concept | Meaning |
|---|---|
| Recorded time | When the Mesh created the record |
| Observed time | When an actor or system observed the represented condition |
| Reported time | When a source reported it |
| Effective interval | When the condition or authority applies |
| Publication time | When a source made information public |
| Expiration time | When a representation, permission, hold, or capability ceases to be treated as current |
| Supersession time | When a later record replaced the earlier record for a defined purpose |

Unknown times remain unknown. Recorded time must not be substituted for observed, reported, or effective time.

### 4.3 Provenance

A record that makes or relies upon a consequential representation must identify, as applicable:

- the contributing actor or external source;
- the organization and role represented by the actor;
- the acquisition or contribution method;
- the source location or source record reference;
- relevant times;
- the purpose and authority under which the information was obtained;
- whether AI or another transformation contributed to the representation;
- the human reviewer or confirmer, when required; and
- the correction, dispute, or supersession history.

### 4.4 Uncertainty vocabulary

The following terms are canonical and may be combined when they describe different dimensions:

| Term | Meaning |
|---|---|
| Observed | Directly detected by the identified source or system |
| Reported | Asserted by an identified person or institution |
| Inferred | Derived from other information rather than directly observed or reported |
| Confirmed | Supported at the defined assurance threshold for the stated purpose |
| Unconfirmed | Not yet supported at the required threshold |
| Conflicting | Materially inconsistent with another relevant claim |
| Stale | Older than the currency rule for the intended use |
| Unknown | The Mesh has no adequate basis for a value |
| Disputed | Challenged by a person or accountable institution |
| Withdrawn | No longer asserted by its contributor |
| Superseded | Retained historically but replaced for a defined current use |

These states describe evidence and representation. They do not substitute for workflow states such as delivered, accepted, or closed.

### 4.5 Correction

Corrections normally create an annotation, replacement, de-link, or superseding record. They must preserve enough history to explain what was represented, what changed, why it changed, and who authorized the change.

Silent overwriting is prohibited when the earlier value affected identity, access, referral, collaboration, recommendation, custody, outcome, or another consequential decision.

### 4.6 Common accountability fields

Every governed record must be capable of identifying:

- accountable owner or steward;
- originating source or actor;
- represented organization and role, when applicable;
- current lifecycle state;
- effective and recorded times;
- sensitivity or disclosure class;
- purpose limitation;
- dispute or correction state; and
- related audit and policy-decision references.

The exact physical fields belong in later specifications.

## 5. Actors, accounts, and organizations

### 5.1 Canonical concepts

| Concept | Definition |
|---|---|
| Actor | A human or automated party capable of making a request or performing a recorded action |
| Human Actor | A natural person acting for self or in a represented capacity |
| Automated Actor | An authorized system, agent, API client, or MCP client acting under an accountable institutional identity |
| Account | A means by which an actor authenticates to the Mesh; it is not the actor itself |
| Session | A time-bounded technical interaction associated with an account or anonymous channel |
| Organization | A legally, contractually, or operationally recognized institution |
| Organization Unit | A bounded program, department, project, or operational unit within an organization |
| Organization Capacity | A contextual function performed by an Organization, such as Provider, employer, training provider, vocational-rehabilitation provider, apprenticeship sponsor, or work-based-learning host |
| Organization Role | A role assigned to an actor by an organization |
| Organization Affiliation | A sourced and time-bounded association connecting a Human Actor to an Organization, unit, and role |
| Requester | The actor asking the Mesh for information or action in a particular assistance context |
| Represented Capacity | The role and organization in which an actor is acting for a particular request |
| Contextual Use Role | The function an Actor performs in one interaction, such as help-seeker, helper, referrer, Provider representative, data administrator, or researcher |
| Provider Point of Contact | A human or managed endpoint authorized to receive or respond for a provider, service, or location |

### 5.2 Actor rules

1. One human may have several accounts, roles, and represented capacities.
2. One account must not silently combine capacities that carry different authority, such as Springboard platform steward and Springboard service provider.
3. An automated actor must be attributable to an accountable organization and approved human or institutional owner.
4. A requester role is contextual. A person who requested help in one episode does not become the requester for another person or episode.
5. Authentication of an account does not prove every claimed real-world identity or represented capacity.
6. Organization membership does not establish authority over a person’s information.
7. A provider point of contact is scoped to the provider context in which the contact was validated.
8. An Organization Affiliation must retain its source, effective period, represented unit and role, validation status, and accountable asserting Organization.
9. A Contextual Use Role describes what the Actor is doing in a particular interaction. It is not a permanent identity classification or permission.
10. An Organization Capacity describes what an Organization does in a defined context. It is not a permanent or exclusive Organization type and does not itself grant authority or participation rights.

### 5.3 Contextual use personas

Open Referral describes four broad uses of human-service resource information: seeking help, providing help, administering data, and research and analysis. Its providing-help persona includes referrers, service providers, case managers, social workers, librarians, and call operators. These are useful descriptions of how people interact with service information; they are not access-control roles or permanent classifications.

Provider Mesh therefore treats the following as contextual:

| Use context | Meaning in the Mesh |
|---|---|
| Seeking help | The Actor is seeking assistance for self or another person |
| Providing help | The Actor is assisting, referring, navigating, or delivering a Service |
| Administering data | The Actor is maintaining a defined representation or technical resource under assigned authority |
| Research and analysis | The Actor is using separately authorized information for an approved analytic purpose |

One Actor or Organization may occupy several use contexts at different times. A case manager may provide case-management Service, refer a person to legal assistance, receive a Referral for another Service, and participate in a Collaboration. The applicable role must be established for each action.

No contextual persona grants information access, creates a Helping Relationship, establishes Provider participation, or authorizes a Referral.

Reference: [Open Referral — Types of Use and User Personas](https://docs.openreferral.org/en/latest/about/users-and-personas.html).

## 6. Person continuity

### 6.1 Purpose

Person continuity allows the Mesh to recognize an ongoing relationship without requiring identification for ordinary public discovery and without assembling a universal personal dossier.

The canonical term is **Person**. “Client,” “patient,” “student,” “resident,” “participant,” and similar labels may be used inside a Provider or domain projection, but they describe a contextual relationship and must not redefine the human’s identity throughout the Mesh.

### 6.2 Canonical concepts

| Concept | Definition |
|---|---|
| Mesh Person | The internal continuity anchor for an asserted continuing relationship with one human |
| Mesh Person ID | The opaque identifier assigned to a Mesh Person |
| Actor–Person Association | The sourced, assurance-rated association between a Human Actor and the Mesh Person the Actor claims or is validated to be |
| Mesh Registration | A person’s voluntary establishment of a continuing relationship with Provider Mesh |
| Registration Authorization | Permission to create and maintain the person’s internal Mesh relationship; it is not a general Release of Information |
| Person Name Assertion | A sourced representation of a name used by or assigned to the person |
| Person Attribute Claim | A sourced, time-aware claim about a demographic, identity, or changing circumstance |
| Identity Evidence | Information used to assess whether records or identifiers concern the same human |
| Identity Assessment | A recorded evaluation of a proposed identity association for a defined consequence |
| External Identity Link | A namespaced association between a Mesh Person and an identifier assigned by another system |
| Contact Method | A time-aware way of reaching the person or an authorized intermediary |
| Recovery Method | An approved means of regaining account access or continuity when ordinary contact is unavailable |
| Merge Relationship | A reversible record that two Mesh Person records were consolidated under approved authority |
| De-link | A correction that ends an incorrect or no-longer-supported association without falsifying history |

### 6.3 Relationship map

~~~mermaid
flowchart TB
    MP["Mesh Person"]
    EA["Assistance Episode"]
    EI["External Identity Link"]
    IE["Identity Evidence"]
    CM["Contact Method"]
    MP --> EA
    MP --> EI
    IE --> EI
    MP --> CM
~~~

An assistance episode may exist without a Mesh Person. A session or cookie may help resume an episode, but neither is a Mesh Person ID.

### 6.4 Person creation and linkage lifecycle

1. A public interaction may remain anonymous.
2. An Assistance Episode may be created when conversational continuity, referral preparation, or transaction accountability requires it.
3. A Mesh Person may be created when the person voluntarily registers or when requested service, continuing assistance, authorized coordination, or accountability requires person continuity.
4. Reported first name, last name, and date of birth may support a provisional asserted identity and manual candidate search.
5. Middle name or initial, former names, address history, contact history, external identifiers, documents, provider attestation, or in-person proofing may help resolve ambiguity.
6. Additional validation must be proportionate to the consequence of a mistaken association.
7. A candidate match remains a candidate until an approved actor and process confirms, rejects, or defers it.
8. A mistaken link or merge must be correctable without deleting the history of consequential actions already taken.

### 6.5 Voluntary registration

A person may register at any point, whether or not a Referral is pending. Registration ordinarily creates or resolves:

1. a Human Actor;
2. an Account;
3. a Mesh Person;
4. an Actor–Person Association representing that the person is acting for self;
5. a Mesh Registration; and
6. a Registration Authorization.

~~~mermaid
flowchart TB
    A["Account"]
    H["Human Actor"]
    AP["Actor–Person Association"]
    P["Mesh Person"]
    R["Mesh Registration"]
    A --> H
    H --> AP
    AP --> P
    P --> R
~~~

Basic registration may collect:

- reported first name;
- reported last name;
- date of birth;
- preferred name and middle name or initial when available;
- available contact or recovery pathway;
- communication preferences;
- acknowledgement of the Mesh privacy notice; and
- acceptance of the Registration Authorization.

Registration begins at a self-asserted assurance level unless stronger evidence is supplied and validated. It does not ordinarily require government identification, Social Security number, HMIS identifier, diagnosis, income documentation, service history, household details, or uploaded identity documents.

Registration Authorization may permit the Mesh to:

- create and maintain the Mesh identity relationship;
- search for possible duplicate Mesh Persons;
- retain basic registration and recovery information;
- use that information to provide requested Mesh functions;
- contact the person through approved methods; and
- retain necessary security, correction, and audit records.

Registration Authorization does not by itself authorize disclosure to a Provider, a Referral, access by a helper, external identity linkage, Collaboration participation, research, or model training.

An Actor–Person Association must retain its assertion, evidence, assurance, effective time, permitted use, confirmation, dispute, suspension, and correction. Authenticating the Account does not prove the association beyond its recorded assurance.

### 6.6 Assurance

Identity assurance is attached to a particular assessment or link, not permanently assigned to the human as a single universal score.

At minimum, an assessment must distinguish:

- asserted but not independently validated;
- corroborated for low-consequence continuity;
- validated for the defined provider, disclosure, or transaction purpose;
- disputed or suspended; and
- unable to determine.

A later Identity and Access Specification must define evidence combinations, reviewers, thresholds, and actions permitted at each assurance level.

### 6.7 External identity links

An External Identity Link must include:

- issuing namespace;
- issuing organization or system;
- external identifier;
- linked Mesh Person;
- link basis and evidence;
- assurance and permitted purpose;
- effective and recorded times;
- confirmer or contributing institution;
- dispute and lifecycle state; and
- merge or de-link history.

An HMIS Client ID, health-system identifier, student ID, benefits ID, or justice-system identifier may be linked to the same Mesh Person. None is universally canonical for the Mesh.

### 6.8 Person attributes and domain projections

The Mesh Person record may support domain-standard projections, including the full HMIS Universal Data Element set where authorized. This capability does not require every person record to contain every element.

A domain projection describes the person for a defined exchange or authorized use; it does not redefine the Mesh Person. A C-CDA document or FHIR representation may communicate authorized clinical information, but neither is the canonical cross-domain person record. The same rule applies to HMIS, education, workforce, vocational-rehabilitation, benefits, and justice-system formats.

Person information must remain distinguishable as:

1. identity and matching information;
2. demographic claims;
3. current or changing circumstances;
4. service-domain data;
5. project or program participation;
6. contact information;
7. authority and relationship information; and
8. longitudinal events and outcomes.

Each item is collected, retained, disclosed, and refreshed according to its own purpose and authority.

### 6.9 Person invariants

1. A Mesh Person represents one asserted human; one human may temporarily have more than one unresolved Mesh Person candidate.
2. Duplicate detection must not automatically merge records.
3. A name and date of birth are search and assertion data, not proof of uniqueness.
4. A Contact Method is not identity evidence unless an approved assessment expressly uses it as such.
5. Loss of phone, email, device, or account must not erase the Mesh Person.
6. Knowledge of a Mesh Person ID or external identifier does not authorize access.
7. A provider’s client identifier remains owned and interpreted by that provider or issuing system.
8. Identity links are contestable and reversible.
9. Person attribute history must not be silently rewritten when earlier values affected consequential action.
10. No domain projection may become a universal requirement for basic discovery.
11. Account authentication does not automatically establish that the Actor is the Mesh Person who is the subject of assistance.
12. Registration does not create a Need, Helping Relationship, Referral, Provider Engagement, or Collaboration participation.
13. Registration Authorization is limited to the internal Mesh relationship and is not a blanket Release of Information.
14. A person is not universally a client, patient, student, trainee, participant, resident, applicant, or employee; each label arises from a defined relationship or domain projection.
15. Supporting a domain projection does not authorize collection of every field available in that standard.

## 7. Assistance, expressions, and needs

### 7.1 Canonical concepts

| Concept | Definition |
|---|---|
| Assistance Episode | A bounded sequence of interactions concerning one or more expressed needs |
| Expression | The person’s or requester’s original words, structured input, or authorized communication |
| Need Interpretation | A proposed understanding of material help that may be relevant |
| Need | A purpose-bound representation of help the person has chosen or authorized the Mesh to pursue |
| Assistance Group | A purpose- and time-bounded grouping of people, such as a household or family, relevant to one Episode, Need, Referral, or service search |
| Constraint | A circumstance that materially affects relevance, access, urgency, or handoff |
| Preference | A person-stated choice used to shape assistance |
| Related concern | A possible risk or barrier identified but not yet adopted as an active Need |
| Assistance objective | The immediate result sought from the Mesh, such as information, connection, referral, or coordination |
| Candidate choice | A service option presented for human selection |
| Selection | A person or authorized requester’s choice to pursue, decline, defer, or reconsider an option |

### 7.2 Expression is preserved

The original Expression must remain distinguishable from AI or human interpretation. A statement such as “I am feeling depressed” may support one or more Need Interpretations, but it does not by itself establish a diagnosis, consent to treatment, permission to disclose, or a completed request.

### 7.3 Need activation

A Need becomes active when:

1. the person expresses or accepts the need as a current priority; or
2. an actor with legitimate authority requests action for that need and the applicable limits on the person’s agency are recorded.

The Mesh may surface a Related Concern and explain why it may matter. It must not silently activate it or subordinate the person’s selected priority.

### 7.4 Assistance groups

Some services concern a household, family, caregiver pair, or another group rather than only one individual. An Assistance Group represents that context without creating a universal household identity.

An Assistance Group must identify:

- the Episode or purpose for which the group matters;
- known Mesh Persons and provisional or unnamed members;
- the source and effective time of each membership assertion;
- the relationship of each member to the active Need;
- whose authority is required for information or action concerning each member; and
- when the grouping expires, changes, or is no longer relevant.

Membership in an Assistance Group does not merge person records, transfer one member’s consent to another, or establish a permanent legal or household relationship.

### 7.5 Episode lifecycle

An Assistance Episode may be:

- open for clarification;
- active in discovery;
- awaiting a person or requester choice;
- preparing an authorized handoff;
- referred to another accountable pathway;
- paused;
- closed procedurally; or
- reopened.

Episode closure does not mean that every Need was satisfied. Needs, referrals, and outcomes retain their own states.

### 7.6 Need lifecycle

A Need may be:

- proposed;
- active;
- deferred by the person;
- declined by the person;
- closed;
- no longer current; or
- reopened.

Referral, coordination, satisfaction, unmet status, partial progress, and inability to determine are not intrinsic Need states. They are relationships, activity records, or Outcome Claims requiring source and time. A purpose-specific Need Assessment Projection may summarize those records without becoming their Source or silently changing the Need.

### 7.7 Assistance invariants

1. An episode may exist without permanent person identity.
2. One episode may contain several Needs with separate priorities.
3. One Need may produce several discovery attempts or referrals.
4. Clarification must be limited to information that can materially change discovery or handoff.
5. Provider intake requirements are not automatically Mesh intake requirements.
6. A Candidate Choice is not a referral, provider acceptance, or service outcome.
7. A Related Concern remains distinct from an active Need until appropriately adopted.
8. Urgent safety routing interrupts normal flow but does not create a general Springboard clinical or emergency duty.
9. A household or family context is represented through a purpose-bound Assistance Group, not by treating several people as one Mesh Person.
10. Authority and confidentiality are evaluated for each affected person even when assistance is requested for a group.
11. A Need’s intrinsic state must not be overwritten by a Provider, helper, or system Outcome Claim.

## 8. Providers, services, opportunities, and access pathways

### 8.1 Canonical concepts

| Concept | Definition |
|---|---|
| Provider | A real person or organization capable of delivering a service or material assistance |
| Mesh Provider | The Mesh identity anchor representing a Provider |
| Provider Capacity | The contextual capacity in which a person or Organization offers one or more Services or material assistance; for an Organization it is an Organization Capacity |
| Employer Capacity | The Organization Capacity in which an Organization offers paid work or a defined employment relationship |
| Training Provider Capacity | The Organization Capacity in which an Organization delivers a Learning Opportunity |
| Vocational-Rehabilitation Provider Capacity | The Organization Capacity in which an Organization delivers disability-related employment preparation, placement, support, accommodation, or retention Services |
| Apprenticeship Sponsor Capacity | The Organization Capacity responsible for governing an apprenticeship that combines paid employment and structured learning |
| Work-Based-Learning Host Capacity | The Organization Capacity in which an Organization hosts an internship, work experience, on-the-job learning, or other structured workplace opportunity |
| Provider identifier | A namespaced identifier assigned by an authoritative or publishing system |
| Organization | The institution responsible for one or more programs or services |
| Program | An optional administrative grouping under which services are organized |
| Service | A defined capability or assistance offering |
| Opportunity | A bounded opening through which a person may obtain employment, housing, education, training, an appointment, a placement, or another scarce or time-sensitive benefit |
| Learning Opportunity | A course, program, apprenticeship component, assessment, or other structured means of developing or demonstrating knowledge or skill |
| Credential | A qualification, degree, certificate, license, badge, or other recognition issued or recognized by an accountable authority |
| Competency | A defined knowledge, skill, ability, task, or other capability that may be taught, assessed, required, or demonstrated |
| Occupation | A standardized or source-defined kind of work to which jobs, competencies, credentials, and learning opportunities may relate |
| Employment Opportunity | A specific opening or continuing offer of paid work associated with an employer, occupation, requirements, terms, location, and application pathway |
| Employment Relationship | A sourced, time-bounded relationship indicating that a person works or worked for an employer under defined terms; it is not the employer's complete personnel record |
| Placement Outcome | An Outcome Claim concerning a job placement, start, retention milestone, wage, hours, advancement, or separation |
| Incentive Program | A public or private program offering a tax credit, reimbursement, subsidy, bond, grant, training support, or other benefit under defined rules |
| Incentive Eligibility Claim | A sourced and time-bounded Claim that a particular person, employer, opportunity, or proposed arrangement may meet an Incentive Program's requirements |
| Incentive Determination | A decision made by the authority responsible for an Incentive Program; it is not created by Mesh inference |
| Location | A physical, virtual, mobile, or administrative place associated with delivery or access |
| Service at Location | The relationship describing where and under what location-specific conditions a Service is delivered |
| Service area | The geographic or jurisdictional area served |
| Access pathway | The route by which a person seeks information, intake, referral, or service |
| Provider contact | A contact channel associated with the Provider |
| Receiving point of contact | A validated person or managed endpoint capable of receiving a defined referral |
| Access requirement | A published or provider-reported condition, document, process, cost, or eligibility requirement |
| Service resource | A capacity-bearing item or opportunity, such as a bed, appointment, unit, class seat, or material allocation, governed by the Provider or external network |
| Availability Claim | A time-bounded Claim about the availability of a Service or Service Resource |
| Hold | A temporary external allocation with an authoritative identifier and expiration |
| Reservation | An authoritative external commitment of a Service Resource under defined terms |
| Eligibility Decision | A Provider-authoritative decision about whether a person or Assistance Group meets requirements for a Service |
| Provider Encounter | A recorded occasion on which the Mesh discovers, uses, contacts, or otherwise encounters the Provider |
| Provider Participation | The Provider’s scoped contractual or governed relationship with the Mesh |
| Provider Identity Assessment | A recorded evaluation of whether Provider records represent the same or distinct real entity |
| Provider Consolidation | A reversible decision that two Mesh Provider identities represent one Provider |
| Provider Separation | A correction restoring distinct Provider identities or entity relationships |
| Provider representation | A sourced claim or projection describing the Provider, Service, Opportunity, Location, or access pathway |

### 8.2 Core provider and offering relationships

~~~mermaid
flowchart TB
    O["Provider Organization"]
    P["Program"]
    S["Service"]
    L["Location"]
    SL["Service at Location"]
    O --> P
    P --> S
    S --> SL
    L --> SL
~~~

Program is optional. A Service may relate directly to an Organization. A Service may be available at several Locations, and a Location may host services from several Providers.

An Organization may act through several Organization Capacities at the same time. A hospital may be a healthcare Provider, employer, and training site. A community college may be a Training Provider, employer, and referrer. An ordinary employer is not automatically a Provider merely because it employs people. It enters a Provider Capacity only when it delivers a defined Service or material assistance.

A Service, Learning Opportunity, Employment Opportunity, and other Opportunity are distinct offerings even when one program combines them. A registered apprenticeship may therefore relate one Organization to an Employer Capacity, Apprenticeship Sponsor Capacity, Employment Opportunity, Learning Opportunity, Occupation, Competencies, and Credential without collapsing those meanings.

### 8.3 Provider identity

The Mesh assigns one Mesh Provider ID to each distinct Provider it resolves. Identity resolution may use:

- legal and public names;
- aliases and former names;
- authoritative domains and websites;
- government, directory, payer, or network identifiers;
- physical and mailing addresses;
- telephone and contact channels;
- parent, subsidiary, program, and health-system relationships; and
- source-specific service and location identifiers.

Ambiguity must remain explicit. Similarity alone does not authorize merger. A program, service, location, or co-located organization must not be collapsed into the parent Provider merely for convenience.

A Provider Identity Assessment must retain the candidate identities, evidence, source, decision, assurance, reviewer or approved method, time, and dispute state. An approved consolidation must be reversible. A later separation must preserve the Provider IDs used in historical discovery, Referral, participation, and outcome records while repairing current projections.

### 8.4 Provider encounter history

A Provider Encounter records actual Mesh contact with or use of a Provider identity. Encounter history may include:

- first observed;
- re-observed;
- included in discovery;
- selected;
- contacted;
- involved in a Service Connection or Referral; and
- last materially refreshed.

Encounter history does not establish Provider participation, consent, endorsement, current capability, or responsibility for maintaining information.

### 8.5 Provider participation

Provider Participation is separate from Provider identity and Provider Encounter. Its lifecycle is:

- no participation agreement;
- pending;
- active;
- suspended;
- withdrawn;
- expired; or
- terminated.

Participation requires an applicable agreement and must identify its scope, including the participating Provider, Programs, Services, Locations, contributed information, authorized representatives, offered capabilities, effective period, and maintenance responsibility. Suspension, withdrawal, expiration, or termination does not erase the Provider or historical evidence.

### 8.6 Representation responsibility

A participating Provider may contribute information and accept responsibility for maintaining identified portions of its representation. The contribution remains a sourced claim. Participation does not make the Provider authoritative for every claim about itself, and independent evidence remains independent.

The Mesh must not preferentially rank or represent a Provider because it participates or because Springboard operates it.

### 8.7 HSDS alignment

The Provider domain must support an HSDS-compatible projection centered on Organization, Service, Location, and Service at Location. Programs, contacts, phones, schedules, service areas, languages, accessibility, cost options, required documents, funding, taxonomies, organization identifiers, attributes, and metadata may be projected where supported.

The Mesh adds concepts required for evidence, identity resolution, participation, accountability, activity history, uncertainty, and current-use projections. These additions do not redefine HSDS and must be clearly separated in exchange profiles.

### 8.8 Workforce and rehabilitation distinctions

Training, employment, and rehabilitation must remain distinguishable even when one Provider or program coordinates them.

1. A Learning Opportunity concerns instruction, assessment, competency development, or a Credential. It is not employment merely because it is intended to improve employability.
2. An Employment Opportunity concerns paid work and its terms. It is not a Service merely because employment may improve economic stability.
3. A registered apprenticeship or structured on-the-job training arrangement may be both employment and learning and must preserve both relationships.
4. Clinical rehabilitation is a healthcare Service. Vocational rehabilitation is a disability-related employment Service. Recovery-supportive employment is an employer practice or support arrangement unless the employer or another Organization separately delivers a clinical or vocational-rehabilitation Service.
5. An employer's hiring, supervision, personnel, payroll, discipline, and separation records remain in the employer's system unless a separately authorized Mesh purpose requires a bounded Claim or transaction reference.
6. Credential award, Provider eligibility, hiring, program eligibility, and incentive approval remain decisions of their respective issuing authorities.

Workforce classifications may use purpose-appropriate external standards. HSDS may represent Organizations, Services, Locations, contacts, and access pathways. CTDL may represent Credentials, Learning Opportunities, Competencies, pathways, and related outcomes. O*NET-SOC or another approved occupational scheme may classify Occupations and work requirements. CIP may classify instructional programs. HR Open Standards may support bounded employment-system exchanges. WIOA PIRL and RSA-911 may support authorized reporting projections but do not define the canonical Mesh Person.

Reference: [Credential Transparency Description Language](https://credentialengine.org/credential-transparency/ctdl/); [O*NET-SOC Taxonomy](https://www.onetcenter.org/taxonomy.html); [NCES Classification of Instructional Programs](https://nces.ed.gov/ipeds/cipcode/); [HR Open Standards](https://www.hropenstandards.org/standards); [RSA-911 Policy Directive](https://rsa.ed.gov/performance/rsa-911-policy-directive).

### 8.9 Selective persistence and refresh

The Mesh may persist stable Organization identity anchors, Organization Capacities, encountered Program and Opportunity identities, source-native classifications, approved terminology mappings, authoritative registrations, and the evidence snapshot relied upon for a consequential Recommendation, Service Connection, Referral, or Resource Transaction.

Information whose actionability changes materially over time must be refreshed for the applicable inquiry. This includes job openings, wages, schedules, application routes, deadlines, training cohorts, available seats, tuition, admissions requirements, funding eligibility, incentive rules, available funding, certification windows, and current willingness to participate.

The Mesh must not routinely replicate complete applicant-tracking, application, onboarding, I-9, background-check, payroll, clinical-rehabilitation, vocational-rehabilitation, education, or personnel records. Such information remains in the authoritative external system unless a specific authorized Mesh purpose requires a bounded record, reference, or Claim.

For each consequential connection, the Mesh must preserve the material requirements and evidence it actually relied upon even when later discovery refreshes the current representation.

### 8.10 Provider and opportunity invariants

1. The Provider exists independently of every record, source, membership, and connection endpoint.
2. Provider identity must remain separate from Service, Program, Location, and Service at Location.
3. A Provider ID does not imply endorsement, current capability, availability, or referral acceptance.
4. Current actionable details must be refreshed for the inquiry when their age could materially affect the connection.
5. Historical hours, eligibility, capacity, or contact information must not be silently represented as current.
6. A Receiving Point of Contact must be validated for the referral purpose; a general public contact is not automatically a referral recipient.
7. External provider identifiers are namespaced.
8. Ambiguous provider candidates remain separate or provisionally associated until resolved.
9. Provider participation affects contribution and access rights, not fair discovery eligibility.
10. Availability is a time-bounded Claim, not a stable Provider-registry attribute.
11. A Hold, Reservation, or Eligibility Decision exists only when an accountable Provider or authoritative external system creates or reports it.
12. The Mesh’s record of a Hold or Reservation must retain the authoritative external identifier, terms, expiration, and reconciliation state.
13. Provider Encounter and Provider Participation are independent dimensions.
14. Participation rights and responsibilities do not extend beyond the agreement’s Provider, Program, Service, Location, information, representative, capability, and time scope.
15. Provider identity consolidation and separation must be reviewable, reversible, and historically traceable.
16. Provider is a contextual service-capable role of a real person or Organization; it is not created by an HSDS record or participation agreement.
17. Employer, Provider, Training Provider, Vocational-Rehabilitation Provider, Apprenticeship Sponsor, and Work-Based-Learning Host are contextual capacities, not mutually exclusive or permanent Organization types.
18. An ordinary employment relationship must not be represented as Provider service delivery solely because employment responds to an economic Need.
19. Service, Learning Opportunity, Employment Opportunity, Employment Relationship, Credential, Occupation, and Placement Outcome must remain distinguishable.
20. Current Opportunity availability and requirements are time-bounded Claims and must not become timeless Organization attributes or Provider attributes.
21. An Incentive Eligibility Claim must not be represented as an Incentive Determination or guarantee.
22. Sensitive facts that may support an Incentive Eligibility Claim must not be disclosed to an employer without applicable authority and purpose.
23. Discovery refreshes current actionable information; the transaction history preserves the evidence and requirements actually relied upon.

## 9. Evidence, claims, and discovery

### 9.1 Canonical concepts

| Concept | Definition |
|---|---|
| Source | A person, institution, publication, system, document, or endpoint from which information originated |
| Source observation | The captured account of what a Source presented or returned at a particular time |
| Evidence artifact | Preserved material supporting one or more Claims |
| Claim | A sourced proposition about a subject |
| Claim type | The defined meaning of the proposition being asserted |
| Claim authority assessment | Evaluation of whether a Source is appropriate for that Claim type and use |
| Claim relationship | Support, contradiction, qualification, derivation, correction, or supersession between Claims |
| Current projection | A purpose-specific assembled view derived from Claims and authoritative domain state |
| Discovery Request | A source-neutral specification of the Need, place, constraints, preferences, and timing relevant to finding help |
| Discovery Attempt | One execution of a Discovery Request against one or more available Sources |
| Candidate | A Provider, Service, Service at Location, Opportunity, or other appropriate response considered for the Discovery Request |
| Candidate Evaluation | An explainable comparison of a Candidate against the Discovery Request |
| Candidate Set | The bounded collection presented for consideration |
| Recommendation | An explained ordering or emphasis among Candidates; it is not a guarantee |
| Concept Scheme | An identified and versioned vocabulary, taxonomy, ontology, code system, or other governed collection of concepts |
| Concept | A defined meaning within a Concept Scheme, identified independently of its display label |
| Source-native Term Observation | The exact label, code, description, and context used by a Source at a particular time |
| Concept Relationship | A broader, narrower, related, replacement, or other governed relationship between Concepts in one scheme |
| Taxonomy Mapping | A versioned exact, close, broader, narrower, related, or unresolved translation between Concepts, Expressions, Needs, source-native terms, and external vocabularies |
| Classification Assertion | A sourced assertion that a Need, Provider Capacity, Service, Opportunity, requirement, or Outcome corresponds to a Concept |
| Concept Candidate | A proposed local Concept whose operational meaning is not adequately represented by an adopted Concept |
| Concept Lifecycle State | The observed, mapped, candidate, adopted, deprecated, or superseded state of a local Concept or mapping |

### 9.2 Evidence structure

~~~mermaid
flowchart TB
    S["Source"]
    O["Source Observation"]
    C["Claim"]
    P["Current Projection"]
    R["Recommendation"]
    S --> O
    O --> C
    C --> P
    P --> R
~~~

Each transformation must preserve the material source, time, method, and limitations of the input. Repetition or transformation must not increase certainty.

A Current Projection is current only for a stated purpose and as-of time. It must identify the freshness rules applied, Sources included, material Sources unavailable, and unresolved conflicts. The Mesh must not imply that one universal current Provider or Person profile exists for every use.

### 9.3 Claim identity

A Claim is identified by:

- subject;
- Claim type;
- asserted value;
- Source or accountable contributor;
- relevant time;
- authority and permitted-use context; and
- version or correction relationship.

Two Claims with the same value but different Sources remain distinct. Two observations from the same page at different times remain distinct observations.

### 9.4 Source authority

Authority is assessed claim by claim. Legal identity, license, published capability, geographic location, eligibility, current availability, provider acceptance, and service receipt may each require different Sources.

A Claim Authority Assessment must identify:

- Claim type and intended consequence;
- Source identity and Source type;
- jurisdiction or organizational scope;
- directness of knowledge;
- currency;
- known limitations;
- assessment rule and version; and
- accountable reviewer or approved automated method.

### 9.5 Discovery Request

A Discovery Request may include only information justified by the search, including:

- active Need and immediate objective;
- person-selected priority;
- location or service area;
- time or urgency constraint;
- travel mode and practical reach;
- remote-service acceptability;
- accessibility, language, cost, eligibility, or documentation constraints;
- preferences;
- requester context; and
- consequence level.

It must not require a complete person profile.

### 9.6 Candidate evaluation

A Candidate Evaluation must be explainable in terms of:

- the active Need;
- material constraints and preferences;
- the Provider, Service, Opportunity, Location, and access pathway considered;
- supporting and conflicting Claims;
- freshness and missing information;
- evaluation rule or instruction version;
- AI contribution, if any; and
- why the Candidate was included, excluded, or emphasized.

An evaluation does not create provider eligibility, availability, acceptance, or outcome.

### 9.7 Discovery invariants

1. Discovery may proceed without a Mesh Person.
2. Each Discovery Attempt belongs to one Discovery Request version.
3. A new inquiry may reuse Provider identity anchors but must refresh material actionable Claims.
4. Failure to retrieve a Source is missing evidence, not evidence that the service does not exist.
5. Absence from the Provider registry is not evidence that a Provider does not exist.
6. Taxonomy mapping does not establish diagnosis, eligibility, urgency, or suitability.
7. Search rank, popularity, sponsorship, participation, or technical convenience must not substitute for explained Need fit.
8. Conflicting Claims remain visible until appropriately reconciled.
9. A Recommendation must identify the evidence and evaluation version used.
10. A Candidate Set is time-bounded and must not be treated as a permanent directory result.

### 9.8 Governed terminology growth

Provider Mesh may recognize unfamiliar source language during any Discovery Attempt. Recognition does not by itself establish canonical meaning.

For a newly encountered term, the Mesh must preserve the Source-native Term Observation and may:

1. associate it with the applicable SDOH or other approved high-level domain;
2. map it to one or more adopted Concepts when supported;
3. retain an unresolved or qualified mapping when the meaning is incomplete or ambiguous;
4. propose a Concept Candidate when an operationally meaningful distinction is not adequately represented; and
5. complete the immediate discovery without waiting for permanent taxonomy adoption when the available evidence otherwise supports a useful connection.

A Concept Candidate may be adopted when an accountable steward determines that it represents a material distinction required for matching, eligibility, safety, routing, referral, reporting, interoperability, or outcome analysis and cannot be adequately expressed through an existing adopted or authoritative external Concept. Frequency of observation is evidence but is neither necessary nor sufficient by itself. A single high-consequence distinction may require adoption; repeated marketing language may require only an alternative label or mapping.

The Mesh must prefer reference to an appropriate maintained external Concept Scheme, then a governed crosswalk, before creating a local extension. External schemes remain separately identified and versioned. A local extension must have a stable identifier, preferred label, definition, scope note, alternative labels as applicable, domain, relationships, provenance, steward, lifecycle state, effective time, and change history.

The W3C Simple Knowledge Organization System may inform the shared representation of Concept Schemes, Concepts, labels, relationships, mappings, scope notes, and change history. Domain-specific exchange may use equivalent terminology structures, including FHIR CodeSystem, ValueSet, and ConceptMap where appropriate for healthcare. HSDS taxonomy references and classifications must remain HSDS-compatible and must not be represented as though HSDS were a complete taxonomy-interchange standard.

Reference: [W3C SKOS Reference](https://www.w3.org/TR/skos-reference/skos.html); [Open Referral — Classifications, Attributes & Taxonomies](https://docs.openreferral.org/en/3.0/hsds/classifications.html); [HL7 FHIR Terminology Module](https://fhir.hl7.org/fhir/terminology-module.html).

### 9.9 Terminology invariants

1. Source-native language, code, description, Source, and observation time must remain available after normalization or mapping.
2. AI may propose a Classification Assertion, Taxonomy Mapping, alternative label, or Concept Candidate; it must not silently adopt canonical meaning.
3. An adopted Concept requires accountable stewardship and versioned change history.
4. Mapping confidence must not be converted into Source authority, clinical diagnosis, Provider eligibility, urgency, suitability, or outcome.
5. Need, Service, Provider Capacity, Opportunity, Eligibility, and Outcome vocabularies must remain distinguishable even when they share external concepts.
6. Changing a Concept or mapping must not rewrite the Source Observation or erase the classification version used in a consequential decision.
7. Current availability, price, schedule, capacity, deadline, funding, and case-specific eligibility are Claims, not permanent taxonomy concepts.
8. An unmapped or provisional term must not by itself block an otherwise supportable human connection.
9. Deprecated or superseded Concepts remain resolvable for historical records and must identify their replacements or change rationale.
10. A Concept Scheme may be adopted for a bounded domain purpose without becoming the Mesh's universal matching logic or complete domain model.

## 10. Relationships, authority, consent, and access

### 10.1 Canonical concepts

| Concept | Definition |
|---|---|
| Relationship | A sourced association between actors, people, organizations, providers, or collaborations |
| Relationship type | The meaning of the association, such as family supporter, navigator, caseworker, guardian, provider, or collaboration participant |
| Pending Relationship Assertion | A reported but not yet validated statement that an Actor assists or otherwise relates to a Mesh Person |
| Helping Relationship | A purpose- and time-bounded relationship in which an identified Human Actor, acting for self or an Organization, accepts direct assistance responsibility toward a Mesh Person |
| Referrer role | The contextual role of an Actor or Organization initiating a particular Referral; it is not a permanent Actor classification |
| Authority basis | The voluntary, professional, contractual, fiduciary, custodial, legal, compulsory, or institutional basis for permitted action |
| Authority Record | The general record of an asserted or validated authority, its origin, scope, time, evidence, and status |
| Authority Grant | An Authority Record subtype in which an authorized party affirmatively grants or delegates permission |
| Consent record | A person’s recorded voluntary authorization or refusal for a defined purpose; one possible Authority basis |
| Disclosure Authorization | An Authority Record permitting identified information to be disclosed to an identified recipient or recipient class for a defined purpose |
| Release of Information | A documented form of Disclosure Authorization; it is not the only possible Authority basis |
| Delegation | Authority intentionally assigned by one authorized party to another |
| Organization assignment | An Organization’s assignment of a role or duty to an Actor |
| Confidentiality Obligation | A validated duty requiring an Actor or Organization to protect information under law, profession, employment, contract, participation agreement, or NDA |
| Confidentiality Agreement | A documented Confidentiality Obligation accepted by a participant; it may apply generally across eligible Mesh activities |
| Access Role | A named set of maximum potential capabilities assigned to an Actor in a represented context; it does not authorize every instance of use |
| Access Request | A request by an Actor to view information or exercise a capability |
| Authorization Decision | The allow, deny, defer, or review-required result for a particular Access Request |
| Disclosure | Release of information to an identified recipient for an authorized purpose |
| Revocation | End of future reliance on a revocable Authority Record, subject to governing rules |

### 10.2 Authority forms

Authority may arise from:

- Consent or voluntary authorization;
- delegation;
- legal or court-established authority;
- fiduciary or custodial authority;
- professional or institutional duty;
- Organization assignment;
- contractual authority;
- Collaboration Charter authority; or
- compulsory or public authority.

The Authority Record must identify which basis applies. Authority not voluntarily granted by the person must not be represented as consent.

### 10.3 Authority scope

An Authority Record must be capable of limiting:

- person or population;
- issuing and receiving parties;
- represented role and organization;
- purpose;
- information categories or specific records;
- permitted actions;
- provider, episode, referral, or collaboration context;
- effective duration;
- re-disclosure conditions;
- delegation rights;
- required notifications or acknowledgements; and
- applicable legal, contractual, or institutional basis.

### 10.4 Helping relationships

A Relationship may explain why an Actor is involved. It does not by itself authorize information access or action.

Guardian, representative payee, parole officer, family member, navigator, caseworker, and Provider are distinct Relationship and Authority types. No universal trusted-person flag may collapse them.

A Mesh Person may have several concurrent Helping Relationships. Each relationship must identify:

- Human Actor providing help;
- represented Organization, unit, Program, and role when applicable;
- Mesh Person and applicable Assistance Episodes or Needs;
- purpose and direct assistance responsibility accepted;
- Authority Records and Confidentiality Obligations relied upon;
- permitted information and actions;
- follow-up responsibility;
- effective period;
- status, revocation, dispute, and correction; and
- source and accountable confirmer.

A help-seeker may identify a helper during registration or later. That creates a Pending Relationship Assertion and may support an invitation. It does not validate the helper’s identity, Organization Affiliation, authority, access, or responsibility.

A Helping Relationship becomes active when identity and represented capacity are sufficiently validated, the person or other legitimate authority permits the defined assistance, and the helper accepts the relationship. The formal link is required when the relationship must carry continuing authority, information access, accountability, or follow-up responsibility. Co-navigation using only public information does not require a durable Helping Relationship.

One helper cannot automatically see another helper’s activity. Shared information requires its own authority or a chartered Collaboration.

### 10.5 Simplified confidentiality and disclosure rule

Relationships describe why someone is involved. Authority determines what the Actor may do. Confidentiality determines how information received must be protected.

A relationship label does not itself trigger a particular ROI, NDA, or form. The trigger for a governed decision is an attempt to access or disclose nonpublic person-specific information or perform a consequential action.

The Mesh must determine:

1. whether recipient identity and represented capacity are sufficiently validated;
2. whether an effective Authority Record covers the purpose, information, recipient, and action;
3. whether the recipient has an adequate Confidentiality Obligation; and
4. whether material conflict or uncertainty requires validation or Human Review.

Existing authority and confidentiality coverage may be reused while its scope remains sufficient. A separate NDA is not required when an adequate legal, professional, employment, organizational, or contractual confidentiality basis is validated. A general Mesh or Case Review Confidentiality Agreement may cover repeated eligible participation.

When uncertainty can be resolved through a low-friction confirmation, the Mesh should ask a clear, bounded question. If required authority or confidentiality cannot be validated, the information must not be disclosed.

Registration Authorization governs internal Mesh use and is not a general ROI. A Referral, helper access, external identifier link, identifiable consultation, or Collaboration participation may require a more specific Authority Record.

### 10.6 Authorization decision

An Authorization Decision evaluates:

- authenticated Actor and represented capacity;
- requested purpose and action;
- target record or capability;
- applicable Relationship and Authority Record;
- applicable Confidentiality Obligation;
- information sensitivity;
- person, Organization, Provider, and Collaboration boundaries;
- environment and channel;
- consequence;
- conflicts or uncertainty; and
- governing rule version.

Material ambiguity produces denial, deferral, or Human Review. It must not produce silent access.

A role defines maximum potential capability. Relationship, authority, purpose, information, recipient, confidentiality, and context determine whether the Actor may exercise that capability in the particular instance.

### 10.7 Consent and revocation

Consent must identify what was explained, what was accepted or declined, and the scope and duration of the decision. A broad interface acknowledgment is not blanket consent.

Revocation or expiration ends future use to the extent required by the governing authority. It does not falsify prior authorized transactions or automatically remove information already received by another legitimate custodian.

### 10.8 Authority invariants

1. Authentication, Relationship, identity linkage, and authorization are separate.
2. Technical capability and account role do not create permission.
3. Authority for one Need, Referral, Collaboration, or purpose does not transfer to another.
4. Organization membership does not create blanket access to all people served by the Organization.
5. Consent is not inferred from silence, technical use, provider selection, referral delivery, or participation in a meeting.
6. Authority must be effective at the time of the action.
7. An Actor may hold several capacities, but the capacity used for each consequential action must be explicit.
8. Conflicting legal or institutional authority requires accountable human determination.
9. Authorization decisions and consequential disclosures must be auditable.
10. Equal confidentiality protection does not imply equal access.
11. Authority Grant is used only when an authorized party affirmatively grants or delegates authority.
12. Adequate existing authority and confidentiality coverage should be reused; a new form is not required solely because a relationship title changes.
13. Registration Authorization is not a general Release of Information.
14. A Relationship label does not itself trigger a form; an attempted access, disclosure, or consequential action triggers the Authorization Decision.
15. One helper's access does not confer access to another helper.
16. Referrer is a contextual role in relation to a Referral, not a permanent class of person.
17. When doubt can be resolved through proportionate, low-friction validation, the Mesh should validate; when required authority cannot be validated, it must deny, defer, or route the decision to Human Review.

## 11. Service connections

### 11.1 Purpose

A Service Connection is the Mesh account of an attempt to help a person reach or begin engagement with a Provider, Service, Program, Location, or access pathway. It covers the practical connection between discovery and Provider-controlled intake whether the interaction occurs through the Mesh, by telephone, through a website or portal, in person, or through another authorized channel.

A Service Connection is broader than a Referral. A Referral is one formal, authorized type of Service Connection. A candidate merely displayed or discussed is not a Service Connection until a person or authorized helper takes or accepts a connection action.

### 11.2 Canonical concepts

| Concept | Definition |
|---|---|
| Service Connection | The durable root record for a bounded attempt to connect a person or purpose-bound Assistance Group to help |
| Connection Intent | The Need, desired result, selected candidate, preferences, and constraints that explain why the connection is attempted |
| Connection Participant | A person, requester, helper, Provider representative, Organization, or automated Actor participating in the connection |
| Connection Channel | The route used or proposed, such as telephone, website, portal, email, in-person visit, Referral, API, or MCP capability |
| Connection Attempt | A time-bounded action taken to establish contact, transmit a request, schedule a next step, or otherwise advance access |
| Connection Event | An attributable observation or report about a material step in the connection |
| Connection Responsibility | A follow-up duty expressly accepted by an Actor or Organization |
| Provider Engagement Claim | A Provider-attributable or otherwise sourced claim that the Provider acknowledged, accepted, enrolled, scheduled, or began serving the person |
| Connection Outcome Claim | A sourced claim about contact, barrier, progress, service access, experience, or result |
| Connection Disposition | The Mesh's administrative treatment of the connection record, separate from Provider engagement and outcome |

### 11.3 Connection structure

~~~mermaid
flowchart TB
    SC["Service Connection"]
    CI["Connection Intent"]
    CA["Connection Attempt"]
    CE["Connection Event"]
    OC["Outcome Claim"]
    SC --> CI
    SC --> CA
    CA --> CE
    SC --> OC
~~~

A Service Connection may reference a Discovery Candidate, Need, Mesh Person or provisional person context, Provider, Service, Referral, and Action Item. Those references do not collapse their independent authority or lifecycles.

### 11.4 Status dimensions

Service Connection status is represented through separate dimensions:

| Dimension | Representative states |
|---|---|
| Intent | proposed, selected, deferred, declined, withdrawn |
| Attempt | not started, attempted, retry planned, completed for channel, failed, result unknown |
| Contact | not observed, initiated, established, unable to determine |
| Provider engagement | not observed, acknowledged, accepted, declined, scheduled, enrolled, service started, unable to determine |
| Responsibility | unassigned, offered, accepted, completed, released, expired |
| Disposition | open, awaiting action, inactive, procedurally closed |
| Outcome | separate sourced Claims, including barrier, service received, need reported satisfied, need reported unmet, or unknown |

One dimension must not imply another. In particular, a completed Connection Attempt does not prove contact; contact does not prove Provider acceptance; acceptance does not prove enrollment or service receipt; and procedural closure does not prove Need satisfaction.

### 11.5 Connection lifecycle

1. A person or authorized requester selects or accepts a proposed connection action.
2. The Mesh records the Connection Intent and the minimum participants, target, and channel required for accountability.
3. Identity and authority are established only to the degree required by the information and action.
4. The person, helper, Provider, or authorized capability makes a Connection Attempt.
5. Subsequent events are recorded only when observed or reported by an attributable source.
6. Follow-up responsibility exists only when expressly accepted.
7. The connection may remain open, be retried, become a Referral, relate to a Collaboration, or close procedurally without implying a service outcome.

### 11.6 Service Connection invariants

1. Public information supplied without an accepted connection action does not create a Service Connection.
2. A person may make a direct Service Connection without creating a Referral.
3. A Referral references or creates one bounded Service Connection; it does not replace the Service Connection concept.
4. Out-of-Mesh communications remain unknown unless an authorized Actor reports them or a governed capability observes them.
5. The Provider remains authoritative for its intake, acceptance, enrollment, professional decisions, and service records.
6. The Mesh must identify the source of each reported Connection Event and outcome.
7. A requester is not assigned indefinite follow-up merely because the requester supplied information or initiated contact.
8. A failed attempt does not establish Provider refusal, service unavailability, or Need resolution.
9. A Service Connection does not automatically create a Helping Relationship or Collaboration.
10. Connection history must not be used to restrict a person's future choices without separate lawful authority.

## 12. Referral

### 12.1 Purpose

A Referral is the Mesh-governed account of an authorized request to a selected Provider to consider a defined Service Connection for a person. It is one formal type of Service Connection, not merely a message or document, and it does not guarantee acceptance, enrollment, service receipt, or satisfaction of the Need.

### 12.2 Canonical concepts

| Concept | Definition |
|---|---|
| Referral | The durable root record for a bounded formal handoff within a Service Connection concerning a person or purpose-bound Assistance Group |
| Referral Envelope | The secure control record binding parties, purpose, authority, state, script, document references, transport, and custody |
| Referral Script | A versioned human-readable and machine-extractable account of the requested service connection |
| Referral Party | A person, requester, sending organization, selected Provider, receiving contact, or accountable follower associated with the Referral |
| Referral Document Reference | A governed pointer to a protected document authorized for the Referral |
| Referral Authorization | The recorded authority to prepare, disclose, transmit, or receive the Referral |
| Transport Attempt | An attempt to notify, transmit, or support human delivery through a defined channel |
| Delivery Evidence | Evidence that the authorized destination received the notification or payload defined by the transport contract |
| Provider Response | An attributable Provider acknowledgement, acceptance, decline, request, or other response |
| Follow-up Assignment | A responsibility expressly accepted by a person or institution for a defined next action |
| Procedural Disposition | The Mesh’s administrative treatment of the Referral record |
| Referral Outcome Claim | A sourced claim about contact, acceptance, service, barrier, experience, or other result |

### 12.3 Referral structure

~~~mermaid
flowchart TB
    R["Referral"]
    E["Referral Envelope"]
    S["Referral Script Version"]
    D["Document Reference"]
    T["Transport and Response"]
    R --> E
    E --> S
    E --> D
    E --> T
~~~

The Envelope references protected documents; it does not embed duplicate files. The Script is one versioned artifact within the Referral and is not the entire Referral record.

### 12.4 Referral status dimensions

Referral status must not be reduced to a single ambiguous field. At minimum, the model distinguishes:

| Dimension | Representative states |
|---|---|
| Preparation | draft, ready for review, complete for intended transport |
| Authorization | not requested, pending, authorized, denied, expired, revoked |
| Transport | not attempted, attempted, delivered, failed, result unknown |
| Provider response | no response observed, acknowledged, accepted, declined, more information requested, unable to determine |
| Procedural disposition | open, awaiting action, withdrawn, closed after defined procedure |
| Outcome | separate Claims such as contact established, service started, barrier reported, need reported satisfied, or unknown |

One dimension must not be used to infer another. In particular, delivered does not mean acknowledged; acknowledged does not mean accepted; accepted does not mean enrolled; procedurally closed does not mean the Need was satisfied.

A Provider Response records the attributable communication or transaction received from the Provider. Semantic assertions within the response are represented as Provider-attributable Claims or authoritative transaction facts according to the Source and capability involved. The response record does not acquire greater authority merely because it is attached to a Referral.

### 12.5 Referral lifecycle

1. A Candidate is selected by the person or authorized requester.
2. The Provider’s current referral pathway and material requirements are discovered.
3. Identity, authority, and information are established only to the degree required.
4. A Referral and draft Envelope are created.
5. The Script and proposed documents are reviewed for relevance and authority.
6. An authorized Actor approves the intended recipient, purpose, content, and transport.
7. The transport pathway attempts delivery or supports human contact.
8. Delivery, response, follow-up, and outcomes are recorded only when evidenced.
9. The Referral reaches a Procedural Disposition without converting unknown service results into success or failure.

### 12.6 Script versioning

Each Script Version must retain:

- the Need and desired connection;
- Provider, Service, Location, and Receiving Point of Contact;
- relevant person and requester context;
- material eligibility, access, or documentation information;
- author or generating process;
- source material and AI contribution;
- review and authorization;
- creation and effective times;
- related Document References; and
- relationship to prior versions.

A sent version must remain reproducible. Later corrections produce another version or an attached correction; they must not silently change what the recipient received.

### 12.7 Referral custody

The Mesh is authoritative for the Referral Envelope, its Script versions, Mesh transport events, and Procedural Disposition.

The requesting party remains accountable for information it contributed and any follow-up it accepted. The receiving Provider becomes accountable for information it receives and records it creates. Provider acceptance and service delivery remain within Provider authority.

No party acquires ownership of the person or blanket control of all related information.

### 12.8 Referral invariants

1. A Referral concerns one Mesh Person, an explicitly identified provisional person context, or a purpose-bound Assistance Group whose affected members and authorities are represented.
2. A Referral targets one selected Provider and defined Service or access pathway; changes that alter the intended recipient or purpose require reauthorization.
3. A Receiving Point of Contact is required for transmission, whether human or system endpoint.
4. The Referral must identify the authority for each disclosed item.
5. A document may be referenced only when its purpose and disclosure authority are established.
6. Confidential content is not placed in ordinary notification messages unless a separately approved equivalent-control pathway permits it.
7. Transport success does not create a Provider Response.
8. Out-of-Mesh activity remains unknown until an authorized source reports it.
9. Follow-up responsibility exists only when accepted and recorded.
10. The Referral may lead to one-to-one coordination but does not automatically create a Collaboration.
11. Referral withdrawal does not erase legitimate historical custody or audit records.
12. A referral script received by a Provider enters a Collaboration only through a separately authorized contribution.
13. A Referral must reference the Service Connection it formalizes; the two records retain separate state and authority.

## 13. Secure documents and custody

### 13.1 Canonical concepts

| Concept | Definition |
|---|---|
| Document Asset | Protected binary or native content held in secure storage |
| Document Record | Metadata governing the Document Asset |
| Document Version | An immutable content version with integrity information |
| Document Subject | A sourced association identifying a person, provisional person context, Assistance Group member, Provider, Organization, or other real-world subject represented in a Document Version |
| Document Reference | A purpose-bound pointer from another domain record to a Document Version |
| Contributor | The Actor or institution that supplied the document |
| Custodian | The institution responsible for a copy or governed instance |
| Document Access Grant | Permission to view, preview, download, transmit, or process the document |
| Receipt Copy | The immutable version preserved as evidence of what was received or disclosed |
| Document Processing Result | A sourced extraction, classification, summary, or safety finding derived from a document |
| Custody Event | Creation, receipt, access, disclosure, transfer, restriction, hold, or disposition involving the document |

### 13.2 Document subjects

A Document Subject association must identify, as applicable:

- the Document Version and represented subject;
- subject type and the subject's role in the document;
- whether the identity is confirmed, asserted, inferred, disputed, or unknown;
- the source and basis of the association;
- applicable information category, sensitivity, and restrictions;
- governing authority, rights, and notice requirements; and
- correction, separation, or supersession history.

A document may concern several people or institutions. Document access must account for all affected subjects, not only the person to whom the containing Referral, Episode, or Collaboration is linked. An unidentified or not-yet-linked person remains a represented subject and must not be ignored merely because no Mesh Person record exists.

Document Subject is not document ownership, custody, authorship, or authority. These concepts remain separate.

### 13.3 Document reference rules

A Document Reference identifies:

- target Document Version;
- referring Episode, Referral, Collaboration, or other authorized record;
- purpose;
- information and recipient scope;
- authority basis;
- access conditions and expiration;
- contributing and receiving custodians;
- integrity digest; and
- retention and disposition rule.

Deleting a reference does not necessarily delete the underlying Document Asset when another legitimate purpose, custodian, hold, or record still requires it.

### 13.4 Processing and AI

AI extraction or summarization produces a Document Processing Result. It does not modify the source document or become an authoritative fact. The result must identify its source version, process, model or rule version, time, confidence, limitations, and human correction.

### 13.5 Document invariants

1. An Envelope holds references, not duplicate document binaries.
2. A Document Version is immutable once used as evidence or disclosed.
3. A later document creates a new version or separate asset.
4. Access to metadata does not automatically authorize access to content.
5. Access must be purpose-, recipient-, and time-bounded.
6. Every consequential access or disclosure creates a Custody Event and Audit Event.
7. Contributor, custodian, subject rights, and recipient obligations remain distinct.
8. Document processing must not create an unrestricted duplicate corpus.
9. A document concerning multiple subjects must not be disclosed solely on the authority of one subject when another subject's protected information is materially included.
10. Failure to identify or link a Document Subject does not remove confidentiality obligations concerning that subject.
11. A Document Subject association must remain correctable and must not be treated as identity proof outside its stated assurance and purpose.

## 14. Collaboration

### 14.1 Purpose

A Collaboration is a governed many-to-many relationship among organizations pursuing an agreed agenda. Shared platform use, a Referral, a case discussion, or several Providers serving the same person does not by itself create a Collaboration.

### 14.2 Canonical concepts

| Concept | Definition |
|---|---|
| Collaboration | The durable identity and information compartment for a shared agenda |
| Collaboration Charter | The governing agreement defining purpose, boundaries, commitments, decision rights, information use, conflict, and closure |
| Charter Version | The approved Charter terms effective for a defined interval |
| Collaboration Member | An Organization formally participating under the Charter |
| Authorized Representative | A human Actor empowered to act for a Collaboration Member |
| Collaboration Role Assignment | Lead, backbone, participant, reviewer, facilitator, recorder, or another Charter-defined responsibility |
| Person Participation | The bounded inclusion of a Mesh Person in person-specific Collaboration activity |
| Collaboration Information Grant | Authority to contribute or access information within the Collaboration |
| Case Review | A scheduled or ad hoc person-specific multi-party coordination activity |
| Case Review Participant | A Human Actor admitted to a defined Case Review under the Charter, Person Participation authority, and applicable Confidentiality Obligation |
| Sponsored Participant | A non-member Human Actor invited by an authorized Collaboration participant for a defined Case Review purpose |
| Sponsor Assertion | The sponsor's attributable statement of the invited person's identity, affiliation, claimed credentials, relevance, and represented expertise |
| Expert Consultant | A contextual label for a Case Review Participant invited to contribute knowledge or guidance without accepting direct service or case-management responsibility |
| Consultation | A bounded exchange of knowledge or guidance within a Case Review; it is not a Referral, Service, or Helping Relationship |
| Case Review Confidentiality Agreement | A general or session-specific Confidentiality Agreement governing eligible Case Review participation |
| Meeting | A recorded Collaboration event with purpose, attendance, and source material |
| Collaboration Communication | A governed group or one-to-one message within the Collaboration context |
| Collaboration Note | A human-authored or AI-assisted account of discussion or progress |
| Action Item | The shared Action Item concept defined in Section 15.1 when created in a Collaboration context |
| Shared Measure | A Charter-defined measurement concept with agreed meaning |
| Referral Contribution | An authorized act that makes identified Referral information available inside the Collaboration |

### 14.3 Collaboration structure

~~~mermaid
flowchart TB
    C["Collaboration"]
    CV["Charter Version"]
    M["Member Organization"]
    PP["Person Participation"]
    CR["Case Review"]
    C --> CV
    C --> M
    C --> PP
    PP --> CR
~~~

Each Collaboration is a separate information and authority compartment. A person may participate in several Collaborations without information flowing automatically among them.

### 14.4 Charter minimum

A Charter Version must define:

- common agenda;
- population or problem focus;
- participating organizations;
- commitments and mutually reinforcing activities;
- decision rights;
- shared understanding of progress and measures;
- communication practices;
- lead and backbone assignments;
- person participation and information rules;
- conflicts of interest;
- disagreement, correction, and escalation;
- relationship to overlapping Collaborations;
- effective date, amendment, suspension, and closure; and
- approval by authorized Member representatives.

Approval time and effective time are separate. A future Charter Version may be approved before it becomes effective. Emergency suspension may stop further reliance without rewriting the previously effective Charter. A gap between effective versions leaves the Collaboration without active Charter authority for new activity.

An amendment must state whether existing Person Participation, information grants, role assignments, and confidentiality coverage remain sufficient. Material changes to purpose, population, participant classes, information use, or disclosure require renewed authority where the existing scope no longer covers the activity.

### 14.5 Person participation

Person Participation must identify:

- Mesh Person;
- Collaboration and Charter Version;
- purpose and authorized information scope;
- authority basis;
- effective duration;
- participating Organizations permitted to access information;
- restrictions, objections, or special conditions;
- revocation or closure; and
- correction history.

Participation in the Collaboration does not authorize every Member to access every record about the person.

### 14.6 Sponsored participation and consultation

A Collaboration may include an authorized representative of a Member Organization or a Sponsored Participant for one or more defined Case Reviews. Admission should be proportionate and low-friction while maintaining accountability.

For a Sponsored Participant, the minimum join sequence is:

1. an authorized Collaboration participant issues or records the invitation;
2. the sponsor records a Sponsor Assertion explaining the invited person's asserted identity, affiliation, claimed credentials, relevance, and intended contribution;
3. the invited person confirms their identity, represented affiliation, and capacity at the assurance level required for the session;
4. the invited person accepts the applicable Case Review Confidentiality Agreement or demonstrates another adequate Confidentiality Obligation;
5. the Authorization Decision confirms that the Charter and Person Participation authority permit the participant class and intended disclosure; and
6. attendance, effective access, and departure are recorded.

The Mesh records the sponsor's assertion as reported. It must not imply that Springboard independently licensed, certified, or endorsed the person's expertise unless a separate verification occurred. A Collaboration may define higher verification for higher-consequence participation.

An adequate general Case Review Confidentiality Agreement may cover repeated eligible sessions. Confidentiality is necessary but not sufficient: an NDA does not itself authorize disclosure, and access remains limited by Person Participation, purpose, information category, meeting, time, and role.

An Expert Consultant is not automatically a Provider, helper, referrer, Collaboration Member, credential class, or referral target. Consultation is not a Referral or Provider service. A Consultant becomes a helper or Provider participant only through a separate relationship, authority, responsibility, and—where applicable—Provider identity or participation transition.

De-identified consultation may proceed without linking the discussion to a Mesh Person when re-identification risk and the Charter permit it. Identifiable consultation requires applicable Person Participation authority. A Sponsored Participant receives no broader record access merely by attending a meeting.

### 14.7 Referral-to-collaboration transition

A Referral may become related to a Collaboration only through a recorded transition that identifies:

1. why multi-party coordination is needed;
2. the applicable Collaboration and Charter Version;
3. the additional participants;
4. the person and institutional authority;
5. the information being contributed;
6. the contributor with custody and authority; and
7. the effective time and limits.

The receiving Provider, not merely the original requester, must authorize contribution of the received Referral Script when the Script has entered the Provider’s custody and applicable confidentiality rules require Provider control.

### 14.8 Collaboration invariants

1. A Collaboration has one active Charter Version at a time.
2. Organizations, not software alone, establish Collaboration legitimacy.
3. Each Member retains its own professional duties, case-management method, and system of record.
4. A lead or backbone role is limited to the Charter mandate.
5. Springboard platform stewardship does not automatically make Springboard the Collaboration lead or backbone agency.
6. Membership in one Collaboration creates no membership or authority in another.
7. Person Participation is separate from Organization membership.
8. Shared measurement does not create unrestricted access to source records.
9. A Case Review may discuss Referrals and services that never passed through the Mesh.
10. Referral records do not automatically populate Collaboration records.
11. Overlapping Collaborations must not silently share information, authority, enrollment, or outcome credit.
12. Closure preserves custody, correction, audit, and retention obligations.
13. A Sponsor Assertion is attributable evidence, not independent verification by the Mesh or Springboard.
14. A Confidentiality Agreement does not by itself create information-access or disclosure authority.
15. Case Review access is bounded to the authorized person, purpose, information, meeting or activity, and effective time.
16. An Expert Consultant does not acquire direct responsibility for the person unless a separate Helping Relationship, Action Item, Referral, or Provider engagement is expressly created and accepted.
17. A Consultation must not be recorded as a Referral or Provider-delivered Service merely because professional advice was offered.
18. Participation may be refused, limited, or terminated when identity, confidentiality, authority, conduct, or conflict requirements are not satisfied.

## 15. Narratives, action items, and outcomes

### 15.1 Canonical concepts

| Concept | Definition |
|---|---|
| Source Narrative | Original human language from a conversation, note, meeting, or document |
| Narrative Account | A contextual description of goals, barriers, actions, and progress |
| Structured Extraction | A derived set of concepts extracted from a Source Narrative |
| Action Item | A bounded task accepted by an Actor or Organization |
| Action Status Report | An attributable report of progress on an Action Item |
| Procedural Disposition | The Mesh’s administrative treatment of a workflow record |
| Outcome Claim | A sourced proposition about what occurred or changed |
| Person-reported Experience | The person’s account of access, treatment, barrier, or result |
| Measure Definition | An agreed description of what is counted or assessed |
| Measure Observation | A sourced value produced under a Measure Definition |
| Disagreement | A recorded difference among accounts that remains material to understanding |

### 15.2 Narrative and structure

Narrative and structured information are complementary.

The Source Narrative preserves context, language, sequence, and human perspective. A Structured Extraction supports search, follow-up, comparison, and measurement. Neither replaces the other.

An AI-generated Narrative Account or Structured Extraction must be labeled as derived, linked to the source, attributable to its process, and open to human correction. It must not become professional judgment or a confirmed Outcome Claim merely because it is fluent or structured.

### 15.3 Action ownership

An Action Item must identify:

- objective;
- responsible Actor or Organization;
- accepting authority;
- related Need, Referral, Case Review, or Collaboration;
- due or review time when applicable;
- dependencies;
- status source;
- completion evidence or inability to determine; and
- correction history.

Mentioning that a Provider “will” do something does not create an Action Item unless the Provider or authorized representative accepts it.

### 15.4 Outcome dimensions

The model distinguishes:

- information supplied;
- connection attempted;
- contact established;
- Referral transmitted;
- Referral acknowledged;
- Provider acceptance or decline;
- enrollment or service start;
- service received;
- barrier or unmet Need;
- Person-reported Experience;
- coordination activity;
- individual change;
- cohort pattern; and
- population-level change.

These are different Claim types. They must not be collapsed into one success field.

An Outcome Claim is a specialized Claim and follows the same provenance, time, uncertainty, conflict, correction, and supersession rules as other Claims. It may reference a Need, Referral, Provider, Assistance Episode, Action Item, Case Review, or Collaboration, but that reference does not make the related record the Source of the outcome.

### 15.5 Outcome invariants

1. Every Outcome Claim has a reporter or Source and relevant time.
2. Person, Provider, Collaboration, and system accounts may differ and remain separately attributable.
3. Expected or scheduled activity is not an observed outcome.
4. Procedural closure is not service receipt or Need satisfaction.
5. One Provider’s success claim must not silently become the person’s account.
6. Historical or disputed outcomes must not permanently determine future discovery.
7. Coordination activity must not be represented as individual or population change.
8. Measure meaning must be defined before aggregation.

## 16. External sources, systems, and capabilities

### 16.1 Canonical concepts

| Concept | Definition |
|---|---|
| External Source | A public, licensed, regulated, provider-controlled, or participant-controlled origin of information |
| External System | A system outside the Mesh that owns or operates records or actions |
| Connection Endpoint | A technical or human-accessible route to an External Source or System |
| Capability Registration | The governed declaration of what an endpoint can do |
| Capability | A bounded operation such as search, retrieve, query availability, transmit, acknowledge, reserve, or expose a resource |
| Credential Context | The institutional identity and permission under which the connection operates |
| External Reference | A namespaced identifier linking a Mesh record to an External Source or System record |
| External Transaction | A durable account of an attempted consequential action through an endpoint |
| Resource Transaction | An External Transaction that queries, holds, reserves, releases, cancels, or otherwise acts upon a scarce or time-sensitive Service Resource |
| Reconciliation Record | The process and result used to resolve an ambiguous External Transaction |

### 16.2 Connection independence

A Provider, Source, External System, Connection Endpoint, and Capability are separate concepts.

A Provider may have several endpoints. One endpoint may represent several Providers or services. A website, API, database connection, portal, telephone number, and MCP server are connection types, not Provider identities.

### 16.3 Capability rules

A Capability Registration must identify:

- owning Source or System;
- Connection Endpoint;
- operation and boundaries;
- supported request and response meaning;
- authenticated institutional identity;
- permitted data classification;
- actor and person authority requirements;
- source authority by Claim type;
- cost, rate, license, and use limits;
- currency and availability characteristics;
- idempotency and reconciliation behavior for consequential actions;
- version, health, and expiration;
- accountable maintainer; and
- fallback or human pathway.

### 16.4 Resource transactions

A Resource Transaction must identify:

- person or purpose-bound Assistance Group, when the action is person-specific;
- Need, Service Connection, Referral, Provider, Service Resource, and Availability Claim as applicable;
- requesting Actor, represented Organization, Credential Context, and Authority Record;
- requested operation, terms, constraints, and expiration;
- external correlation and idempotency identifiers;
- request, response, and reconciliation times;
- source system's reported result and the Mesh's uncertainty state;
- cancellation, release, expiration, and correction history; and
- accountable party for required follow-up.

The lifecycle must preserve at least these meanings where supported: availability queried, transaction prepared, authorized, requested, pending, confirmed, declined, failed, result unknown, expired, released or cancelled, and reconciled.

These meanings may be separate state dimensions when an external system combines or omits them. An Availability Claim is evidence available at a time; it is not a hold or reservation. A confirmed reservation is not proof that the person arrived, was admitted, or received service.

The External System remains authoritative for the resource operation. The Mesh is authoritative for what it requested, received, recorded, and reconciled.

### 16.5 External transaction invariants

1. Capability is explicit and must not be inferred from endpoint type.
2. Transport success is not semantic success.
3. An External Transaction carries actor, purpose, authority, correlation, and idempotency context as applicable.
4. Timeout or ambiguous response remains unknown until reconciled.
5. Retrying a consequential transaction requires defined idempotency or human review.
6. An MCP tool cannot bypass the same authorization and consequence rules applied to another transport.
7. Wrapping public information in an internal resource does not improve its authority or freshness.
8. External references are namespaced and do not replace Mesh identity.
9. Availability, hold, reservation, admission, and service receipt are separate Claims or transactions.
10. A Resource Transaction must not be retried after an ambiguous result unless idempotency or Human Review makes duplicate action acceptably unlikely.
11. Expiration or release of a resource must not be inferred solely from elapsed local time when the External System requires confirmation.
12. A manually reported resource transaction remains attributable to the reporter and must not be represented as system-confirmed.

## 17. Human review, correction, complaints, and audit

### 17.1 Canonical concepts

| Concept | Definition |
|---|---|
| Human Review Case | A bounded matter transferred to an accountable human or institution |
| Review Authority | The role or institution responsible for deciding the matter |
| Correction Request | A request to amend, annotate, supersede, merge, separate, or de-link information |
| Complaint | An allegation of improper Mesh representation, access, disclosure, treatment, or operation |
| Dispute | A formal challenge to a Claim, identity link, authority, outcome, or Provider representation |
| Review Disposition | The accountable decision and required remedy or follow-up |
| Domain Event | A durable statement that a meaningful domain transition occurred |
| Audit Event | A tamper-evident record of who or what attempted or performed a consequential action |
| Policy Decision Record | The rule, version, inputs, and result used for a governed automated or human decision |

### 17.2 Review routing

A Human Review Case is assigned to the authority that owns the question:

- the person or requester for voluntary goals and choices;
- the Provider for eligibility, intake, professional judgment, acceptance, and service delivery;
- the Collaboration for matters within its Charter;
- the contributing institution for the authority and accuracy of its contribution; or
- Springboard as platform steward for Mesh identity associations, access conflicts, platform corrections, provider representation disputes, misuse, account recovery, and Mesh privacy or security incidents.

Escalation to human authority does not automatically mean Springboard staff intervention.

### 17.3 Human review record

A Human Review Case must identify:

- issue and consequence;
- affected records and parties;
- urgency and service commitment;
- accountable Review Authority;
- evidence and applicable rules;
- interim restrictions;
- communications and notices;
- disposition and remedy;
- review and appeal path; and
- related Audit Events.

The existence of a work queue must not imply continuous live service where none has been authorized and resourced.

### 17.4 Domain and audit events

A Domain Event explains a business transition, such as ReferralAuthorized or IdentityLinkDisputed. An Audit Event records the actor, purpose, target, time, result, and policy context of the action.

One transition may create both. Audit records must not be used as the primary mutable business record, and business records must not replace tamper-evident audit.

### 17.5 Review and audit invariants

1. Every consequential representation or action must be attributable to an accountable human or institution.
2. AI is never the accountable institution.
3. A disputed record remains restricted or qualified as required while review is pending.
4. Audit access is itself audited.
5. Correction must propagate to affected current projections without erasing legitimate history.
6. Cross-participant harm requires coordinated investigation and must not be abandoned at an organizational boundary.
7. Review status must not falsely imply a response time or staffed service commitment.

## 18. Analytics and authorized learning

### 18.1 Canonical concepts

| Concept | Definition |
|---|---|
| Operational Record | A record created for assistance, accountability, or platform operation |
| Secondary-use Authorization | Separate authority permitting defined analysis, research, evaluation, or model development |
| Analytic Purpose | The approved public or client benefit and question the analysis addresses |
| Analytic Dataset | A derived, minimized, isolated dataset created for an approved Analytic Purpose |
| Cohort Definition | The rule identifying records included in analysis |
| De-identification Transformation | A governed transformation intended to reduce identifiability |
| Data Lineage | The traceable relationship from source records through transformations to an analytic result |
| Reporting Gap | Missing participation, observation, or contribution that limits interpretation |
| Analytic Result | An aggregate, narrative, measure, model output, or other approved product of analysis |

### 18.2 Separation from operations

Operational authority to assist one person does not authorize secondary use. An Analytic Dataset must begin with an approved purpose, authorized source classes, field and time limits, transformation plan, access boundary, retention rule, and disclosure review.

De-identification and aggregation reduce risk but do not automatically authorize use or eliminate re-identification concern.

### 18.3 Learning distinctions

Analytic models must distinguish:

- expressed demand;
- active Need;
- discovery attempt;
- Candidate presented;
- connection attempt;
- Referral transmission;
- Provider response;
- service receipt;
- barrier or unmet Need;
- reported individual outcome;
- Collaboration activity;
- cohort pattern; and
- population change.

### 18.4 Analytics invariants

1. Every Analytic Dataset has one or more explicit authorized purposes.
2. Source lineage remains traceable even when direct identifiers are removed.
3. Operational users do not automatically receive analytic access, and analytic users do not automatically receive operational access.
4. Reporting and participation gaps remain part of the result.
5. Identifiable longitudinal research requires the separate authority required by the Constitution.
6. Identifiable or confidential personal information must not train a general-purpose or third-party model.
7. Sale of personal information, behavioral advertising based on Needs, and punitive profiling are prohibited.
8. Analytic value does not justify collecting information without an operational or separately approved purpose.

## 19. Consistency boundaries

A consistency boundary identifies a group of records whose invariants must be evaluated together when a consequential transition occurs. It is a business transaction boundary, not necessarily a separate service or database.

| Boundary root | Included responsibility | Must remain outside |
|---|---|---|
| Assistance Episode | Expressions, Need versions, purpose-bound Assistance Groups, constraints, preferences, Candidate choices, and episode disposition | Provider acceptance, service delivery, or Collaboration authority |
| Mesh Person | Continuity identity, Registration, Actor–Person Associations, identity assessments, namespaced links, merges, and de-links | Universal service-domain dossier or blanket authorization |
| Mesh Provider | Provider identity, entity relationships, encounters, identity correction, participation scopes, and stable identity anchors | Current Claims treated as timeless Provider facts |
| Opportunity | Opportunity identity, offering Organization, kind, terms, requirements, access pathway, availability Claims, and evidence snapshots | Employer personnel record, Provider intake record, or current availability inferred from history |
| Concept Scheme | Concepts, labels, definitions, relationships, mappings, lifecycle, versions, stewardship, and change history | Source Observations rewritten to conform to current terminology |
| Evidence Claim | Claim provenance, relationships, correction, dispute, and supersession | Workflow status or authorization |
| Discovery Request | Request version, attempts, candidate evaluations, and presented Candidate Sets | Referral transmission or Provider response |
| Authority Record | Source or issuer, basis, scope, duration, status, revocation, and decision references | Authentication credentials or inferred consent |
| Service Connection | Intent, participants, channels, attempts, events, responsibilities, disposition, and Outcome Claims | Provider-controlled intake or service record |
| Referral | Envelope, Script versions, authorized references, transport, response evidence, disposition, and follow-up assignments | Provider case record or automatic Collaboration membership |
| Document Record | Asset versions, subjects, integrity, references, access grants, custody, and disposition | Authority unrelated to the document’s purpose |
| Collaboration | Charter versions, Members, representatives, Sponsored Participants, consultations, Person Participation, communications, reviews, tasks, and measures | Authority in another Collaboration or control of Member systems |
| Resource Transaction | Requested resource operation, authority, correlation, external result, expiration, release, and reconciliation | External-system resource inventory or Provider admission record |
| Outcome Claim | Reporter, subject, Claim type, time, supporting evidence, uncertainty, dispute, and supersession | Automatic alteration of Need, Referral, Provider, or Collaboration status |
| Human Review Case | Issue, authority, evidence, interim action, disposition, remedy, and appeal | Redefinition of constitutional or Provider authority |
| Analytic Dataset | Purpose, authorization, cohort, fields, transformations, lineage, access, and disposition | Unapproved operational reuse or re-identification |

Cross-boundary transactions use explicit references and Domain Events. Failure in one boundary must not leave another record falsely implying completion.

## 20. Ownership and system-of-record responsibility

Ownership here means accountability for the authoritative record or decision. It does not imply unrestricted property rights in personal information.

| Record or decision | Primary authority | Mesh responsibility |
|---|---|---|
| Person goals, preferences, and voluntary choices | Person, subject to legitimate legal limits | Preserve and apply within authorized assistance |
| Mesh Person ID | Provider Mesh | Issue, protect, correct, merge, and de-link |
| Mesh Registration and Actor–Person Association | Person for voluntary participation; Provider Mesh for internal continuity record | Record scope, assurance, correction, recovery, and revocation without treating registration as blanket ROI |
| External client identifier | Issuing Provider or system | Store only as a namespaced, assurance-rated link |
| Provider legal identity | Applicable authoritative institution or Provider evidence | Record observations and resolution |
| Mesh Provider ID | Provider Mesh | Resolve and maintain the internal identity anchor |
| Organization Capacity | Organization and applicable authoritative evidence | Record the contextual capacity, scope, Source, time, and uncertainty |
| Employment Opportunity and hiring terms | Employer or authorized publisher | Record observed terms, freshness, access pathway, and evidence relied upon without assuming continued availability |
| Learning Opportunity and Credential | Training provider, sponsor, issuer, regulator, or authorized publisher as applicable | Preserve identity, mappings, published requirements, authority, and current-use evidence |
| Incentive Program and determination | Program administrator or designated determining authority | Represent program rules and case-specific determinations only from attributable, time-bounded evidence |
| Employment Relationship and Placement Outcome | Employer, person, workforce program, or other direct Source according to Claim type | Preserve attribution and disagreement without becoming the employer's personnel system |
| Provider eligibility and professional decision | Provider | Represent only from attributable Provider evidence |
| Discovery activity and Candidate presentation | Provider Mesh | Preserve request, evidence, evaluation, and uncertainty |
| Helping Relationship responsibility | Person or other legitimate authority and the accepting helper | Record scope, authority, acceptance, and ending without granting implicit cross-helper access |
| Authority contributed by a participant | Issuer under applicable law or agreement | Validate scope and enforce within the Mesh |
| Mesh Authorization Decision | Provider Mesh | Apply approved rules and retain accountability |
| Service Connection and Mesh-observed attempts | Provider Mesh | Maintain the accountable connection history while preserving Provider system authority |
| Referral Envelope and Mesh transport history | Provider Mesh | Maintain authoritative transaction account |
| Provider acceptance | Provider | Record only when attributable to the Provider |
| Provider-created service record | Provider | Do not replicate as a false Mesh system of record |
| Document supplied by a contributor | Contributor and applicable custodians | Enforce Mesh custody and access obligations |
| Collaboration Charter and membership | Participating Organizations | Maintain the approved Collaboration record |
| Sponsored Consultant participation | Collaboration under its Charter; sponsor for the Sponsor Assertion; participant for their own representations | Enforce session scope, confidentiality, access, attendance, provenance, and correction |
| Collaboration backbone process | Charter-designated backbone agency | Support but do not silently assume |
| External Resource Transaction result | External System or Provider controlling the resource | Record request, response, uncertainty, expiration, release, and reconciliation |
| Mesh-generated summary or recommendation | Springboard as platform steward | Preserve provenance, review, correction, and remedy |
| Reported Outcome Claim | Reporter or direct Source | Preserve attribution, uncertainty, and disputes |
| Audit Event | Provider Mesh | Maintain tamper-evident accountability |
| Analytic Dataset and Result | Authority named in the approved use | Enforce purpose, lineage, access, and disposition |

## 21. Canonical domain events

The following event names establish shared meaning. A later implementation specification may refine payloads and technical delivery but must not change their semantics silently.

Event names ending in **Requested**, **Attempted**, **Reported**, **Observed**, **Confirmed**, or **Recorded** retain those evidence meanings. An event without an external-authority qualifier records the Mesh transition named; it must not imply that the Mesh caused or authoritatively verified an external event. Every event payload must identify its source, relevant time, uncertainty, and external authoritative reference when applicable.

### 21.1 Assistance and discovery

- AssistanceEpisodeOpened
- ExpressionRecorded
- NeedProposed
- NeedActivated
- NeedDeferred
- RelatedConcernPresented
- AssistanceGroupFormed
- AssistanceGroupMembershipChanged
- DiscoveryRequested
- DiscoveryAttempted
- CandidateSetPresented
- CandidateSelected
- AssistanceEpisodePaused
- AssistanceEpisodeClosed

### 21.2 Person continuity

- RegistrationStarted
- RegistrationAuthorized
- RegistrationRevoked
- ActorPersonAssociationAsserted
- ActorPersonAssociationValidated
- ActorPersonAssociationSuspended
- MeshPersonCreated
- IdentityCandidateFound
- IdentityAssessmentRecorded
- ExternalIdentityLinked
- IdentityLinkSuspended
- IdentityLinkDisputed
- IdentityLinkCorrected
- ExternalIdentityDelinked
- MeshPersonsMerged
- MeshPersonMergeReversed
- ContactMethodChanged
- HelpingRelationshipProposed
- HelpingRelationshipAccepted
- HelpingRelationshipEnded

### 21.3 Provider and evidence

- ProviderObserved
- ProviderReobserved
- ProviderIdentityResolved
- ProviderIdentityDisputed
- ProviderIdentitiesConsolidated
- ProviderIdentitySeparated
- ProviderEncounterRecorded
- ProviderParticipationProposed
- ProviderParticipationActivated
- ProviderParticipationSuspended
- ProviderParticipationWithdrawn
- OrganizationCapacityRecorded
- OrganizationCapacityEnded
- OpportunityObserved
- OpportunityReobserved
- OpportunityUnavailableReported
- AvailabilityClaimRecorded
- ServiceResourceHoldReported
- ServiceResourceReservationReported
- ServiceResourceReleaseReported
- EligibilityDecisionReported
- SourceObserved
- ClaimRecorded
- ClaimConflicted
- ClaimDisputed
- ClaimCorrected
- ClaimSuperseded
- SourceNativeTermObserved
- TaxonomyMappingProposed
- TaxonomyMappingApproved
- ConceptCandidateProposed
- ConceptAdopted
- ConceptDeprecated
- ConceptSuperseded

### 21.4 Authority and access

- RelationshipRecorded
- AuthorityAsserted
- AuthorityValidated
- AuthorityGranted
- AuthorityDenied
- AuthorityRevoked
- AuthorityExpired
- AccessRequested
- AccessAllowed
- AccessDenied
- HumanReviewRequired
- DisclosureCompleted

### 21.5 Service connection, Referral, documents, and resources

- ServiceConnectionCreated
- ConnectionAttemptRecorded
- ConnectionContactReported
- ConnectionResponsibilityAccepted
- ConnectionResponsibilityReleased
- ProviderEngagementReported
- ServiceConnectionProcedurallyClosed
- ReferralCreated
- ReferralScriptVersioned
- ReferralAuthorized
- ReferralAuthorizationDenied
- ReferralTransmissionAttempted
- ReferralDelivered
- ReferralDeliveryFailed
- ReferralAcknowledged
- ReferralAccepted
- ReferralDeclined
- ReferralWithdrawn
- ReferralProcedurallyClosed
- FollowupAccepted
- DocumentContributed
- DocumentSubjectAssociated
- DocumentSubjectDisputed
- DocumentReferenced
- DocumentAccessed
- DocumentDisclosed
- DocumentAccessRevoked
- ResourceTransactionPrepared
- ResourceTransactionAuthorized
- ResourceTransactionRequested
- ResourceTransactionConfirmed
- ResourceTransactionDeclined
- ResourceTransactionResultUnknown
- ResourceTransactionExpired
- ResourceTransactionReleased
- ResourceTransactionReconciled

### 21.6 Collaboration and outcomes

- CollaborationCreated
- CharterVersionApproved
- OrganizationJoinedCollaboration
- OrganizationLeftCollaboration
- PersonParticipationAuthorized
- PersonParticipationEnded
- SponsoredParticipantInvited
- SponsorAssertionRecorded
- CaseReviewConfidentialityAccepted
- CaseReviewParticipantAdmitted
- CaseReviewParticipantDeparted
- ConsultationRecorded
- CaseReviewHeld
- CollaborationNoteRecorded
- ActionItemAccepted
- ActionStatusReported
- ReferralContributedToCollaboration
- OutcomeClaimRecorded
- OutcomeClaimDisputed
- MeasureObserved
- CollaborationSuspended
- CollaborationClosed

### 21.7 Review and learning

- CorrectionRequested
- ComplaintOpened
- ReviewAssigned
- ReviewDispositionRecorded
- RemedyCompleted
- SecondaryUseAuthorized
- AnalyticDatasetCreated
- AnalyticResultReleased
- AnalyticDatasetDisposed

## 22. Cross-domain invariants

The following rules apply across all domain areas:

1. A real-world subject is not created, validated, or made authoritative solely by creating a Mesh record.
2. Every durable identifier is opaque internally or explicitly namespaced externally.
3. Identity, authentication, Relationship, authority, knowledge, and outcome remain separate.
4. Basic discovery does not require a Mesh Person or conventional identity evidence.
5. A person may voluntarily register at any point, but registration does not create a Need, Referral, Helping Relationship, external identity link, or blanket Release of Information.
6. Permanent person continuity is created only for voluntary registration or justified service, coordination, or accountability purposes.
7. A Source is authoritative only for the Claims and uses it can legitimately support.
8. Unknown, stale, conflicting, inferred, and unobserved information remains visibly uncertain.
9. Absence of evidence is not converted into evidence of absence.
10. AI may propose or derive; it may not grant authority, merge identity, commit a Provider, confirm an outcome, or become the accountable institution.
11. Consequential AI-derived material remains source-linked, labeled, reviewable, and correctable.
12. Contextual personas explain use; they do not confer access or authority.
13. A Provider is independent of its records, endpoints, memberships, Programs, Services, and Locations.
14. Provider Encounter, Provider Participation, and Provider identity resolution remain separate.
15. Provider participation does not create preferential discovery treatment.
16. A Recommendation remains explainable in terms of Need and evidence.
17. A Service Connection records an accepted attempt to reach help; it does not prove Provider engagement or service receipt.
18. A Referral is an authorized bounded handoff and one formal type of Service Connection, not a service guarantee.
19. Connection attempt, Referral transport, Provider response, Procedural Disposition, and Outcome Claims remain separate.
20. A Referral does not automatically become a Collaboration.
21. A Collaboration exists only under an approved Charter and applicable person authority.
22. Each Collaboration is a separate information and authority compartment.
23. A Consultant is a contextual Case Review Participant, not automatically a Provider, helper, referrer, Member, or referral target.
24. A Confidentiality Agreement governs protection of information; it does not itself authorize disclosure.
25. Relationships describe involvement but do not alone authorize access or consequential action.
26. Provider systems remain authoritative for Provider decisions and Provider-created service records.
27. An External System controlling a Service Resource remains authoritative for holds, reservations, releases, and related resource operations.
28. Availability, reservation, admission, and service receipt remain separate.
29. Springboard platform stewardship, Springboard service delivery, and Collaboration backbone roles remain separately represented and authorized.
30. Information access follows validated identity and capacity, authority, purpose, information, action, recipient, confidentiality, context, and time—not technical availability.
31. Revocation limits future reliance as required but does not falsify legitimate prior custody or audit history.
32. Corrections preserve consequential history while repairing current projections.
33. Documents may have multiple subjects; access must account for all materially affected subjects.
34. Narrative and structured representations remain distinguishable and source-linked.
35. Activity, coordination, service receipt, individual outcome, and population change are different Claims.
36. Operational use does not automatically authorize analytics, research, model development, or enforcement.
37. De-identification does not by itself create authority for secondary use.
38. Human escalation routes to the institution holding the relevant authority.
39. Springboard support availability must not be represented beyond an approved and resourced commitment.
40. Lower-level implementation may refine representation but must not weaken these distinctions.
41. Organization Capacities are contextual, independently evidenced, and may overlap; they must not be treated as permanent mutually exclusive Organization types.
42. Service, Opportunity, Learning Opportunity, Employment Opportunity, Employment Relationship, Credential, Occupation, incentive, and Outcome Claim remain distinguishable.
43. Clinical rehabilitation, vocational rehabilitation, recovery-supportive employment, training, and employment must not be collapsed because a single program or Organization connects them.
44. Source-native terminology remains preserved after classification, mapping, or normalization.
45. AI may propose terminology and mappings but cannot silently establish canonical meaning.
46. Taxonomy changes preserve the vocabulary and mapping versions used in consequential historical actions.
47. External schemas and reporting standards are purpose-bound projections and do not create universal collection requirements.

## 23. Projections and interoperability

### 23.1 Projection principle

External and user-facing representations are projections from authoritative domain records and Evidence Claims. A projection must identify its intended purpose, source version or effective time, and material uncertainty.

### 23.2 Provider projection

The Provider projection may conform to an approved HSDS profile. The profile must identify required, recommended, optional, extended, and unsupported elements and must preserve Mesh provenance separately from HSDS publisher metadata.

### 23.3 Person projections

The Mesh Person may support:

- an HMIS Universal Data Element projection for authorized homeless-services use;
- health-system identity and exchange projections, including authorized clinical-document exchange;
- workforce, vocational-rehabilitation, education, benefits, justice, or other domain projections; and
- a minimal cross-domain continuity projection.

No projection becomes the complete Mesh Person record or universal collection requirement.

Clinical standards such as C-CDA or FHIR may represent authorized healthcare documents, clinical observations, encounters, plans, or exchange identifiers. They do not define the canonical Mesh Person and must not make clinical data a requirement for housing, education, workforce, or other non-clinical assistance. WIOA PIRL, RSA-911, HMIS, student, benefits, and similar participant schemas are likewise purpose-bound projections rather than universal personal records.

Reference: [HL7 C-CDA 5.0.0](https://hl7.org/cda/us/ccda/5.0.0/toc.html); [HL7 FHIR](https://hl7.org/fhir/).

### 23.4 Workforce and learning projections

Workforce and learning exchange may use:

- HSDS for Organizations, Services, Locations, contacts, and access pathways;
- CTDL for Credentials, Learning Opportunities, Competencies, pathways, and aggregate outcomes;
- O*NET-SOC or another approved scheme for Occupations, tasks, skills, and work context;
- CIP for instructional-program classification;
- HR Open Standards for bounded exchanges involving positions, candidates, applications, onboarding, or career records;
- WIOA PIRL for authorized workforce-program reporting; and
- RSA-911 for authorized vocational-rehabilitation reporting.

No one of these standards is the complete workforce domain, the complete Organization record, or the complete Mesh Person. Exchange support must preserve the separate meanings of training, clinical rehabilitation, vocational rehabilitation, employment opportunity, employment relationship, credential, incentive, and outcome.

### 23.5 Service Connection, Referral, and Collaboration projections

Service Connection, Referral, authority, document, Resource Transaction, and Collaboration concepts require Mesh-specific contracts unless an approved external standard fully preserves their meaning and controls. Mapping to a portal, API, message, PDF, or MCP resource must not erase status dimensions, authority, custody, or uncertainty.

### 23.6 Projection invariants

1. Derived search indexes, embeddings, summaries, and caches are not authoritative records.
2. A projection may omit information for purpose limitation but must not silently change the meaning of what it includes.
3. Round-trip exchange must preserve external identifiers, Source, and material version information.
4. Rebuilding a projection must not create a new Claim source.
5. Projection failure must not corrupt the authoritative domain record.
6. Adoption of an external standard does not expand authority to collect, retain, disclose, or reuse its available fields.
7. A reporting schema is not automatically an operational intake requirement or canonical personal record.
8. Cross-domain projection must not convert a contextual label such as patient, client, student, participant, trainee, or employee into the person's universal identity.

## 24. Conceptual relationship summary

The central relationship chain is:

1. An Actor contributes an Expression or structured request in an Assistance Episode.
2. The Episode preserves the original Expression and one or more interpreted Needs.
3. A Discovery Request uses only material constraints and preferences.
4. Discovery observes Sources, preserves source-native terminology, records Claims, applies versioned terminology mappings, resolves Provider and Organization identities, and evaluates Services or Opportunities as Candidates.
5. The person or authorized Requester makes a Selection.
6. If only information is wanted, the interaction may end without person identity, Service Connection, or Referral.
7. A person may register voluntarily at any point, but registration creates only the bounded internal Mesh relationship.
8. When a person or authorized helper accepts an action intended to reach help, the Mesh may create a Service Connection and establish only the identity and authority required by that action.
9. A direct telephone call, website visit, appointment request, or in-person contact may advance the Service Connection without a Referral.
10. When an authorized formal handoff is requested, a Referral Envelope binds the selected Provider, Receiving Point of Contact, Script, Document References, transport, and disposition.
11. The Provider remains responsible for intake, acceptance, professional decisions, and service records.
12. Reported responses and outcomes return as attributable Claims, not assumed facts.
13. A person may have multiple separately bounded helpers; one helper's relationship does not expose another's activity.
14. Multi-provider work occurs only inside a separately chartered Collaboration with Person Participation and information authority.
15. An authorized participant may sponsor a Consultant for bounded Case Review participation; the consultation does not become a Referral or Service.
16. Authorized operational history may support learning only through the separate analytics boundary.
17. Domain standards may project applicable records for exchange or reporting, but no projection becomes the complete Person, Organization, Provider, Service, Opportunity, or Mesh domain.

## 25. Decisions requiring subordinate resolution

The following are domain-level decisions still requiring an approved specification or ADR. They are not constitutional gaps and do not authorize implementation.

| Decision | Required document |
|---|---|
| Exact identity-assurance levels and permitted actions | Identity and Access Specification |
| Candidate matching, manual review, merge, and de-link procedures | Identity and Access Specification |
| Registration fields, notice, recovery methods, account-to-person validation, and withdrawal workflow | Identity and Access Specification |
| Full person attribute dictionary and domain projection mappings | Domain-specific profile specifications |
| Assistance Group membership, authority, and household-service rules | Identity and Access / Referral specifications |
| HSDS version and Provider Mesh profile | Provider/HSDS Profile |
| Provider hierarchy and complex health-system resolution rules | Provider/HSDS Profile |
| Need, Service, Provider Capacity, Opportunity, Eligibility, and Outcome vocabularies; SDOH mappings; concept stewardship; lifecycle; and crosswalk governance | Terminology and Discovery Specification |
| Approved Concept Schemes, versions, licenses, external identifiers, local extensions, and mapping review thresholds | Terminology and Discovery Specification |
| Workforce Organization Capacities and the profiles for CTDL, O*NET-SOC, CIP, HR Open, WIOA PIRL, and RSA-911 | Workforce and Learning Profile |
| Employment Opportunity, Learning Opportunity, Credential, Competency, Employment Relationship, Placement Outcome, and incentive field requirements | Workforce and Learning Profile |
| Opportunity persistence, refresh, expiration, evidence snapshot, and system-of-record rules | Workforce and Learning Profile / Discovery and Evidence Specification |
| C-CDA, FHIR, and other health exchange boundaries and mappings | Health Interoperability Profile |
| Claim types, freshness rules, source-authority rules, and confidence criteria | Discovery and Evidence Specification |
| Candidate evaluation and explanation rules | Discovery and Evidence Specification |
| Helping Relationship invitations, acceptance, scope, conflict, ending, and visibility rules | Identity and Access Specification |
| Authority Record types, consent and ROI forms, confidentiality bases, conflict rules, and access policy | Security and Audit / Identity and Access Specification |
| Service Connection evidence, status rules, follow-up expectations, and direct-channel capture | Service Connection and Referral Specification |
| Referral state evidence, Script minimums, and transport-specific contracts | Referral and Document Specification |
| Document classifications, Document Subject rules, custody, retention, and disposition | Security and Audit / Referral and Document Specification |
| Resource Transaction operations, external contracts, idempotency, expiration, and reconciliation | Integration and Resource Transaction Specification |
| Charter template, Member authority, Person Participation, and Referral transition procedure | Collaboration Charter Standard |
| Sponsored Consultant invitation, identity confirmation, confidentiality coverage, session access, and exit rules | Collaboration Charter Standard / Identity and Access Specification |
| Narrative, AI-summary, disagreement, and task-status rules | Collaboration and AI policies |
| Outcome Claim types and evidence thresholds | Referral, Collaboration, and Analytics specifications |
| Human Review ownership and service levels | Operating model and runbooks |
| Domain Event payloads, ordering, and delivery semantics | Bounded implementation specification |
| Analytic purposes, de-identification, cohort safeguards, and release review | Board-approved Research and Secondary Use Policy |

## 26. Acceptance criteria

Before this Domain Model may be approved, review must establish that it:

1. implements the approved Constitution without narrowing human agency or widening institutional authority;
2. remains consistent with the approved System Architecture;
3. distinguishes reality, records, Claims, projections, and derived representations;
4. supports anonymous discovery and proportionate person continuity;
5. supports voluntary registration without converting signup into blanket ROI;
6. separates Account, Human Actor, Actor–Person Association, and Mesh Person;
7. makes identity links contestable, assurance-rated, and reversible;
8. supports multiple external identifiers without a universal external canonical identity;
9. treats Open Referral personas as contextual use descriptions rather than permanent permission roles;
10. supports HSDS-compatible Provider exchange without reducing the Mesh to a directory;
11. separates Provider identity, Encounter, Participation, Service, Program, Location, access pathway, and representation;
12. preserves original Expressions alongside interpreted Needs and keeps Need lifecycle separate from Outcome Claims;
13. supports multiple independently bounded Helping Relationships;
14. makes authority purpose-, information-, action-, recipient-, context-, and time-bounded;
15. separates authority, confidentiality, role-based capability, and the instance-specific Authorization Decision;
16. defines Service Connection independently from Discovery, Referral, Provider engagement, and service outcome;
17. separates Referral preparation, authorization, transport, Provider response, procedural disposition, and outcome;
18. treats documents as secure governed assets with explicit subjects and purpose-bound references;
19. represents Resource Transactions without treating availability, reservation, admission, or service receipt as equivalent;
20. separates one-to-one Referral coordination from formal multi-provider Collaboration;
21. supports low-friction sponsored Consultant participation without converting consultation into Provider service or Referral;
22. preserves Provider, external-system, and Collaboration systems-of-record boundaries;
23. distinguishes narrative, structured extraction, Action Status, and Outcome Claim;
24. preserves uncertainty and source accountability;
25. keeps operational records separate from authorized analytics and learning;
26. defines correction, dispute, Human Review, and audit responsibilities;
27. states cross-domain invariants precise enough to constrain later implementation; and
28. leaves unresolved technical, security, policy, and workflow details to the correct subordinate documents;
29. treats Provider, employer, training provider, vocational-rehabilitation provider, apprenticeship sponsor, and work-based-learning host as contextual and potentially overlapping capacities;
30. distinguishes Service, Learning Opportunity, Employment Opportunity, Employment Relationship, Credential, Competency, Occupation, incentive, and Placement Outcome;
31. preserves source-native terminology while supporting governed concepts, mappings, local extensions, lifecycle, and historical version traceability;
32. permits AI to propose but not silently adopt canonical terminology;
33. separates stable identity and relied-upon evidence from volatile opportunity, requirement, capacity, and incentive Claims that require refresh; and
34. treats HSDS, HMIS, C-CDA, FHIR, CTDL, O*NET-SOC, CIP, HR Open, WIOA PIRL, RSA-911, and similar standards as bounded projections or Concept Schemes rather than complete internal domains.

## 27. Traceability to controlling documents

| Controlling requirement | Primary Domain Model sections |
|---|---|
| Human need and agency | 6–7, 9–12, 22 |
| Discovery-first operation | 7–9, 24 |
| Evidence accountability and uncertainty | 4, 9, 15, 22 |
| Mission-bounded natural language | 7 |
| Capability subordinate to purpose and permission | 10, 16, 22 |
| Proportionate and contestable identity | 6 |
| Bounded trusted relationships | 5, 10 |
| Confidentiality follows information | 10, 12–14, 20 |
| Service Connection and Referral as distinct bounded activity | 11–13 |
| Provider identity independent of representation and membership | 8–9 |
| Contextual employer, training, vocational-rehabilitation, apprenticeship, and work-based-learning capacities | 5, 8, 20, 22–23 |
| Governed, discovery-led terminology growth | 9, 21–23 |
| External standards as bounded projections | 2, 8–9, 23 |
| Charter-governed Collaboration and sponsored consultation | 14 |
| Separation of backbone, Provider, and platform roles | 5, 14, 17, 20 |
| Selective persistence | 4, 6–7, 11, 13, 18 |
| Authorized learning | 15, 18 |
| Organic, honest growth | 8–9, 16 |
| Human accountability and remedy | 17, 20–22 |
| Authority-based escalation | 17 |
| Modular architecture and explicit domain boundaries | 3, 19 |
| Integration Manifold, resources, and MCP boundary | 16 |
| Durable record families and projection model | 4, 19, 23 |

## 28. Authoritative terminology index

This index points to the authoritative definition or governing section. It does not create duplicate definitions.

| Term | Section |
|---|---:|
| Account | 5.1 |
| Actor | 5.1 |
| Actor–Person Association | 6.2, 6.5 |
| Assistance Episode and Assistance Group | 7.1, 7.4–7.5 |
| Authority Record and Authorization Decision | 10.1–10.8 |
| Candidate, Candidate Evaluation, and Recommendation | 9.1, 9.6 |
| Claim, Source Observation, and Current Projection | 9.1–9.4 |
| Concept Scheme, Concept, Concept Candidate, and Concept Lifecycle State | 9.1, 9.8–9.9 |
| Classification Assertion, Source-native Term Observation, and Taxonomy Mapping | 9.1, 9.8–9.9 |
| Collaboration and Collaboration Charter | 14.1–14.4 |
| Confidentiality Obligation and Confidentiality Agreement | 10.1, 10.5 |
| Consultation and Expert Consultant | 14.2, 14.6 |
| Contextual Use Role | 5.1, 5.3 |
| Document Asset, Record, Version, Reference, and Subject | 13.1–13.5 |
| External System, Capability, and Resource Transaction | 16.1–16.5 |
| Helping Relationship | 10.1, 10.4 |
| Human Review Case | 17.1–17.5 |
| Mesh Person, Mesh Person ID, and Mesh Registration | 6.1–6.9 |
| Need, Need Interpretation, and Related Concern | 7.1–7.7 |
| Organization, Organization Unit, Organization Affiliation, and Organization Capacity | 5.1–5.2 |
| Employer, Training Provider, Vocational-Rehabilitation Provider, Apprenticeship Sponsor, and Work-Based-Learning Host Capacities | 8.1, 8.8–8.10 |
| Opportunity, Learning Opportunity, and Employment Opportunity | 8.1–8.2, 8.8–8.10 |
| Credential, Competency, and Occupation | 8.1, 8.8–8.10 |
| Employment Relationship and Placement Outcome | 8.1, 8.8–8.10 |
| Incentive Program, Incentive Eligibility Claim, and Incentive Determination | 8.1, 8.8–8.10 |
| Outcome Claim | 15.1, 15.4–15.5 |
| Person Participation and Case Review Participant | 14.2, 14.5–14.6 |
| Provider, Mesh Provider, Provider Encounter, and Provider Participation | 8.1–8.10 |
| Referral, Referral Envelope, and Referral Script | 12.1–12.8 |
| Relationship | 10.1, 10.4 |
| Service, Program, Location, and Service at Location | 8.1–8.2 |
| Service Connection | 11.1–11.6 |
| Service Resource, Availability Claim, Hold, and Reservation | 8.1, 16.4 |
| Sponsor Assertion and Sponsored Participant | 14.2, 14.6 |

## 29. Approval record

**Approval status:** Approved — Controlling Domain Model  
**Approved version:** 0.3  
**Approved by:** Judson Malone, Executive Director  
**Approval date:** September 9, 2026  
**Approved source SHA-256:** `f817fbbe5cc07bd1567f8732de31360017dc9b525cee43614b8a353bdee15b05`  
**Canonical repository path:** `docs/DOMAIN_MODEL.md`  
**Canonical repository reference:** Pending canonical placement and synchronization  

This approved Domain Model remains non-operational until byte-identical canonical placement, commit, and synchronization. It does not authorize implementation without an approved bounded implementation specification and applicable subordinate controls.
