# Threat Model and Misuse Case Table

This misuse case table frames the AI actor platform as a privacy engineering system, not only a content moderation workflow.

| Misuse ID | Threat actor | Misuse case | Target / asset | Impact | Existing control | Additional privacy engineering control |
|---|---|---|---|---|---|---|
| M1 | Malicious creator | Uploads celebrity images to generate a commercial short drama without permission | Celebrity likeness, platform trust | Publicity rights claim, viewer deception, takedown liability | Consent verification, public figure escalation | Face match risk flag, commercial-use block until license evidence is attached |
| M2 | Former contractor | Reuses performer media from a prior project for a new campaign | Performer face, voice, motion data | Purpose creep, unauthorized secondary use | License scope review | Purpose-bound media IDs, license expiry enforcement, reuse alerts |
| M3 | Fan account | Generates parody content with a public figure face but no clear AI label | Viewer understanding, public figure reputation | Confusion, reputational harm, platform policy breach | Visible AI labels | Mandatory parody disclosure, watermark, repost detection |
| M4 | Brand user | Uses an authorized digital replica outside agreed territory or duration | Performer license rights | Contract breach, undercompensation | License fields in checklist | Automated territory/duration validation before export |
| M5 | Internal operator | Accesses source face or voice samples without case need | Source media store | Privacy breach, insider misuse | Role-based access control | Just-in-time access, audit review, anomaly alerts |
| M6 | Model vendor | Uses submitted performer media for model improvement without separate authorization | Training dataset, performer identity | Training data misuse, irreversible replication risk | Vendor contract clause | Training-use field, vendor audit right, data-use ledger |
| M7 | Bad actor | Creates sexual, defamatory, or political synthetic media using a real person's identity | Real person dignity, safety, reputation | Severe harm, harassment, legal exposure | Prohibited-use policy | Pre-generation sensitive context block, evidence preservation, rapid takedown SLA |
| M8 | Downstream repost account | Removes visible labels after export and reposts content elsewhere | Provenance signal, viewer transparency | Label stripping, loss of context | Watermark and metadata | Hash registry, platform detection, abuse report channel |
| M9 | Impersonator | Submits forged consent documents for a face or voice upload | Consent vault, performer identity | False authorization, identity theft | Manual reviewer check | Document verification, performer callback, signer identity verification |
| M10 | Ordinary user victim | Cannot find a clear path to report stolen face or voice content | Complaint process | Prolonged harm and regulatory risk | Incident response playbook | Dedicated likeness/voice complaint portal, response SLA, status updates |

## STRIDE-Style Summary

| Category | Synthetic media example | Priority control |
|---|---|---|
| Spoofing | Forged performer consent or impersonated rights holder | Identity verification and signer validation |
| Tampering | Removal of labels or metadata after export | Persistent watermarking, hash registry, repost detection |
| Repudiation | Creator denies uploading source media or approving export | Immutable audit logs and case decision records |
| Information disclosure | Internal access to facial or voice samples | Need-to-know access and audit monitoring |
| Denial of service | Mass false reports against lawful digital replicas | Triage queue, evidence threshold, appeal workflow |
| Elevation of privilege | Reviewer bypasses escalation for high-risk public figure content | Segregation of duties and policy gate enforcement |

