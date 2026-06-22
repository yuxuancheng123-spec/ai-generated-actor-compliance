#!/usr/bin/env python3
"""Rule-based risk scoring and compliance report demo for synthetic media intake cases."""

from __future__ import annotations

import argparse
import json
from dataclasses import dataclass
from pathlib import Path
from typing import Any


SENSITIVE_CONTEXTS = {"sexual", "political", "medical", "financial", "defamatory"}


@dataclass
class RiskInput:
    content_type: str
    real_person: bool
    authorized: bool
    public_figure: bool
    minor: bool
    commercial: bool
    sensitive_context: str
    ai_labeled: bool
    training_use: bool


def normalize_bool(value: Any) -> bool:
    if isinstance(value, bool):
        return value
    if isinstance(value, str):
        return parse_bool(value)
    return bool(value)


def normalize_real_person(value: Any) -> bool:
    if isinstance(value, bool):
        return value
    normalized = str(value).strip().lower()
    return normalized in {"real_person", "real person", "celebrity", "public_figure", "public figure", "performer", "true", "yes", "1"}


def normalize_authorized(value: Any) -> bool:
    if isinstance(value, bool):
        return value
    normalized = str(value).strip().lower()
    return normalized in {"verified", "authorized", "licensed", "true", "yes", "1"}


def score_content(risk: RiskInput) -> tuple[str, list[str]]:
    reasons: list[str] = []
    score = 0

    if risk.real_person:
        score += 3
        reasons.append("uses or imitates a real person")

    if risk.real_person and not risk.authorized:
        reasons.append("no verified authorization for real-person likeness or voice")
        return "prohibited", reasons

    if risk.minor:
        score += 4
        reasons.append("involves a child or minor")

    if risk.public_figure:
        score += 3
        reasons.append("involves a public figure or celebrity")

    if risk.commercial:
        score += 2
        reasons.append("commercial or endorsement use")

    if risk.sensitive_context in SENSITIVE_CONTEXTS:
        score += 4
        reasons.append(f"sensitive context: {risk.sensitive_context}")

    if risk.training_use and not risk.authorized:
        reasons.append("training use without separate authorization")
        return "prohibited", reasons

    if risk.training_use:
        score += 3
        reasons.append("training, fine-tuning, or model improvement use")

    if not risk.ai_labeled:
        score += 2
        reasons.append("missing AI-generated or AI-modified content label")

    if risk.minor and risk.sensitive_context in SENSITIVE_CONTEXTS:
        reasons.append("minor plus sensitive context")
        return "prohibited", reasons

    if risk.sensitive_context in {"sexual", "defamatory"} and risk.real_person:
        reasons.append("real-person sexual or defamatory synthetic portrayal")
        return "prohibited", reasons

    if score >= 9:
        return "high", reasons
    if score >= 5:
        return "medium", reasons
    return "low", reasons


def decision_from_level(level: str) -> str:
    if level == "prohibited":
        return "reject"
    if level == "high":
        return "escalate"
    if level == "medium":
        return "approve_with_conditions"
    return "approve"


def load_intake_case(path: str | Path) -> dict[str, Any]:
    with Path(path).open(encoding="utf-8") as file:
        return json.load(file)


def risk_input_from_case(case: dict[str, Any]) -> RiskInput:
    return RiskInput(
        content_type=str(case.get("content_type", "video")),
        real_person=normalize_real_person(case.get("person_depicted", case.get("real_person", True))),
        authorized=normalize_authorized(case.get("authorization_status", case.get("authorized", False))),
        public_figure=normalize_bool(case.get("public_figure", False)),
        minor=normalize_bool(case.get("minor", False)),
        commercial=normalize_bool(case.get("commercial_use", case.get("commercial", False))),
        sensitive_context=str(case.get("sensitive_context", "none")).lower(),
        ai_labeled=normalize_bool(case.get("ai_labeled", False)),
        training_use=normalize_bool(case.get("training_use", False)),
    )


def framework_notes(case: dict[str, Any], risk: RiskInput) -> list[str]:
    regions = {str(region).strip().lower() for region in case.get("regions", [])}
    notes: list[str] = []

    if "eu" in regions or "global" in regions:
        notes.append("EU AI Act Article 50: apply transparent disclosure for AI-generated or manipulated video/audio and deepfake-style content.")
    if "china" in regions or "cn" in regions or "global" in regions:
        notes.append("China synthetic content labeling: apply visible and machine-readable labels for generated or deeply synthesized content.")
    if risk.real_person:
        notes.append("SAG-AFTRA AI principles: require clear consent, scope, compensation, and digital replica use limitations.")
    notes.append("NIST AI RMF: document Govern, Map, Measure, and Manage controls for the review path.")
    return notes


def control_recommendations(level: str, risk: RiskInput) -> list[str]:
    controls: list[str] = []

    if risk.real_person:
        controls.append("Verify likeness, voice, motion, and performance consent before generation.")
    if risk.commercial:
        controls.append("Confirm commercial-use scope, territory, duration, compensation, and secondary-use limits.")
    if not risk.ai_labeled:
        controls.append("Add visible AI disclosure, metadata label, and export-preserved provenance signal.")
    else:
        controls.append("Retain visible label, metadata label, and export logs through publication.")
    if risk.public_figure or risk.minor or risk.sensitive_context in SENSITIVE_CONTEXTS:
        controls.append("Route the case to enhanced human review before release.")
    if risk.training_use:
        controls.append("Require separate training-data authorization and data-use audit logging.")
    if level == "prohibited":
        controls.append("Block generation or publication and preserve evidence for incident review.")
    return controls


def assess_intake_case(case: dict[str, Any]) -> dict[str, Any]:
    risk = risk_input_from_case(case)
    level, reasons = score_content(risk)
    decision = decision_from_level(level)

    return {
        "case_id": case.get("case_id", "UNSPECIFIED"),
        "title": case.get("title", "Synthetic media intake case"),
        "risk_level": level,
        "decision": decision,
        "reasons": reasons,
        "framework_notes": framework_notes(case, risk),
        "recommended_controls": control_recommendations(level, risk),
        "regions": case.get("regions", []),
        "consent_evidence": case.get("consent_evidence", []),
        "license_scope": case.get("license_scope", {}),
        "raw_case": case,
    }


def render_markdown_report(assessment: dict[str, Any]) -> str:
    evidence = assessment["consent_evidence"] or ["No consent evidence provided"]
    license_scope = assessment["license_scope"] or {"scope": "No license scope provided"}

    lines = [
        f"# Compliance Intake Report: {assessment['title']}",
        "",
        "## Executive Decision",
        "",
        f"- Case ID: {assessment['case_id']}",
        f"- Risk level: {assessment['risk_level']}",
        f"- Decision: {assessment['decision']}",
        "",
        "## Risk Drivers",
        "",
    ]
    lines.extend(f"- {reason}" for reason in (assessment["reasons"] or ["No elevated risk drivers identified"]))
    lines.extend(["", "## Consent and License Evidence", ""])
    lines.extend(f"- {item}" for item in evidence)
    lines.extend(["", "## License Scope", ""])
    lines.extend(f"- {key}: {value}" for key, value in license_scope.items())
    lines.extend(["", "## Framework Notes", ""])
    lines.extend(f"- {note}" for note in assessment["framework_notes"])
    lines.extend(["", "## Recommended Controls", ""])
    lines.extend(f"- {control}" for control in assessment["recommended_controls"])
    lines.extend(["", "## Reviewer Next Steps", ""])
    lines.extend([
        "- Attach authorization records to the case file.",
        "- Confirm visible and machine-readable labeling before publication.",
        "- Log the final decision, reviewer, timestamp, and release regions.",
    ])
    return "\n".join(lines) + "\n"


def parse_bool(value: str) -> bool:
    normalized = value.strip().lower()
    if normalized in {"true", "yes", "y", "1"}:
        return True
    if normalized in {"false", "no", "n", "0"}:
        return False
    raise argparse.ArgumentTypeError(f"Expected boolean, got {value!r}")


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Score AI-generated actor or deepfake content risk."
    )
    parser.add_argument("--input", type=Path, help="Path to a JSON synthetic media intake case.")
    parser.add_argument("--output", type=Path, help="Optional path for a generated Markdown compliance report.")
    parser.add_argument("--json-output", action="store_true", help="Print the structured assessment as JSON.")
    parser.add_argument("--content-type", default="video")
    parser.add_argument("--real-person", type=parse_bool, default=True)
    parser.add_argument("--authorized", type=parse_bool, default=False)
    parser.add_argument("--public-figure", type=parse_bool, default=False)
    parser.add_argument("--minor", type=parse_bool, default=False)
    parser.add_argument("--commercial", type=parse_bool, default=False)
    parser.add_argument(
        "--sensitive-context",
        choices=["none", "sexual", "political", "medical", "financial", "defamatory"],
        default="none",
    )
    parser.add_argument("--ai-labeled", type=parse_bool, default=False)
    parser.add_argument("--training-use", type=parse_bool, default=False)

    args = parser.parse_args()
    if args.input:
        case = load_intake_case(args.input)
        assessment = assess_intake_case(case)
        report = render_markdown_report(assessment)
        if args.output:
            args.output.parent.mkdir(parents=True, exist_ok=True)
            args.output.write_text(report, encoding="utf-8")
            if not args.json_output:
                print(f"Report written to: {args.output}")
        if args.json_output:
            print(json.dumps(assessment, indent=2))
        elif not args.output:
            print(report)
        return

    risk = RiskInput(
        content_type=args.content_type,
        real_person=args.real_person,
        authorized=args.authorized,
        public_figure=args.public_figure,
        minor=args.minor,
        commercial=args.commercial,
        sensitive_context=args.sensitive_context,
        ai_labeled=args.ai_labeled,
        training_use=args.training_use,
    )

    level, reasons = score_content(risk)
    print(f"Risk level: {level}")
    print("Reasons:")
    for reason in reasons:
        print(f"- {reason}")


if __name__ == "__main__":
    main()
