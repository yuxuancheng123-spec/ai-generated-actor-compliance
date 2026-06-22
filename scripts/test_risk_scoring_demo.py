import json
import sys
import tempfile
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

from risk_scoring_demo import assess_intake_case, load_intake_case, render_markdown_report


class RiskScoringDemoTest(unittest.TestCase):
    def test_json_intake_case_generates_assessment_and_markdown_report(self) -> None:
        case = {
            "case_id": "CASE-001",
            "title": "Licensed performer advertisement",
            "requester_type": "brand",
            "content_type": "video",
            "person_depicted": "real_person",
            "authorization_status": "verified",
            "public_figure": False,
            "minor": False,
            "commercial_use": True,
            "sensitive_context": "none",
            "ai_labeled": True,
            "training_use": False,
            "regions": ["EU", "China", "US"],
            "consent_evidence": ["signed likeness release", "voice replica addendum"],
            "license_scope": {
                "purpose": "digital advertisement",
                "duration": "6 months",
                "territory": "EU, China, US",
                "revocation": "contractual notice",
            },
        }

        with tempfile.TemporaryDirectory() as tmpdir:
            input_path = Path(tmpdir) / "case.json"
            input_path.write_text(json.dumps(case), encoding="utf-8")

            loaded = load_intake_case(input_path)
            assessment = assess_intake_case(loaded)
            report = render_markdown_report(assessment)

        self.assertEqual(assessment["risk_level"], "medium")
        self.assertEqual(assessment["decision"], "approve_with_conditions")
        self.assertIn("EU AI Act Article 50", report)
        self.assertIn("China synthetic content labeling", report)
        self.assertIn("signed likeness release", report)


if __name__ == "__main__":
    unittest.main()
