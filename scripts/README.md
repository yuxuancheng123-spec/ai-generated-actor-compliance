# Risk Scoring Demo

`risk_scoring_demo.py` is a small rule-based demo that shows how platform compliance requirements can be translated into repeatable content review logic.

It is intentionally simple. It is not an ML model, not a legal determination engine, and not a replacement for human review. Its purpose is to demonstrate how a synthetic media platform could encode baseline controls such as authorization, public figure review, child-safety escalation, sensitive-context review, AI labeling, and training-data restrictions.

## How to Run

From the project root:

```bash
python3 scripts/risk_scoring_demo.py
```

The default scenario is intentionally strict: it assumes real-person content without verified authorization and returns `prohibited`.

## Scenario 1: Prohibited

Unauthorized public figure commercial content:

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

Expected result:

```text
Risk level: prohibited
Reasons:
- uses or imitates a real person
- no verified authorization for real-person likeness or voice
```

## Scenario 2: Medium

Authorized commercial real-person content:

```bash
python3 scripts/risk_scoring_demo.py \
  --content-type video \
  --real-person true \
  --authorized true \
  --public-figure false \
  --minor false \
  --commercial true \
  --sensitive-context none \
  --ai-labeled true \
  --training-use false
```

Expected result:

```text
Risk level: medium
Reasons:
- uses or imitates a real person
- commercial or endorsement use
```

## Scenario 3: Low

Fully synthetic labeled non-commercial content:

```bash
python3 scripts/risk_scoring_demo.py \
  --content-type video \
  --real-person false \
  --authorized false \
  --public-figure false \
  --minor false \
  --commercial false \
  --sensitive-context none \
  --ai-labeled true \
  --training-use false
```

Expected result:

```text
Risk level: low
Reasons:
```

## Compliance Logic Covered

The demo reflects the project controls in a simplified way:

- Real-person likeness or voice without verified authorization is prohibited.
- Real-person sexual or defamatory synthetic portrayals are prohibited.
- Minor plus sensitive context is prohibited.
- Public figure, commercial, training, and missing-label factors increase risk.
- Authorized real-person content can still require medium or high review depending on context.

