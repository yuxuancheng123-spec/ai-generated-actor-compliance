const sensitiveContexts = new Set(["sexual", "political", "medical", "financial", "defamatory"]);
const realPersonSubjects = new Set([
  "self",
  "ordinaryPerson",
  "performer",
  "publicFigure",
  "politician",
  "minor",
]);
const verifiedConsentEvidence = new Set(["uploadedContract", "verifiedPortal", "performerAgreement"]);
const commercialUses = new Set(["advertisement", "virtualInfluencer"]);
const commercialMonetization = new Set(["paidAd", "resale"]);

const labels = {
  requesterType: {
    creator: "Individual creator",
    brand: "Brand or advertiser",
    production: "Production company",
    performer: "Performer licensing own replica",
  },
  subjectType: {
    publicFigure: "Celebrity or public figure",
    ordinaryPerson: "Ordinary third party",
    self: "Uploader themselves",
    performer: "Contracted performer",
    politician: "Political figure",
    minor: "Child or minor",
    synthetic: "Fully synthetic character",
  },
  useCase: {
    shortDrama: "Short drama scene",
    advertisement: "Advertisement",
    virtualInfluencer: "Virtual influencer post",
    fanContent: "Fan content",
    parody: "Parody or satire",
    politicalMessage: "Political message",
  },
  monetization: {
    paidAd: "Paid ad or endorsement",
    publicPost: "Public post",
    draft: "Internal draft only",
    resale: "License or resale",
  },
  consentEvidence: {
    "": "Not selected",
    none: "No authorization evidence",
    selfAttestation: "Uploader self-attestation",
    uploadedContract: "Uploaded contract",
    verifiedPortal: "Verified performer portal",
    performerAgreement: "Performer AI replica agreement",
  },
};

const presets = {
  unauthorizedCelebrityAd: {
    requesterType: "brand",
    subjectType: "publicFigure",
    mediaFace: true,
    mediaVoice: true,
    mediaMotion: false,
    mediaPerformance: false,
    useCase: "advertisement",
    monetization: "paidAd",
    sensitiveContext: "none",
    regionEu: true,
    regionChina: true,
    regionUs: true,
    regionGlobal: false,
    consentEvidence: "none",
    scopeCommercial: false,
    scopeTraining: false,
    scopeTerritory: false,
    scopeDuration: false,
    scopeSecondaryUse: false,
    scopeRevocation: false,
    scopeCompensation: false,
    visibleLabel: false,
    machineLabel: false,
    watermark: false,
    trainingUse: false,
  },
  licensedPerformer: {
    requesterType: "production",
    subjectType: "performer",
    mediaFace: true,
    mediaVoice: true,
    mediaMotion: true,
    mediaPerformance: true,
    useCase: "shortDrama",
    monetization: "publicPost",
    sensitiveContext: "none",
    regionEu: true,
    regionChina: true,
    regionUs: false,
    regionGlobal: false,
    consentEvidence: "performerAgreement",
    scopeCommercial: true,
    scopeTraining: false,
    scopeTerritory: true,
    scopeDuration: true,
    scopeSecondaryUse: true,
    scopeRevocation: true,
    scopeCompensation: true,
    visibleLabel: true,
    machineLabel: true,
    watermark: true,
    trainingUse: false,
  },
  fanParody: {
    requesterType: "creator",
    subjectType: "publicFigure",
    mediaFace: true,
    mediaVoice: false,
    mediaMotion: false,
    mediaPerformance: false,
    useCase: "parody",
    monetization: "publicPost",
    sensitiveContext: "none",
    regionEu: false,
    regionChina: false,
    regionUs: true,
    regionGlobal: false,
    consentEvidence: "selfAttestation",
    scopeCommercial: false,
    scopeTraining: false,
    scopeTerritory: false,
    scopeDuration: false,
    scopeSecondaryUse: false,
    scopeRevocation: false,
    scopeCompensation: false,
    visibleLabel: true,
    machineLabel: false,
    watermark: false,
    trainingUse: false,
  },
  syntheticLow: {
    requesterType: "creator",
    subjectType: "synthetic",
    mediaFace: false,
    mediaVoice: false,
    mediaMotion: false,
    mediaPerformance: false,
    useCase: "shortDrama",
    monetization: "draft",
    sensitiveContext: "none",
    regionEu: true,
    regionChina: false,
    regionUs: false,
    regionGlobal: false,
    consentEvidence: "none",
    scopeCommercial: false,
    scopeTraining: false,
    scopeTerritory: false,
    scopeDuration: false,
    scopeSecondaryUse: false,
    scopeRevocation: false,
    scopeCompensation: false,
    visibleLabel: true,
    machineLabel: true,
    watermark: false,
    trainingUse: false,
  },
};

const form = document.querySelector("#risk-form");
const workflowShell = document.querySelector("#review-system");
const reportView = document.querySelector("#report-view");
const workflowMode = document.querySelector("#workflow-mode");
const fullReportSection = document.querySelector("#full-report");
const stepTitle = document.querySelector("#step-title");
const stepCopy = document.querySelector("#step-copy");
const composerStepLabel = document.querySelector("#composer-step-label");
const prevStepButton = document.querySelector("#prev-step");
const nextStepButton = document.querySelector("#next-step");
const generateReportButton = document.querySelector("#generate-report");
const viewFullReportButton = document.querySelector("#view-full-report");
const editIntakeButton = document.querySelector("#edit-intake");
const liveDecision = document.querySelector("#live-decision");
const liveScore = document.querySelector("#live-score");
const liveRiskLevel = document.querySelector("#live-risk-level");
const liveMainBlocker = document.querySelector("#live-main-blocker");
const liveReviewerPath = document.querySelector("#live-reviewer-path");
const evidenceReadiness = document.querySelector("#evidence-readiness");
const riskSummaryCard = document.querySelector(".risk-summary-card");
const triggeredRuleList = document.querySelector("#triggered-rule-list");
const liveMissingEvidenceList = document.querySelector("#live-missing-evidence-list");
const stepResultList = document.querySelector("#step-result-list");
const evidenceGapList = document.querySelector("#evidence-gap-list");
const riskRegisterPreview = document.querySelector("#risk-register-preview");
const regulatoryContext = document.querySelector("#regulatory-context");
const memoStatus = document.querySelector("#memo-status");
const reportStateCopy = document.querySelector("#report-state-copy");
const decisionPill = document.querySelector("#decision-pill");
const scoreValue = document.querySelector("#score-value");
const resultTitle = document.querySelector("#result-title");
const resultCopy = document.querySelector("#result-copy");
const riskLevelText = document.querySelector("#risk-level-text");
const reviewerPath = document.querySelector("#reviewer-path");
const resultPanel = document.querySelector(".result-panel");

const sections = {
  riskDrivers: document.querySelector("#risk-driver-list"),
  missingEvidence: document.querySelector("#missing-evidence-list"),
  scenarioProfile: document.querySelector("#scenario-profile"),
  consentControls: document.querySelector("#consent-control-list"),
  labelControls: document.querySelector("#label-control-list"),
  releaseControls: document.querySelector("#release-control-list"),
  incidentControls: document.querySelector("#incident-control-list"),
  jurisdictionMatrix: document.querySelector("#jurisdiction-matrix"),
  nextSteps: document.querySelector("#next-step-list"),
  frameworks: document.querySelector("#framework-list"),
  evidence: document.querySelector("#evidence-list"),
};

const workflowSteps = [
  {
    title: "Request context",
    copy: "Identify who is requesting the synthetic media review and whose identity is depicted.",
  },
  {
    title: "Media inputs",
    copy: "Select the face, voice, motion, or prior performance assets used to generate the content.",
  },
  {
    title: "Use and distribution",
    copy: "Define the publication purpose, commercialization path, sensitivity, and release regions.",
  },
  {
    title: "Consent evidence",
    copy: "Record the authorization artifact and license scope for the depicted person or performer.",
  },
  {
    title: "Platform controls",
    copy: "Confirm labeling, provenance, watermarking, and training-use controls before report generation.",
  },
];

let currentStep = 0;
let activeWorkspaceTab = "intake";
let reportGenerated = false;

function checked(data, field) {
  return data.has(field);
}

function getScenario() {
  const data = new FormData(form);
  return {
    requesterType: data.get("requesterType"),
    subjectType: data.get("subjectType"),
    mediaFace: checked(data, "mediaFace"),
    mediaVoice: checked(data, "mediaVoice"),
    mediaMotion: checked(data, "mediaMotion"),
    mediaPerformance: checked(data, "mediaPerformance"),
    useCase: data.get("useCase"),
    monetization: data.get("monetization"),
    sensitiveContext: data.get("sensitiveContext"),
    regionEu: checked(data, "regionEu"),
    regionChina: checked(data, "regionChina"),
    regionUs: checked(data, "regionUs"),
    regionGlobal: checked(data, "regionGlobal"),
    consentEvidence: data.get("consentEvidence"),
    scopeCommercial: checked(data, "scopeCommercial"),
    scopeTraining: checked(data, "scopeTraining"),
    scopeTerritory: checked(data, "scopeTerritory"),
    scopeDuration: checked(data, "scopeDuration"),
    scopeSecondaryUse: checked(data, "scopeSecondaryUse"),
    scopeRevocation: checked(data, "scopeRevocation"),
    scopeCompensation: checked(data, "scopeCompensation"),
    visibleLabel: checked(data, "visibleLabel"),
    machineLabel: checked(data, "machineLabel"),
    watermark: checked(data, "watermark"),
    trainingUse: checked(data, "trainingUse"),
  };
}

function unique(items) {
  return [...new Set(items.filter(Boolean))];
}

function selectedMedia(risk) {
  const media = [];
  if (risk.mediaFace) media.push("face or likeness");
  if (risk.mediaVoice) media.push("voice");
  if (risk.mediaMotion) media.push("body motion");
  if (risk.mediaPerformance) media.push("prior performance");
  return media;
}

function isCommercial(risk) {
  return commercialUses.has(risk.useCase) || commercialMonetization.has(risk.monetization);
}

function isPublicFigure(risk) {
  return risk.subjectType === "publicFigure" || risk.subjectType === "politician";
}

function hasVerifiedAuthorization(risk) {
  if (risk.subjectType === "synthetic") return true;
  if (risk.subjectType === "self" && risk.consentEvidence === "selfAttestation") return true;
  return verifiedConsentEvidence.has(risk.consentEvidence);
}

function usesRealPerson(risk) {
  return realPersonSubjects.has(risk.subjectType) && selectedMedia(risk).length > 0;
}

function effectiveRegions(risk) {
  const regions = [];
  if (risk.regionGlobal) return ["EU", "China", "US", "Global release"];
  if (risk.regionEu) regions.push("EU");
  if (risk.regionChina) regions.push("China");
  if (risk.regionUs) regions.push("US");
  return regions;
}

function isBlankScenario(risk) {
  return !Object.values(risk).some((value) => Boolean(value));
}

function hasCoreScenario(risk) {
  return Boolean(risk.requesterType && risk.subjectType && risk.useCase && risk.monetization && risk.sensitiveContext);
}

function addJurisdictionRequirements(risk, jurisdictionRequirements, controls, frameworks, evidence) {
  const regions = effectiveRegions(risk);

  if (!regions.length) {
    jurisdictionRequirements.push("No release region selected. Select at least one region before publication review.");
    return;
  }

  if (regions.includes("EU")) {
    jurisdictionRequirements.push("EU: disclose AI-generated or manipulated image, audio, or video content to viewers.");
    jurisdictionRequirements.push("EU: preserve technical provenance where feasible so synthetic or manipulated content remains detectable after export.");
    frameworks.push("EU AI Act Article 50: transparency disclosure for AI-generated or manipulated audio/video/image content.");
    evidence.push("EU release review: label placement screenshot, metadata/provenance record, and reviewer approval.");
  }

  if (regions.includes("China")) {
    jurisdictionRequirements.push("China: apply explicit visible labels for AI-generated synthetic content where users can perceive the label.");
    jurisdictionRequirements.push("China: add implicit machine-readable labeling such as metadata, watermarking, or platform-side provenance signals.");
    jurisdictionRequirements.push("China: keep service-provider records linking generated content, label state, account, and publication/export event.");
    frameworks.push("China AI synthetic content labeling rules: explicit visible labels plus implicit machine-readable signals.");
    evidence.push("China release review: explicit label screenshot, implicit label record, and export/repost persistence check.");
  }

  if (regions.includes("US")) {
    jurisdictionRequirements.push("US: assess right of publicity, privacy, deceptive endorsement, and platform policy risk for real-person likeness or voice.");
    jurisdictionRequirements.push("US: treat political, sexual, defamatory, or commercial impersonation as enhanced-review contexts because state and sector rules may vary.");
    evidence.push("US release review: publicity/endorsement assessment, consent artifact, and sensitive-context reviewer note.");
  }

  if (regions.includes("Global release")) {
    jurisdictionRequirements.push("Global: apply the strictest selected-region labeling and consent controls by default.");
    jurisdictionRequirements.push("Global: require export-resistant provenance, takedown routing, and region-specific policy notes before release.");
    controls.push("Use highest-common-denominator controls for global distribution: verified consent, visible label, machine-readable label, watermark/provenance, and takedown SLA.");
  }
}

function addLabelRequirements(risk, labelsOut, controls, frameworks) {
  const realPerson = usesRealPerson(risk);
  const regions = effectiveRegions(risk);

  if (realPerson || risk.subjectType === "synthetic") {
    labelsOut.push("Apply a visible label such as AI-generated, AI-modified, digital replica, or synthetic voice.");
  }

  if (regions.includes("EU") || regions.includes("Global release")) {
    if (!risk.visibleLabel) labelsOut.push("EU release path requires a viewer-facing AI disclosure before publication.");
  }

  if (regions.includes("China") || regions.includes("Global release")) {
    if (!risk.machineLabel) labelsOut.push("China release path requires implicit or machine-readable labeling support.");
  }

  if ((regions.includes("China") || regions.includes("EU") || regions.includes("Global release")) && !risk.watermark) {
    labelsOut.push("Add persistent watermarking, metadata, content credentials, or export hash records for reposting risk.");
  }

  if (risk.visibleLabel && risk.machineLabel && risk.watermark) {
    controls.push("Confirm labels persist across preview, publication, download, export, and repost detection workflows.");
  }
}

function assessScenario(risk) {
  if (isBlankScenario(risk)) {
    return {
      decision: "intake",
      score: "-",
      riskLevel: "Not assessed",
      title: "Awaiting scenario details",
      reviewer: "Complete intake fields",
      summary: "Select requester type, person depicted, use case, distribution region, and authorization evidence to generate a review memo.",
      riskDrivers: ["No scenario facts entered yet."],
      controls: ["Complete intake before generation, publication, or commercialization review."],
      labels: ["Labeling requirements will appear after media type and release region are selected."],
      jurisdictions: ["No jurisdiction selected."],
      gaps: ["Consent and licensing gaps will appear after authorization evidence is selected."],
      reviews: ["Human review triggers will appear after subject type, use case, and sensitive context are selected."],
      frameworks: ["Framework mapping will populate from selected regions and risk triggers."],
      evidence: ["Evidence checklist will populate after the scenario is defined."],
    };
  }

  let score = 0;
  let decision = "approve";
  const riskDrivers = [];
  const controls = [];
  const labelsOut = [];
  const jurisdictionRequirements = [];
  const gaps = [];
  const reviews = [];
  const frameworks = ["NIST AI RMF: Govern, Map, Measure, Manage controls across intake, generation, publication, and incident response."];
  const evidence = [
    "Source media inventory and upload account record.",
    "Generated output ID, prompt/script record, model/tool log, and publication/export log.",
    "Reviewer decision record with timestamp and rationale.",
  ];

  const media = selectedMedia(risk);
  const realPerson = usesRealPerson(risk);
  const verifiedAuthorization = hasVerifiedAuthorization(risk);
  const commercial = isCommercial(risk);
  const publicFigure = isPublicFigure(risk);
  const regions = effectiveRegions(risk);
  const fanOrParody = risk.useCase === "parody" || risk.useCase === "fanContent";
  const lowerImpactParody =
    fanOrParody &&
    publicFigure &&
    !commercial &&
    risk.sensitiveContext === "none" &&
    risk.subjectType !== "minor";

  if (risk.requesterType) riskDrivers.push(`Requester: ${labels.requesterType[risk.requesterType]}.`);
  if (risk.subjectType) riskDrivers.push(`Subject: ${labels.subjectType[risk.subjectType]}.`);
  if (risk.useCase || risk.monetization) {
    riskDrivers.push(`Use case: ${labels.useCase[risk.useCase] || "Not selected"} / ${labels.monetization[risk.monetization] || "Not selected"}.`);
  }
  if (media.length) riskDrivers.push(`Source media includes ${media.join(", ")}.`);
  if (regions.length) riskDrivers.push(`Distribution region: ${regions.join(", ")}.`);
  if (!hasCoreScenario(risk)) {
    gaps.push("Core intake is incomplete: select requester type, person depicted, use case, commercialization, and sensitive context.");
  }

  if (realPerson) {
    score += 3;
    frameworks.push("SAG-AFTRA AI principles: digital replica use requires clear consent, compensation, and specific-purpose authorization.");
    evidence.push("Consent/license document linked to the depicted person and the requested media attributes.");
  }

  if (realPerson && !verifiedAuthorization && !lowerImpactParody) {
    score += 7;
    decision = "reject";
    riskDrivers.push("No verified authorization for a real-person likeness, voice, motion, or performance workflow.");
    gaps.push("Require verified person-level authorization before generation; self-attestation is not enough for third-party or public figure content.");
    controls.push("Block generation and preserve upload, prompt, and account evidence for rights-holder review.");
  } else if (realPerson && !verifiedAuthorization && lowerImpactParody) {
    score += 4;
    riskDrivers.push("Public figure parody/fan content lacks verified authorization but is not commercial or sensitive.");
    gaps.push("Authorization remains unverified; reviewer must assess whether the parody/fan context is misleading, commercial, or harmful.");
    controls.push("Restrict monetization and endorsement framing unless separate authorization is provided.");
  }

  if (commercial) {
    score += 2;
    riskDrivers.push("Commercial, endorsement, or resale context increases publicity, performer-rights, and consumer deception risk.");
    if (!risk.scopeCommercial) gaps.push("Commercial use is not clearly covered by the submitted authorization.");
    controls.push("Run license-scope check for commercial use, channel, territory, duration, and secondary use.");
  }

  if (publicFigure) {
    score += 3;
    reviews.push("Public figure or political figure content requires enhanced human review for impersonation, endorsement, and public-interest risk.");
  }

  if (risk.subjectType === "minor") {
    score += 5;
    reviews.push("Minor-related content requires child-safety escalation and stricter identity/guardian authorization review.");
    gaps.push("Confirm guardian authorization, child-safety review, and distribution limitations.");
  }

  if (risk.sensitiveContext && risk.sensitiveContext !== "none") {
    score += 4;
    riskDrivers.push(`Sensitive context selected: ${risk.sensitiveContext}.`);
    reviews.push("Sensitive context requires human review before generation or publication.");
  }

  if (realPerson && ["sexual", "defamatory"].includes(risk.sensitiveContext)) {
    decision = "reject";
    controls.push("Reject real-person sexual or defamatory synthetic portrayal and route to incident/safety queue if uploaded content exists.");
  }

  if (risk.subjectType === "minor" && risk.sensitiveContext && risk.sensitiveContext !== "none") {
    decision = "reject";
    controls.push("Reject minor-related sensitive synthetic media and preserve evidence for safety review.");
  }

  if (risk.trainingUse) {
    score += 3;
    evidence.push("Training-data use flag, data lineage record, and model-improvement opt-in record.");
    if (!risk.scopeTraining) {
      gaps.push("Training, fine-tuning, or model improvement is not separately authorized.");
      controls.push("Allow content generation only if otherwise valid; block model training until separate authorization is captured.");
    }
  }

  if (verifiedAuthorization && realPerson) {
    if (!risk.scopeTerritory) gaps.push("Territory is not clearly scoped to the selected release regions.");
    if (!risk.scopeDuration) gaps.push("License duration or expiration is missing.");
    if (!risk.scopeSecondaryUse && risk.monetization === "resale") gaps.push("Secondary use or resale is not covered.");
    if (!risk.scopeRevocation) gaps.push("Revocation or withdrawal path is missing.");
    if (!risk.scopeCompensation && risk.subjectType === "performer") gaps.push("Performer compensation terms are missing.");
  }

  if (risk.useCase === "parody" || risk.useCase === "fanContent") {
    reviews.push("Fan/parody claim requires reviewer assessment of confusion, commercialization, platform policy, and local law risk.");
    controls.push("Do not treat parody or fan context as automatic authorization; require label and no misleading endorsement.");
  }

  if (risk.useCase === "politicalMessage" || risk.sensitiveContext === "political" || risk.subjectType === "politician") {
    reviews.push("Political or civic-content workflow requires enhanced review and stronger disclosure placement.");
    controls.push("Restrict deceptive political impersonation and require prominent synthetic-media disclosure.");
  }

  addJurisdictionRequirements(risk, jurisdictionRequirements, controls, frameworks, evidence);
  addLabelRequirements(risk, labelsOut, controls, frameworks);

  if (!risk.visibleLabel && (realPerson || risk.subjectType === "synthetic")) {
    score += 2;
    labelsOut.push("Visible AI disclosure is missing from the current release plan.");
  }
  if (!risk.machineLabel && (risk.regionChina || risk.regionGlobal)) {
    score += 2;
  }
  if (!risk.watermark && (risk.regionEu || risk.regionChina || risk.regionGlobal || commercial)) {
    score += 1;
  }

  evidence.push("Visible label screenshot, metadata/provenance record, watermark state, and export hash record where required.");
  evidence.push("Complaint intake route and takedown SLA attached to the content ID.");

  if (decision !== "reject") {
    const hasEscalationTrigger =
      publicFigure ||
      risk.subjectType === "minor" ||
      (risk.sensitiveContext && risk.sensitiveContext !== "none") ||
      risk.useCase === "politicalMessage" ||
      risk.useCase === "parody" ||
      score >= 9;
    const hasBlockingConditions = gaps.length > 0 || labelsOut.some((item) => item.includes("missing") || item.includes("requires"));

    if (hasEscalationTrigger || score >= 9) {
      decision = "escalate";
    } else if (hasBlockingConditions || score >= 5) {
      decision = "conditional";
    }
  }

  if (!hasCoreScenario(risk)) {
    decision = "intake";
  }

  const riskLevel = decision === "intake" ? "Not assessed" : decision === "reject" ? "prohibited" : score >= 9 ? "high" : score >= 5 ? "medium" : "low";
  const title = {
    intake: "Scenario intake incomplete",
    reject: "Reject before generation",
    escalate: "Escalate to human review",
    conditional: "Approve with conditions",
    approve: "Approve standard workflow",
  }[decision];
  const reviewer = {
    intake: "Complete intake fields",
    reject: "Block and preserve evidence",
    escalate: "Enhanced human review",
    conditional: "Release only after controls are satisfied",
    approve: "Standard labeling and audit logging",
  }[decision];
  const summary = {
    intake: "The memo is showing jurisdiction and evidence guidance, but a final decision requires the core scenario fields.",
    reject: "The request cannot proceed until verified authorization and prohibited-use concerns are resolved.",
    escalate: "The request may be permissible, but the risk profile requires human reviewer sign-off before release.",
    conditional: "The request can proceed only after specific controls, labels, or license-scope gaps are closed.",
    approve: "The request fits the lower-risk path with ordinary synthetic-media labeling and audit logging.",
  }[decision];

  return {
    decision,
    score: decision === "intake" ? "-" : score,
    riskLevel,
    title,
    reviewer,
    summary,
    riskDrivers: unique(riskDrivers),
    controls: unique(controls.length ? controls : ["Apply standard pre-publication moderation, label verification, and audit logging."]),
    labels: unique(labelsOut.length ? labelsOut : ["Maintain visible AI disclosure and internal content provenance record."]),
    jurisdictions: unique(jurisdictionRequirements),
    gaps: unique(gaps.length ? gaps : ["No material authorization gaps detected from the selected fields."]),
    reviews: unique(reviews.length ? reviews : ["No enhanced human review trigger selected."]),
    frameworks: unique(frameworks),
    evidence: unique(evidence),
  };
}

function renderList(target, items) {
  if (!target) return;
  target.replaceChildren();
  items.forEach((text) => {
    const item = document.createElement("li");
    item.textContent = text;
    target.append(item);
  });
}

function renderDefinitionList(target, items) {
  if (!target) return;
  target.replaceChildren();
  items.forEach(({ label, value }) => {
    const item = document.createElement("div");
    const term = document.createElement("dt");
    const description = document.createElement("dd");
    term.textContent = label;
    description.textContent = value;
    item.append(term, description);
    target.append(item);
  });
}

function decisionLabel(decision) {
  return {
    intake: "Intake incomplete",
    reject: "Reject",
    escalate: "Escalate",
    conditional: "Approve with conditions",
    approve: "Approve",
  }[decision] || decision;
}

function mainBlocker(memo) {
  const blockingGap = memo.gaps.find((item) => !/No material/i.test(item));
  if (blockingGap) return blockingGap;
  const labelGap = memo.labels.find((item) => /missing|requires|Add|Apply/i.test(item));
  if (labelGap) return labelGap;
  const review = memo.reviews.find((item) => !/No enhanced/i.test(item));
  if (review) return review;
  return "No blocking issue detected from the selected fields.";
}

function checklistStatus(complete, warning = false) {
  if (complete) return "pass";
  return warning ? "warn" : "fail";
}

function evidenceChecklist(risk) {
  if (isBlankScenario(risk)) {
    return [
      "Verified identity",
      "Consent or performer AI replica agreement",
      "Commercial use scope",
      "Territory and duration",
      "Compensation terms",
      "Revocation pathway",
      "Labeling implementation",
      "Provenance or watermarking control",
      "Incident escalation owner",
    ].map((label) => ({ label, complete: false, warning: true }));
  }

  const realPerson = usesRealPerson(risk);
  const commercial = isCommercial(risk);
  const regions = effectiveRegions(risk);
  const verifiedAuthorization = hasVerifiedAuthorization(risk);
  const needsLabel = realPerson || risk.subjectType === "synthetic" || regions.length > 0;
  const needsProvenance = regions.includes("EU") || regions.includes("China") || regions.includes("Global release") || commercial;

  return [
    {
      label: "Verified identity",
      complete: !realPerson || verifiedAuthorization || risk.subjectType === "self",
      warning: realPerson,
    },
    {
      label: "Consent or performer AI replica agreement",
      complete: !realPerson || verifiedAuthorization,
      warning: realPerson,
    },
    {
      label: "Commercial use scope",
      complete: !commercial || risk.scopeCommercial,
      warning: commercial,
    },
    {
      label: "Territory and duration",
      complete: !realPerson || (risk.scopeTerritory && risk.scopeDuration),
      warning: realPerson,
    },
    {
      label: "Compensation terms",
      complete: risk.subjectType !== "performer" || risk.scopeCompensation,
      warning: risk.subjectType === "performer",
    },
    {
      label: "Revocation pathway",
      complete: !realPerson || risk.scopeRevocation,
      warning: realPerson,
    },
    {
      label: "Labeling implementation",
      complete: !needsLabel || (risk.visibleLabel && (!regions.includes("China") || risk.machineLabel)),
      warning: needsLabel,
    },
    {
      label: "Provenance or watermarking control",
      complete: !needsProvenance || risk.watermark,
      warning: needsProvenance,
    },
    {
      label: "Incident escalation owner",
      complete: hasCoreScenario(risk) && regions.length > 0,
      warning: true,
    },
  ];
}

function evidenceReadinessPercent(risk) {
  const items = evidenceChecklist(risk);
  const complete = items.filter((item) => item.complete).length;
  return Math.round((complete / items.length) * 100);
}

function stepReviewResults(risk) {
  const realPerson = usesRealPerson(risk);
  const commercial = isCommercial(risk);
  const verifiedAuthorization = hasVerifiedAuthorization(risk);
  const regions = effectiveRegions(risk);
  const labelReady = risk.visibleLabel && (!regions.includes("China") || risk.machineLabel) && (!regions.length || risk.watermark || !(regions.includes("EU") || regions.includes("China") || regions.includes("Global release")));

  return [
    {
      label: realPerson ? "Real-person risk detected" : risk.subjectType === "synthetic" ? "No real-person source selected" : "Person depicted not selected",
      status: realPerson ? "warn" : risk.subjectType === "synthetic" ? "pass" : "fail",
    },
    {
      label: selectedMedia(risk).length ? `Source media: ${selectedMedia(risk).join(", ")}` : "Source media not selected",
      status: selectedMedia(risk).length || risk.subjectType === "synthetic" ? "pass" : "fail",
    },
    {
      label: commercial ? "Commercial endorsement triggers enhanced review" : risk.useCase ? "No paid endorsement trigger selected" : "Use case not selected",
      status: commercial ? "warn" : risk.useCase ? "pass" : "fail",
    },
    {
      label: verifiedAuthorization ? "Authorization evidence is present" : realPerson ? "Authorization missing" : "Authorization not required for synthetic-only draft",
      status: verifiedAuthorization || risk.subjectType === "synthetic" ? "pass" : realPerson ? "fail" : "warn",
    },
    {
      label: labelReady ? "Labeling and provenance controls look ready" : "Labeling controls incomplete",
      status: labelReady ? "pass" : "warn",
    },
  ];
}

function renderStatusList(target, items) {
  if (!target) return;
  target.replaceChildren();
  items.forEach(({ label, status }) => {
    const item = document.createElement("li");
    item.className = status;
    item.textContent = label;
    target.append(item);
  });
}

function renderPlainStatusList(target, items, fallback) {
  if (!target) return;
  target.replaceChildren();
  const safeItems = items.length ? items : [fallback];
  safeItems.forEach((label) => {
    const item = document.createElement("li");
    item.textContent = label;
    target.append(item);
  });
}

function renderEvidenceChecklist(risk) {
  const items = evidenceChecklist(risk).map((item) => ({
      label: item.complete ? `${item.label}: ready` : `${item.label}: gap`,
      status: checklistStatus(item.complete, item.warning),
    }));
  renderStatusList(evidenceGapList, items);
  const missing = items.filter((item) => item.status !== "pass").slice(0, 5);
  renderStatusList(
    liveMissingEvidenceList,
    missing.length ? missing : [{ label: "No open evidence gaps in the selected intake.", status: "pass" }]
  );
}

function riskRegisterRows(risk) {
  const realPerson = usesRealPerson(risk);
  return [
    {
      risk: "Unauthorized likeness use",
      severity: realPerson && !hasVerifiedAuthorization(risk) ? "High" : "Medium",
      control: "Identity verification, consent vault, upload restriction",
      active: realPerson && !hasVerifiedAuthorization(risk),
    },
    {
      risk: "Unauthorized voice cloning",
      severity: risk.mediaVoice ? "High" : "Medium",
      control: "Voice consent check, audio fingerprinting, licensing review",
      active: risk.mediaVoice && !hasVerifiedAuthorization(risk),
    },
    {
      risk: "Training reuse beyond consent",
      severity: risk.trainingUse && !risk.scopeTraining ? "High" : "Medium",
      control: "Separate training opt-in, data use logs, audit rights",
      active: risk.trainingUse && !risk.scopeTraining,
    },
    {
      risk: "Public figure manipulation",
      severity: isPublicFigure(risk) ? "High" : "Medium",
      control: "Enhanced human review, endorsement screening, policy limits",
      active: isPublicFigure(risk),
    },
    {
      risk: "Label removal after export",
      severity: risk.watermark ? "Medium" : "High",
      control: "Visible label, metadata, watermarking, provenance detection",
      active: !risk.watermark && effectiveRegions(risk).length > 0,
    },
  ];
}

function renderRiskRegisterPreview(risk) {
  if (!riskRegisterPreview) return;
  riskRegisterPreview.replaceChildren();
  riskRegisterRows(risk).forEach((row) => {
    const tableRow = document.createElement("tr");
    if (row.active) tableRow.className = "active";
    [row.risk, row.severity, row.control].forEach((value) => {
      const cell = document.createElement("td");
      cell.textContent = value;
      tableRow.append(cell);
    });
    riskRegisterPreview.append(tableRow);
  });
}

function regulatoryItems(risk) {
  const regions = effectiveRegions(risk);
  return [
    {
      title: "EU AI Act Article 50",
      body: regions.includes("EU") || regions.includes("Global release")
        ? "Viewer-facing disclosure and detectable provenance are in scope for AI-generated or manipulated media."
        : "Select EU or global release to trigger EU transparency notes.",
    },
    {
      title: "China AI-generated content labeling rules",
      body: regions.includes("China") || regions.includes("Global release")
        ? "Explicit visible label, implicit machine-readable signal, and provider records should be checked."
        : "Select China or global release to trigger explicit and implicit labeling notes.",
    },
    {
      title: "SAG-AFTRA AI principles",
      body: usesRealPerson(risk)
        ? "Digital replica use should require clear consent, compensation, specific purpose, and scope limits."
        : "Real-person performer controls are not triggered by the current synthetic-only posture.",
    },
    {
      title: "NIST AI RMF",
      body: "Govern, Map, Measure, and Manage controls structure the intake gate, risk scoring, review path, and incident response.",
    },
    {
      title: "C2PA / content provenance concepts",
      body: risk.watermark
        ? "Provenance or watermarking is selected; verify export persistence and platform-side detection."
        : "Add content credentials, metadata, watermarking, or export hashes for provenance resilience.",
    },
  ];
}

function renderRegulatoryContext(risk) {
  if (!regulatoryContext) return;
  regulatoryContext.replaceChildren();
  regulatoryItems(risk).forEach(({ title, body }) => {
    const card = document.createElement("article");
    const heading = document.createElement("strong");
    const copy = document.createElement("p");
    heading.textContent = title;
    copy.textContent = body;
    card.append(heading, copy);
    regulatoryContext.append(card);
  });
}

function scenarioProfile(risk) {
  const media = selectedMedia(risk);
  const regions = effectiveRegions(risk);
  return [
    { label: "Requester", value: labels.requesterType[risk.requesterType] || "Not selected" },
    { label: "Person depicted", value: labels.subjectType[risk.subjectType] || "Not selected" },
    { label: "Use case", value: labels.useCase[risk.useCase] || "Not selected" },
    { label: "Commercialization", value: labels.monetization[risk.monetization] || "Not selected" },
    { label: "Source media", value: media.length ? media.join(", ") : "None selected" },
    { label: "Release region", value: regions.length ? regions.join(", ") : "Not selected" },
    { label: "Authorization", value: labels.consentEvidence[risk.consentEvidence] || "Not selected" },
    { label: "Sensitive context", value: risk.sensitiveContext || "Not selected" },
  ];
}

function prioritize(items, fallback) {
  const uniqueItems = unique(items);
  return uniqueItems.length ? uniqueItems.slice(0, 5) : [fallback];
}

function controlGroups(memo) {
  return {
    consent: prioritize(
      [
        ...memo.gaps.filter((item) => /authorization|consent|license|commercial|territory|duration|secondary|revocation|compensation|training/i.test(item)),
        ...memo.controls.filter((item) => /authorization|license|consent|commercial|territory|duration|secondary|training/i.test(item)),
      ],
      "No consent-specific action has been triggered by the selected scenario."
    ),
    labeling: prioritize(
      [
        ...memo.labels,
        ...memo.controls.filter((item) => /label|watermark|metadata|provenance|disclosure|export|repost/i.test(item)),
      ],
      "Maintain visible disclosure and internal provenance records."
    ),
    release: prioritize(
      [
        ...memo.jurisdictions,
        ...memo.controls.filter((item) => /release|distribution|publication|global|political|parody|endorsement/i.test(item)),
      ],
      "No region-specific release condition has been selected yet."
    ),
    incident: prioritize(
      [
        ...memo.controls.filter((item) => /block|preserve|incident|safety|takedown|complaint|evidence/i.test(item)),
        ...memo.reviews,
      ],
      "Attach the standard complaint intake route and takedown SLA to the content ID."
    ),
  };
}

function regionRequirementItems(region, memo) {
  const items = memo.jurisdictions.filter((item) => item.startsWith(`${region}:`));
  if (items.length) return items.map((item) => item.replace(`${region}: `, ""));
  return ["Not selected for this release path."];
}

function renderJurisdictionMatrix(target, risk, memo) {
  const regions = effectiveRegions(risk);
  const cards = [
    { key: "EU", title: "European Union" },
    { key: "China", title: "China" },
    { key: "US", title: "United States" },
    { key: "Global", title: "Global release", sourceKey: "Global" },
  ];

  target.replaceChildren();
  cards.forEach(({ key, title, sourceKey }) => {
    const active = regions.includes(sourceKey || key) || (key === "Global" && regions.includes("Global release"));
    const card = document.createElement("article");
    card.className = active ? "jurisdiction-card active" : "jurisdiction-card";

    const status = document.createElement("span");
    status.textContent = active ? "In scope" : "Not selected";

    const heading = document.createElement("h4");
    heading.textContent = title;

    const list = document.createElement("ul");
    regionRequirementItems(key, memo).forEach((text) => {
      const item = document.createElement("li");
      item.textContent = text;
      list.append(item);
    });

    card.append(status, heading, list);
    target.append(card);
  });
}

function nextSteps(memo) {
  return prioritize(
    [
      ...memo.gaps,
      ...memo.reviews,
      ...memo.controls.filter((item) => /block|confirm|restrict|run|require|allow|reject|route/i.test(item)),
    ],
    "Proceed with standard synthetic-media labeling, audit logging, and release review."
  );
}

function displayRiskLevel(value) {
  if (!value || value === "Not assessed") return value;
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function requiredIntakeItems(risk) {
  const media = selectedMedia(risk);
  const regions = effectiveRegions(risk);
  return [
    { label: "Requester type", complete: Boolean(risk.requesterType), step: 0 },
    { label: "Person depicted", complete: Boolean(risk.subjectType), step: 0 },
    { label: "Source media selection", complete: media.length > 0 || risk.subjectType === "synthetic", step: 1 },
    { label: "Use case", complete: Boolean(risk.useCase), step: 2 },
    { label: "Commercialization", complete: Boolean(risk.monetization), step: 2 },
    { label: "Sensitive context", complete: Boolean(risk.sensitiveContext), step: 2 },
    { label: "Distribution region", complete: regions.length > 0, step: 2 },
    { label: "Authorization evidence", complete: Boolean(risk.consentEvidence), step: 3 },
  ];
}

function intakeCompletion(risk) {
  const items = requiredIntakeItems(risk);
  const completed = items.filter((item) => item.complete).length;
  return {
    items,
    completed,
    percent: Math.round((completed / items.length) * 100),
    ready: completed === items.length,
  };
}

function updateWorkflowProgress(risk) {
  const completion = intakeCompletion(risk);
  document.querySelectorAll("[data-step-index]").forEach((item) => {
    const index = Number(item.dataset.stepIndex);
    item.classList.toggle("active", index === currentStep);
    item.classList.toggle(
      "complete",
      index < currentStep ||
        (index < workflowSteps.length &&
          completion.items.filter((entry) => entry.step === index).every((entry) => entry.complete))
    );
  });
}

function setWorkflowStep(step) {
  currentStep = Math.max(0, Math.min(step, workflowSteps.length - 1));
  const risk = getScenario();

  document.querySelectorAll("[data-step]").forEach((panel) => {
    panel.hidden = Number(panel.dataset.step) !== currentStep;
  });

  updateWorkflowProgress(risk);

  stepTitle.textContent = workflowSteps[currentStep].title;
  stepCopy.textContent = workflowSteps[currentStep].copy;
  composerStepLabel.textContent = workflowSteps[currentStep].title;
  prevStepButton.disabled = currentStep === 0;
  nextStepButton.hidden = currentStep === workflowSteps.length - 1;
  generateReportButton.hidden = currentStep !== workflowSteps.length - 1;
}

function updateLiveEvaluation(risk, memo) {
  const completion = intakeCompletion(risk);
  generateReportButton.disabled = !completion.ready;

  liveDecision.textContent = decisionLabel(memo.decision);
  liveScore.textContent = memo.score;
  liveRiskLevel.textContent = displayRiskLevel(memo.riskLevel);
  liveMainBlocker.textContent = mainBlocker(memo);
  liveReviewerPath.textContent = memo.reviewer;
  evidenceReadiness.textContent = `${evidenceReadinessPercent(risk)}%`;
  riskSummaryCard.dataset.decision = memo.decision;

  renderPlainStatusList(
    triggeredRuleList,
    prioritize(memo.riskDrivers, "No triggered rules yet. Complete intake to evaluate the case.").slice(0, 6),
    "No triggered rules yet. Complete intake to evaluate the case."
  );
  renderStatusList(stepResultList, stepReviewResults(risk));
  renderEvidenceChecklist(risk);
  renderRiskRegisterPreview(risk);
  renderRegulatoryContext(risk);
}

function setWorkspaceTab(tab) {
  activeWorkspaceTab = tab;
  document.querySelectorAll("[data-workspace-tab]").forEach((button) => {
    const active = button.dataset.workspaceTab === tab;
    button.classList.toggle("active", active);
    button.setAttribute("aria-selected", String(active));
  });
  document.querySelectorAll("[data-workspace-panel]").forEach((panel) => {
    panel.dataset.mobileActive = panel.dataset.workspacePanel === tab ? "true" : "false";
  });
  document.body.dataset.workspaceTab = tab;
}

function showReport() {
  const risk = getScenario();
  const completion = intakeCompletion(risk);
  if (!completion.ready) {
    const firstMissing = completion.items.find((item) => !item.complete);
    if (firstMissing) setWorkflowStep(firstMissing.step);
    render();
    return;
  }

  reportGenerated = true;
  document.body.classList.add("report-generated");
  workflowShell.classList.add("report-mode");
  workflowMode.textContent = "Generated report";
  memoStatus.textContent = "Generated";
  reportStateCopy.textContent = "Generated memo based on the current intake.";
  document.querySelectorAll("[data-step-index]").forEach((item) => {
    item.classList.add("complete");
  });
  setWorkspaceTab("report");
  fullReportSection.scrollIntoView({ block: "start", behavior: "smooth" });
}

function showIntake() {
  reportGenerated = false;
  document.body.classList.remove("report-generated");
  workflowShell.classList.remove("report-mode");
  workflowMode.textContent = "Intake workspace";
  memoStatus.textContent = "Draft";
  reportStateCopy.textContent = "Generate a report from the intake workspace, then review the full memo here.";
  setWorkspaceTab("intake");
  setWorkflowStep(currentStep);
}

function render() {
  const risk = getScenario();
  const memo = assessScenario(risk);
  updateWorkflowProgress(risk);

  decisionPill.textContent =
    memo.decision === "conditional" ? "Approve with conditions" : memo.decision === "intake" ? "Intake incomplete" : memo.decision;
  decisionPill.className = `risk-pill ${memo.decision}`;
  resultPanel.dataset.decision = memo.decision;
  scoreValue.textContent = memo.score;
  resultTitle.textContent = memo.title;
  resultCopy.textContent = memo.summary;
  riskLevelText.textContent = displayRiskLevel(memo.riskLevel);
  reviewerPath.textContent = memo.reviewer;

  renderDefinitionList(sections.scenarioProfile, scenarioProfile(risk));
  renderList(sections.riskDrivers, prioritize(memo.riskDrivers, "No material risk finding has been generated yet."));
  renderList(sections.missingEvidence, prioritize(memo.gaps, "No material evidence gap has been generated yet."));
  const groups = controlGroups(memo);
  renderList(sections.consentControls, groups.consent);
  renderList(sections.labelControls, groups.labeling);
  renderList(sections.releaseControls, groups.release);
  renderList(sections.incidentControls, groups.incident);
  renderJurisdictionMatrix(sections.jurisdictionMatrix, risk, memo);
  renderList(sections.nextSteps, nextSteps(memo));
  renderList(sections.frameworks, memo.frameworks);
  renderList(sections.evidence, memo.evidence);
  updateLiveEvaluation(risk, memo);
}

function setCheckbox(field, value) {
  form.elements[field].checked = Boolean(value);
}

function applyPreset(name) {
  const preset = presets[name];
  if (!preset) return;

  [
    "requesterType",
    "subjectType",
    "useCase",
    "monetization",
    "sensitiveContext",
    "consentEvidence",
  ].forEach((field) => {
    form.elements[field].value = preset[field];
  });

  [
    "mediaFace",
    "mediaVoice",
    "mediaMotion",
    "mediaPerformance",
    "regionEu",
    "regionChina",
    "regionUs",
    "regionGlobal",
    "scopeCommercial",
    "scopeTraining",
    "scopeTerritory",
    "scopeDuration",
    "scopeSecondaryUse",
    "scopeRevocation",
    "scopeCompensation",
    "visibleLabel",
    "machineLabel",
    "watermark",
    "trainingUse",
  ].forEach((field) => setCheckbox(field, preset[field]));

  currentStep = workflowSteps.length - 1;
  showIntake();
  workflowMode.textContent = "Preset loaded";
  document.querySelectorAll("[data-preset]").forEach((button) => {
    button.classList.toggle("selected", button.dataset.preset === name);
  });
  render();
}

form.addEventListener("input", render);
form.addEventListener("change", render);

document.querySelectorAll("[data-preset]").forEach((button) => {
  button.addEventListener("click", () => applyPreset(button.dataset.preset));
});

prevStepButton.addEventListener("click", () => setWorkflowStep(currentStep - 1));
nextStepButton.addEventListener("click", () => setWorkflowStep(currentStep + 1));
generateReportButton.addEventListener("click", showReport);
viewFullReportButton.addEventListener("click", showReport);
editIntakeButton.addEventListener("click", showIntake);
document.querySelectorAll("[data-workspace-tab]").forEach((button) => {
  button.addEventListener("click", () => {
    const tab = button.dataset.workspaceTab;
    if (tab === "report" && !reportGenerated) {
      reportStateCopy.textContent = "No generated report yet. Complete intake and generate a report to lock the memo.";
    }
    setWorkspaceTab(tab);
  });
});

setWorkspaceTab("intake");
setWorkflowStep(0);
render();
