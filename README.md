# AI-Generated Actor and Deepfake Content Compliance Assessment

Chinese title: AI生成演员与深度伪造内容合规评估：面向合成媒体平台的授权、标识与治理控制

English title: Compliance Assessment for AI-Generated Actors and Deepfake Content: Consent, Labeling, and Governance Controls for Synthetic Media Platforms

## Quick Links

| Link | URL |
|---|---|
| Portfolio homepage | <https://yuxuancheng123-spec.github.io/yuxuan-cheng-portfolio/> |
| Portfolio repository | <https://github.com/yuxuancheng123-spec/yuxuan-cheng-portfolio> |
| Compliance repository | <https://github.com/yuxuancheng123-spec/ai-generated-actor-compliance> |
| English compliance web demo | <https://yuxuancheng123-spec.github.io/ai-generated-actor-compliance/web/> |
| Chinese compliance web demo | <https://yuxuancheng123-spec.github.io/ai-generated-actor-compliance/web/demo.zh.html> |
| Final assessment report | [docs/09_final_compliance_assessment_report.md](docs/09_final_compliance_assessment_report.md) |
| Portfolio summary | [docs/10_portfolio_summary.md](docs/10_portfolio_summary.md) |
| Risk scoring demo | [scripts/risk_scoring_demo.py](scripts/risk_scoring_demo.py) |

If the GitHub Pages links do not open, confirm that the repository is public and that GitHub Pages is enabled for the `main` branch.

## Local Preview Links

From the parent folder:

```bash
cd "/Users/miine/Documents/Compliance Assessment"
python3 -m http.server 8010
```

Then open:

| Local page | URL |
|---|---|
| Portfolio homepage | <http://127.0.0.1:8010/yuxuan-cheng-portfolio/> |
| English compliance demo | <http://127.0.0.1:8010/ai-generated-actor-compliance/web/> |
| Chinese compliance demo | <http://127.0.0.1:8010/ai-generated-actor-compliance/web/demo.zh.html> |

## Project Pitch

This project is an English-first product compliance case study for a fictional synthetic media platform that lets creators and production teams generate AI actors from face, voice, video, and motion data. It turns a high-level AI responsibility problem into a practical review workflow: intake the content request, check authorization and labeling obligations, map jurisdiction-specific requirements, and generate a structured compliance assessment report.

The portfolio is designed to read like a real AI governance work product rather than a research note. It includes policy artifacts, risk controls, framework mappings, incident response procedures, provenance analysis, and an interactive browser demo that simulates an intake-to-report review flow for synthetic media content.

## Role and Scenario

Role: AI Compliance Analyst

Platform scenario: A fictional AI short-drama / AI actor generation platform allows creators, production companies, brands, and performers to upload facial images, voice samples, video clips, motion data, scripts, prompts, and licensing records. The platform can generate synthetic performances for short dramas, ads, virtual influencers, fan videos, and authorized performer digital replicas.

Core compliance problem: The platform must prevent unauthorized use of a real person's face or voice while supporting lawful synthetic media workflows through consent, licensing, labeling, provenance, audit logging, and incident response controls.

This is a fictional educational project and is not legal advice.

## What This Project Delivers

| Artifact | Purpose |
|---|---|
| [Interactive Web Demo](web/index.html) | Provides a two-stage workflow: synthetic media intake first, generated compliance report after completion |
| [Project Brief](docs/01_project_brief.md) | Defines the platform assumption, research questions, and applicable frameworks |
| [System Description](docs/02_system_description.md) | Describes inputs, AI processing, outputs, lifecycle stages, and high-risk points |
| [Data Flow Diagram](diagrams/data_flow_diagram.md) | Maps how source media, consent records, generated content, labels, and incident records flow through the platform |
| [Risk Register](docs/03_risk_register.md) | Identifies 15 key risks, including unauthorized likeness use, voice cloning, training misuse, public figure manipulation, and label removal |
| [Consent and Licensing Checklist](docs/04_consent_checklist.md) | Converts face, voice, motion, performer, and commercial-use authorization into a platform review checklist |
| [AI Content Labeling Policy](docs/05_labeling_policy.md) | Defines visible labels, metadata labels, watermarking, export rules, appeal paths, and enforcement |
| [Incident Response Playbook](docs/06_incident_response.md) | Provides intake, triage, containment, evidence preservation, takedown, notification, and post-incident review steps |
| [Provenance and Watermarking Review](docs/07_deepfake_provenance_watermarking_review.md) | Compares visible watermarks, metadata, C2PA/content credentials, model-side watermarks, and hash registries |
| [Framework Mappings](frameworks/) | Maps controls to EU AI Act Article 50, China AI labeling rules, SAG-AFTRA AI principles, and NIST AI RMF |
| [Risk Scoring Demo](scripts/risk_scoring_demo.py) | Shows how compliance rules can become a simple executable content review aid |
| [Final Assessment Report](docs/09_final_compliance_assessment_report.md) | Summarizes the assessment, findings, recommended controls, and governance model |

## How to Review This Repo

### 3-minute review

Read this README, then open:

- [Interactive Web Demo](web/index.html)
- [Final Assessment Report](docs/09_final_compliance_assessment_report.md)
- [Risk Register](docs/03_risk_register.md)

### 10-minute review

Read the 3-minute path, then open:

- [Consent and Licensing Checklist](docs/04_consent_checklist.md)
- [AI Content Labeling Policy](docs/05_labeling_policy.md)
- [Incident Response Playbook](docs/06_incident_response.md)
- [Risk Scoring Demo README](scripts/README.md)

### Deep dive

Review the full system and governance package:

- [System Description](docs/02_system_description.md)
- [Data Flow Diagram](diagrams/data_flow_diagram.md)
- [Provenance and Watermarking Review](docs/07_deepfake_provenance_watermarking_review.md)
- [EU AI Act Mapping](frameworks/eu_ai_act_mapping.md)
- [China AI Labeling Mapping](frameworks/china_ai_labeling_mapping.md)
- [SAG-AFTRA AI Mapping](frameworks/sag_aftra_mapping.md)
- [NIST AI RMF Mapping](frameworks/nist_ai_rmf_mapping.md)

## Key Compliance Questions

This project asks how a synthetic media platform should answer the following product compliance questions:

1. Can a user generate an AI actor from a real person's face or voice?
2. What evidence of consent or licensing should the platform require?
3. When should AI-generated, AI-modified, or deepfake-style content be visibly labeled?
4. How should labels and provenance signals persist after download, export, or reposting?
5. How should the platform distinguish authorized digital replicas from unauthorized deepfakes?
6. What should happen when a person reports stolen face, stolen voice, or unauthorized digital replica use?
7. How should controls be mapped to EU AI Act, China labeling rules, SAG-AFTRA principles, and NIST AI RMF?

## Control Architecture

The proposed compliance control architecture uses five layers across the synthetic media lifecycle:

1. Pre-generation gate: identity verification, source media review, consent/license check, and prohibited-use screening.
2. Authorization controls: specific-purpose consent for face, voice, motion, performance, commercial use, duration, territory, secondary use, and training-data use.
3. Labeling and provenance controls: visible labels, metadata labels, watermarking, content credentials, export logs, and hash registries.
4. Human review and escalation: enhanced review for public figures, children, endorsements, political content, sexual content, defamatory portrayals, medical claims, and financial claims.
5. Incident response and governance: takedown workflow, evidence preservation, affected-person notification, vendor escalation, metrics, and post-incident control improvement.

The interactive demo implements this architecture as a product workflow:

1. Intake workspace: collect request context, source media, use case, release regions, consent evidence, and platform controls.
2. Completeness check: show required missing fields and intake progress before report generation.
3. Generated report: output executive snapshot, scenario classification, key findings, control recommendations, jurisdiction matrix, evidence checklist, and framework mapping.

## Frameworks Used

- EU AI Act Article 50 transparency obligations for AI-generated and manipulated content;
- China AI-generated synthetic content labeling requirements;
- SAG-AFTRA AI-related consent, compensation, and digital replica principles;
- NIST AI Risk Management Framework categories: Govern, Map, Measure, Manage;
- C2PA/content provenance concepts for synthetic media labeling and traceability.

## Run the Demo

The risk scoring demo is intentionally simple and rule-based. It is not an ML model. It shows how compliance requirements can be translated into repeatable content review logic.

### Browser demo

Open [web/index.html](web/index.html) directly in a browser, or run a local server from the project root:

```bash
python3 -m http.server 8000
```

Then visit:

```text
http://localhost:8000/web/
```

The browser demo is a rule-based workflow, not an ML model. It has two stages:

1. Intake workspace: enter requester type, depicted person, source media, use case, monetization, release regions, consent evidence, license scope, labeling controls, and training-data use. The page shows intake completeness, required missing fields, and a short intake profile.
2. Generated report: after the required intake is complete, click `Generate compliance report` to produce a modular consulting-style report.

The generated report includes:

- Decision: reject, escalate, approve with conditions, or approve;
- Executive snapshot with risk score, risk level, and reviewer path;
- Scenario classification based on the intake profile;
- Key findings and risk drivers;
- Consent, labeling, release, and incident control recommendations;
- Jurisdiction matrix for EU, China, US, and global release paths;
- Evidence artifacts, reviewer next steps, and framework mapping.

Preset scenarios are included so reviewers can quickly test high-risk and low-risk cases, including unauthorized celebrity advertising, licensed performer workflows, fan parody, and fully synthetic internal drafts.

### Python demo

From the project root:

```bash
python3 scripts/risk_scoring_demo.py \
  --content-type video \
  --real-person true \
  --authorized false \
  --public-figure true \
  --commercial true \
  --sensitive-context none \
  --ai-labeled false
```

Expected result:

```text
Risk level: prohibited
Reasons:
- uses or imitates a real person
- no verified authorization for real-person likeness or voice
```

## Repository Structure

```text
ai-generated-actor-compliance/
├── README.md
├── docs/
│   ├── 01_project_brief.md
│   ├── 02_system_description.md
│   ├── 03_risk_register.md
│   ├── 04_consent_checklist.md
│   ├── 05_labeling_policy.md
│   ├── 06_incident_response.md
│   ├── 07_deepfake_provenance_watermarking_review.md
│   ├── 08_final_report_outline.md
│   ├── 09_final_compliance_assessment_report.md
│   └── 10_portfolio_summary.md
├── frameworks/
│   ├── eu_ai_act_mapping.md
│   ├── china_ai_labeling_mapping.md
│   ├── sag_aftra_mapping.md
│   └── nist_ai_rmf_mapping.md
├── diagrams/
│   └── data_flow_diagram.md
├── scripts/
│   ├── README.md
│   └── risk_scoring_demo.py
└── web/
    ├── index.html
    ├── styles.css
    └── app.js
```

## Skills Demonstrated

- AI governance and risk management;
- Synthetic media and deepfake compliance analysis;
- Consent and licensing control design;
- AI content labeling and provenance policy design;
- Incident response planning;
- Framework mapping across EU, China, SAG-AFTRA, and NIST AI RMF;
- Translating compliance rules into executable review logic;
- Designing a product-style compliance intake and generated report workflow.
