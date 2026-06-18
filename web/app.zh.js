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
    creator: "个人创作者",
    brand: "品牌或广告主",
    production: "制作公司",
    performer: "演员授权自己的数字分身",
  },
  subjectType: {
    publicFigure: "名人或公众人物",
    ordinaryPerson: "普通第三人",
    self: "上传者本人",
    performer: "签约演员",
    politician: "政治人物",
    minor: "儿童或未成年人",
    synthetic: "完全合成角色",
  },
  useCase: {
    shortDrama: "短剧情节",
    advertisement: "广告",
    virtualInfluencer: "虚拟网红内容",
    fanContent: "粉丝内容",
    parody: "戏仿或讽刺",
    politicalMessage: "政治信息",
  },
  monetization: {
    paidAd: "付费广告或代言",
    publicPost: "公开发布",
    draft: "仅内部草稿",
    resale: "授权或转售",
  },
  consentEvidence: {
    "": "未选择",
    none: "无授权证据",
    selfAttestation: "上传者自我声明",
    uploadedContract: "已上传合同",
    verifiedPortal: "已验证演员门户",
    performerAgreement: "演员AI数字分身协议",
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
const workflowShell = document.querySelector("#demo");
const intakeView = document.querySelector("#intake-view");
const reportView = document.querySelector("#report-view");
const workflowMode = document.querySelector("#workflow-mode");
const stepTitle = document.querySelector("#step-title");
const stepCopy = document.querySelector("#step-copy");
const prevStepButton = document.querySelector("#prev-step");
const nextStepButton = document.querySelector("#next-step");
const generateReportButton = document.querySelector("#generate-report");
const editIntakeButton = document.querySelector("#edit-intake");
const completionScore = document.querySelector("#completion-score");
const completionBar = document.querySelector("#completion-bar");
const completionCopy = document.querySelector("#completion-copy");
const missingList = document.querySelector("#missing-list");
const intakeProfile = document.querySelector("#intake-profile");
const decisionPill = document.querySelector("#decision-pill");
const scoreValue = document.querySelector("#score-value");
const resultTitle = document.querySelector("#result-title");
const resultCopy = document.querySelector("#result-copy");
const riskLevelText = document.querySelector("#risk-level-text");
const reviewerPath = document.querySelector("#reviewer-path");
const resultPanel = document.querySelector(".result-panel");

const sections = {
  riskDrivers: document.querySelector("#risk-driver-list"),
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
    title: "请求背景",
    copy: "确认谁在提交审核请求，以及内容中描绘的是谁。",
  },
  {
    title: "源素材",
    copy: "选择用于生成内容的脸部、声音、动作或既有表演素材。",
  },
  {
    title: "用途与分发",
    copy: "定义发布目的、商业化方式、敏感语境和发布地区。",
  },
  {
    title: "授权证据",
    copy: "记录被描绘人或演员的授权材料和许可范围。",
  },
  {
    title: "平台控制",
    copy: "在生成报告前确认标识、来源证明、水印和训练用途控制。",
  },
];

let currentStep = 0;

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
  if (risk.mediaFace) media.push("脸部或肖像");
  if (risk.mediaVoice) media.push("声音");
  if (risk.mediaMotion) media.push("身体动作");
  if (risk.mediaPerformance) media.push("既有表演片段");
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

function displayRegion(region) {
  return {
    EU: "欧盟",
    China: "中国",
    US: "美国",
    "Global release": "全球发布",
  }[region] || region;
}

function displayRegions(regions) {
  return regions.map(displayRegion).join(", ");
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
    jurisdictionRequirements.push("未选择发布地区。发布审核前至少需要选择一个地区。");
    return;
  }

  if (regions.includes("EU")) {
    jurisdictionRequirements.push("欧盟: 向观众披露 AI 生成或 AI 操纵的图像、音频、视频内容。");
    jurisdictionRequirements.push("欧盟: 在可行情况下保留技术来源证明，使合成或操纵内容导出后仍可检测。");
    frameworks.push("EU AI Act Article 50: 对 AI 生成或操纵的音频、视频、图像内容提出透明度披露要求。");
    evidence.push("欧盟发布审核: 标签位置截图、元数据/来源记录和审核批准。");
  }

  if (regions.includes("China")) {
    jurisdictionRequirements.push("中国: 对 AI 生成合成内容添加用户可感知的显式标识。");
    jurisdictionRequirements.push("中国: 添加隐式机器可读标识，例如元数据、水印或平台侧来源信号。");
    jurisdictionRequirements.push("中国: 保留生成内容、标签状态、账号、发布/导出事件之间的服务提供者记录。");
    frameworks.push("中国 AI 生成合成内容标识规则: 显式可见标识与隐式机器可读信号并用。");
    evidence.push("中国发布审核: 显式标签截图、隐式标签记录、导出/转发持久性检查。");
  }

  if (regions.includes("US")) {
    jurisdictionRequirements.push("美国: 评估真人肖像或声音涉及的公开权、隐私、误导性代言和平台政策风险。");
    jurisdictionRequirements.push("美国: 对政治、性、诽谤或商业冒充场景进行强化审核，因为州法和行业规则可能不同。");
    evidence.push("美国发布审核: 公开权/代言风险评估、授权材料和敏感场景审核记录。");
  }

  if (regions.includes("Global release")) {
    jurisdictionRequirements.push("全球发布: 默认采用所选地区中最严格的标识和授权控制。");
    jurisdictionRequirements.push("全球发布: 发布前要求抗导出丢失的来源证明、下架路由和地区政策说明。");
    controls.push("全球分发采用最高共同标准控制: 已验证授权、可见标签、机器可读标签、水印/来源证明和下架 SLA。");
  }
}

function addLabelRequirements(risk, labelsOut, controls, frameworks) {
  const realPerson = usesRealPerson(risk);
  const regions = effectiveRegions(risk);

  if (realPerson || risk.subjectType === "synthetic") {
    labelsOut.push("添加可见标签，例如 AI生成、AI修改、数字分身或合成声音。");
  }

  if (regions.includes("EU") || regions.includes("Global release")) {
    if (!risk.visibleLabel) labelsOut.push("欧盟发布路径要求发布前加入面向观众的 AI 披露。");
  }

  if (regions.includes("China") || regions.includes("Global release")) {
    if (!risk.machineLabel) labelsOut.push("中国发布路径要求支持隐式或机器可读标识。");
  }

  if ((regions.includes("China") || regions.includes("EU") || regions.includes("Global release")) && !risk.watermark) {
    labelsOut.push("添加持久水印、元数据、内容凭证或导出哈希记录，以降低转发后标签丢失风险。");
  }

  if (risk.visibleLabel && risk.machineLabel && risk.watermark) {
    controls.push("确认标签能在预览、发布、下载、导出和转发检测流程中保持可追踪。");
  }
}

function assessScenario(risk) {
  if (isBlankScenario(risk)) {
    return {
      decision: "intake",
      score: "-",
      riskLevel: "未评估",
      title: "等待填写场景信息",
      reviewer: "请完成信息录入",
      summary: "请选择请求方类型、被描绘的人、使用场景、发布地区和授权证据，以生成合规审核报告。",
      riskDrivers: ["尚未录入场景事实。"],
      controls: ["在生成、发布或商业化审核前，需要先完成信息录入。"],
      labels: ["选择媒体类型和发布地区后，将显示标识要求。"],
      jurisdictions: ["尚未选择地区。"],
      gaps: ["选择授权证据后，将显示授权与许可缺口。"],
      reviews: ["选择被描绘人、使用场景和敏感语境后，将显示人工审核触发条件。"],
      frameworks: ["框架映射会根据所选地区和风险触发条件生成。"],
      evidence: ["定义场景后，将生成证据清单。"],
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
  const frameworks = ["NIST AI RMF: 在录入、生成、发布和事件响应阶段采用 Govern、Map、Measure、Manage 风险治理结构。"];
  const evidence = [
    "源素材清单和上传账号记录。",
    "生成内容 ID、提示词/剧本记录、模型/工具日志和发布/导出日志。",
    "带时间戳和理由的审核员决策记录。",
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

  if (risk.requesterType) riskDrivers.push(`请求方: ${labels.requesterType[risk.requesterType]}。`);
  if (risk.subjectType) riskDrivers.push(`被描绘的人: ${labels.subjectType[risk.subjectType]}。`);
  if (risk.useCase || risk.monetization) {
    riskDrivers.push(`使用场景: ${labels.useCase[risk.useCase] || "未选择"} / ${labels.monetization[risk.monetization] || "未选择"}。`);
  }
  if (media.length) riskDrivers.push(`源素材包括: ${media.join(", ")}。`);
  if (regions.length) riskDrivers.push(`发布地区: ${displayRegions(regions)}。`);
  if (!hasCoreScenario(risk)) {
    gaps.push("核心信息录入不完整: 请选择请求方类型、被描绘的人、使用场景、商业化方式和敏感语境。");
  }

  if (realPerson) {
    score += 3;
    frameworks.push("SAG-AFTRA AI 原则: 数字分身使用需要清晰同意、补偿和具体用途授权。");
    evidence.push("与被描绘人和所请求媒体属性相匹配的授权/许可文件。");
  }

  if (realPerson && !verifiedAuthorization && !lowerImpactParody) {
    score += 7;
    decision = "reject";
    riskDrivers.push("真人肖像、声音、动作或表演工作流缺少已验证授权。");
    gaps.push("生成前需要本人级别的已验证授权；第三人或公众人物内容不能仅依赖上传者自我声明。");
    controls.push("阻止生成，并保留上传、提示词和账号证据，供权利人审核。");
  } else if (realPerson && !verifiedAuthorization && lowerImpactParody) {
    score += 4;
    riskDrivers.push("公众人物戏仿/粉丝内容缺少已验证授权，但当前不是商业或敏感场景。");
    gaps.push("授权仍未验证；审核员需要判断戏仿/粉丝语境是否存在误导、商业化或伤害风险。");
    controls.push("除非提供单独授权，否则限制变现和代言式表达。");
  }

  if (commercial) {
    score += 2;
    riskDrivers.push("商业、代言或转售语境会提高公开权、表演者权益和消费者误导风险。");
    if (!risk.scopeCommercial) gaps.push("提交的授权未明确覆盖商业使用。");
    controls.push("检查商业使用、渠道、地域、期限和二次使用是否在许可范围内。");
  }

  if (publicFigure) {
    score += 3;
    reviews.push("公众人物或政治人物内容需要强化人工审核，重点检查冒充、代言和公共利益风险。");
  }

  if (risk.subjectType === "minor") {
    score += 5;
    reviews.push("涉及未成年人的内容需要升级儿童安全审核，并进行更严格的身份/监护人授权审查。");
    gaps.push("确认监护人授权、儿童安全审核和分发限制。");
  }

  if (risk.sensitiveContext && risk.sensitiveContext !== "none") {
    score += 4;
    riskDrivers.push(`选择了敏感语境: ${risk.sensitiveContext}。`);
    reviews.push("敏感语境需要在生成或发布前进行人工审核。");
  }

  if (realPerson && ["sexual", "defamatory"].includes(risk.sensitiveContext)) {
    decision = "reject";
    controls.push("拒绝真人性相关或诽谤性合成呈现；如已有上传内容，转入事件/安全队列。");
  }

  if (risk.subjectType === "minor" && risk.sensitiveContext && risk.sensitiveContext !== "none") {
    decision = "reject";
    controls.push("拒绝涉及未成年人的敏感合成媒体，并保留证据供安全审核。");
  }

  if (risk.trainingUse) {
    score += 3;
    evidence.push("训练数据使用标记、数据血缘记录和模型改进 opt-in 记录。");
    if (!risk.scopeTraining) {
      gaps.push("训练、微调或模型改进用途没有单独授权。");
      controls.push("如其他条件有效，可允许内容生成；但在取得单独授权前阻止模型训练。");
    }
  }

  if (verifiedAuthorization && realPerson) {
    if (!risk.scopeTerritory) gaps.push("授权地域没有明确覆盖所选发布地区。");
    if (!risk.scopeDuration) gaps.push("缺少许可期限或到期时间。");
    if (!risk.scopeSecondaryUse && risk.monetization === "resale") gaps.push("二次使用或转售未被覆盖。");
    if (!risk.scopeRevocation) gaps.push("缺少撤回或退出路径。");
    if (!risk.scopeCompensation && risk.subjectType === "performer") gaps.push("缺少演员补偿条款。");
  }

  if (risk.useCase === "parody" || risk.useCase === "fanContent") {
    reviews.push("粉丝/戏仿主张需要审核员评估混淆、商业化、平台政策和当地法律风险。");
    controls.push("不要把戏仿或粉丝语境视为自动授权；要求标识且不得构成误导性代言。");
  }

  if (risk.useCase === "politicalMessage" || risk.sensitiveContext === "political" || risk.subjectType === "politician") {
    reviews.push("政治或公共议题内容需要强化审核，并采用更醒目的披露位置。");
    controls.push("限制欺骗性政治冒充，并要求显著的合成媒体披露。");
  }

  addJurisdictionRequirements(risk, jurisdictionRequirements, controls, frameworks, evidence);
  addLabelRequirements(risk, labelsOut, controls, frameworks);

  if (!risk.visibleLabel && (realPerson || risk.subjectType === "synthetic")) {
    score += 2;
    labelsOut.push("当前发布计划缺少可见 AI 披露。");
  }
  if (!risk.machineLabel && (risk.regionChina || risk.regionGlobal)) {
    score += 2;
  }
  if (!risk.watermark && (risk.regionEu || risk.regionChina || risk.regionGlobal || commercial)) {
    score += 1;
  }

  evidence.push("可见标签截图、元数据/来源记录、水印状态，以及必要时的导出哈希记录。");
  evidence.push("与内容 ID 绑定的投诉入口和下架 SLA。");

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

  const riskLevel = decision === "intake" ? "未评估" : decision === "reject" ? "禁止" : score >= 9 ? "高" : score >= 5 ? "中" : "低";
  const title = {
    intake: "场景信息未完成",
    reject: "生成前拒绝",
    escalate: "升级人工审核",
    conditional: "有条件通过",
    approve: "标准流程通过",
  }[decision];
  const reviewer = {
    intake: "请完成信息录入",
    reject: "阻止并保全证据",
    escalate: "强化人工审核",
    conditional: "满足控制要求后方可发布",
    approve: "标准标识与审计日志",
  }[decision];
  const summary = {
    intake: "当前报告只显示地区和证据提示；最终结论需要先完成核心场景字段。",
    reject: "在解决已验证授权和禁止用途问题前，该请求不能继续。",
    escalate: "该请求可能可行，但发布前需要人工审核员签字确认。",
    conditional: "该请求只有在补齐具体控制、标识或许可范围缺口后才能继续。",
    approve: "该请求属于较低风险路径，可按标准合成媒体标识和审计日志流程处理。",
  }[decision];

  return {
    decision,
    score: decision === "intake" ? "-" : score,
    riskLevel,
    title,
    reviewer,
    summary,
    riskDrivers: unique(riskDrivers),
    controls: unique(controls.length ? controls : ["应用标准发布前审核、标签验证和审计日志。"]),
    labels: unique(labelsOut.length ? labelsOut : ["保持可见 AI 披露和内部内容来源记录。"]),
    jurisdictions: unique(jurisdictionRequirements),
    gaps: unique(gaps.length ? gaps : ["No material authorization gaps detected from the selected fields."]),
    reviews: unique(reviews.length ? reviews : ["未触发强化人工审核条件。"]),
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

function renderDefinitionList(target, items) {
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

function scenarioProfile(risk) {
  const media = selectedMedia(risk);
  const regions = effectiveRegions(risk);
  return [
    { label: "请求方", value: labels.requesterType[risk.requesterType] || "未选择" },
    { label: "被描绘的人", value: labels.subjectType[risk.subjectType] || "未选择" },
    { label: "使用场景", value: labels.useCase[risk.useCase] || "未选择" },
    { label: "商业化方式", value: labels.monetization[risk.monetization] || "未选择" },
    { label: "源素材", value: media.length ? media.join(", ") : "未选择" },
    { label: "发布地区", value: regions.length ? displayRegions(regions) : "未选择" },
    { label: "授权证据", value: labels.consentEvidence[risk.consentEvidence] || "未选择" },
    { label: "敏感语境", value: risk.sensitiveContext || "未选择" },
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
      "当前场景未触发单独的授权控制动作。"
    ),
    labeling: prioritize(
      [
        ...memo.labels,
        ...memo.controls.filter((item) => /label|watermark|metadata|provenance|disclosure|export|repost/i.test(item)),
      ],
      "保持可见披露和内部来源记录。"
    ),
    release: prioritize(
      [
        ...memo.jurisdictions,
        ...memo.controls.filter((item) => /release|distribution|publication|global|political|parody|endorsement/i.test(item)),
      ],
      "当前尚未选择地区性发布条件。"
    ),
    incident: prioritize(
      [
        ...memo.controls.filter((item) => /block|preserve|incident|safety|takedown|complaint|evidence/i.test(item)),
        ...memo.reviews,
      ],
      "将标准投诉入口和下架 SLA 绑定到内容 ID。"
    ),
  };
}

function regionRequirementItems(region, memo) {
  const items = memo.jurisdictions.filter((item) => item.startsWith(`${region}:`));
  if (items.length) return items.map((item) => item.replace(`${region}: `, ""));
  return ["该发布路径未选择此地区。"];
}

function renderJurisdictionMatrix(target, risk, memo) {
  const regions = effectiveRegions(risk);
  const cards = [
    { key: "欧盟", title: "欧盟", sourceKey: "EU" },
    { key: "中国", title: "中国", sourceKey: "China" },
    { key: "美国", title: "美国", sourceKey: "US" },
    { key: "全球发布", title: "全球发布", sourceKey: "Global release" },
  ];

  target.replaceChildren();
  cards.forEach(({ key, title, sourceKey }) => {
    const active = regions.includes(sourceKey || key);
    const card = document.createElement("article");
    card.className = active ? "jurisdiction-card active" : "jurisdiction-card";

    const status = document.createElement("span");
    status.textContent = active ? "适用" : "未选择";

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
    "按标准合成媒体标识、审计日志和发布审核流程继续。"
  );
}

function displayRiskLevel(value) {
  if (!value || value === "未评估") return value;
  return value;
}

function requiredIntakeItems(risk) {
  const media = selectedMedia(risk);
  const regions = effectiveRegions(risk);
  return [
    { label: "请求方类型", complete: Boolean(risk.requesterType), step: 0 },
    { label: "被描绘的人", complete: Boolean(risk.subjectType), step: 0 },
    { label: "源素材选择", complete: media.length > 0 || risk.subjectType === "synthetic", step: 1 },
    { label: "使用场景", complete: Boolean(risk.useCase), step: 2 },
    { label: "商业化方式", complete: Boolean(risk.monetization), step: 2 },
    { label: "敏感语境", complete: Boolean(risk.sensitiveContext), step: 2 },
    { label: "发布地区", complete: regions.length > 0, step: 2 },
    { label: "授权证据", complete: Boolean(risk.consentEvidence), step: 3 },
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

function renderIntakeProfile(risk) {
  renderDefinitionList(intakeProfile, scenarioProfile(risk).slice(0, 6));
}

function renderMissingItems(items) {
  missingList.replaceChildren();
  const missing = items.filter((item) => !item.complete);

  if (!missing.length) {
    const item = document.createElement("li");
    item.textContent = "所有必填信息已经完成。";
    missingList.append(item);
    return;
  }

  missing.forEach((missingItem) => {
    const item = document.createElement("li");
    item.textContent = missingItem.label;
    missingList.append(item);
  });
}

function setWorkflowStep(step) {
  currentStep = Math.max(0, Math.min(step, workflowSteps.length - 1));
  const risk = getScenario();
  const completion = intakeCompletion(risk);

  document.querySelectorAll("[data-step]").forEach((panel) => {
    panel.hidden = Number(panel.dataset.step) !== currentStep;
  });

  document.querySelectorAll("[data-step-index]").forEach((item) => {
    const index = Number(item.dataset.stepIndex);
    item.classList.toggle("active", index === currentStep);
    item.classList.toggle("complete", index < currentStep || (index < workflowSteps.length - 1 && completion.items.filter((entry) => entry.step === index).every((entry) => entry.complete)));
  });

  stepTitle.textContent = workflowSteps[currentStep].title;
  stepCopy.textContent = workflowSteps[currentStep].copy;
  prevStepButton.disabled = currentStep === 0;
  nextStepButton.hidden = currentStep === workflowSteps.length - 1;
  generateReportButton.hidden = currentStep !== workflowSteps.length - 1;
}

function updateIntakeStatus(risk) {
  const completion = intakeCompletion(risk);
  completionScore.textContent = `${completion.percent}%`;
  completionBar.style.width = `${completion.percent}%`;
  completionCopy.textContent = completion.ready
    ? "可以生成合规报告。"
    : "请先完成核心场景字段，再生成报告。";
  generateReportButton.disabled = !completion.ready;
  renderMissingItems(completion.items);
  renderIntakeProfile(risk);
}

function showReport() {
  const risk = getScenario();
  const completion = intakeCompletion(risk);
  if (!completion.ready) {
    const firstMissing = completion.items.find((item) => !item.complete);
    if (firstMissing) setWorkflowStep(firstMissing.step);
    updateIntakeStatus(risk);
    return;
  }

  intakeView.hidden = true;
  reportView.hidden = false;
  workflowShell.classList.add("report-mode");
  workflowMode.textContent = "已生成报告";
  document.querySelectorAll("[data-step-index]").forEach((item) => {
    const index = Number(item.dataset.stepIndex);
    item.classList.toggle("active", index === 5);
    item.classList.add("complete");
  });
  reportView.scrollIntoView({ block: "start", behavior: "smooth" });
}

function showIntake() {
  reportView.hidden = true;
  intakeView.hidden = false;
  workflowShell.classList.remove("report-mode");
  workflowMode.textContent = "信息录入台";
  setWorkflowStep(currentStep);
}

function render() {
  const risk = getScenario();
  const memo = assessScenario(risk);

  decisionPill.textContent =
    memo.decision === "conditional" ? "有条件通过" : memo.decision === "intake" ? "信息未完成" : memo.decision === "reject" ? "拒绝" : memo.decision === "escalate" ? "升级审核" : "通过";
  decisionPill.className = `risk-pill ${memo.decision}`;
  resultPanel.dataset.decision = memo.decision;
  scoreValue.textContent = memo.score;
  resultTitle.textContent = memo.title;
  resultCopy.textContent = memo.summary;
  riskLevelText.textContent = displayRiskLevel(memo.riskLevel);
  reviewerPath.textContent = memo.reviewer;

  renderDefinitionList(sections.scenarioProfile, scenarioProfile(risk));
  renderList(sections.riskDrivers, prioritize(memo.riskDrivers, "尚未生成实质性风险发现。"));
  const groups = controlGroups(memo);
  renderList(sections.consentControls, groups.consent);
  renderList(sections.labelControls, groups.labeling);
  renderList(sections.releaseControls, groups.release);
  renderList(sections.incidentControls, groups.incident);
  renderJurisdictionMatrix(sections.jurisdictionMatrix, risk, memo);
  renderList(sections.nextSteps, nextSteps(memo));
  renderList(sections.frameworks, memo.frameworks);
  renderList(sections.evidence, memo.evidence);
  updateIntakeStatus(risk);
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
editIntakeButton.addEventListener("click", showIntake);

setWorkflowStep(0);
render();
