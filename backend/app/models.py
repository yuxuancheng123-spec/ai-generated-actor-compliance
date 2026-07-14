"""SQLAlchemy persistence models for case, evidence, assessment, and audit data."""

from __future__ import annotations

from datetime import datetime, timezone
from typing import Any

from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.types import JSON

from .database import Base


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


class CaseRecord(Base):
    __tablename__ = "case_records"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    case_id: Mapped[str] = mapped_column(String(64), unique=True, index=True)
    title: Mapped[str] = mapped_column(String(255))
    requester_type: Mapped[str] = mapped_column(String(64))
    person_type: Mapped[str] = mapped_column(String(64))
    reviewer_status: Mapped[str] = mapped_column(String(64), default="pending")
    retention_until: Mapped[str | None] = mapped_column(String(32), nullable=True)
    case_json: Mapped[dict[str, Any]] = mapped_column(JSON)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)
    deleted_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    consent_records: Mapped[list["ConsentRecord"]] = relationship(cascade="all, delete-orphan")
    evidence_records: Mapped[list["EvidenceRecord"]] = relationship(cascade="all, delete-orphan")
    assessment_results: Mapped[list["AssessmentResult"]] = relationship(cascade="all, delete-orphan")
    audit_logs: Mapped[list["AuditLog"]] = relationship(cascade="all, delete-orphan")


class ConsentRecord(Base):
    __tablename__ = "consent_records"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    case_id: Mapped[str] = mapped_column(ForeignKey("case_records.case_id"), index=True)
    consent_status: Mapped[str] = mapped_column(String(64))
    authorizing_party: Mapped[str | None] = mapped_column(String(255), nullable=True)
    authorized_party: Mapped[str | None] = mapped_column(String(255), nullable=True)
    purpose: Mapped[str | None] = mapped_column(Text, nullable=True)
    allowed_uses: Mapped[dict[str, Any]] = mapped_column(JSON)
    prohibited_uses: Mapped[list[str]] = mapped_column(JSON)
    territory: Mapped[list[str]] = mapped_column(JSON)
    duration_start: Mapped[str | None] = mapped_column(String(32), nullable=True)
    duration_end: Mapped[str | None] = mapped_column(String(32), nullable=True)
    training_use_authorized: Mapped[str] = mapped_column(String(32))
    secondary_use_authorized: Mapped[str] = mapped_column(String(32))
    revocation_path: Mapped[str | None] = mapped_column(Text, nullable=True)
    compensation_terms: Mapped[str | None] = mapped_column(Text, nullable=True)
    evidence_reference: Mapped[str | None] = mapped_column(Text, nullable=True)


class EvidenceRecord(Base):
    __tablename__ = "evidence_records"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    case_id: Mapped[str] = mapped_column(ForeignKey("case_records.case_id"), index=True)
    evidence_id: Mapped[str] = mapped_column(String(64), index=True)
    evidence_type: Mapped[str] = mapped_column(String(128))
    owner: Mapped[str | None] = mapped_column(String(255), nullable=True)
    uri: Mapped[str | None] = mapped_column(Text, nullable=True)
    verification_status: Mapped[str] = mapped_column(String(64))
    retention_until: Mapped[str | None] = mapped_column(String(32), nullable=True)
    evidence_metadata: Mapped[dict[str, Any]] = mapped_column(JSON)


class AssessmentResult(Base):
    __tablename__ = "assessment_results"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    case_id: Mapped[str] = mapped_column(ForeignKey("case_records.case_id"), index=True)
    rule_version: Mapped[str] = mapped_column(String(128))
    total_score: Mapped[int] = mapped_column(Integer)
    risk_level: Mapped[str] = mapped_column(String(64))
    decision: Mapped[str] = mapped_column(String(64))
    reviewer_path: Mapped[str] = mapped_column(String(128))
    missing_information: Mapped[list[str]] = mapped_column(JSON)
    recommended_controls: Mapped[list[str]] = mapped_column(JSON)
    report_markdown: Mapped[str] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)

    triggered_rules: Mapped[list["TriggeredRuleRecord"]] = relationship(cascade="all, delete-orphan")


class TriggeredRuleRecord(Base):
    __tablename__ = "triggered_rules"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    assessment_id: Mapped[int] = mapped_column(ForeignKey("assessment_results.id"), index=True)
    rule_id: Mapped[str] = mapped_column(String(32))
    title: Mapped[str] = mapped_column(String(255))
    description: Mapped[str] = mapped_column(Text)
    severity: Mapped[str] = mapped_column(String(32))
    score: Mapped[int] = mapped_column(Integer)
    hard_stop: Mapped[bool] = mapped_column(Boolean)
    affected_domain: Mapped[str] = mapped_column(String(128))
    recommended_control: Mapped[str] = mapped_column(Text)
    source_reference: Mapped[str] = mapped_column(Text)
    version: Mapped[str] = mapped_column(String(128))


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    case_id: Mapped[str] = mapped_column(ForeignKey("case_records.case_id"), index=True)
    actor_role: Mapped[str] = mapped_column(String(64))
    event_type: Mapped[str] = mapped_column(String(96))
    details: Mapped[dict[str, Any]] = mapped_column(JSON)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)

