# Consent and Licensing Checklist

## 1. Purpose

This checklist defines the consent and licensing controls required before an AI-generated actor platform creates, edits, publishes, or commercializes content based on a real person's likeness, voice, facial features, body movement, or performance data.

The checklist is designed for a hypothetical synthetic media platform supporting short drama production, advertising, virtual influencers, fan-generated videos, and licensed digital replicas. It should be used before generation, before publication, and before any commercial reuse of AI-generated actor content.

This document is a compliance design artifact for portfolio purposes. It does not provide legal advice.

## 2. When This Checklist Applies

Use this checklist when the platform receives or generates any of the following:

- A real person's facial image;
- A real person's voice sample;
- A video clip showing a real person;
- Motion capture or body movement data from a performer;
- A prompt requesting imitation of a named or identifiable person;
- A request to create a digital replica of an actor, singer, influencer, public figure, employee, child, or ordinary individual;
- A request to commercialize content featuring a real or realistically imitated person.

The checklist applies even when the generated output is fictional, humorous, fan-made, or substantially edited, if the output could reasonably be understood as depicting, imitating, or exploiting an identifiable person.

## 3. Pre-Generation Gatekeeping Questions

Before generation begins, the platform reviewer or automated workflow should answer:

1. Is the person identifiable from face, voice, name, body movement, context, or prompt instructions?
2. Is the uploader the person depicted, an authorized representative, or a third party?
3. Is there a signed consent or license covering the specific face, voice, motion, or performance data being used?
4. Does the consent cover this exact use case, including format, distribution channel, commercial use, territory, and duration?
5. Does the consent allow model training, fine-tuning, or future model improvement?
6. Does the output involve a public figure, child, employee, political figure, sexual context, medical context, financial claim, or endorsement?
7. Will viewers be likely to believe the real person actually appeared in, endorsed, or performed the content?
8. Will the content be labeled as AI-generated, AI-modified, or a digital replica?
9. Can the platform preserve an audit trail linking the generated output to consent records, source media, user account, and publication event?

If the reviewer cannot answer these questions with sufficient evidence, the generation request should be paused or rejected until authorization is verified.

## 4. Required Consent and Licensing Fields

| Field | Required Control | Why It Matters | Minimum Evidence |
|---|---|---|---|
| Person identity | Confirm the identity of the person whose face, voice, or performance is used | Prevents unauthorized replicas and forged submissions | Government ID check, performer account verification, agent verification, or verified enterprise contract |
| Rights holder authority | Confirm the signer has authority to license the relevant rights | Prevents invalid consent from agents, employers, or uploaders without authority | Signed agreement, agency authorization, corporate authorization, or guardian documentation |
| Likeness scope | Specify whether the license covers face, body, gestures, name, image, persona, or full digital replica | Avoids vague permission that is later expanded beyond the person's expectations | Contract clause listing covered attributes |
| Voice scope | Specify whether the license covers speaking voice, singing voice, accent, vocal style, or voice cloning | Voice use can create separate reputation, labor, and licensing risks | Voice release form, audio license, or performer digital replica agreement |
| Motion and performance scope | Specify whether movement, choreography, acting style, or prior performance data may be reused | Prevents reuse of performer labor beyond the licensed production | Performance data release or motion capture agreement |
| Purpose limitation | Define the approved use cases, such as short drama, advertisement, dubbing, fan content, internal testing, or model evaluation | Limits function creep from one campaign into unrelated uses | Purpose-specific license term |
| Commercial use | State whether monetization, paid ads, brand endorsement, product placement, or subscription content is allowed | Commercial use carries higher publicity, labor, and consumer deception risk | Commercial license clause and compensation record |
| Distribution channels | Identify where content may appear, such as in-app only, social media, TV, streaming, paid ads, or third-party platforms | Prevents unexpected downstream exposure | Distribution schedule or channel list |
| Territory | Identify geographic scope, such as one country, global online distribution, or platform-specific markets | Helps manage jurisdiction-specific consent and labeling obligations | Territory clause |
| Duration | Define the period of authorized use and whether content must be removed after expiration | Prevents indefinite use of a person's identity | Start date, end date, renewal clause |
| Compensation | Document payment, royalties, revenue share, or other compensation | Supports fair digital replica use and performer accountability | Payment terms, invoice, royalty schedule |
| Revocation or withdrawal | Define whether and how the person can withdraw consent or stop future use | Important for dignity, autonomy, and changed circumstances | Withdrawal procedure and effect of revocation clause |
| Secondary use | Specify whether generated outputs, clips, stills, thumbnails, trailers, or derivative ads may be reused | Prevents campaign creep and unauthorized repackaging | Secondary-use clause |
| Training and fine-tuning | State whether source media or generated outputs may be used to train, fine-tune, test, or improve models | Training use is materially different from one-time generation | Separate training-data authorization |
| Data retention | Define how long source media, voice samples, generated outputs, and consent records will be stored | Reduces privacy and breach risk | Retention schedule |
| Subprocessors and vendors | Identify whether third-party AI providers, cloud vendors, or production partners can access the data | Prevents accountability gaps across the production chain | Vendor terms, data processing agreement, audit rights |
| Content restrictions | Define prohibited contexts, such as sexual content, political persuasion, defamatory content, health claims, financial claims, or sensitive endorsements | Protects dignity, reputation, and viewer trust | Morals clause or prohibited-use schedule |
| Labeling obligation | Confirm whether visible labels, metadata labels, watermarking, or content credentials must be applied | Supports transparency obligations and downstream detection | Labeling policy reference and output metadata |
| Audit trail | Link every output to the relevant consent, source media, user, model, reviewer, and publication event | Enables investigation and proof of authorization | Generation log and consent ID |

## 5. Risk-Based Authorization Matrix

| Content Type | Authorization Requirement | Review Level | Default Decision |
|---|---|---|---|
| Fully synthetic character with no real-person prompt or source media | No likeness consent required; standard content policy still applies | Low | Allow with AI label if generated content is published |
| User uploads their own face or voice for non-commercial personal content | Identity verification and self-consent required | Medium | Allow after verification and labeling |
| User uploads a third party's ordinary-person face or voice | Written consent from the depicted person required | High | Hold until consent is verified |
| Actor licenses a digital replica for a specific production | Specific-purpose digital replica agreement required | High | Allow only within licensed scope |
| Brand requests AI endorsement using a real person or digital replica | Explicit commercial endorsement license required | High | Allow only after enhanced legal/compliance review |
| Public figure, celebrity, politician, or influencer replica | Explicit authorization required; parody or news exceptions require legal review | High | Hold for enhanced review |
| Child or minor likeness, voice, or performance | Guardian consent, child-safety review, and strict purpose limitation required | High | Hold for enhanced review; reject sensitive uses |
| Sexual, defamatory, political, medical, financial, or highly sensitive portrayal of a real person | Explicit authorization is not sufficient by itself; dignity, safety, and platform policy review required | High | Usually reject or escalate |
| Training or fine-tuning on performer data | Separate training-data consent required | High | Reject unless training authorization is explicit |
| Reuse after license expiration or outside territory | Updated authorization required | High | Block until renewed or narrowed |

## 6. Red Flags Requiring Escalation

Escalate the request to legal, trust and safety, or senior compliance review when:

- The uploaded person is a celebrity, influencer, politician, or other public figure;
- The content appears to imitate a real person's voice or face without a clear consent record;
- The uploader claims to have consent but provides only informal messages, screenshots, or unsigned documents;
- The content involves endorsement, advertising, fundraising, political persuasion, medical claims, or financial claims;
- The content sexualizes, humiliates, threatens, defames, or impersonates a real person;
- The content involves a child or a person who may be unable to provide valid consent;
- The request asks to remove, hide, crop out, or avoid AI labels;
- The source media appears scraped from social media, fan sites, public interviews, films, songs, or live streams;
- The requested use differs from the original license scope;
- The request involves model training, fine-tuning, or building a reusable digital replica.

## 7. Minimum Consent Language Requirements

Consent should be specific, informed, documented, and revocable where applicable. A valid consent or license should clearly identify:

1. The person whose likeness, voice, or performance is being used;
2. The party receiving the license;
3. The exact attributes covered, such as face, voice, name, performance, gestures, or full digital replica;
4. The permitted content type and production context;
5. Whether commercial use, paid advertising, product endorsement, or monetization is allowed;
6. Whether the content may be edited, localized, dubbed, translated, remixed, or republished;
7. Whether source media or generated outputs may be used for model training, fine-tuning, or improvement;
8. The duration and territory of the authorization;
9. Compensation terms;
10. Withdrawal, expiration, and takedown procedures;
11. Prohibited uses and sensitive contexts;
12. Labeling and disclosure expectations;
13. Recordkeeping and audit requirements.

The platform should not treat broad statements such as "I agree to AI use" or "you may use my image for promotional purposes" as sufficient authorization for creating a reusable digital replica or training a model.

## 8. Reviewer Checklist

Before approving generation, the reviewer should confirm:

- The person is identified or the content is confirmed to be fully synthetic;
- The uploader's relationship to the depicted person is documented;
- The required consent or license is present and signed;
- The license covers face, voice, motion, and performance attributes actually used;
- Commercial use is either prohibited or explicitly authorized;
- Territory, duration, and distribution channels are defined;
- Compensation is documented when performer labor or digital replica rights are licensed;
- Secondary use and derivative works are either prohibited or expressly allowed;
- Training, fine-tuning, and model improvement use are separately authorized;
- Public figure, child, endorsement, sexual, political, medical, financial, and defamatory risks are screened;
- Required AI labels, metadata, and watermarking controls are applied;
- The consent record ID is linked to source media, generated output, reviewer decision, and publication record.

Before approving publication or download, the reviewer should confirm:

- The output remains within the approved content scope;
- The output does not create a misleading impression that the person personally appeared, performed, or endorsed the content;
- Required labels are visible or machine-readable as applicable;
- Expiration and takedown obligations are logged;
- The platform can respond to a later complaint with evidence of authorization.

## 9. Mini Case Analysis

### Case A: Celebrity Face in a Commercial Short Drama

Scenario: A creator uploads a famous actor's public interview image and asks the platform to generate a short drama advertisement using that actor's face.

Assessment: This should be treated as high risk. The user is not the rights holder, the source image appears publicly scraped, the output is commercial, and viewers may believe the actor participated in or endorsed the advertisement.

Decision: Reject unless the creator provides verified authorization from the actor or authorized representative covering commercial digital replica use, distribution channel, territory, duration, compensation, and AI labeling.

### Case B: Performer Licenses Their Own Digital Replica

Scenario: An actor creates a verified performer account and signs a contract allowing their digital replica to appear in one short drama series for six months on the platform.

Assessment: This may be allowed if the license is specific and supported by identity verification, compensation, clear use scope, and labeling controls.

Decision: Allow only for the licensed series, licensed duration, and approved distribution channel. Block reuse in advertisements, sequels, or model training unless separately authorized.

### Case C: Fan Video Using a Singer's Voice

Scenario: A fan uploads a singer's voice sample from a live performance and generates new dialogue for a fictional video.

Assessment: This creates unauthorized voice cloning risk. Even if the video is non-commercial, the output may mislead viewers or harm the singer's reputation.

Decision: Reject unless valid voice authorization is provided. If the content is allowed under a narrow platform policy exception, it should still require prominent AI labeling and non-commercial restrictions.

## 10. Link to Risk Register

This checklist directly mitigates the following risk register items:

- R1: Unauthorized likeness use;
- R2: Unauthorized voice cloning;
- R4: Training data misuse;
- R5: Harmful or defamatory portrayal;
- R8: Overbroad consent;
- R9: Child likeness or voice misuse;
- R10: Public figure manipulation;
- R11: Commercial scope violation;
- R12: Vendor or model-provider accountability gap;
- R14: Inadequate audit trail;
- R15: False authorization document.

## 11. Reference Materials

- EU AI Act, Article 50: Transparency obligations for providers and deployers of certain AI systems. https://eur-lex.europa.eu/eli/reg/2024/1689/oj
- China Measures for Labeling Artificial Intelligence-Generated Synthetic Content, issued in 2025. https://www.cac.gov.cn/2025-03/14/c_1743654684782215.htm
- SAG-AFTRA AI-related digital replica principles, including specific consent and compensation expectations. https://www.sagaftra.org/contracts-industry-resources/contracts/2023-tvtheatrical-contracts
- NIST AI Risk Management Framework, including Govern, Map, Measure, and Manage functions. https://www.nist.gov/itl/ai-risk-management-framework
