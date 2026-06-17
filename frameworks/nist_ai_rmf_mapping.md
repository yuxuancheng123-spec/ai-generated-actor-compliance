# NIST AI RMF Mapping

## 1. Purpose

This mapping uses the NIST AI Risk Management Framework to organize the platform's synthetic media risks and controls under four functions: Govern, Map, Measure, and Manage.

This document is a compliance design artifact for portfolio purposes. It does not provide legal advice.

## 2. Relevant Platform Context

The platform uses AI systems to generate or modify performances using facial images, voice samples, video clips, motion data, prompts, scripts, and consent records. Risks include unauthorized likeness use, voice cloning, misleading synthetic content, training-data misuse, label removal, weak complaint handling, child/public figure misuse, vendor accountability gaps, and inadequate audit trails.

## 3. Govern

Govern establishes accountability, policy, roles, and oversight.

| Risk Governance Need | Platform Control | Evidence Artifact |
|---|---|---|
| Clear ownership for AI actor compliance | Assign AI compliance owner, trust and safety owner, legal owner, and engineering owner | RACI matrix, policy owner list |
| Consent and licensing governance | Require specific authorization before generation or commercialization | `04_consent_checklist.md`, consent ID |
| Labeling governance | Require visible and machine-readable labels for synthetic media | `05_labeling_policy.md`, label audit log |
| Incident governance | Define escalation paths, SLAs, and post-incident review | `06_incident_response.md`, incident case record |
| Vendor governance | Require AI vendor due diligence, contractual controls, and audit rights | Vendor risk review, data processing terms |
| Performer and rights-holder governance | Provide complaint and takedown path for unauthorized digital replicas | Rights-holder portal record |

## 4. Map

Map identifies context, system boundaries, affected stakeholders, and risk sources.

| Mapping Need | Platform Control | Evidence Artifact |
|---|---|---|
| Define system context | Document inputs, model processing, outputs, publication, and export flows | `02_system_description.md`, data flow diagram |
| Identify affected stakeholders | Track actors, performers, viewers, brands, creators, children, public figures, vendors, and regulators | Stakeholder register |
| Identify data types | Classify face, voice, video, motion, prompt, script, consent, metadata, and generated content | Data inventory |
| Identify high-risk contexts | Flag public figure, child, commercial, sexual, political, medical, financial, and defamatory uses | Risk-based review matrix |
| Map lifecycle risk | Review upload, generation, moderation, labeling, publication, download, reposting, and complaint stages | Lifecycle control map |

## 5. Measure

Measure evaluates whether risks and controls are working as intended.

| Measurement Need | Platform Control | Evidence Artifact |
|---|---|---|
| Consent accuracy | Sample approved outputs and verify consent scope | Consent audit report |
| Labeling accuracy | Test visible labels, metadata, watermarks, and export retention | Label QA report |
| Unauthorized upload detection | Measure detection rate for known celebrity/public figure images and voice samples | Moderation performance report |
| Incident response effectiveness | Track time to containment, time to decision, and repeat incident rates | Incident metrics dashboard |
| Vendor control effectiveness | Review logs, access records, and contractual compliance | Vendor audit report |
| Risk scoring consistency | Use repeatable risk scoring for content review | Risk scoring demo and reviewer calibration |

## 6. Manage

Manage prioritizes, responds to, and reduces identified AI risks.

| Management Need | Platform Control | Evidence Artifact |
|---|---|---|
| Prevent unauthorized generation | Block generation without verified consent for real-person likeness or voice | Generation gate log |
| Reduce misleading content | Require labels, watermarking, and content credentials | Label application log |
| Prevent harmful portrayal | Escalate sensitive, defamatory, sexual, child, and public figure content | Human review record |
| Reduce scope creep | Enforce duration, territory, distribution, and commercial-use restrictions | License scope enforcement log |
| Respond to incidents | Takedown, preserve evidence, notify parties, and improve controls | Incident response file |
| Improve over time | Post-incident review, model-control updates, policy revisions | Corrective action tracker |

## 7. Crosswalk to Project Risks

| Risk ID | NIST Function | Key Control |
|---|---|---|
| R1 Unauthorized likeness use | Govern, Map, Manage | Consent verification and upload restriction |
| R2 Unauthorized voice cloning | Map, Measure, Manage | Voice authorization and audio review |
| R3 Misleading synthetic content | Govern, Measure, Manage | Labeling and disclosure policy |
| R4 Training data misuse | Govern, Map, Manage | Purpose limitation and training-data authorization |
| R5 Harmful or defamatory portrayal | Map, Manage | Prohibited-use policy and human review |
| R6 Label removal or reposting | Measure, Manage | Watermarking, metadata, and repost detection |
| R7 Weak complaint mechanism | Govern, Manage | Notice-and-action workflow |
| R8 Overbroad consent | Govern, Measure | Specific consent checklist |
| R9 Child likeness or voice misuse | Map, Manage | Child-safety escalation |
| R10 Public figure manipulation | Map, Manage | Public figure detection and enhanced review |
| R11 Commercial scope violation | Govern, Manage | License scope registry |
| R12 Vendor accountability gap | Govern, Measure | Vendor due diligence and audit rights |
| R13 Privacy leakage | Map, Manage | Metadata minimization and retention limits |
| R14 Inadequate audit trail | Govern, Measure | Immutable audit logs |
| R15 False authorization document | Measure, Manage | Document verification and signer authentication |

## 8. Reference

- NIST AI Risk Management Framework. https://www.nist.gov/itl/ai-risk-management-framework
