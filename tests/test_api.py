from __future__ import annotations

import json
from collections.abc import Generator
from pathlib import Path

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.pool import StaticPool

from backend.app.database import Base
from backend.app.main import app
from backend.app.main import get_db as app_get_db


ROOT = Path(__file__).resolve().parents[1]


@pytest.fixture()
def client() -> Generator[TestClient, None, None]:
    engine = create_engine(
        "sqlite+pysqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    Base.metadata.create_all(bind=engine)

    def override_get_db() -> Generator[Session, None, None]:
        db = TestingSessionLocal()
        try:
            yield db
        finally:
            db.close()

    app.dependency_overrides[app_get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


def load_case(filename: str) -> dict:
    return json.loads((ROOT / "examples" / filename).read_text(encoding="utf-8"))


def test_create_assessment_persists_case_result_rules_and_audit_log(client: TestClient) -> None:
    case = load_case("unauthorized_public_figure_ad.json")

    create_response = client.post("/api/v1/assessments", json=case)

    assert create_response.status_code == 201
    created = create_response.json()
    assert created["decision"] == "reject"
    assert created["hard_stops"][0]["rule_id"] == "R-01"
    assert created["rule_version"]

    get_response = client.get(f"/api/v1/assessments/{case['case_id']}")
    assert get_response.status_code == 200
    record = get_response.json()
    assert record["case_id"] == case["case_id"]
    assert record["assessment"]["decision"] == "reject"
    assert [event["event_type"] for event in record["audit_events"]] == [
        "case_created",
        "assessment_completed",
    ]


def test_get_report_returns_markdown_with_rule_trace(client: TestClient) -> None:
    case = load_case("unauthorized_public_figure_ad.json")
    client.post("/api/v1/assessments", json=case)

    response = client.get(f"/api/v1/assessments/{case['case_id']}/report")

    assert response.status_code == 200
    body = response.json()
    assert body["format"] == "markdown"
    assert "R-01 Real-person commercial use without verified authorization +5 HARD STOP" in body["report"]
    record = client.get(f"/api/v1/assessments/{case['case_id']}").json()
    assert record["audit_events"][-1]["event_type"] == "report_exported"


def test_reviewer_update_requires_reviewer_role_and_logs_event(client: TestClient) -> None:
    case = load_case("authorized_performer_case.json")
    client.post("/api/v1/assessments", json=case)
    payload = {
        "reviewer_status": "approved_with_conditions",
        "reviewer": "reviewer@example.com",
        "notes": "Release after final label screenshot is attached.",
        "final_decision": "approve_with_conditions",
    }

    forbidden = client.post(f"/api/v1/assessments/{case['case_id']}/review", json=payload)
    assert forbidden.status_code == 403

    allowed = client.post(
        f"/api/v1/assessments/{case['case_id']}/review",
        json=payload,
        headers={"X-Actor-Role": "reviewer"},
    )

    assert allowed.status_code == 200
    assert allowed.json()["audit_event"]["event_type"] == "review_updated"
    record = client.get(f"/api/v1/assessments/{case['case_id']}").json()
    assert record["audit_events"][-1]["event_type"] == "review_updated"


def test_soft_delete_requires_admin_and_keeps_audit_record(client: TestClient) -> None:
    case = load_case("authorized_performer_case.json")
    client.post("/api/v1/assessments", json=case)

    forbidden = client.delete(f"/api/v1/assessments/{case['case_id']}")
    assert forbidden.status_code == 403

    deleted = client.delete(
        f"/api/v1/assessments/{case['case_id']}",
        headers={"X-Actor-Role": "compliance_admin"},
    )
    assert deleted.status_code == 200

    record = client.get(f"/api/v1/assessments/{case['case_id']}").json()
    assert record["deleted"] is True
    assert record["audit_events"][-1]["event_type"] == "deletion_requested"
