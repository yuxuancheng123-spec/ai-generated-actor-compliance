"""Traceable rule engine for synthetic media compliance assessments."""

from __future__ import annotations

from dataclasses import dataclass
from typing import Callable

from .schemas import (
    AssessmentResponse,
    CaseIntake,
    Decision,
    DistributionRegion,
    IntendedUse,
    PersonType,
    RiskLevel,
    RuleSeverity,
    SensitiveContext,
    SourceMediaType,
    TriggeredRule,
    VerificationStatus,
    YesNoUnknown,
)


RULE_VERSION = "actor-compliance-rules-2026-07-14"


def is_verified(status: VerificationStatus) -> bool:
    return status == VerificationStatus.VERIFIED


def is_missing_or_unknown(status: VerificationStatus | YesNoUnknown | SensitiveContext) -> bool:
    return status in {
        VerificationStatus.NOT_PROVIDED,
        VerificationStatus.UNKNOWN,
        VerificationStatus.UNVERIFIED,
        YesNoUnknown.UNKNOWN,
        YesNoUnknown.NOT_PROVIDED,
        SensitiveContext.UNKNOWN,
        SensitiveContext.NOT_PROVIDED,
    }


def uses_real_person(case: CaseIntake) -> bool:
    return case.represented_person.person_type in {
        PersonType.SELF,
        PersonType.ORDINARY_PERSON,
        PersonType.PERFORMER,
        PersonType.PUBLIC_FIGURE,
        PersonType.POLITICAL_FIGURE,
        PersonType.MINOR,
    }


def uses_voice(case: CaseIntake) -> bool:
    return SourceMediaType.VOICE_SAMPLE in case.source_media.media_types


def uses_likeness(case: CaseIntake) -> bool:
    media = set(case.source_media.media_types)
    return bool(
        {
            SourceMediaType.FACIAL_IMAGE,
            SourceMediaType.VIDEO_CLIP,
            SourceMediaType.PRIOR_PERFORMANCE,
        }
        & media
    )


def uses_motion_or_performance(case: CaseIntake) -> bool:
    media = set(case.source_media.media_types)
    return bool({SourceMediaType.MOTION_CAPTURE, SourceMediaType.PRIOR_PERFORMANCE} & media)


def is_commercial(case: CaseIntake) -> bool:
    return case.intended_use.commercial_use == YesNoUnknown.YES or case.intended_use.use_case in {
        IntendedUse.ADVERTISEMENT,
        IntendedUse.VIRTUAL_INFLUENCER,
    }


def involves_public_figure(case: CaseIntake) -> bool:
    return case.represented_person.person_type in {
        PersonType.PUBLIC_FIGURE,
        PersonType.POLITICAL_FIGURE,
    } or case.represented_person.is_public_figure == YesNoUnknown.YES


def involves_minor(case: CaseIntake) -> bool:
    return case.represented_person.person_type == PersonType.MINOR or case.represented_person.is_minor == YesNoUnknown.YES


def includes_region(case: CaseIntake, region: DistributionRegion) -> bool:
    regions = set(case.intended_use.distribution_regions)
    return region in regions or DistributionRegion.GLOBAL in regions


def consent_verified(case: CaseIntake) -> bool:
    if case.represented_person.person_type == PersonType.FULLY_SYNTHETIC:
        return True
    return case.consent.consent_status == VerificationStatus.VERIFIED


def required_scope_missing(case: CaseIntake) -> bool:
    consent = case.consent
    if uses_likeness(case) and not is_verified(consent.likeness_scope):
        return True
    if uses_voice(case) and not is_verified(consent.voice_scope):
        return True
    if uses_motion_or_performance(case) and not (
        is_verified(consent.motion_scope) or is_verified(consent.performance_scope)
    ):
        return True
    return False


@dataclass(frozen=True)
class Rule:
    rule_id: str
    title: str
    description: str
    severity: RuleSeverity
    score: int
    hard_stop: bool
    affected_domain: str
    recommended_control: str
    source_reference: str
    version: str
    condition: Callable[[CaseIntake], bool]

    def trigger(self) -> TriggeredRule:
        return TriggeredRule(
            rule_id=self.rule_id,
            title=self.title,
            description=self.description,
            severity=self.severity,
            score=self.score,
            hard_stop=self.hard_stop,
            affected_domain=self.affected_domain,
            recommended_control=self.recommended_control,
            source_reference=self.source_reference,
            version=self.version,
        )


RULES: tuple[Rule, ...] = (
    Rule(
        "R-01",
        "Real-person commercial use without verified authorization",
        "A real person's likeness, voice, motion, or prior performance is used for commercial content without verified authorization.",
        RuleSeverity.CRITICAL,
        5,
        True,
        "consent",
        "Block generation or publication until person-level authorization and commercial-use scope are verified.",
        "SAG-AFTRA AI digital replica consent principles; right-of-publicity risk control",
        RULE_VERSION,
        lambda c: uses_real_person(c) and is_commercial(c) and not consent_verified(c),
    ),
    Rule(
        "R-02",
        "Real-person sexual or defamatory synthetic portrayal",
        "A real person's identity is placed into a sexual or defamatory synthetic-media context.",
        RuleSeverity.CRITICAL,
        5,
        True,
        "safety",
        "Reject and preserve evidence for incident response and affected-person notice review.",
        "Platform prohibited-use policy; privacy and dignity harm controls",
        RULE_VERSION,
        lambda c: uses_real_person(c)
        and c.intended_use.sensitive_context in {SensitiveContext.SEXUAL, SensitiveContext.DEFAMATORY},
    ),
    Rule(
        "R-03",
        "Minor identity in sensitive synthetic-media context",
        "A child or minor is depicted in a sensitive synthetic-media context.",
        RuleSeverity.CRITICAL,
        5,
        True,
        "child_safety",
        "Reject and route to child-safety review with evidence preservation.",
        "Child safety and high-impact synthetic media controls",
        RULE_VERSION,
        lambda c: involves_minor(c) and c.intended_use.sensitive_context != SensitiveContext.NONE,
    ),
    Rule(
        "R-04",
        "Public-figure or political-figure endorsement risk",
        "The request depicts a public or political figure in a context that could imply endorsement or mislead viewers.",
        RuleSeverity.HIGH,
        3,
        False,
        "identity_risk",
        "Require enhanced human review, clear disclosure, and no misleading endorsement framing.",
        "EU AI Act Article 50; publicity and deceptive endorsement risk control",
        RULE_VERSION,
        lambda c: involves_public_figure(c)
        and (is_commercial(c) or c.intended_use.use_case == IntendedUse.POLITICAL_MESSAGE),
    ),
    Rule(
        "R-05",
        "Training use without separate authorization",
        "Source media or generated output is used for model training, fine-tuning, or improvement without separate authorization.",
        RuleSeverity.CRITICAL,
        5,
        True,
        "training_data",
        "Block training use until a separate data-use authorization and data lineage record are attached.",
        "Purpose limitation and data minimization control; NIST AI RMF Map/Manage",
        RULE_VERSION,
        lambda c: c.consent.training_use_authorized != YesNoUnknown.YES
        and c.intended_use.use_case == IntendedUse.MODEL_TRAINING,
    ),
    Rule(
        "R-06",
        "Required media scope is not verified",
        "The submitted authorization does not verify the specific face, voice, motion, or performance scope used in the request.",
        RuleSeverity.HIGH,
        3,
        False,
        "consent_scope",
        "Verify separate likeness, voice, motion, and performance scopes before approval.",
        "SAG-AFTRA AI scope-of-use principle",
        RULE_VERSION,
        lambda c: uses_real_person(c) and consent_verified(c) and required_scope_missing(c),
    ),
    Rule(
        "R-07",
        "Visible AI disclosure is missing or unverified",
        "The release plan lacks a verified viewer-facing AI-generated or AI-modified content label.",
        RuleSeverity.MEDIUM,
        2,
        False,
        "transparency",
        "Add visible AI disclosure before publication or export.",
        "EU AI Act Article 50; China synthetic content labeling requirements",
        RULE_VERSION,
        lambda c: c.disclosure_plan.visible_label != VerificationStatus.VERIFIED,
    ),
    Rule(
        "R-08",
        "Machine-readable label is missing for China or global distribution",
        "China-facing or global distribution lacks verified implicit or machine-readable synthetic-content metadata.",
        RuleSeverity.MEDIUM,
        2,
        False,
        "transparency",
        "Add machine-readable metadata, content credentials, or platform-side provenance signal.",
        "China AI-generated synthetic content labeling requirements",
        RULE_VERSION,
        lambda c: includes_region(c, DistributionRegion.CHINA)
        and c.disclosure_plan.machine_readable_metadata != VerificationStatus.VERIFIED,
    ),
    Rule(
        "R-09",
        "Provenance controls are incomplete",
        "The case lacks verified output hashing, watermarking, model-version logging, or export-event records.",
        RuleSeverity.MEDIUM,
        2,
        False,
        "provenance",
        "Record source/output hashes, watermark state, model version, and export event before release.",
        "C2PA/content provenance concepts; NIST AI RMF Measure/Manage",
        RULE_VERSION,
        lambda c: c.disclosure_plan.watermark != VerificationStatus.VERIFIED
        or c.provenance_controls.output_hash_registry != VerificationStatus.VERIFIED
        or c.provenance_controls.export_event_logged != VerificationStatus.VERIFIED,
    ),
    Rule(
        "R-10",
        "Territory, duration, or revocation scope is missing",
        "Verified consent exists, but territory, duration, or revocation path is incomplete.",
        RuleSeverity.MEDIUM,
        2,
        False,
        "license_scope",
        "Require territory, duration, and revocation terms before release approval.",
        "Consent and licensing checklist; purpose limitation control",
        RULE_VERSION,
        lambda c: consent_verified(c)
        and uses_real_person(c)
        and (not c.consent.territory or c.consent.duration_end is None or not c.consent.revocation_path),
    ),
    Rule(
        "R-11",
        "Commercial compensation terms missing for performer digital replica",
        "A performer digital replica is used commercially without documented compensation terms.",
        RuleSeverity.HIGH,
        3,
        False,
        "compensation",
        "Attach compensation terms and performer approval before commercial release.",
        "SAG-AFTRA AI consent and compensation principle",
        RULE_VERSION,
        lambda c: c.represented_person.person_type == PersonType.PERFORMER
        and is_commercial(c)
        and not c.consent.compensation_terms,
    ),
    Rule(
        "R-12",
        "Sensitive context requires enhanced review",
        "The request involves political, medical, financial, violent, or otherwise sensitive context.",
        RuleSeverity.HIGH,
        3,
        False,
        "human_review",
        "Route to enhanced reviewer path with scenario-specific safety and deception checks.",
        "NIST AI RMF Govern/Map; platform safety governance",
        RULE_VERSION,
        lambda c: c.intended_use.sensitive_context
        in {
            SensitiveContext.POLITICAL,
            SensitiveContext.MEDICAL,
            SensitiveContext.FINANCIAL,
            SensitiveContext.VIOLENCE,
        },
    ),
    Rule(
        "R-13",
        "Consent evidence status is unverified",
        "Consent evidence is missing, unknown, expired, rejected, or not verified.",
        RuleSeverity.HIGH,
        3,
        False,
        "consent",
        "Move case to manual review and require verified evidence before approval.",
        "Consent vault and evidence ownership control",
        RULE_VERSION,
        lambda c: uses_real_person(c) and not consent_verified(c),
    ),
)


def collect_missing_information(case: CaseIntake) -> list[str]:
    missing: list[str] = []
    if case.represented_person.identity_verification != VerificationStatus.VERIFIED and uses_real_person(case):
        missing.append("represented_person.identity_verification is not verified")
    if is_missing_or_unknown(case.intended_use.commercial_use):
        missing.append("intended_use.commercial_use is unknown or not provided")
    if is_missing_or_unknown(case.intended_use.sensitive_context):
        missing.append("intended_use.sensitive_context is unknown or not provided")
    if DistributionRegion.NOT_PROVIDED in case.intended_use.distribution_regions:
        missing.append("intended_use.distribution_regions contains not_provided")
    if uses_real_person(case) and not consent_verified(case):
        missing.append("consent.consent_status is not verified")
    if uses_likeness(case) and case.consent.likeness_scope != VerificationStatus.VERIFIED:
        missing.append("consent.likeness_scope is not verified")
    if uses_voice(case) and case.consent.voice_scope != VerificationStatus.VERIFIED:
        missing.append("consent.voice_scope is not verified")
    if c_missing := [
        name
        for name, value in {
            "disclosure_plan.visible_label": case.disclosure_plan.visible_label,
            "disclosure_plan.machine_readable_metadata": case.disclosure_plan.machine_readable_metadata,
            "disclosure_plan.watermark": case.disclosure_plan.watermark,
        }.items()
        if value in {VerificationStatus.NOT_PROVIDED, VerificationStatus.UNKNOWN, VerificationStatus.UNVERIFIED}
    ]:
        missing.extend(f"{name} is not verified" for name in c_missing)
    return missing


def risk_level_from_score(score: int, hard_stops: list[TriggeredRule]) -> RiskLevel:
    if hard_stops:
        return RiskLevel.PROHIBITED
    if score >= 9:
        return RiskLevel.HIGH
    if score >= 5:
        return RiskLevel.MEDIUM
    return RiskLevel.LOW


def decision_from_assessment(
    score: int,
    hard_stops: list[TriggeredRule],
    missing_information: list[str],
) -> Decision:
    if hard_stops:
        return Decision.REJECT
    if score >= 9 or missing_information:
        return Decision.MANUAL_REVIEW
    if score >= 5:
        return Decision.APPROVE_WITH_CONDITIONS
    return Decision.APPROVE


def reviewer_path_for(decision: Decision, triggered: list[TriggeredRule]) -> str:
    domains = {rule.affected_domain for rule in triggered}
    if decision == Decision.REJECT:
        return "compliance_admin_block_and_incident_review"
    if "child_safety" in domains:
        return "child_safety_and_compliance_reviewer"
    if "human_review" in domains or "identity_risk" in domains:
        return "enhanced_human_review"
    if decision == Decision.MANUAL_REVIEW:
        return "manual_compliance_review"
    if decision == Decision.APPROVE_WITH_CONDITIONS:
        return "conditional_release_review"
    return "standard_release_review"


def render_report(case: CaseIntake, response: AssessmentResponse) -> str:
    rule_trace = response.triggered_rules or []
    lines = [
        f"# Compliance Assessment Report: {case.title}",
        "",
        "## Decision",
        "",
        f"- Case ID: {case.case_id}",
        f"- Rule version: {response.rule_version}",
        f"- Total score: {response.total_score}",
        f"- Risk level: {response.risk_level.value}",
        f"- Decision: {response.decision.value}",
        f"- Reviewer path: {response.reviewer_path}",
        "",
        "## Rule Trace",
        "",
    ]
    if rule_trace:
        for rule in rule_trace:
            marker = " HARD STOP" if rule.hard_stop else ""
            lines.append(f"- {rule.rule_id} {rule.title} +{rule.score}{marker}")
    else:
        lines.append("- No elevated rules triggered.")
    lines.extend(["", "## Missing Information", ""])
    lines.extend(f"- {item}" for item in (response.missing_information or ["No missing information detected."]))
    lines.extend(["", "## Recommended Controls", ""])
    lines.extend(f"- {control}" for control in response.recommended_controls)
    lines.extend(["", "## Audit Evidence To Preserve", ""])
    lines.extend(
        [
            "- Intake JSON and schema version.",
            "- Consent record and source media evidence references.",
            "- Triggered rules, hard stops, score, decision, and reviewer path.",
            "- Report export event and final review status.",
        ]
    )
    return "\n".join(lines) + "\n"


def assess_case(case: CaseIntake) -> AssessmentResponse:
    triggered = [rule.trigger() for rule in RULES if rule.condition(case)]
    hard_stops = [rule for rule in triggered if rule.hard_stop]
    total_score = sum(rule.score for rule in triggered)
    missing_information = collect_missing_information(case)
    risk_level = risk_level_from_score(total_score, hard_stops)
    decision = decision_from_assessment(total_score, hard_stops, missing_information)
    reviewer_path = reviewer_path_for(decision, triggered)
    recommended_controls = sorted({rule.recommended_control for rule in triggered})
    if not recommended_controls:
        recommended_controls = [
            "Maintain intake record, label state, provenance log, and standard release audit trail."
        ]

    response = AssessmentResponse(
        case_id=case.case_id,
        rule_version=RULE_VERSION,
        total_score=total_score,
        risk_level=risk_level,
        decision=decision,
        triggered_rules=triggered,
        hard_stops=hard_stops,
        recommended_controls=recommended_controls,
        missing_information=missing_information,
        reviewer_path=reviewer_path,
        report_markdown="",
    )
    return response.model_copy(update={"report_markdown": render_report(case, response)})

