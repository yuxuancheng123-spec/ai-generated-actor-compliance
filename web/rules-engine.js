/*
 * Browser port of backend/app/rules.py.
 *
 * Rule metadata (titles, scores, hard stops, legal bases) comes from rules/rules.json through the
 * generated web/rules-data.js. The conditions below mirror CONDITIONS in rules.py one for one;
 * tests/test_engine_parity.py runs both engines on the same canonical cases and fails on any
 * difference. Change a condition in both places, or the parity test will fail.
 */
(function (root, factory) {
  if (typeof module === "object" && module.exports) {
    module.exports = factory(require("./rules-data.js"));
  } else {
    root.RulesEngine = factory(root.RULES_DATA);
  }
})(typeof self !== "undefined" ? self : this, function (RULES_DATA) {
  "use strict";

  const VERIFIED = "verified";
  const REAL_PERSON = new Set(["self", "ordinary_person", "performer", "public_figure", "political_figure", "minor"]);
  const LIKENESS_MEDIA = new Set(["facial_image", "video_clip", "prior_performance"]);
  const MOTION_MEDIA = new Set(["motion_capture", "prior_performance"]);
  const MISSING = new Set(["not_provided", "unknown", "unverified"]);

  const media = (c) => new Set(c.source_media.media_types);
  const usesRealPerson = (c) => REAL_PERSON.has(c.represented_person.person_type);
  const usesVoice = (c) => media(c).has("voice_sample");
  const usesLikeness = (c) => [...media(c)].some((m) => LIKENESS_MEDIA.has(m));
  const usesMotionOrPerformance = (c) => [...media(c)].some((m) => MOTION_MEDIA.has(m));
  const isCommercial = (c) =>
    c.intended_use.commercial_use === "yes" || ["advertisement", "virtual_influencer"].includes(c.intended_use.use_case);
  const involvesPublicFigure = (c) =>
    ["public_figure", "political_figure"].includes(c.represented_person.person_type) ||
    c.represented_person.is_public_figure === "yes";
  const involvesMinor = (c) => c.represented_person.person_type === "minor" || c.represented_person.is_minor === "yes";
  const includesRegion = (c, region) => {
    const regions = c.intended_use.distribution_regions;
    return regions.includes(region) || regions.includes("global");
  };
  const consentVerified = (c) =>
    c.represented_person.person_type === "fully_synthetic" || c.consent.consent_status === VERIFIED;
  const requiredScopeMissing = (c) => {
    const s = c.consent;
    if (usesLikeness(c) && s.likeness_scope !== VERIFIED) return true;
    if (usesVoice(c) && s.voice_scope !== VERIFIED) return true;
    if (usesMotionOrPerformance(c) && !(s.motion_scope === VERIFIED || s.performance_scope === VERIFIED)) return true;
    return false;
  };
  const sensitive = (c) => c.intended_use.sensitive_context;

  const CONDITIONS = {
    "R-01": (c) => usesRealPerson(c) && isCommercial(c) && !consentVerified(c),
    "R-02": (c) => usesRealPerson(c) && ["sexual", "defamatory"].includes(sensitive(c)),
    "R-03": (c) => involvesMinor(c) && sensitive(c) !== "none",
    "R-04": (c) => involvesPublicFigure(c) && (isCommercial(c) || c.intended_use.use_case === "political_message"),
    "R-05": (c) =>
      c.consent.training_use_authorized !== "yes" &&
      (c.intended_use.use_case === "model_training" || c.intended_use.includes_training_use === "yes"),
    "R-06": (c) => usesRealPerson(c) && consentVerified(c) && requiredScopeMissing(c),
    "R-07": (c) => c.disclosure_plan.visible_label !== VERIFIED,
    "R-08": (c) => includesRegion(c, "china") && c.disclosure_plan.machine_readable_metadata !== VERIFIED,
    "R-09": (c) =>
      c.disclosure_plan.watermark !== VERIFIED ||
      c.provenance_controls.output_hash_registry !== VERIFIED ||
      c.provenance_controls.export_event_logged !== VERIFIED,
    "R-10": (c) =>
      consentVerified(c) &&
      usesRealPerson(c) &&
      (!(c.consent.territory || []).length || !c.consent.duration_end || !c.consent.revocation_path),
    "R-11": (c) => c.represented_person.person_type === "performer" && isCommercial(c) && !c.consent.compensation_terms,
    "R-12": (c) => ["political", "medical", "financial", "violence"].includes(sensitive(c)),
    "R-13": (c) => usesRealPerson(c) && !consentVerified(c),
  };

  function missingInformation(c) {
    const missing = [];
    if (c.represented_person.identity_verification !== VERIFIED && usesRealPerson(c)) {
      missing.push("represented_person.identity_verification is not verified");
    }
    if (MISSING.has(c.intended_use.commercial_use)) missing.push("intended_use.commercial_use is unknown or not provided");
    if (MISSING.has(sensitive(c))) missing.push("intended_use.sensitive_context is unknown or not provided");
    if (c.intended_use.distribution_regions.includes("not_provided")) {
      missing.push("intended_use.distribution_regions contains not_provided");
    }
    if (usesRealPerson(c) && !consentVerified(c)) missing.push("consent.consent_status is not verified");
    if (usesLikeness(c) && c.consent.likeness_scope !== VERIFIED) missing.push("consent.likeness_scope is not verified");
    if (usesVoice(c) && c.consent.voice_scope !== VERIFIED) missing.push("consent.voice_scope is not verified");
    for (const key of ["visible_label", "machine_readable_metadata", "watermark"]) {
      if (MISSING.has(c.disclosure_plan[key])) missing.push(`disclosure_plan.${key} is not verified`);
    }
    return missing;
  }

  function riskLevel(score, hardStops) {
    if (hardStops.length) return "prohibited";
    if (score >= 9) return "high";
    if (score >= 5) return "medium";
    return "low";
  }

  function decision(score, hardStops, missing) {
    if (hardStops.length) return "reject";
    if (score >= 9 || missing.length) return "manual_review";
    if (score >= 5) return "approve_with_conditions";
    return "approve";
  }

  function reviewerPath(dec, triggered) {
    const domains = new Set(triggered.map((r) => r.affected_domain));
    if (dec === "reject") return "compliance_admin_block_and_incident_review";
    if (domains.has("child_safety")) return "child_safety_and_compliance_reviewer";
    if (domains.has("human_review") || domains.has("identity_risk")) return "enhanced_human_review";
    if (dec === "manual_review") return "manual_compliance_review";
    if (dec === "approve_with_conditions") return "conditional_release_review";
    return "standard_release_review";
  }

  /** Assess a canonical case (the shape of backend CaseIntake). Mirrors rules.assess_case. */
  function assess(c) {
    const triggered = RULES_DATA.rules.filter((rule) => CONDITIONS[rule.rule_id](c));
    const hardStops = triggered.filter((rule) => rule.hard_stop);
    const totalScore = triggered.reduce((sum, rule) => sum + rule.score, 0);
    const missing = missingInformation(c);
    const dec = decision(totalScore, hardStops, missing);
    return {
      rule_version: RULES_DATA.version,
      total_score: totalScore,
      risk_level: riskLevel(totalScore, hardStops),
      decision: dec,
      triggered_rules: triggered,
      hard_stops: hardStops,
      missing_information: missing,
      reviewer_path: reviewerPath(dec, triggered),
    };
  }

  const REQUESTER = { creator: "individual_creator", brand: "brand_advertiser", production: "production_company", performer: "performer_owner" };
  const PERSON = {
    publicFigure: "public_figure", ordinaryPerson: "ordinary_person", self: "self", performer: "performer",
    politician: "political_figure", minor: "minor", synthetic: "fully_synthetic",
  };
  const USE = {
    shortDrama: "short_drama", advertisement: "advertisement", virtualInfluencer: "virtual_influencer",
    fanContent: "fan_content", parody: "parody", politicalMessage: "political_message",
  };
  // An uploaded contract is submitted evidence, not verified evidence: it still has to pass review.
  const VERIFIED_EVIDENCE = new Set(["verifiedPortal", "performerAgreement"]);

  /**
   * Convert the demo's flat intake form into a canonical case. This is the only place the
   * demo's field names are interpreted; the parity test validates its output against the
   * backend's Pydantic schema.
   */
  function fromDemoIntake(intake, caseId) {
    const status = (flag) => (flag ? VERIFIED : "not_provided");
    const yesNo = (flag) => (flag ? "yes" : "no");
    const media = [];
    if (intake.mediaFace) media.push("facial_image");
    if (intake.mediaVoice) media.push("voice_sample");
    if (intake.mediaMotion) media.push("motion_capture");
    if (intake.mediaPerformance) media.push("prior_performance");
    const regions = [];
    if (intake.regionGlobal) regions.push("global");
    if (intake.regionEu) regions.push("eu");
    if (intake.regionChina) regions.push("china");
    if (intake.regionUs) regions.push("us");

    let consentStatus = "not_provided";
    if (intake.subjectType === "self" && intake.consentEvidence === "selfAttestation") consentStatus = VERIFIED;
    else if (VERIFIED_EVIDENCE.has(intake.consentEvidence)) consentStatus = VERIFIED;
    else if (intake.consentEvidence && intake.consentEvidence !== "none") consentStatus = "unverified";
    const verified = consentStatus === VERIFIED;
    const scope = verified ? VERIFIED : consentStatus;
    const commercial =
      ["advertisement", "virtualInfluencer"].includes(intake.useCase) || ["paidAd", "resale"].includes(intake.monetization);

    return {
      case_id: caseId || "DEMO-CASE",
      title: caseId || "Demo case",
      requester: { requester_type: REQUESTER[intake.requesterType] || "unknown" },
      represented_person: {
        person_type: PERSON[intake.subjectType] || "unknown",
        identity_verification: verified ? VERIFIED : "unverified",
        is_public_figure: ["publicFigure", "politician"].includes(intake.subjectType) ? "yes" : "no",
        is_minor: intake.subjectType === "minor" ? "yes" : "no",
      },
      source_media: { media_types: media.length ? media : ["prompt_only"] },
      intended_use: {
        use_case: USE[intake.useCase] || "other",
        commercial_use: intake.monetization ? yesNo(commercial) : "not_provided",
        sensitive_context: intake.sensitiveContext || "not_provided",
        distribution_regions: regions.length ? regions : ["not_provided"],
        includes_training_use: yesNo(intake.trainingUse),
      },
      consent: {
        consent_status: consentStatus,
        likeness_scope: scope,
        voice_scope: scope,
        motion_scope: scope,
        performance_scope: scope,
        commercial_use_authorized: yesNo(intake.scopeCommercial),
        training_use_authorized: yesNo(intake.scopeTraining),
        secondary_use_authorized: yesNo(intake.scopeSecondaryUse),
        territory: intake.scopeTerritory ? regions.filter((r) => r !== "not_provided") : [],
        duration_end: intake.scopeDuration ? "2027-12-31" : null,
        revocation_path: intake.scopeRevocation ? "documented" : null,
        compensation_terms: intake.scopeCompensation ? "documented" : null,
      },
      disclosure_plan: {
        visible_label: status(intake.visibleLabel),
        machine_readable_metadata: status(intake.machineLabel),
        watermark: status(intake.watermark),
      },
      // The demo form has one provenance toggle (watermark); it stands for the provenance control set.
      provenance_controls: {
        output_hash_registry: status(intake.watermark),
        export_event_logged: status(intake.watermark),
      },
    };
  }

  return { assess, fromDemoIntake, version: RULES_DATA.version, rules: RULES_DATA.rules };
});
