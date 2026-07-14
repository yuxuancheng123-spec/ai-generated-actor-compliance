#!/usr/bin/env python3
"""CLI wrapper for the backend synthetic media compliance rules engine."""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from backend.app.compat import canonical_case_from_flat
from backend.app.rules import assess_case
from backend.app.schemas import CaseIntake


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


def load_intake_case(path: str | Path) -> dict[str, Any]:
    with Path(path).open(encoding="utf-8") as file:
        return json.load(file)


def assess_intake_case(case: dict[str, Any]) -> dict[str, Any]:
    intake = CaseIntake.model_validate(case) if "requester" in case else canonical_case_from_flat(case)
    assessment = assess_case(intake)
    return assessment.model_dump(mode="json")


def render_markdown_report(assessment: dict[str, Any]) -> str:
    return assessment["report_markdown"]


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

    case = {
        "case_id": "CLI-DEMO",
        "title": "CLI synthetic media assessment",
        "content_type": args.content_type,
        "real_person": args.real_person,
        "authorized": args.authorized,
        "public_figure": args.public_figure,
        "minor": args.minor,
        "commercial_use": args.commercial,
        "sensitive_context": args.sensitive_context,
        "ai_labeled": args.ai_labeled,
        "training_use": args.training_use,
        "regions": ["EU", "China"],
    }
    assessment = assess_intake_case(case)
    print(f"Risk level: {assessment['risk_level']}")
    print(f"Decision: {assessment['decision']}")
    print(f"Total score: {assessment['total_score']}")
    print("Rule trace:")
    for rule in assessment["triggered_rules"]:
        marker = " HARD STOP" if rule["hard_stop"] else ""
        print(f"- {rule['rule_id']} {rule['title']} +{rule['score']}{marker}")


if __name__ == "__main__":
    main()
