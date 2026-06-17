#!/usr/bin/env python3
"""Simple rule-based risk scoring demo for AI-generated actor content."""

from __future__ import annotations

import argparse
from dataclasses import dataclass


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

