# Privacy Engineering Data Flow Diagram v2

This upgraded data flow diagram focuses on privacy-relevant data movement, control points, retention boundaries, and evidence artifacts for the fictional AI actor / synthetic media platform.

```mermaid
flowchart LR
  U[Requester / Creator] -->|uploads image, video, voice, prompt| INT[Intake UI]
  P[Performer / Rights Holder] -->|consent, license, revocation terms| CONSENT[Consent & Licensing Vault]
  INT -->|case metadata| CASE[Case Review Record]
  INT -->|source media| MEDIA[Encrypted Source Media Store]
  INT -->|prompt and script| PROMPT[Prompt & Script Store]

  MEDIA -->|feature extraction| BIO[Biometric / Likeness Feature Pipeline]
  PROMPT --> MOD[Policy & Safety Moderation]
  CONSENT --> AUTH[Authorization Decision Engine]
  CASE --> AUTH
  BIO --> GEN[Generation Service]
  MOD --> GEN
  AUTH -->|approve / block / escalate| GEN

  GEN -->|synthetic clip| OUTPUT[Generated Content Store]
  OUTPUT --> LABEL[Labeling & Provenance Service]
  LABEL -->|visible label, metadata, hash, content credential| EXPORT[Export / Publishing Gateway]
  EXPORT --> VIEWER[Viewer / Downstream Platform]

  VIEWER -->|complaint or takedown request| IR[Incident Response Queue]
  IR --> EVIDENCE[Evidence Preservation Store]
  IR --> CONSENT
  IR --> CASE

  subgraph Privacy Controls
    AUTH
    LABEL
    IR
    EVIDENCE
  end

  subgraph Retention Boundaries
    MEDIA
    PROMPT
    OUTPUT
    CASE
    CONSENT
  end
```

## Key Privacy Control Points

| Control point | Privacy purpose | Evidence artifact |
|---|---|---|
| Intake UI | Capture declared use, source media type, person depicted, regions, and commercial purpose | Intake case JSON |
| Consent & Licensing Vault | Bind face, voice, motion, performance, commercial use, training use, duration, territory, and revocation terms | Consent record, license scope, audit event |
| Authorization Decision Engine | Prevent generation when real-person likeness or voice lacks verified authority | Decision log, reviewer note |
| Biometric / Likeness Feature Pipeline | Minimize extracted identifiers and avoid uncontrolled template reuse | Feature extraction log, deletion job |
| Labeling & Provenance Service | Preserve transparency after publication or export | Visible label, metadata label, hash, content credential |
| Incident Response Queue | Support notice-and-action, takedown, evidence preservation, and control improvement | Incident ticket, evidence package, post-incident review |

