# Risk Register

| Risk ID | Risk | Scenario | Affected Stakeholders | Severity | Likelihood | Governance Control | Framework Link |
|---|---|---|---|---|---|---|---|
| R1 | Unauthorized likeness use | A user uploads a celebrity image and generates a commercial short drama without consent | Actor, platform, viewers | High | High | Identity verification, consent record, upload restriction, takedown workflow | SAG-AFTRA, EU AI Act, China labeling rules |
| R2 | Unauthorized voice cloning | A creator uses a singer's voice sample to generate dialogue or songs | Performer, record label, platform | High | Medium | Voice consent verification, audio fingerprinting, licensing review | SAG-AFTRA |
| R3 | Misleading synthetic content | Viewers believe an AI-generated actor actually appeared in the video | Viewers, actor, platform | High | High | Visible AI label, metadata label, disclosure notice | EU AI Act Article 50 |
| R4 | Training data misuse | Performer data is used for model training beyond the licensed purpose | Actors, platform, vendors | High | Medium | Purpose limitation, data use log, contract clause, audit right | NIST AI RMF, privacy-by-design |
| R5 | Harmful or defamatory portrayal | A real person's face is placed in offensive, sexual, political, or defamatory content | Actor, public, platform | High | Medium | Content moderation, prohibited-use policy, human review | Platform governance |
| R6 | Label removal or reposting | AI labels are removed when content is downloaded and reposted | Viewers, platforms, regulators | Medium | High | Persistent watermarking, metadata, platform-level detection | EU AI Act, China labeling rules |
| R7 | Weak complaint mechanism | Victims cannot easily report unauthorized AI replicas | Actors, ordinary users | High | Medium | Notice-and-action portal, response SLA, evidence preservation | Governance control |
| R8 | Overbroad consent | Actors sign vague contracts allowing unlimited future AI use | Actors, production company | High | Medium | Specific-purpose consent, time limit, revocation clause, compensation | SAG-AFTRA |
| R9 | Child likeness or voice misuse | A user uploads a child's photo or voice sample to create synthetic media without guardian consent | Child, guardian, platform, viewers | High | Medium | Age-sensitive upload checks, guardian consent verification, child-safety review, stricter prohibited-use policy | Platform governance, NIST AI RMF |
| R10 | Public figure manipulation | A public official or public figure is depicted endorsing a product or making a false statement | Public figure, viewers, election or market participants, platform | High | Medium | Public figure detection, endorsement restrictions, political-content review, clear disclosure | EU AI Act, platform governance |
| R11 | Commercial scope violation | A performer licenses a digital replica for one campaign, but the replica is reused in unrelated ads | Performer, brand, agency, platform | High | Medium | Contract scope registry, usage approval workflow, expiration controls | SAG-AFTRA, NIST AI RMF |
| R12 | Vendor or model-provider accountability gap | A third-party model provider processes performer data without clear contractual controls | Actors, platform, vendor | High | Medium | Vendor due diligence, data processing terms, audit rights, incident notification clause | NIST AI RMF |
| R13 | Privacy leakage from uploaded source media | Uploaded videos contain bystanders, location clues, or metadata that are exposed or reused | Uploaded subjects, bystanders, platform | Medium | Medium | Metadata minimization, secure storage, retention limit, access control | Privacy-by-design, NIST AI RMF |
| R14 | Inadequate audit trail | The platform cannot prove whether a generated actor was authorized because consent and generation logs are incomplete | Actors, platform, regulators, business customers | High | Medium | Immutable audit logs, consent-to-output linkage, reviewer decision records | NIST AI RMF |
| R15 | False authorization document | A user uploads a forged release form to generate an AI actor from another person's likeness | Actor, platform, customer | High | Medium | Document verification, signer authentication, manual review for high-risk uses | SAG-AFTRA, platform governance |

## Severity Scale

- Low: Limited impact, easily reversible, no commercial or reputational harm.
- Medium: Noticeable impact on individuals, viewers, or platform trust; requires corrective action.
- High: Significant legal, financial, reputational, privacy, dignity, or safety impact.

## Likelihood Scale

- Low: Unlikely under normal platform use.
- Medium: Plausible under normal user behavior or foreseeable misuse.
- High: Likely unless preventive controls are implemented.

## Initial Priority Risks

The first implementation phase should prioritize R1, R2, R3, R4, R5, R6, R7, and R8 because they directly map to unauthorized face or voice use, misleading synthetic media, consent scope, and takedown readiness.

