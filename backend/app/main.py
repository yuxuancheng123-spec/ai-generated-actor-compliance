"""FastAPI service for synthetic media compliance assessments."""

from __future__ import annotations

from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

from fastapi import Depends, FastAPI, Header, HTTPException, Query, status
from sqlalchemy.orm import Session

from .database import get_db, init_db
from .schemas import (
    ActorRole,
    AssessmentRecordResponse,
    AssessmentResponse,
    CaseIntake,
    ReviewResponse,
    ReviewUpdate,
)
from .services import (
    create_assessment,
    create_audit_log,
    get_case_response,
    soft_delete_case,
    update_review_status,
)


@asynccontextmanager
async def lifespan(_: FastAPI) -> AsyncIterator[None]:
    init_db()
    yield


app = FastAPI(
    title="AI Actor Compliance Assessment API",
    description=(
        "Reference implementation for validating synthetic media intake cases, "
        "evaluating traceable rules, persisting evidence records, and producing audit logs."
    ),
    version="0.1.0",
    lifespan=lifespan,
)


def actor_role_from_header(x_actor_role: str = Header(default=ActorRole.REQUESTER.value)) -> ActorRole:
    try:
        return ActorRole(x_actor_role)
    except ValueError as exc:
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Unsupported actor role.") from exc


def require_reviewer(role: ActorRole) -> None:
    if role not in {ActorRole.REVIEWER, ActorRole.COMPLIANCE_ADMIN}:
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Reviewer or compliance_admin role required.")


def require_admin(role: ActorRole) -> None:
    if role != ActorRole.COMPLIANCE_ADMIN:
        raise HTTPException(status.HTTP_403_FORBIDDEN, "compliance_admin role required.")


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/api/v1/assessments", response_model=AssessmentResponse, status_code=status.HTTP_201_CREATED)
def create_assessment_endpoint(
    case: CaseIntake,
    db: Session = Depends(get_db),
    actor_role: ActorRole = Depends(actor_role_from_header),
) -> AssessmentResponse:
    try:
        return create_assessment(db, case, actor_role)
    except ValueError as exc:
        raise HTTPException(status.HTTP_409_CONFLICT, str(exc)) from exc


@app.get("/api/v1/assessments/{case_id}", response_model=AssessmentRecordResponse)
def get_assessment_endpoint(case_id: str, db: Session = Depends(get_db)) -> AssessmentRecordResponse:
    response = get_case_response(db, case_id)
    if response is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Assessment case not found.")
    return response


@app.get("/api/v1/assessments/{case_id}/report")
def get_report_endpoint(
    case_id: str,
    db: Session = Depends(get_db),
    actor_role: ActorRole = Depends(actor_role_from_header),
) -> dict[str, str]:
    response = get_case_response(db, case_id)
    if response is None or response.assessment is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Assessment report not found.")
    create_audit_log(
        db,
        case_id,
        actor_role,
        "report_exported",
        {"format": "markdown", "rule_version": response.assessment.rule_version},
    )
    db.commit()
    return {"case_id": case_id, "format": "markdown", "report": response.assessment.report_markdown}


@app.post("/api/v1/assessments/{case_id}/review", response_model=ReviewResponse)
def review_assessment_endpoint(
    case_id: str,
    update: ReviewUpdate,
    db: Session = Depends(get_db),
    actor_role: ActorRole = Depends(actor_role_from_header),
) -> ReviewResponse:
    require_reviewer(actor_role)
    event = update_review_status(db, case_id, update, actor_role)
    if event is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Assessment case not found.")
    return ReviewResponse(
        case_id=case_id,
        reviewer_status=update.reviewer_status,
        audit_event={
            "event_type": event.event_type,
            "actor_role": event.actor_role,
            "details": event.details,
            "created_at": event.created_at.isoformat(),
        },
    )


@app.delete("/api/v1/assessments/{case_id}", response_model=ReviewResponse)
def soft_delete_assessment_endpoint(
    case_id: str,
    reason: str = Query(default="retention_or_deletion_request"),
    db: Session = Depends(get_db),
    actor_role: ActorRole = Depends(actor_role_from_header),
) -> ReviewResponse:
    require_admin(actor_role)
    event = soft_delete_case(db, case_id, actor_role, reason)
    if event is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Assessment case not found.")
    return ReviewResponse(
        case_id=case_id,
        reviewer_status="archived",
        audit_event={
            "event_type": event.event_type,
            "actor_role": event.actor_role,
            "details": event.details,
            "created_at": event.created_at.isoformat(),
        },
    )
