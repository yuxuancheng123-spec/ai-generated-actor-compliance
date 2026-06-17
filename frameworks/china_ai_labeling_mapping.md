# China AI Labeling Mapping

## 1. Purpose

This mapping connects the platform's synthetic media controls to China's AI-generated synthetic content labeling requirements. The mapping focuses on visible labels, implicit or machine-readable labels, service provider obligations, user disclosure duties, and label retention after distribution.

This document is a compliance design artifact for portfolio purposes. It does not provide legal advice.

## 2. Relevant Platform Context

The hypothetical platform provides generation and editing tools for AI actors, face swaps, voice cloning, synthetic advertisements, virtual influencer content, and AI short drama production. These services can create text, image, audio, and video content that users may publish, download, or repost across social media and short-video platforms.

## 3. Mapping Table

| China Labeling Theme | Platform Risk | Platform Control | Evidence Artifact |
|---|---|---|---|
| Explicit label for generated synthetic content | Viewers cannot identify AI-generated video or audio | Visible AI label on video player, caption, thumbnail, and download page | UI label record, publication log |
| Implicit or machine-readable label | Labels disappear when files are exported, copied, or reposted | Metadata, watermark, content credentials, hash registry | Export log, metadata snapshot, watermark verification |
| Service provider responsibility | Platform enables generation but leaves labeling to users | Default platform-applied labels before publication and export | Labeling policy, automated labeling workflow |
| User disclosure responsibility | Users falsely claim that generated content is real | Pre-publication AI-content disclosure form | User attestation, enforcement log |
| Label retention | Users remove or obscure AI labels after download | Export warning, watermark retention, block high-risk exports without labels | Export event log, enforcement record |
| Prevention of malicious label removal | Users crop, blur, or strip watermarks and metadata | Detection, account enforcement, repeat-upload matching | Incident case file, hash match log |
| Deep synthesis and realistic manipulation | AI actor or voice clone creates confusion about a real person's participation | Prominent label plus consent verification | Consent ID, moderator review decision |
| Platform governance | Labeling decisions are inconsistent across content types | Risk-based labeling matrix and reviewer workflow | `05_labeling_policy.md`, training record |

## 4. Required Platform Controls

The platform should implement:

1. Explicit visible labels for AI-generated or materially AI-modified video, audio, image, and text outputs where applicable;
2. Implicit machine-readable labels or metadata for generated files;
3. Watermarking or content credentials for downloadable, commercial, or high-risk synthetic media;
4. Export restrictions for high-risk content when labels cannot be preserved;
5. User disclosure forms before publication;
6. Enforcement against label removal, label obscuring, and false origin claims;
7. Complaint and correction mechanisms for mislabeled or unlabeled content;
8. Audit logs covering label application, label changes, publication, download, and reposting events.

## 5. Labeling Implementation by Content Type

| Content Type | Explicit Label | Implicit Label | Additional Control |
|---|---|---|---|
| AI-generated short drama video | Required | Required | Watermark for downloads |
| AI-modified face or body video | Required | Required | Consent check and human review |
| Synthetic voice or voice clone | Required in UI/caption/audio description | Required | Voice authorization check |
| Synthetic advertisement | Prominent disclosure required | Required | Commercial authorization and review |
| Virtual influencer account | Profile-level and content-level disclosure | Required for exported media | Account category label |
| Fan-generated deepfake-style content | Required | Required | Non-commercial restriction or takedown if unauthorized |
| Internal test output | Internal label required | Recommended | Block external sharing unless labeled |

## 6. Gap Analysis

| Gap | Compliance Impact | Recommended Fix |
|---|---|---|
| Label applied only after publication | Unlabeled synthetic content may appear publicly | Require pre-publication labeling gate |
| User can download clean file without label | Downstream platforms and viewers lose context | Preserve visible label and metadata during export |
| No record of label changes | Platform cannot investigate disputes | Log label version, editor, timestamp, and rationale |
| No enforcement for label removal | Users can evade platform controls | Treat label removal as policy violation |
| No distinction between visible and machine-readable label | Platform may satisfy viewer notice but not downstream detection | Implement both layers for high-risk content |

## 7. Related Project Files

- `docs/05_labeling_policy.md`: labeling controls and retention rules.
- `docs/06_incident_response.md`: response to label removal and unauthorized synthetic content.
- `docs/03_risk_register.md`: R3, R6, R7, R10, R14.

## 8. Reference

- 国家互联网信息办公室等：人工智能生成合成内容标识办法，2025. https://www.cac.gov.cn/2025-03/14/c_1743654684782215.htm

