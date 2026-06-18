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
const decisionPill = document.querySelector("#decision-pill");
const scoreValue = document.querySelector("#score-value");
const resultTitle = document.querySelector("#result-title");
const resultCopy = document.querySelector("#result-copy");
const riskLevelText = document.querySelector("#risk-level-text");
const reviewerPath = document.querySelector("#reviewer-path");

const sections = {
  riskDrivers: document.querySelector("#risk-driver-list"),
  controls: document.querySelector("#control-list"),
  labels: document.querySelector("#label-list"),
  gaps: document.querySelector("#gap-list"),
  reviews: document.querySelector("#review-list"),
  frameworks: document.querySelector("#framework-list"),
  evidence: document.querySelector("#evidence-list"),
};

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

function addLabelRequirements(risk, labelsOut, controls, frameworks) {
  const realPerson = usesRealPerson(risk);
  const regions = effectiveRegions(risk);

  if (realPerson || risk.subjectType === "synthetic") {
    labelsOut.push("Apply a visible label such as AI-generated, AI-modified, digital replica, or synthetic voice.");
  }

  if (regions.includes("EU") || regions.includes("Global release")) {
    frameworks.push("EU AI Act Article 50: transparency disclosure for AI-generated or manipulated audio/video/image content.");
    if (!risk.visibleLabel) labelsOut.push("EU release path requires a viewer-facing AI disclosure before publication.");
  }

  if (regions.includes("China") || regions.includes("Global release")) {
    frameworks.push("China AI synthetic content labeling rules: explicit visible labels plus implicit machine-readable signals.");
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
  let score = 0;
  let decision = "approve";
  const riskDrivers = [];
  const controls = [];
  const labelsOut = [];
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

  riskDrivers.push(`Requester: ${labels.requesterType[risk.requesterType]}.`);
  riskDrivers.push(`Subject: ${labels.subjectType[risk.subjectType]}.`);
  riskDrivers.push(`Use case: ${labels.useCase[risk.useCase]} / ${labels.monetization[risk.monetization]}.`);
  if (media.length) riskDrivers.push(`Source media includes ${media.join(", ")}.`);
  if (regions.length) riskDrivers.push(`Distribution region: ${regions.join(", ")}.`);

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

  if (risk.sensitiveContext !== "none") {
    score += 4;
    riskDrivers.push(`Sensitive context selected: ${risk.sensitiveContext}.`);
    reviews.push("Sensitive context requires human review before generation or publication.");
  }

  if (realPerson && ["sexual", "defamatory"].includes(risk.sensitiveContext)) {
    decision = "reject";
    controls.push("Reject real-person sexual or defamatory synthetic portrayal and route to incident/safety queue if uploaded content exists.");
  }

  if (risk.subjectType === "minor" && risk.sensitiveContext !== "none") {
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
      risk.sensitiveContext !== "none" ||
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

  const riskLevel = decision === "reject" ? "prohibited" : score >= 9 ? "high" : score >= 5 ? "medium" : "low";
  const title = {
    reject: "Reject before generation",
    escalate: "Escalate to human review",
    conditional: "Approve with conditions",
    approve: "Approve standard workflow",
  }[decision];
  const reviewer = {
    reject: "Block and preserve evidence",
    escalate: "Enhanced human review",
    conditional: "Release only after controls are satisfied",
    approve: "Standard labeling and audit logging",
  }[decision];
  const summary = {
    reject: "The request cannot proceed until verified authorization and prohibited-use concerns are resolved.",
    escalate: "The request may be permissible, but the risk profile requires human reviewer sign-off before release.",
    conditional: "The request can proceed only after specific controls, labels, or license-scope gaps are closed.",
    approve: "The request fits the lower-risk path with ordinary synthetic-media labeling and audit logging.",
  }[decision];

  return {
    decision,
    score,
    riskLevel,
    title,
    reviewer,
    summary,
    riskDrivers: unique(riskDrivers),
    controls: unique(controls.length ? controls : ["Apply standard pre-publication moderation, label verification, and audit logging."]),
    labels: unique(labelsOut.length ? labelsOut : ["Maintain visible AI disclosure and internal content provenance record."]),
    gaps: unique(gaps.length ? gaps : ["No material authorization gaps detected from the selected fields."]),
    reviews: unique(reviews.length ? reviews : ["No enhanced human review trigger selected."]),
    frameworks: unique(frameworks),
    evidence: unique(evidence),
  };
}

function renderList(target, items) {
  target.replaceChildren();
  items.forEach((text) => {
    const item = document.createElement("li");
    item.textContent = text;
    target.append(item);
  });
}

function render() {
  const risk = getScenario();
  const memo = assessScenario(risk);

  decisionPill.textContent = memo.decision === "conditional" ? "Approve with conditions" : memo.decision;
  decisionPill.className = `risk-pill ${memo.decision}`;
  scoreValue.textContent = memo.score;
  resultTitle.textContent = memo.title;
  resultCopy.textContent = memo.summary;
  riskLevelText.textContent = memo.riskLevel;
  reviewerPath.textContent = memo.reviewer;

  renderList(sections.riskDrivers, memo.riskDrivers);
  renderList(sections.controls, memo.controls);
  renderList(sections.labels, memo.labels);
  renderList(sections.gaps, memo.gaps);
  renderList(sections.reviews, memo.reviews);
  renderList(sections.frameworks, memo.frameworks);
  renderList(sections.evidence, memo.evidence);
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

  render();
}

form.addEventListener("input", render);
form.addEventListener("change", render);

document.querySelectorAll("[data-preset]").forEach((button) => {
  button.addEventListener("click", () => applyPreset(button.dataset.preset));
});

render();
