# Deepfake Provenance and Watermarking Review

## 1. Purpose

This review compares provenance and watermarking controls for AI-generated actors and deepfake-style synthetic media. The goal is to recommend a layered labeling and detection strategy for a synthetic media platform.

## 2. Control Comparison

| Control | What It Does | Strengths | Limitations | Recommended Role |
|---|---|---|---|---|
| Visible watermark | Places a visible mark on the video or image | Easy for viewers to understand; useful for screenshots and previews | Can be cropped, blurred, covered, or removed | Use for high-risk, public, and downloadable content |
| Visible AI label in UI | Displays "AI-generated" or similar label in platform interface | Clear inside the platform; easy to update | Does not travel with downloaded files | Use for all published synthetic media |
| Caption or description disclosure | Adds disclosure in post text, ad copy, or video description | Good for context and accessibility | Can be omitted or edited during reposting | Use as supporting disclosure, not the only label |
| Metadata label | Embeds AI-generation information in file metadata | Useful for platforms and automated systems | Often stripped during compression, conversion, or reposting | Use for exports and machine review |
| C2PA / content credentials | Provides structured, tamper-evident provenance information | Stronger provenance chain and professional ecosystem support | Adoption varies across platforms and tools | Use for commercial, licensed, and professional outputs |
| Model-side watermark | Embeds detectable signals at generation time | Can support later detection at scale | Robustness varies; may degrade after editing | Use where technically available, especially for high-volume outputs |
| Perceptual hash registry | Stores fingerprints of generated content | Supports repeat-upload detection and takedown enforcement | Does not inform viewers directly | Use for incident response and repost detection |
| Audio watermark or fingerprint | Embeds or stores voice-output signals | Useful for synthetic voice and voice clone detection | May fail after compression, mixing, or re-recording | Use for voice cloning and synthetic dialogue |
| Release package manifest | Bundles output file, license ID, label, export log, and provenance record | Strong for business customers and audits | Requires operational discipline | Use for enterprise and brand distribution |

## 3. Recommended Layered Approach

The platform should not rely on one provenance method. The recommended baseline is:

1. Platform UI label for every published synthetic media output;
2. Visible watermark for high-risk, downloadable, or externally distributed outputs;
3. Metadata label for every exported file where technically supported;
4. C2PA or content credentials for commercial, licensed, professional, or high-risk outputs;
5. Hash registry for all high-risk generated outputs and all reported incidents;
6. Audio fingerprinting or watermarking for voice cloning and synthetic voice outputs;
7. Export logs that record whether labels, metadata, and provenance controls were preserved.

## 4. Scenario Recommendations

| Scenario | Recommended Provenance Controls |
|---|---|
| Fully synthetic short drama | UI label, metadata label, optional watermark |
| AI actor based on licensed performer | UI label, visible watermark, metadata, content credentials, consent ID linkage |
| Synthetic advertisement | Prominent visible label, watermark, metadata, content credentials, commercial release manifest |
| Public figure deepfake-style content | Prominent visible label, metadata, watermark, human review, hash registry |
| Synthetic voice dialogue | Audio disclosure, metadata, audio fingerprint, consent ID linkage |
| User download/export | Visible label where feasible, metadata, export log, warning against label removal |
| Reported unauthorized likeness incident | Preserve file, metadata, hash, source media, prompt, label state, and generation log |

## 5. Key Design Tradeoffs

Visible labels help people, but can be removed. Metadata helps machines, but can be stripped. Watermarks can support persistence, but are not always robust. C2PA-style provenance can provide stronger professional-grade records, but it depends on ecosystem adoption. Hash registries are useful for enforcement, but do not provide transparency to viewers.

The practical answer is a layered control stack: viewer-facing disclosure, machine-readable metadata, tamper-evident provenance where available, and internal detection records for enforcement.

## 6. Link to Project Controls

- `docs/05_labeling_policy.md`: defines required visible and machine-readable labels.
- `docs/06_incident_response.md`: uses provenance records for evidence preservation.
- `frameworks/eu_ai_act_mapping.md`: maps transparency duties to platform controls.
- `frameworks/china_ai_labeling_mapping.md`: maps explicit and implicit labeling obligations.

## 7. References

- C2PA technical specification and content provenance resources. https://c2pa.org/specifications/
- EU AI Act, Article 50. https://eur-lex.europa.eu/eli/reg/2024/1689/oj
- China Measures for Labeling Artificial Intelligence-Generated Synthetic Content, issued in 2025. https://www.cac.gov.cn/2025-03/14/c_1743654684782215.htm

