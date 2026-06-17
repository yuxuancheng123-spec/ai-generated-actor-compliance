# Scripts

## Risk Scoring Demo

`risk_scoring_demo.py` is a small rule-based demo showing how compliance rules can be translated into a repeatable content risk classification.

Example:

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

Expected result: `prohibited`, because the content uses or imitates a real person without verified authorization.

