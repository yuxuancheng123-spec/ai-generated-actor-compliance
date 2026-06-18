const sensitiveContexts = new Set(["sexual", "political", "medical", "financial", "defamatory"]);

const presets = {
  prohibited: {
    contentType: "video",
    realPerson: true,
    authorized: false,
    publicFigure: true,
    minor: false,
    commercial: true,
    sensitiveContext: "none",
    trainingUse: false,
    aiLabeled: false,
  },
  medium: {
    contentType: "ad",
    realPerson: true,
    authorized: true,
    publicFigure: false,
    minor: false,
    commercial: true,
    sensitiveContext: "none",
    trainingUse: false,
    aiLabeled: true,
  },
  low: {
    contentType: "video",
    realPerson: false,
    authorized: false,
    publicFigure: false,
    minor: false,
    commercial: false,
    sensitiveContext: "none",
    trainingUse: false,
    aiLabeled: true,
  },
};

const form = document.querySelector("#risk-form");
const riskLevel = document.querySelector("#risk-level");
const scoreValue = document.querySelector("#score-value");
const resultTitle = document.querySelector("#result-title");
const resultCopy = document.querySelector("#result-copy");
const reasonList = document.querySelector("#reason-list");

function getScenario() {
  const data = new FormData(form);
  return {
    contentType: data.get("contentType"),
    realPerson: data.has("realPerson"),
    authorized: data.has("authorized"),
    publicFigure: data.has("publicFigure"),
    minor: data.has("minor"),
    commercial: data.has("commercial"),
    sensitiveContext: data.get("sensitiveContext"),
    trainingUse: data.has("trainingUse"),
    aiLabeled: data.has("aiLabeled"),
  };
}

function scoreScenario(risk) {
  const reasons = [];
  let score = 0;

  if (risk.realPerson) {
    score += 3;
    reasons.push("Uses or imitates a real person.");
  }

  if (risk.realPerson && !risk.authorized) {
    reasons.push("No verified authorization for real-person likeness or voice.");
    return { level: "prohibited", score, reasons };
  }

  if (risk.minor) {
    score += 4;
    reasons.push("Involves a child or minor.");
  }

  if (risk.publicFigure) {
    score += 3;
    reasons.push("Involves a public figure or celebrity.");
  }

  if (risk.commercial) {
    score += 2;
    reasons.push("Commercial or endorsement use.");
  }

  if (sensitiveContexts.has(risk.sensitiveContext)) {
    score += 4;
    reasons.push(`Sensitive context: ${risk.sensitiveContext}.`);
  }

  if (risk.trainingUse && !risk.authorized) {
    reasons.push("Training use without separate authorization.");
    return { level: "prohibited", score, reasons };
  }

  if (risk.trainingUse) {
    score += 3;
    reasons.push("Training, fine-tuning, or model improvement use.");
  }

  if (!risk.aiLabeled) {
    score += 2;
    reasons.push("Missing AI-generated or AI-modified content label.");
  }

  if (risk.minor && sensitiveContexts.has(risk.sensitiveContext)) {
    reasons.push("Minor plus sensitive context.");
    return { level: "prohibited", score, reasons };
  }

  if ((risk.sensitiveContext === "sexual" || risk.sensitiveContext === "defamatory") && risk.realPerson) {
    reasons.push("Real-person sexual or defamatory synthetic portrayal.");
    return { level: "prohibited", score, reasons };
  }

  if (score >= 9) return { level: "high", score, reasons };
  if (score >= 5) return { level: "medium", score, reasons };
  return { level: "low", score, reasons };
}

function resultMessage(level) {
  if (level === "prohibited") {
    return {
      title: "Generation should be blocked.",
      copy: "The scenario needs verified rights review before any synthetic media output is created or distributed.",
    };
  }

  if (level === "high") {
    return {
      title: "Escalate to human review.",
      copy: "The request may be allowed only with stronger authorization, labeling, and reviewer sign-off.",
    };
  }

  if (level === "medium") {
    return {
      title: "Proceed with controls.",
      copy: "The request can move forward with consent records, labels, audit logs, and publication checks.",
    };
  }

  return {
    title: "Low-risk workflow.",
    copy: "The request is likely suitable for standard synthetic media labeling and routine monitoring.",
  };
}

function render() {
  const risk = getScenario();
  const result = scoreScenario(risk);
  const message = resultMessage(result.level);

  riskLevel.textContent = result.level;
  riskLevel.className = `risk-pill ${result.level}`;
  scoreValue.textContent = result.score;
  resultTitle.textContent = message.title;
  resultCopy.textContent = message.copy;

  reasonList.replaceChildren();
  const reasons = result.reasons.length ? result.reasons : ["No elevated risk triggers selected."];
  reasons.forEach((reason) => {
    const item = document.createElement("li");
    item.textContent = reason;
    reasonList.append(item);
  });
}

function applyPreset(name) {
  const preset = presets[name];
  if (!preset) return;

  form.elements.contentType.value = preset.contentType;
  form.elements.sensitiveContext.value = preset.sensitiveContext;

  [
    "realPerson",
    "authorized",
    "publicFigure",
    "minor",
    "commercial",
    "trainingUse",
    "aiLabeled",
  ].forEach((field) => {
    form.elements[field].checked = preset[field];
  });

  render();
}

form.addEventListener("input", render);
form.addEventListener("change", render);

document.querySelectorAll("[data-preset]").forEach((button) => {
  button.addEventListener("click", () => applyPreset(button.dataset.preset));
});

render();
