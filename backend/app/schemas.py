"""Canonical case schema for synthetic media compliance assessments.

The browser demo remains a static client-side experience. These Pydantic models
are the engineering reference schema used by the FastAPI service, rules engine,
JSON Schema export, and tests.
"""

from __future__ import annotations

from datetime import date, datetime, timezone
from enum import StrEnum
from typing import Any
from uuid import uuid4

from pydantic import BaseModel, ConfigDict, Field, field_validator


SCHEMA_VERSION = "2026-07-14"


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


class RequesterType(StrEnum):
    INDIVIDUAL_CREATOR = "individual_creator"
    BRAND_ADVERTISER = "brand_advertiser"
    PRODUCTION_COMPANY = "production_company"
    PERFORMER_OWNER = "performer_owner"
    PLATFORM_OPERATOR = "platform_operator"
    UNKNOWN = "unknown"


class PersonType(StrEnum):
    FULLY_SYNTHETIC = "fully_synthetic"
    SELF = "self"
    ORDINARY_PERSON = "ordinary_person"
    PERFORMER = "performer"
    PUBLIC_FIGURE = "public_figure"
    POLITICAL_FIGURE = "political_figure"
    MINOR = "minor"
    UNKNOWN = "unknown"


class VerificationStatus(StrEnum):
    NOT_PROVIDED = "not_provided"
    UNKNOWN = "unknown"
    UNVERIFIED = "unverified"
    VERIFIED = "verified"
    EXPIRED = "expired"
    REJECTED = "rejected"


class YesNoUnknown(StrEnum):
    YES = "yes"
    NO = "no"
    UNKNOWN = "unknown"
    NOT_PROVIDED = "not_provided"


class SourceMediaType(StrEnum):
    FACIAL_IMAGE = "facial_image"
    VOICE_SAMPLE = "voice_sample"
    VIDEO_CLIP = "video_clip"
    MOTION_CAPTURE = "motion_capture"
    PRIOR_PERFORMANCE = "prior_performance"
    PROMPT_ONLY = "prompt_only"
    OTHER = "other"


class IntendedUse(StrEnum):
    SHORT_DRAMA = "short_drama"
    ADVERTISEMENT = "advertisement"
    VIRTUAL_INFLUENCER = "virtual_influencer"
    FAN_CONTENT = "fan_content"
    PARODY = "parody"
    POLITICAL_MESSAGE = "political_message"
    INTERNAL_TEST = "internal_test"
    MODEL_TRAINING = "model_training"
    OTHER = "other"


class SensitiveContext(StrEnum):
    NONE = "none"
    SEXUAL = "sexual"
    POLITICAL = "political"
    MEDICAL = "medical"
    FINANCIAL = "financial"
    DEFAMATORY = "defamatory"
    VIOLENCE = "violence"
    UNKNOWN = "unknown"
    NOT_PROVIDED = "not_provided"


class DistributionRegion(StrEnum):
    EU = "eu"
    CHINA = "china"
    US = "us"
    GLOBAL = "global"
    OTHER = "other"
    NOT_PROVIDED = "not_provided"


class ReviewerStatus(StrEnum):
    PENDING = "pending"
    IN_REVIEW = "in_review"
    APPROVED = "approved"
    APPROVED_WITH_CONDITIONS = "approved_with_conditions"
    REJECTED = "rejected"
    ARCHIVED = "archived"


class ActorRole(StrEnum):
    REQUESTER = "requester"
    REVIEWER = "reviewer"
    COMPLIANCE_ADMIN = "compliance_admin"


class RiskLevel(StrEnum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    PROHIBITED = "prohibited"


class Decision(StrEnum):
    APPROVE = "approve"
    APPROVE_WITH_CONDITIONS = "approve_with_conditions"
    MANUAL_REVIEW = "manual_review"
    REJECT = "reject"


class RuleSeverity(StrEnum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class Requester(BaseModel):
    model_config = ConfigDict(extra="forbid")

    requester_type: RequesterType
    organization_name: str | None = None
    contact_email: str | None = None
    role: ActorRole = ActorRole.REQUESTER


class RepresentedPerson(BaseModel):
    model_config = ConfigDict(extra="forbid")

    person_type: PersonType
    identity_verification: VerificationStatus
    is_public_figure: YesNoUnknown = YesNoUnknown.UNKNOWN
    is_minor: YesNoUnknown = YesNoUnknown.UNKNOWN
    relationship_to_requester: str | None = None


class SourceMedia(BaseModel):
    model_config = ConfigDict(extra="forbid")

    media_types: list[SourceMediaType]
    source_owner: str | None = None
    collection_context: str | None = None
    pii_categories: list[str] = Field(default_factory=list)
    evidence_status: VerificationStatus = VerificationStatus.UNKNOWN

    @field_validator("media_types")
    @classmethod
    def media_types_required(cls, value: list[SourceMediaType]) -> list[SourceMediaType]:
        if not value:
            raise ValueError("At least one source media type is required.")
        return value


class IntendedUsePlan(BaseModel):
    model_config = ConfigDict(extra="forbid")

    use_case: IntendedUse
    commercial_use: YesNoUnknown
    sensitive_context: SensitiveContext
    distribution_regions: list[DistributionRegion]
    publication_channel: str | None = None
    audience: str | None = None

    @field_validator("distribution_regions")
    @classmethod
    def regions_required(cls, value: list[DistributionRegion]) -> list[DistributionRegion]:
        if not value:
            raise ValueError("At least one distribution region is required.")
        return value


class ConsentRecordInput(BaseModel):
    model_config = ConfigDict(extra="forbid")

    consent_status: VerificationStatus
    authorizing_party: str | None = None
    authorized_party: str | None = None
    purpose: str | None = None
    likeness_scope: VerificationStatus = VerificationStatus.UNKNOWN
    voice_scope: VerificationStatus = VerificationStatus.UNKNOWN
    motion_scope: VerificationStatus = VerificationStatus.UNKNOWN
    performance_scope: VerificationStatus = VerificationStatus.UNKNOWN
    commercial_use_authorized: YesNoUnknown = YesNoUnknown.UNKNOWN
    training_use_authorized: YesNoUnknown = YesNoUnknown.UNKNOWN
    secondary_use_authorized: YesNoUnknown = YesNoUnknown.UNKNOWN
    territory: list[DistributionRegion] = Field(default_factory=list)
    duration_start: date | None = None
    duration_end: date | None = None
    revocation_path: str | None = None
    compensation_terms: str | None = None
    prohibited_uses: list[str] = Field(default_factory=list)
    evidence_reference: str | None = None


class DisclosurePlan(BaseModel):
    model_config = ConfigDict(extra="forbid")

    visible_label: VerificationStatus
    machine_readable_metadata: VerificationStatus
    watermark: VerificationStatus
    platform_disclosure: VerificationStatus = VerificationStatus.UNKNOWN
    c2pa_content_credentials: VerificationStatus = VerificationStatus.UNKNOWN
    label_text: str | None = None


class ProvenanceControls(BaseModel):
    model_config = ConfigDict(extra="forbid")

    source_media_hashing: VerificationStatus = VerificationStatus.UNKNOWN
    output_hash_registry: VerificationStatus = VerificationStatus.UNKNOWN
    model_version_logged: VerificationStatus = VerificationStatus.UNKNOWN
    export_event_logged: VerificationStatus = VerificationStatus.UNKNOWN
    vendor_lineage_logged: VerificationStatus = VerificationStatus.UNKNOWN


class EvidenceAttachment(BaseModel):
    model_config = ConfigDict(extra="forbid")

    evidence_id: str = Field(default_factory=lambda: f"EVID-{uuid4().hex[:10].upper()}")
    evidence_type: str
    owner: str | None = None
    uri: str | None = None
    verification_status: VerificationStatus = VerificationStatus.UNKNOWN
    retention_until: date | None = None
    metadata: dict[str, Any] = Field(default_factory=dict)


class TimestampMetadata(BaseModel):
    model_config = ConfigDict(extra="forbid")

    created_at: datetime = Field(default_factory=utc_now)
    updated_at: datetime = Field(default_factory=utc_now)
    retention_until: date | None = None


class CaseIntake(BaseModel):
    model_config = ConfigDict(extra="forbid")

    schema_version: str = SCHEMA_VERSION
    case_id: str = Field(default_factory=lambda: f"CASE-{uuid4().hex[:10].upper()}")
    title: str
    requester: Requester
    represented_person: RepresentedPerson
    source_media: SourceMedia
    intended_use: IntendedUsePlan
    consent: ConsentRecordInput
    disclosure_plan: DisclosurePlan
    provenance_controls: ProvenanceControls
    evidence_attachments: list[EvidenceAttachment] = Field(default_factory=list)
    reviewer_status: ReviewerStatus = ReviewerStatus.PENDING
    timestamps: TimestampMetadata = Field(default_factory=TimestampMetadata)


class TriggeredRule(BaseModel):
    model_config = ConfigDict(extra="forbid")

    rule_id: str
    title: str
    description: str
    severity: RuleSeverity
    score: int
    hard_stop: bool
    affected_domain: str
    recommended_control: str
    source_reference: str
    version: str


class AssessmentResponse(BaseModel):
    model_config = ConfigDict(extra="forbid")

    case_id: str
    rule_version: str
    total_score: int
    risk_level: RiskLevel
    decision: Decision
    triggered_rules: list[TriggeredRule]
    hard_stops: list[TriggeredRule]
    recommended_controls: list[str]
    missing_information: list[str]
    reviewer_path: str
    report_markdown: str


class AssessmentRecordResponse(BaseModel):
    model_config = ConfigDict(extra="forbid")

    case_id: str
    deleted: bool
    intake: dict[str, Any]
    assessment: AssessmentResponse | None
    audit_events: list[dict[str, Any]]


class ReviewUpdate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    reviewer_status: ReviewerStatus
    reviewer: str
    notes: str | None = None
    final_decision: Decision | None = None


class ReviewResponse(BaseModel):
    model_config = ConfigDict(extra="forbid")

    case_id: str
    reviewer_status: ReviewerStatus
    audit_event: dict[str, Any]

