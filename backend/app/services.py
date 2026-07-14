"""Persistence helpers for assessments and audit events."""

from __future__ import annotations

from datetime import datetime, timezone
from typing import Any

from sqlalchemy.orm import Session

from .models import (
    AssessmentResult,
    AuditLog,
    CaseRecord,
    ConsentRecord,
    EvidenceRecord,
    TriggeredRuleRecord,
)
from .rules import assess_case
from .schemas import (
    ActorRole,
    AssessmentRecordResponse,
    AssessmentResponse,
    CaseIntake,
    ReviewUpdate,
    TriggeredRule,
)


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


def create_audit_log(
    db: Session,
    case_id: str,
    actor_role: ActorRole,
    event_type: str,
    details: dict[str, Any],
) -> AuditLog:
    event = AuditLog(
        case_id=case_id,
        actor_role=actor_role.value,
        event_type=event_type,
        details=details,
    )
    db.add(event)
    return event


def create_assessment(db: Session, case: CaseIntake, actor_role: ActorRole) -> AssessmentResponse:
    existing = db.query(CaseRecord).filter(CaseRecord.case_id == case.case_id).one_or_none()
    if existing and existing.deleted_at is None:
        raise ValueError(f"Case {case.case_id} already exists.")

    assessment = assess_case(case)
    case_json = case.model_dump(mode="json")
    case_record = CaseRecord(
        case_id=case.case_id,
        title=case.title,
        requester_type=case.requester.requester_type.value,
        person_type=case.represented_person.person_type.value,
        reviewer_status=case.reviewer_status.value,
        retention_until=str(case.timestamps.retention_until) if case.timestamps.retention_until else None,
        case_json=case_json,
    )
    db.add(case_record)

    consent = case.consent
    db.add(
        ConsentRecord(
            case_id=case.case_id,
            consent_status=consent.consent_status.value,
            authorizing_party=consent.authorizing_party,
            authorized_party=consent.authorized_party,
            purpose=consent.purpose,
            allowed_uses={
                "likeness_scope": consent.likeness_scope.value,
                "voice_scope": consent.voice_scope.value,
                "motion_scope": consent.motion_scope.value,
                "performance_scope": consent.performance_scope.value,
                "commercial_use_authorized": consent.commercial_use_authorized.value,
            },
            prohibited_uses=consent.prohibited_uses,
            territory=[region.value for region in consent.territory],
            duration_start=str(consent.duration_start) if consent.duration_start else None,
            duration_end=str(consent.duration_end) if consent.duration_end else None,
            training_use_authorized=consent.training_use_authorized.value,
            secondary_use_authorized=consent.secondary_use_authorized.value,
            revocation_path=consent.revocation_path,
            compensation_terms=consent.compensation_terms,
            evidence_reference=consent.evidence_reference,
        )
    )

    for evidence in case.evidence_attachments:
        db.add(
            EvidenceRecord(
                case_id=case.case_id,
                evidence_id=evidence.evidence_id,
                evidence_type=evidence.evidence_type,
                owner=evidence.owner,
                uri=evidence.uri,
                verification_status=evidence.verification_status.value,
                retention_until=str(evidence.retention_until) if evidence.retention_until else None,
                evidence_metadata=evidence.metadata,
            )
        )

    assessment_record = AssessmentResult(
        case_id=case.case_id,
        rule_version=assessment.rule_version,
        total_score=assessment.total_score,
        risk_level=assessment.risk_level.value,
        decision=assessment.decision.value,
        reviewer_path=assessment.reviewer_path,
        missing_information=assessment.missing_information,
        recommended_controls=assessment.recommended_controls,
        report_markdown=assessment.report_markdown,
    )
    db.add(assessment_record)
    db.flush()

    for rule in assessment.triggered_rules:
        db.add(
            TriggeredRuleRecord(
                assessment_id=assessment_record.id,
                rule_id=rule.rule_id,
                title=rule.title,
                description=rule.description,
                severity=rule.severity.value,
                score=rule.score,
                hard_stop=rule.hard_stop,
                affected_domain=rule.affected_domain,
                recommended_control=rule.recommended_control,
                source_reference=rule.source_reference,
                version=rule.version,
            )
        )

    create_audit_log(
        db,
        case.case_id,
        actor_role,
        "case_created",
        {"schema_version": case.schema_version, "title": case.title},
    )
    create_audit_log(
        db,
        case.case_id,
        actor_role,
        "assessment_completed",
        {
            "rule_version": assessment.rule_version,
            "decision": assessment.decision.value,
            "risk_level": assessment.risk_level.value,
            "total_score": assessment.total_score,
        },
    )
    db.commit()
    return assessment


def _assessment_response(record: AssessmentResult | None) -> AssessmentResponse | None:
    if record is None:
        return None
    rules = [
        TriggeredRule(
            rule_id=rule.rule_id,
            title=rule.title,
            description=rule.description,
            severity=rule.severity,
            score=rule.score,
            hard_stop=rule.hard_stop,
            affected_domain=rule.affected_domain,
            recommended_control=rule.recommended_control,
            source_reference=rule.source_reference,
            version=rule.version,
        )
        for rule in record.triggered_rules
    ]
    return AssessmentResponse(
        case_id=record.case_id,
        rule_version=record.rule_version,
        total_score=record.total_score,
        risk_level=record.risk_level,
        decision=record.decision,
        triggered_rules=rules,
        hard_stops=[rule for rule in rules if rule.hard_stop],
        recommended_controls=record.recommended_controls,
        missing_information=record.missing_information,
        reviewer_path=record.reviewer_path,
        report_markdown=record.report_markdown,
    )


def get_case_record(db: Session, case_id: str) -> CaseRecord | None:
    return db.query(CaseRecord).filter(CaseRecord.case_id == case_id).one_or_none()


def get_case_response(db: Session, case_id: str) -> AssessmentRecordResponse | None:
    record = get_case_record(db, case_id)
    if record is None:
        return None
    latest = (
        db.query(AssessmentResult)
        .filter(AssessmentResult.case_id == case_id)
        .order_by(AssessmentResult.created_at.desc())
        .first()
    )
    events = (
        db.query(AuditLog)
        .filter(AuditLog.case_id == case_id)
        .order_by(AuditLog.created_at.asc())
        .all()
    )
    return AssessmentRecordResponse(
        case_id=case_id,
        deleted=record.deleted_at is not None,
        intake=record.case_json,
        assessment=_assessment_response(latest),
        audit_events=[
            {
                "event_type": event.event_type,
                "actor_role": event.actor_role,
                "details": event.details,
                "created_at": event.created_at.isoformat(),
            }
            for event in events
        ],
    )


def update_review_status(db: Session, case_id: str, update: ReviewUpdate, actor_role: ActorRole) -> AuditLog | None:
    record = get_case_record(db, case_id)
    if record is None:
        return None
    record.reviewer_status = update.reviewer_status.value
    record.updated_at = utc_now()
    event = create_audit_log(
        db,
        case_id,
        actor_role,
        "review_updated",
        {
            "reviewer": update.reviewer,
            "reviewer_status": update.reviewer_status.value,
            "final_decision": update.final_decision.value if update.final_decision else None,
            "notes": update.notes,
        },
    )
    db.commit()
    db.refresh(event)
    return event


def soft_delete_case(db: Session, case_id: str, actor_role: ActorRole, reason: str) -> AuditLog | None:
    record = get_case_record(db, case_id)
    if record is None:
        return None
    record.deleted_at = utc_now()
    record.updated_at = utc_now()
    event = create_audit_log(
        db,
        case_id,
        actor_role,
        "deletion_requested",
        {"reason": reason, "mode": "soft_delete", "deleted_at": record.deleted_at.isoformat()},
    )
    db.commit()
    db.refresh(event)
    return event

