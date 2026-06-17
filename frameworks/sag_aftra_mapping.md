# SAG-AFTRA AI Mapping

## 1. Purpose

This mapping connects the platform's digital replica, consent, compensation, and performer-protection controls to SAG-AFTRA AI-related principles. The mapping is especially relevant when the platform creates or commercializes an AI-generated actor based on a performer, actor, singer, voice artist, influencer, or other identifiable person.

This document is a compliance design artifact for portfolio purposes. It does not provide legal advice.

## 2. Relevant Platform Context

The platform may allow professional performers to license digital replicas of their face, voice, body, and performance style. It may also allow creators or production companies to upload source media and generate AI-performed short dramas, advertisements, and fan videos.

The key governance concern is whether digital replicas are created and used with clear, specific, documented, and compensated authorization.

## 3. Mapping Table

| SAG-AFTRA AI Theme | Platform Risk | Platform Control | Evidence Artifact |
|---|---|---|---|
| Clear consent for digital replicas | Performer data is used without meaningful authorization | Specific-purpose digital replica agreement | Signed consent/license record |
| Specific use authorization | A digital replica licensed for one project is reused in another | Contract scope registry and usage gate | Project ID, license scope, approval log |
| Compensation | Performer is not paid for AI reuse or commercial exploitation | Payment, royalty, or revenue-share record | Compensation schedule, invoice, royalty report |
| Voice and likeness protection | Face and voice rights are bundled vaguely or hidden in broad terms | Separate fields for face, voice, motion, and performance use | Consent checklist and contract clause |
| Training-data authorization | Performer media is used for model training beyond performance use | Separate opt-in for training/fine-tuning/model improvement | Training authorization log |
| Duration and territory | Digital replica remains available after license expires | Expiration controls and territorial restrictions | License metadata, automated block log |
| Secondary use | Clips, thumbnails, sequels, ads, or derivative works are reused without approval | Secondary-use approval workflow | Derivative-use request and approval |
| Transparency to audience | Viewers believe performer personally appeared | AI/digital replica label | Label record and publication log |
| Performer dispute process | Performer cannot challenge unauthorized replica use | Rights-holder complaint portal and takedown SLA | Incident response case file |

## 4. Required Platform Controls

The platform should implement:

1. Verified performer accounts for individuals licensing their own digital replicas;
2. Separate consent fields for likeness, voice, motion, performance, and full digital replica use;
3. Specific-purpose licensing rather than broad, indefinite AI-use clauses;
4. Separate authorization for model training, fine-tuning, testing, and improvement;
5. Compensation records tied to commercial use and reuse;
6. Contract scope enforcement before generation, publication, download, or monetization;
7. Expiration and renewal controls;
8. Performer-accessible complaint and takedown workflow;
9. AI content labeling when a digital replica appears in generated media.

## 5. Minimum Digital Replica License Fields

| Field | Required Detail |
|---|---|
| Performer identity | Legal name, verified account, representative if applicable |
| Covered attributes | Face, voice, name, body, movement, acting style, or full replica |
| Project scope | Production title, campaign, character, brand, or content category |
| Permitted output | Short drama, advertisement, dubbing, translation, localization, still image, trailer, thumbnail |
| Commercial rights | Monetization, paid advertising, endorsement, product placement, subscription content |
| Distribution | Platform, social media, streaming, broadcast, third-party syndication |
| Territory | Country, region, global online, or platform-specific market |
| Duration | Start date, end date, renewal process |
| Compensation | Fee, royalty, revenue share, residual-like payment, or other agreed term |
| Training use | Whether source media or generated outputs may train or improve models |
| Secondary use | Whether generated outputs can be reused in sequels, ads, edits, or compilations |
| Revocation/withdrawal | Whether and how future use can stop |
| Labeling | Required disclosure that a digital replica or AI-generated performance is used |
| Audit | Right to inspect use records and generated outputs |

## 6. Gap Analysis

| Gap | Performer Protection Impact | Recommended Fix |
|---|---|---|
| One checkbox for all AI use | Consent is too vague to support digital replica governance | Use specific consent categories |
| No training-data distinction | One-time performance consent may become model-building consent | Require separate training authorization |
| No expiration enforcement | Replica can be reused indefinitely | Encode duration into generation and publication gates |
| No compensation log | Platform cannot prove performer was compensated | Link payment records to license and content ID |
| No performer complaint path | Unauthorized use may persist | Provide dedicated rights-holder portal and response SLA |

## 7. Related Project Files

- `docs/04_consent_checklist.md`: specific consent and licensing controls.
- `docs/03_risk_register.md`: R1, R2, R4, R8, R11, R15.
- `docs/06_incident_response.md`: unauthorized likeness and voice complaint workflow.

## 8. Reference

- SAG-AFTRA 2023 TV/Theatrical Contracts resources. https://www.sagaftra.org/contracts-industry-resources/contracts/2023-tvtheatrical-contracts

