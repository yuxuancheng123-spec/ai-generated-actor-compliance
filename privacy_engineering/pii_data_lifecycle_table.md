# PII and Data Lifecycle Table

This table translates the synthetic media workflow into privacy engineering inventory terms: data category, purpose, lawful/authorization basis, retention, access control, and deletion trigger.

| Data category | Examples | Lifecycle stage | Purpose | Privacy risk | Control / minimization | Retention trigger | Deletion trigger |
|---|---|---|---|---|---|---|---|
| Account metadata | User ID, role, organization, billing status | Intake, review, publishing | Attribute request ownership and reviewer accountability | Linkability, account takeover | Role-based access, audit logs, MFA | Active account and open cases | Account closure subject to legal hold |
| Source facial media | Face photos, video frames, headshots | Intake, feature extraction, generation | Generate or verify authorized digital replica | Biometric identification, stolen face misuse | Consent check before processing, encryption, upload restriction | Active approved case | Case closure, consent withdrawal, failed authorization |
| Voice samples | Spoken audio, voice reference clips | Intake, voice model processing | Generate or sync voice performance | Voice cloning, impersonation | Separate voice consent, audio fingerprinting, restricted export | Active approved case | Consent withdrawal, license expiry, incident finding |
| Motion / performance data | Motion capture, body movement, gesture data | Generation, editing | Create synthetic performance | Performance appropriation, re-identification | Purpose limitation, performer-specific license scope | Contracted production period | License expiry or performer revocation |
| Consent and license records | Signed releases, addenda, scope, compensation, territory | Authorization, audit, incident response | Prove lawful use and limit secondary uses | Overbroad consent, stale terms | Structured scope fields, versioning, revocation field | Legal limitation period | End of legal retention period |
| Prompt and script text | User prompts, scene descriptions, ad copy | Moderation, generation | Check prohibited use and generate content | Sensitive inference, defamatory prompt content | Prompt moderation, sensitive category flags | Case review period | Case closure or incident retention expiry |
| Generated synthetic media | Video, image, audio, ad clips | Output, labeling, publishing | Publish approved content | Misleading viewers, reputation harm | Visible labels, metadata, watermarking, hash registry | Publication period | Takedown, license expiry, rights-holder request |
| Label and provenance metadata | AI label, C2PA-like credential, hashes, export logs | Publishing, downstream detection | Preserve transparency and traceability | Label stripping, incomplete provenance | Machine-readable labels, export logs, repost detection | Life of distributed content | End of publication plus audit period |
| Review and incident records | Reviewer decision, risk score, complaint, evidence package | Governance, incident response | Accountability, takedown, control improvement | Sensitive allegations, complainant privacy | Need-to-know access, evidence preservation rules | Open incident or audit cycle | Incident closure plus retention schedule |

## Lifecycle Principles

- Separate consent records from source media so deletion of media does not erase audit evidence.
- Treat facial and voice references as high-sensitivity identity data even when the project is fictional or entertainment-focused.
- Do not use performer media for training, fine-tuning, or model improvement unless training use is separately authorized.
- Apply shorter retention for rejected source media than for approved case metadata and consent records.
- Preserve incident evidence only for review, enforcement, legal hold, and control improvement purposes.

