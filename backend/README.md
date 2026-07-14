# FastAPI Reference Implementation

This backend is a separate engineering implementation for the synthetic media compliance workflow. It uses the same case concepts as the static GitHub Pages demo, but it is not connected to the deployed GitHub Pages site.

```text
Frontend intake
→ JSON schema validation
→ FastAPI
→ Rules engine
→ SQLite case and evidence records
→ Decision, triggered rules, report
→ Audit log
```

## Local Run

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn backend.app.main:app --reload
```

Open:

```text
http://127.0.0.1:8000/docs
```

## Tests

```bash
pytest
```

## JSON Schema

```bash
python -m backend.app.schema_export
```

The generated schema is written to `examples/case_schema.json`.

