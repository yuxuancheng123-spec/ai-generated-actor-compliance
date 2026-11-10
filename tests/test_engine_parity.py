"""The static demo's JS rule engine must agree with the backend on every case.

Runs web/rules-engine.js under Node on: the canonical examples, the four demo cases (converted by the
demo's own adapter and then validated by the backend schema), and a few hundred random cases.
Skipped if Node is not installed.
"""

from __future__ import annotations

import json
import random
import shutil
import subprocess
from pathlib import Path

import pytest

from backend.app.rules import assess_case
from backend.app.schemas import CaseIntake

ROOT = Path(__file__).resolve().parents[1]
NODE = shutil.which("node")
pytestmark = pytest.mark.skipif(NODE is None, reason="Node.js is required for the JS engine")

STATUSES = ["not_provided", "unknown", "unverified", "verified", "expired", "rejected"]
YNU = ["yes", "no", "unknown", "not_provided"]


def backend(case: dict) -> dict:
    result = assess_case(CaseIntake.model_validate(case))
    return {
        "rule_ids": [rule.rule_id for rule in result.triggered_rules],
        "total_score": result.total_score,
        "risk_level": result.risk_level.value,
        "decision": result.decision.value,
        "missing_information": result.missing_information,
        "reviewer_path": result.reviewer_path,
    }


def run_js(canonical: list[dict], demo: list[dict]) -> dict:
    completed = subprocess.run(
        [NODE, str(ROOT / "tests" / "engine_runner.js")],
        input=json.dumps({"canonical": canonical, "demo": demo}),
        capture_output=True, text=True, check=True,
    )
    return json.loads(completed.stdout)


def demo_cases() -> list[dict]:
    script = "global.window={};require('./web/case-records.js');process.stdout.write(JSON.stringify(window.COMPLIANCE_DEMO_DATA.cases))"
    out = subprocess.run([NODE, "-e", script], cwd=ROOT, capture_output=True, text=True, check=True).stdout
    return json.loads(out)


def random_case(rng: random.Random, index: int) -> dict:
    media = rng.sample(["facial_image", "voice_sample", "video_clip", "motion_capture", "prior_performance", "prompt_only"], rng.randint(1, 3))
    regions = rng.sample(["eu", "china", "us", "global", "other", "not_provided"], rng.randint(1, 2))
    return {
        "case_id": f"RANDOM-{index}",
        "title": "Random parity case",
        "requester": {"requester_type": rng.choice(["individual_creator", "brand_advertiser", "production_company", "performer_owner", "unknown"])},
        "represented_person": {
            "person_type": rng.choice(["fully_synthetic", "self", "ordinary_person", "performer", "public_figure", "political_figure", "minor", "unknown"]),
            "identity_verification": rng.choice(STATUSES),
            "is_public_figure": rng.choice(YNU),
            "is_minor": rng.choice(YNU),
        },
        "source_media": {"media_types": media},
        "intended_use": {
            "use_case": rng.choice(["short_drama", "advertisement", "virtual_influencer", "fan_content", "parody", "political_message", "internal_test", "model_training", "other"]),
            "commercial_use": rng.choice(YNU),
            "sensitive_context": rng.choice(["none", "sexual", "political", "medical", "financial", "defamatory", "violence", "unknown", "not_provided"]),
            "distribution_regions": regions,
            "includes_training_use": rng.choice(YNU),
        },
        "consent": {
            "consent_status": rng.choice(STATUSES),
            "likeness_scope": rng.choice(STATUSES), "voice_scope": rng.choice(STATUSES),
            "motion_scope": rng.choice(STATUSES), "performance_scope": rng.choice(STATUSES),
            "training_use_authorized": rng.choice(YNU),
            "territory": rng.choice([[], ["china"], ["eu", "us"]]),
            "duration_end": rng.choice([None, "2027-12-31"]),
            "revocation_path": rng.choice([None, "documented"]),
            "compensation_terms": rng.choice([None, "documented"]),
        },
        "disclosure_plan": {k: rng.choice(STATUSES) for k in ("visible_label", "machine_readable_metadata", "watermark")},
        "provenance_controls": {k: rng.choice(STATUSES) for k in ("output_hash_registry", "export_event_logged")},
    }


def clean_case(rng: random.Random, index: int) -> dict:
    """Mostly verified cases, so approve and conditional paths are exercised too."""
    case = random_case(rng, 1000 + index)
    case["represented_person"].update(identity_verification="verified", is_minor="no")
    case["intended_use"].update(
        commercial_use=rng.choice(["yes", "no"]),
        sensitive_context=rng.choice(["none", "none", "none", "political"]),
        distribution_regions=[rng.choice(["eu", "china", "us"])],
    )
    for key in ("consent_status", "likeness_scope", "voice_scope", "motion_scope", "performance_scope"):
        case["consent"][key] = "verified"
    for key in case["disclosure_plan"]:
        case["disclosure_plan"][key] = rng.choice(["verified", "verified", "verified", "unverified"])
    for key in case["provenance_controls"]:
        case["provenance_controls"][key] = rng.choice(["verified", "verified", "unknown"])
    return case


def test_random_cases_cover_every_rule_and_decision() -> None:
    rng = random.Random(20261110)
    results = [backend(random_case(rng, i)) for i in range(400)] + [backend(clean_case(rng, i)) for i in range(200)]
    assert {rule for r in results for rule in r["rule_ids"]} == {f"R-{n:02d}" for n in range(1, 14)}
    assert {r["decision"] for r in results} == {"approve", "approve_with_conditions", "manual_review", "reject"}


def test_canonical_examples_and_random_cases_agree() -> None:
    examples = [json.loads(p.read_text(encoding="utf-8")) for p in sorted((ROOT / "examples").glob("*.json")) if p.name != "case_schema.json"]
    rng = random.Random(20261110)
    cases = examples + [random_case(rng, i) for i in range(400)] + [clean_case(rng, i) for i in range(200)]
    js = run_js(cases, [])["canonical"]
    for case, js_result in zip(cases, js):
        assert js_result == backend(case), case["case_id"]


def test_demo_cases_agree_and_validate_against_backend_schema() -> None:
    demos = demo_cases()
    js = run_js([], [{"id": d["id"], "intake": d["intake"]} for d in demos])["demo"]
    for demo, item in zip(demos, js):
        assert item["result"] == backend(item["canonical"]), demo["id"]


def test_generated_rules_data_is_current() -> None:
    import importlib.util

    spec = importlib.util.spec_from_file_location("build_web_rules", ROOT / "scripts" / "build_web_rules.py")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    assert (ROOT / "web" / "rules-data.js").read_text(encoding="utf-8") == module.render(), "run scripts/build_web_rules.py"
