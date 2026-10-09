/* Provenance chain + inbox helpers for the case workspace (EN).
   Derived only from the existing demo data in case-records.js and the rule engine in app.js. */

const PROV_ICONS = {
  source: '<path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm-7 8a7 7 0 0 1 14 0" />',
  consent: '<path d="M7 3h7l4 4v14H7z" /><path d="M14 3v4h4M10 13h5M10 17h3" />',
  generation: '<path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M18 6l-2.5 2.5M8.5 15.5 6 18" />',
  labeling: '<path d="M3 12V4h8l10 10-8 8L3 12Z" /><circle cx="7.5" cy="8.5" r="1.3" />',
  review: '<path d="M12 3 4 6v6c0 4.5 3.4 8 8 9 4.6-1 8-4.5 8-9V6l-8-3Z" /><path d="m9 12 2 2 4-4" />',
  approval: '<path d="M4 7h16M4 12h16M4 17h10" /><path d="m16 17 2 2 3-4" />',
  publish: '<path d="M4 12h12M12 6l6 6-6 6" /><path d="M20 4v16" />',
  doc: '<path d="M7 3h7l4 4v14H7z" /><path d="M14 3v4h4" />',
};

function provIcon(name, size = 16) {
  return `<svg class="prov-icon" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${PROV_ICONS[name] || ""}</svg>`;
}

function provEl(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function personInitials(label) {
  const words = String(label || "?").replace(/[^A-Za-z ]/g, " ").split(/\s+/).filter(Boolean);
  return (words.length > 1 ? words[0][0] + words[1][0] : (words[0] || "?").slice(0, 2)).toUpperCase();
}

/* Neutral generated placeholder: initials on a soft tile, explicitly labelled as demo. */
function demoThumb(caseRecord, size = "md") {
  const wrap = provEl("span", `demo-thumb ${size}`);
  wrap.setAttribute("aria-hidden", "true");
  wrap.append(provEl("span", "demo-thumb-initials", personInitials(caseRecord.representedPerson)));
  wrap.append(provEl("span", "demo-thumb-tag", "demo"));
  return wrap;
}

const EVIDENCE_STATUS = {
  fail: ["Missing", "Rejected"],
  warn: ["Requested", "Under Review", "Submitted", "Pending"],
};

function evidenceState(status) {
  if (EVIDENCE_STATUS.fail.includes(status)) return "fail";
  if (EVIDENCE_STATUS.warn.includes(status)) return "warn";
  if (status === "Accepted") return "ok";
  return "info";
}

function worstState(states) {
  if (states.includes("fail")) return "fail";
  if (states.includes("warn")) return "warn";
  if (states.includes("ok")) return "ok";
  return "info";
}

function activityWhere(caseRecord, test) {
  return caseRecord.activity.filter(test).sort((a, b) => b[0].localeCompare(a[0]))[0];
}

function openBlockingFindings(caseRecord, pattern) {
  return caseRecord.findings.filter((finding) => pattern.test(finding[2]) && !["Resolved", "Closed", "Risk Accepted"].includes(finding[7]));
}

function yesNo(value) { return value ? "Yes" : "No"; }

function buildProvenanceChain(caseRecord, intake = caseRecord.intake) {
  const memo = assessScenario(intake);
  const evidence = caseRecord.evidence;
  const pick = (pattern) => evidence.filter((item) => pattern.test(item[1]));
  const created = activityWhere(caseRecord, (entry) => entry[2] === "Case created");
  const media = [["mediaFace", "Face / likeness"], ["mediaVoice", "Voice"], ["mediaMotion", "Body motion"], ["mediaPerformance", "Prior performance"]].filter(([key]) => intake[key]).map(([, label]) => label);
  const scopes = [["scopeCommercial", "Commercial"], ["scopeTraining", "Training"], ["scopeTerritory", "Territory"], ["scopeDuration", "Duration"], ["scopeSecondaryUse", "Secondary use"], ["scopeRevocation", "Revocation"], ["scopeCompensation", "Compensation"]];
  const regions = [["regionEu", "EU"], ["regionChina", "China"], ["regionUs", "US"], ["regionGlobal", "Global"]].filter(([key]) => intake[key]).map(([, label]) => label);
  const nodes = [];
  const used = new Set();
  const take = (items) => { items.forEach((item) => used.add(item[0])); return items; };

  // 1. Source performer
  const sourceEvidence = take(pick(/identity|verification/i));
  nodes.push({
    key: "source", title: "Source performer", icon: "source", by: "Submitted by",
    who: created ? created[1] : "Not recorded", when: created ? created[0] : "",
    rows: [["Represented", caseRecord.representedPerson], ["Source media", media.join(", ") || "None selected"], ["Requested by", labels.requesterType[intake.requesterType] || "Not selected"]],
    evidence: sourceEvidence, findings: openBlockingFindings(caseRecord, /protected subjects/i),
  });

  // 2. Consent / authorization
  const consentEvidence = take(pick(/authori[sz]ation|agreement|clause|permission|rider/i));
  const covered = scopes.filter(([key]) => intake[key]).map(([, label]) => label);
  const uncovered = scopes.filter(([key]) => !intake[key]).map(([, label]) => label);
  const consentActivity = activityWhere(caseRecord, (entry) => consentEvidence.some((item) => item[0] === entry[3]));
  nodes.push({
    key: "consent", title: "Consent & authorization", icon: "consent",
    by: consentActivity ? "Last updated by" : "Evidence owner",
    who: consentActivity ? consentActivity[1] : consentEvidence[0] ? consentEvidence[0][4] : "Not recorded",
    when: consentActivity ? consentActivity[0] : (consentEvidence.map((item) => item[6]).filter((date) => date && date !== "-").sort().pop() || ""),
    rows: [["Authorization", labels.consentEvidence[intake.consentEvidence] || "Not selected"], ["Scope covered", covered.join(", ") || "None"], ["Not covered", uncovered.join(", ") || "None"]],
    evidence: consentEvidence, findings: openBlockingFindings(caseRecord, /rights clearance|commercial use|model training/i),
    forced: !intake.consentEvidence ? { state: "info", note: "Authorization evidence not selected yet." }
      : realPersonSubjects.has(intake.subjectType) && !verifiedConsentEvidence.has(intake.consentEvidence) ? { state: "fail", note: "No verified authorization for a real person." } : null,
  });

  // 3. AI actor generation
  const generationEvidence = take(pick(/lineage|vendor/i));
  nodes.push({
    key: "generation", title: "AI actor generation", icon: "generation", by: "Recorded by",
    who: generationEvidence[0] ? generationEvidence[0][4] : "Not recorded", when: generationEvidence[0] && generationEvidence[0][6] !== "-" ? generationEvidence[0][6] : "",
    rows: [["Intended use", `${labels.useCase[intake.useCase] || "Not selected"} · ${labels.monetization[intake.monetization] || "Not selected"}`], ["Sensitive context", intake.sensitiveContext ? titleCase(intake.sensitiveContext) : "Not selected"], ["Training use", yesNo(intake.trainingUse)], ["Generation tool", "Not recorded in demo data"]],
    evidence: generationEvidence, findings: openBlockingFindings(caseRecord, /vendor/i),
    forced: memo.decision === "reject" ? { state: "fail", note: "Generation blocked by a hard-stop rule." } : null,
  });

  // 4. Labeling & provenance
  const labelEvidence = take(pick(/disclosure|metadata|provenance record|output provenance/i));
  const missingLabels = [["visibleLabel", "Visible AI label"], ["machineLabel", "Machine-readable metadata"], ["watermark", "Watermark / provenance"]].filter(([key]) => !intake[key]).map(([, label]) => label);
  const labelActivity = labelEvidence.filter((item) => item[6] !== "-").sort((a, b) => b[6].localeCompare(a[6]))[0];
  nodes.push({
    key: "labeling", title: "Labeling & provenance", icon: "labeling", by: "Submitted by",
    who: labelActivity ? labelActivity[4] : "Not recorded", when: labelActivity ? labelActivity[6] : "",
    rows: [["Visible label", yesNo(intake.visibleLabel)], ["Machine metadata", yesNo(intake.machineLabel)], ["Watermark", yesNo(intake.watermark)]],
    evidence: labelEvidence, findings: [],
    softGap: missingLabels.length ? `Not planned: ${missingLabels.join(", ")}.` : "",
  });

  // 5. Risk review
  const reviewEvidence = take(evidence.filter((item) => !used.has(item[0])));
  const systemRun = activityWhere(caseRecord, (entry) => entry[1] === "System");
  const remainingFindings = caseRecord.findings.filter((finding) => !nodes.some((node) => node.findings.includes(finding)) && !["Resolved", "Closed", "Risk Accepted"].includes(finding[7]));
  nodes.push({
    key: "review", title: "Risk review", icon: "review", by: "Run by",
    who: systemRun ? "Rules engine" : "Not run", when: systemRun ? systemRun[0] : "",
    rows: [["Decision", memo.title], ["Risk", `${displayRiskLevel(memo.riskLevel)} · score ${memo.score}`], ["Rules triggered", String(memo.riskDrivers.length)]],
    evidence: reviewEvidence, findings: remainingFindings,
    forced: memo.decision === "intake" ? { state: "info", note: "Complete the intake to run the assessment." } : memo.decision === "reject" ? { state: "fail", note: "Hard stop: request rejected before generation." } : memo.decision === "escalate" ? { state: "warn", note: "Escalated to human review." } : memo.decision === "conditional" ? { state: "warn", note: "Approved only with conditions." } : null,
  });

  // 6. Approval gates
  const approvalStates = caseRecord.approvals.map((approval) => /Blocked|Rejected/.test(approval[2]) ? "fail" : /Pending|Not Started/.test(approval[2]) ? "warn" : "ok");
  const lastApproval = caseRecord.approvals.filter((approval) => approval[4] && approval[4] !== "-").sort((a, b) => b[4].localeCompare(a[4]))[0];
  const firstOpenGate = caseRecord.approvals.find((approval) => /Blocked|Rejected|Pending|Not Started/.test(approval[2]));
  nodes.push({
    key: "approval", title: "Approval", icon: "approval", by: "Last sign-off",
    who: lastApproval ? lastApproval[1] : "Not recorded", when: lastApproval ? lastApproval[4] : "",
    gates: caseRecord.approvals, evidence: [], findings: [],
    forced: { state: worstState(approvalStates), note: firstOpenGate ? `${firstOpenGate[0]}: ${firstOpenGate[2]}${firstOpenGate[3] && firstOpenGate[3] !== "-" ? ` (${firstOpenGate[3]})` : ""}.` : "All gates complete." },
  });

  // 7. Publish
  const finalGate = caseRecord.approvals.find((approval) => approval[0] === "Final Approver");
  const cleared = finalGate && finalGate[2] === "Approved";
  nodes.push({
    key: "publish", title: "Publish", icon: "publish", by: "Final approver",
    who: finalGate ? finalGate[1] : "Not recorded", when: cleared ? finalGate[4] : "",
    rows: [["Regions", regions.join(", ") || "None selected"], ["Channel", labels.monetization[intake.monetization] || "Not selected"], ["Release", cleared ? "Cleared" : "Not released"]],
    evidence: [], findings: [],
    forced: cleared ? { state: "ok", note: "Cleared for release." } : { state: "fail", note: finalGate && finalGate[3] !== "-" ? `Release blocked: ${finalGate[3]}.` : "Release blocked until all gates clear." },
  });

  nodes.forEach((node) => {
    const evidenceStates = node.evidence.map((item) => evidenceState(item[3]));
    const findingStates = node.findings.map((finding) => (finding[4] ? "fail" : "warn"));
    let state = worstState([...evidenceStates, ...findingStates]);
    if (node.softGap && state !== "fail") state = "warn";
    if (node.forced) state = node.forced.state === "ok" ? worstState([state === "info" ? "ok" : state, "ok"]) : worstState([state, node.forced.state]);
    if (node.key === "approval" || node.key === "publish") state = node.forced.state;
    const incomplete = (node.key === "source" && !intake.subjectType) || (node.key === "consent" && !intake.consentEvidence);
    if (state === "info" && !node.evidence.length && !node.findings.length && !(node.forced && node.forced.state === "info")) state = node.key === "generation" || incomplete ? "info" : "ok";
    node.state = state;
    const missing = node.evidence.filter((item) => evidenceState(item[3]) === "fail");
    node.blocker = node.findings.find((finding) => finding[4])
      ? node.findings.find((finding) => finding[4])[1]
      : missing.length ? `${missing.map((item) => item[1]).join(", ")} ${missing.length > 1 ? "are" : "is"} missing.`
      : node.forced && node.forced.state !== "ok" ? node.forced.note
      : node.softGap || "";
  });

  const blockedAt = nodes.slice(0, -1).find((node) => node.state === "fail") || (!cleared ? nodes.slice(0, -1).find((node) => node.state === "warn") : null);
  return { nodes, memo, cleared, blockedAt, verified: nodes.filter((node) => node.state === "ok").length };
}

const STATE_LABEL = { ok: "Verified", warn: "Pending", fail: "Blocked", info: "No record" };

function evidenceChip(item) {
  const chip = document.createElement("button");
  const state = evidenceState(item[3]);
  chip.type = "button";
  chip.className = `doc-chip ${state}`;
  chip.dataset.openEvidence = item[0];
  chip.innerHTML = `${provIcon("doc", 13)}<span class="doc-chip-name"></span><span class="doc-chip-status"></span>`;
  chip.querySelector(".doc-chip-name").textContent = item[1];
  chip.querySelector(".doc-chip-status").textContent = item[3];
  chip.setAttribute("aria-label", `Open evidence ${item[0]}: ${item[1]}, ${item[3]}`);
  return chip;
}

function provenanceCard(node, index, downstream, condensed = false) {
  const compact = condensed && (node.state === "ok" || node.state === "info");
  const li = provEl("li", `prov-node ${node.state}${downstream ? " downstream" : ""}${compact ? " compact" : ""}`);
  if (!condensed) li.id = `prov-${node.key}`;
  const rail = provEl("div", "prov-rail");
  const dot = provEl("span", "prov-dot");
  dot.innerHTML = provIcon(node.icon, 15);
  rail.append(dot);
  const side = provEl("div", "prov-when");
  side.append(provEl("span", "prov-step", `Step ${String(index + 1).padStart(2, "0")}`));
  if (node.when) {
    const [day, time] = node.when.split(" ");
    side.append(provEl("time", "prov-date", dateLabel(day)));
    if (time) side.append(provEl("span", "prov-time", time));
  } else {
    side.append(provEl("span", "prov-time", "No timestamp"));
  }
  const card = provEl("article", "prov-card");
  const head = provEl("header", "prov-head");
  const titleWrap = provEl("div");
  titleWrap.append(provEl("h3", "", node.title));
  const meta = provEl("p", "prov-meta");
  meta.append(`${node.by || "By"} `, provEl("strong", "", node.who));
  if (compact) titleWrap.append(provEl("span", "prov-oneline", nodeSummary(node)));
  else titleWrap.append(meta);
  head.append(titleWrap, provEl("span", `prov-state ${node.state}`, STATE_LABEL[node.state]));
  card.append(head);
  if (compact) { li.append(side, rail, card); return li; }

  if (node.rows) {
    const dl = provEl("dl", "prov-rows");
    node.rows.forEach(([term, value]) => { const row = provEl("div"); row.append(provEl("dt", "", term), provEl("dd", "", value)); dl.append(row); });
    card.append(dl);
  }
  if (node.gates) {
    const gates = provEl("ul", "prov-gates");
    node.gates.forEach((gate) => {
      const state = /Blocked|Rejected/.test(gate[2]) ? "fail" : /Pending|Not Started/.test(gate[2]) ? "warn" : "ok";
      const item = provEl("li", state);
      item.append(provEl("span", "gate-dot"), provEl("span", "gate-name", gate[0]), provEl("span", "gate-person", gate[1]), provEl("span", "gate-status", gate[2]));
      gates.append(item);
    });
    card.append(gates);
  }
  if (node.evidence.length) {
    const chips = provEl("div", "prov-docs");
    node.evidence.forEach((item) => chips.append(evidenceChip(item)));
    card.append(chips);
  }
  if (node.blocker && node.state !== "ok") {
    const blocker = provEl("p", `prov-blocker ${node.state}`);
    blocker.append(provEl("strong", "", node.state === "fail" ? "Blocker" : "Open"), provEl("span", "", node.blocker));
    card.append(blocker);
  }
  li.append(side, rail, card);
  return li;
}

function nodeSummary(node) {
  if (node.gates) return `${node.gates.length} gates · last sign-off ${node.who}`;
  if (node.key === "labeling") {
    const planned = (node.rows || []).filter(([, value]) => value === "Yes").map(([label]) => label);
    return planned.length ? `${planned.join(" · ")} planned` : "No label planned";
  }
  return (node.rows || []).slice(0, 2).map(([, value]) => value).join(" · ");
}

/* ---------- Condensed report (shared shape with the ZH report) ---------- */
const INTAKE_RESTATEMENT_EN = /^(Requester|Subject|Use case|Source media|Distribution region)[: ]/i;

function reportReasons(chain, memo) {
  const blockers = ["fail", "warn"].flatMap((state) => chain.nodes
    .filter((node) => node.state === state && ["source", "consent", "generation", "labeling"].includes(node.key) && node.blocker)
    .map((node) => `${node.title}: ${node.blocker}`));
  const consentBlocked = chain.nodes.some((node) => node.key === "consent" && node.state === "fail");
  const drivers = memo.riskDrivers.filter((item) => !INTAKE_RESTATEMENT_EN.test(item) && !(consentBlocked && /verified authori[sz]ation/i.test(item)));
  let reasons = unique([...blockers, ...drivers]);
  if (reasons.length < 2) {
    const positives = chain.nodes.filter((node) => node.state === "ok" && ["consent", "labeling"].includes(node.key))
      .map((node) => (node.key === "consent" ? `Authorization verified: ${node.rows[0][1]}.` : "Visible label, machine-readable metadata, and watermark are all planned."));
    reasons = unique([...reasons, ...positives, ...memo.reviews.filter((item) => !/^No enhanced/i.test(item))]);
  }
  return reasons.slice(0, 4);
}

const ACTION_STAGES_EN = ["Consent", "Generation", "Labeling", "Release", "Review"];
const CANONICAL_ACTIONS_EN = [
  { key: "global", stage: "Release", test: /^Global[: ]|global distribution/i, text: () => "Apply the strictest selected-region consent and labeling controls for global release.", blocking: () => false },
  { key: "visible", stage: "Labeling", test: /visible label|disclos|explicit visible/i, text: (r) => (r.visibleLabel ? "Confirm the visible AI label (AI-generated / digital replica / synthetic voice) ships with the release." : "Add a visible AI label (not planned yet)."), blocking: (r) => !r.visibleLabel },
  { key: "machine", stage: "Labeling", test: /implicit|machine-readable/i, text: (r) => (r.machineLabel ? "Confirm machine-readable labeling (metadata or platform signal) stays attached." : "Add machine-readable labeling (not planned yet)."), blocking: (r) => !r.machineLabel },
  { key: "provenance", stage: "Labeling", test: /watermark|provenance|content credentials|hash|persist/i, text: (r) => (r.watermark ? "Confirm watermark / provenance stays detectable after export and repost." : "Add a persistent watermark or content credentials (not planned yet)."), blocking: (r) => !r.watermark },
  { key: "records", stage: "Release", test: /service-provider records/i, text: () => "Keep records linking generated content, label state, and publication/export events.", blocking: () => false },
  { key: "publicity", stage: "Review", test: /right of publicity|state and sector/i, text: () => "Assess right-of-publicity, deceptive-endorsement, and sensitive-context risk.", blocking: () => false },
];
const REGION_PREFIX_EN = /^(EU|China|US|Global)(?: release path)?:?\s*/;
const REGION_NAME_EN = { EU: "EU", China: "China", US: "US", Global: "Global" };

function reportActions(intake, memo) {
  const actions = new Map();
  const add = (key, stage, text, priority, region) => {
    const existing = actions.get(key);
    if (existing) { existing.priority = Math.min(existing.priority, priority); if (region) existing.regions.add(region); return; }
    actions.set(key, { stage, text, priority, regions: new Set(region ? [region] : []) });
  };
  const regionOf = (item) => { const match = item.match(/^(EU|China|US|Global)\b/); return match ? REGION_NAME_EN[match[1]] : ""; };
  const canonical = (item, basePriority) => {
    const rule = CANONICAL_ACTIONS_EN.find((entry) => entry.test.test(item));
    if (!rule) return false;
    add(rule.key, rule.stage, rule.text(intake), rule.blocking(intake) ? 2 : basePriority, regionOf(item));
    return true;
  };
  const hardStop = /^(Block generation|Reject)/i;
  memo.controls.forEach((item) => { if (hardStop.test(item)) add(item, "Generation", item, 0); });
  memo.gaps.filter((item) => !/^No material/i.test(item)).forEach((item) => add(item, /guardian|child/i.test(item) ? "Review" : "Consent", item, 1));
  [...memo.jurisdictions, ...memo.labels].forEach((item) => { if (!canonical(item, 5)) add(item, "Release", item.replace(REGION_PREFIX_EN, ""), 5, regionOf(item)); });
  memo.reviews.filter((item) => !/^No enhanced/i.test(item)).forEach((item) => add(item, "Review", item, 3));
  memo.controls.forEach((item) => {
    if (hardStop.test(item) || canonical(item, 5)) return;
    const stage = /training/i.test(item) ? "Generation" : /license|commercial use|authori[sz]ation/i.test(item) ? "Consent" : /monetization|endorsement|parody|political/i.test(item) ? "Release" : "Review";
    add(item, stage, item, 4);
  });
  return [...actions.values()].sort((a, b) => a.priority - b.priority).slice(0, 6);
}

function renderActionGroups(target, actions, stages, emptyText) {
  if (!target) return;
  target.replaceChildren();
  if (!actions.length) { target.append(provEl("p", "empty-note", emptyText)); return; }
  stages.forEach((stage) => {
    const items = actions.filter((action) => action.stage === stage);
    if (!items.length) return;
    const group = provEl("div", "action-group");
    group.append(provEl("h4", "", stage));
    const list = provEl("ul", "action-list");
    items.forEach((action) => {
      const li = provEl("li", action.priority <= 2 ? "blocking" : "");
      li.append(provEl("span", "action-text", action.text));
      if (action.regions.size) {
        const chips = provEl("span", "region-chips");
        action.regions.forEach((region) => chips.append(provEl("span", "region-chip", region)));
        li.append(chips);
      }
      list.append(li);
    });
    group.append(list);
    target.append(group);
  });
}

function renderProvenanceChain() {
  const list = document.querySelector("#prov-chain");
  if (!list || !activeCase) return;
  const chain = buildProvenanceChain(activeCase, getScenario());
  const failIndex = chain.nodes.findIndex((node) => node.state === "fail");
  list.replaceChildren(...chain.nodes.map((node, index) => provenanceCard(node, index, failIndex >= 0 && index > failIndex)));
  const reportChain = document.querySelector("#report-prov-chain");
  if (reportChain) reportChain.replaceChildren(...chain.nodes.map((node, index) => provenanceCard(node, index, failIndex >= 0 && index > failIndex, true)));
  const reasonList = document.querySelector("#risk-driver-list");
  if (reasonList) {
    const reasons = chain.memo.decision === "intake" ? [chain.memo.summary] : reportReasons(chain, chain.memo);
    reasonList.replaceChildren(...reasons.map((text) => provEl("li", "", text)));
  }
  renderActionGroups(document.querySelector("#action-groups"), reportActions(getScenario(), chain.memo), ACTION_STAGES_EN, "Continue with standard labeling, audit logging, and release review.");

  const banner = document.querySelector("#publish-banner");
  if (banner) {
    banner.className = `publish-banner ${chain.cleared ? "ok" : "fail"}`;
    const title = banner.querySelector("#publish-banner-title");
    const link = banner.querySelector("#publish-banner-link");
    if (chain.cleared) {
      title.textContent = "Cleared for release";
      link.hidden = true;
    } else {
      title.textContent = chain.blockedAt ? `Publish blocked at step ${chain.nodes.indexOf(chain.blockedAt) + 1} · ${chain.blockedAt.title}` : "Publish blocked";
      link.hidden = !chain.blockedAt;
      if (chain.blockedAt) link.href = `#prov-${chain.blockedAt.key}`;
    }
    const verified = banner.querySelector("#publish-banner-count");
    if (verified) verified.textContent = `${chain.verified} of ${chain.nodes.length} links verified`;
  }
}

/* Inbox row for the case list */
function crBadge(chain) {
  const state = chain.cleared ? "ok" : chain.blockedAt && chain.blockedAt.state === "fail" ? "fail" : "warn";
  const badge = provEl("span", `cr-badge ${state}`, "cr");
  badge.title = `Provenance: ${chain.verified} of ${chain.nodes.length} links verified`;
  return badge;
}

function chainStrip(chain) {
  const strip = provEl("span", "chain-strip");
  strip.setAttribute("aria-label", `Provenance chain: ${chain.verified} of ${chain.nodes.length} verified`);
  chain.nodes.forEach((node) => { const seg = provEl("span", node.state); seg.title = `${node.title}: ${STATE_LABEL[node.state]}`; strip.append(seg); });
  return strip;
}

function inboxRow(caseRecord) {
  const chain = buildProvenanceChain(caseRecord);
  const li = provEl("li", "inbox-item");
  const link = provEl("a", "inbox-row");
  link.href = `#/cases/${caseRecord.id}/overview`;
  const thumb = provEl("span", "inbox-thumb");
  thumb.append(demoThumb(caseRecord), crBadge(chain));
  const main = provEl("span", "inbox-main");
  main.append(provEl("strong", "inbox-title", caseRecord.title), provEl("span", "inbox-sub", `${caseRecord.id} · ${caseRecord.representedPerson} · ${caseRecord.owner}`));
  const status = provEl("span", "inbox-status");
  const where = provEl("span", `inbox-where ${chain.cleared ? "ok" : "fail"}`, chain.cleared ? "Cleared for release" : chain.blockedAt ? `Blocked at ${chain.blockedAt.title}` : "Publish blocked");
  status.append(where, chainStrip(chain));
  const side = provEl("span", "inbox-side");
  side.append(statusBadge(`${titleCase(caseRecord.riskLevel)} risk`), provEl("span", "inbox-due", `Due ${dateLabel(caseRecord.dueDate)}`));
  link.append(thumb, main, status, side);
  li.append(link);
  return li;
}
