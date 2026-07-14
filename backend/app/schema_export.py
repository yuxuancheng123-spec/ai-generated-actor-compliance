"""Export the canonical Pydantic case schema as JSON Schema."""

from __future__ import annotations

import json
from pathlib import Path

from .schemas import CaseIntake


def export_schema(output_path: Path) -> None:
    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(
        json.dumps(CaseIntake.model_json_schema(), indent=2),
        encoding="utf-8",
    )


if __name__ == "__main__":
    export_schema(Path("examples/case_schema.json"))

