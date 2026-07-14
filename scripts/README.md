# Risk Scoring Demo

`risk_scoring_demo.py` is now a CLI wrapper around the backend rules engine in `backend/app/rules.py`. It exists so reviewers can run the same core assessment logic without starting FastAPI.

The demo is deterministic and rule-based. It is not an ML model, not legal advice, and not a replacement for human review.

## Relationship to the Web Demo

The deployed GitHub Pages demo runs client-side. The FastAPI service and this CLI are separate engineering implementations. They use the same case concepts, but the deployed web page does not call Python.

## Run a Canonical JSON Case

```bash
python3 scripts/risk_scoring_demo.py \
  --input examples/unauthorized_public_figure_ad.json \
  --json-output
```

Generate a Markdown report:

```bash
python3 scripts/risk_scoring_demo.py \
  --input examples/unauthorized_public_figure_ad.json \
  --output scripts/generated_compliance_report.md
```

## Run With Flags

```bash
python3 scripts/risk_scoring_demo.py \
  --content-type video \
  --real-person true \
  --authorized false \
  --public-figure true \
  --commercial true \
  --sensitive-context none \
  --ai-labeled false
```

Expected trace:

```text
Risk level: prohibited
Decision: reject
Rule trace:
- R-01 Real-person commercial use without verified authorization +5 HARD STOP
```

## Example Scenarios

| Scenario | Example file | Expected decision |
|---|---|---|
| Authorized performer workflow | `examples/authorized_performer_case.json` | `approve` |
| Unauthorized public figure ad | `examples/unauthorized_public_figure_ad.json` | `reject` |
| Minor in sensitive context | `examples/minor_sensitive_case.json` | `reject` |
| Training use without authorization | `examples/unauthorized_training_case.json` | `reject` |
| Unknown / incomplete evidence | `examples/incomplete_unknown_case.json` | `manual_review` |

## Output Fields

The structured output includes:

- `total_score`
- `risk_level`
- `decision`
- `triggered_rules`
- `hard_stops`
- `recommended_controls`
- `missing_information`
- `reviewer_path`
- `report_markdown`

Each triggered rule includes `rule_id`, title, description, severity, score, hard-stop flag, affected domain, recommended control, source reference, and rule version.

## Test

```bash
pytest scripts/test_risk_scoring_demo.py
```
