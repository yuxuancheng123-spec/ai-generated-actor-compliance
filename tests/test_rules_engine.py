from __future__ import annotations

import json
from pathlib import Path

import pytest
from pydantic import ValidationError

from backend.app.rules import assess_case
from backend.app.schemas import CaseIntake, Decision, RiskLevel


ROOT = Path(__file__).resolve().parents[1]


def load_case(filename: str) -> CaseIntake:
    data = json.loads((ROOT / "examples" / filename).read_text(encoding="utf-8"))
    return CaseIntake.model_validate(data)


def rule_ids(case: CaseIntake) -> set[str]:
    return {rule.rule_id for rule in assess_case(case).triggered_rules}


def test_authorized_performer_does_not_trigger_hard_stop() -> None:
    case = load_case("authorized_performer_case.json")
    assessment = assess_case(case)

    assert assessment.risk_level == RiskLevel.LOW
    assert assessment.decision == Decision.APPROVE
    assert assessment.hard_stops == []
    assert assessment.missing_information == []


def test_unauthorized_public_figure_commercial_content_is_prohibited() -> None:
    case = load_case("unauthorized_public_figure_ad.json")
    assessment = assess_case(case)

    assert assessment.risk_level == RiskLevel.PROHIBITED
    assert assessment.decision == Decision.REJECT
    assert "R-01" in rule_ids(case)
    assert any(rule.hard_stop for rule in assessment.triggered_rules)
    assert "R-04" in rule_ids(case)


def test_minor_sensitive_context_triggers_hard_stop() -> None:
    case = load_case("minor_sensitive_case.json")
    assessment = assess_case(case)

    assert assessment.risk_level == RiskLevel.PROHIBITED
    assert assessment.decision == Decision.REJECT
    assert "R-03" in rule_ids(case)
    assert assessment.reviewer_path == "compliance_admin_block_and_incident_review"


def test_training_use_without_authorization_triggers_hard_stop() -> None:
    case = load_case("unauthorized_training_case.json")
    assessment = assess_case(case)

    assert assessment.risk_level == RiskLevel.PROHIBITED
    assert assessment.decision == Decision.REJECT
    assert "R-05" in rule_ids(case)


def test_missing_information_is_not_treated_as_safe() -> None:
    case = load_case("incomplete_unknown_case.json")
    assessment = assess_case(case)

    assert assessment.decision == Decision.MANUAL_REVIEW
    assert assessment.missing_information
    assert "represented_person.identity_verification is not verified" in assessment.missing_information


def test_labeling_and_provenance_requirements_are_traceable() -> None:
    case = load_case("unauthorized_public_figure_ad.json")
    ids = rule_ids(case)

    assert "R-07" in ids
    assert "R-08" in ids
    assert "R-09" in ids


def test_report_contains_rule_trace() -> None:
    case = load_case("unauthorized_public_figure_ad.json")
    assessment = assess_case(case)

    assert "## Rule Trace" in assessment.report_markdown
    assert "R-01 Real-person commercial use without verified authorization +5 HARD STOP" in assessment.report_markdown


def test_missing_required_field_fails_schema_validation() -> None:
    data = json.loads((ROOT / "examples" / "authorized_performer_case.json").read_text(encoding="utf-8"))
    data.pop("requester")

    with pytest.raises(ValidationError):
        CaseIntake.model_validate(data)

