"""Compatibility helpers for older flat demo intake cases."""

from __future__ import annotations

from datetime import date, timedelta
from typing import Any

from .schemas import (
    CaseIntake,
    ConsentRecordInput,
    DisclosurePlan,
    DistributionRegion,
    EvidenceAttachment,
    IntendedUse,
    IntendedUsePlan,
    PersonType,
    ProvenanceControls,
    RepresentedPerson,
    Requester,
    RequesterType,
    SensitiveContext,
    SourceMedia,
    SourceMediaType,
    TimestampMetadata,
    VerificationStatus,
    YesNoUnknown,
)


def _bool_status(value: Any) -> YesNoUnknown:
    if value is True:
        return YesNoUnknown.YES
    if value is False:
        return YesNoUnknown.NO
    if isinstance(value, str):
        normalized = value.strip().lower()
        if normalized in {"yes", "true", "1", "y"}:
            return YesNoUnknown.YES
        if normalized in {"no", "false", "0", "n"}:
            return YesNoUnknown.NO
        if normalized in {"unknown", ""}:
            return YesNoUnknown.UNKNOWN
    return YesNoUnknown.UNKNOWN


def _verification(value: Any) -> VerificationStatus:
    if isinstance(value, VerificationStatus):
        return value
    normalized = str(value).strip().lower()
    mapping = {
        "verified": VerificationStatus.VERIFIED,
        "authorized": VerificationStatus.VERIFIED,
        "licensed": VerificationStatus.VERIFIED,
        "uploadedcontract": VerificationStatus.VERIFIED,
        "performeragreement": VerificationStatus.VERIFIED,
        "unverified": VerificationStatus.UNVERIFIED,
        "none": VerificationStatus.NOT_PROVIDED,
        "not_provided": VerificationStatus.NOT_PROVIDED,
        "missing": VerificationStatus.NOT_PROVIDED,
        "expired": VerificationStatus.EXPIRED,
        "rejected": VerificationStatus.REJECTED,
    }
    return mapping.get(normalized, VerificationStatus.UNKNOWN)


def _person_type(value: Any, real_person: Any = None, public_figure: Any = None, minor: Any = None) -> PersonType:
    normalized = str(value).strip().lower()
    mapping = {
        "synthetic": PersonType.FULLY_SYNTHETIC,
        "fully_synthetic": PersonType.FULLY_SYNTHETIC,
        "self": PersonType.SELF,
        "ordinaryperson": PersonType.ORDINARY_PERSON,
        "ordinary_person": PersonType.ORDINARY_PERSON,
        "real_person": PersonType.ORDINARY_PERSON,
        "performer": PersonType.PERFORMER,
        "publicfigure": PersonType.PUBLIC_FIGURE,
        "public_figure": PersonType.PUBLIC_FIGURE,
        "celebrity": PersonType.PUBLIC_FIGURE,
        "politician": PersonType.POLITICAL_FIGURE,
        "political_figure": PersonType.POLITICAL_FIGURE,
        "minor": PersonType.MINOR,
    }
    if normalized in mapping:
        return mapping[normalized]
    if _bool_status(minor) == YesNoUnknown.YES:
        return PersonType.MINOR
    if _bool_status(public_figure) == YesNoUnknown.YES:
        return PersonType.PUBLIC_FIGURE
    if _bool_status(real_person) == YesNoUnknown.NO:
        return PersonType.FULLY_SYNTHETIC
    return PersonType.ORDINARY_PERSON


def _requester_type(value: Any) -> RequesterType:
    normalized = str(value).strip().lower()
    mapping = {
        "creator": RequesterType.INDIVIDUAL_CREATOR,
        "individual_creator": RequesterType.INDIVIDUAL_CREATOR,
        "brand": RequesterType.BRAND_ADVERTISER,
        "brand_advertiser": RequesterType.BRAND_ADVERTISER,
        "production": RequesterType.PRODUCTION_COMPANY,
        "production_company": RequesterType.PRODUCTION_COMPANY,
        "performer": RequesterType.PERFORMER_OWNER,
    }
    return mapping.get(normalized, RequesterType.UNKNOWN)


def _use_case(value: Any, content_type: Any = None) -> IntendedUse:
    normalized = str(value or content_type or "short_drama").strip().lower()
    mapping = {
        "shortdrama": IntendedUse.SHORT_DRAMA,
        "short_drama": IntendedUse.SHORT_DRAMA,
        "video": IntendedUse.SHORT_DRAMA,
        "advertisement": IntendedUse.ADVERTISEMENT,
        "ad": IntendedUse.ADVERTISEMENT,
        "virtualinfluencer": IntendedUse.VIRTUAL_INFLUENCER,
        "virtual_influencer": IntendedUse.VIRTUAL_INFLUENCER,
        "fancontent": IntendedUse.FAN_CONTENT,
        "fan_content": IntendedUse.FAN_CONTENT,
        "parody": IntendedUse.PARODY,
        "politicalmessage": IntendedUse.POLITICAL_MESSAGE,
        "political_message": IntendedUse.POLITICAL_MESSAGE,
        "model_training": IntendedUse.MODEL_TRAINING,
        "training": IntendedUse.MODEL_TRAINING,
    }
    return mapping.get(normalized, IntendedUse.OTHER)


def _sensitive_context(value: Any) -> SensitiveContext:
    normalized = str(value or "none").strip().lower()
    try:
        return SensitiveContext(normalized)
    except ValueError:
        return SensitiveContext.UNKNOWN


def _regions(values: Any) -> list[DistributionRegion]:
    if not values:
        return [DistributionRegion.NOT_PROVIDED]
    output: list[DistributionRegion] = []
    for value in values:
        normalized = str(value).strip().lower()
        if normalized in {"eu", "europe"}:
            output.append(DistributionRegion.EU)
        elif normalized in {"china", "cn"}:
            output.append(DistributionRegion.CHINA)
        elif normalized in {"us", "usa", "united_states"}:
            output.append(DistributionRegion.US)
        elif normalized == "global":
            output.append(DistributionRegion.GLOBAL)
        else:
            output.append(DistributionRegion.OTHER)
    return output


def _media_types(case: dict[str, Any], person_type: PersonType) -> list[SourceMediaType]:
    if case.get("source_media"):
        return [SourceMediaType(item) for item in case["source_media"]]
    media = []
    if case.get("mediaFace", True):
        media.append(SourceMediaType.FACIAL_IMAGE)
    if case.get("mediaVoice", False):
        media.append(SourceMediaType.VOICE_SAMPLE)
    if case.get("mediaMotion", False):
        media.append(SourceMediaType.MOTION_CAPTURE)
    if case.get("mediaPerformance", False):
        media.append(SourceMediaType.PRIOR_PERFORMANCE)
    if not media and person_type == PersonType.FULLY_SYNTHETIC:
        media.append(SourceMediaType.PROMPT_ONLY)
    if not media:
        media.append(SourceMediaType.FACIAL_IMAGE)
    return media


def canonical_case_from_flat(case: dict[str, Any]) -> CaseIntake:
    """Convert older demo JSON into the canonical Pydantic case model."""

    person_type = _person_type(
        case.get("person_depicted", case.get("subjectType")),
        case.get("real_person"),
        case.get("public_figure"),
        case.get("minor"),
    )
    authorization = _verification(case.get("authorization_status", case.get("authorized", "unknown")))
    commercial = _bool_status(case.get("commercial_use", case.get("commercial", False)))
    training_requested = _bool_status(case.get("training_use", False))
    regions = _regions(case.get("regions") or case.get("distribution_regions") or [])
    today = date.today()

    return CaseIntake(
        case_id=case.get("case_id", "CASE-COMPAT-DEMO"),
        title=case.get("title", "Synthetic media intake case"),
        requester=Requester(
            requester_type=_requester_type(case.get("requester_type")),
            organization_name=case.get("organization_name"),
            contact_email=case.get("contact_email"),
        ),
        represented_person=RepresentedPerson(
            person_type=person_type,
            identity_verification=VerificationStatus.VERIFIED if authorization == VerificationStatus.VERIFIED else VerificationStatus.UNVERIFIED,
            is_public_figure=_bool_status(case.get("public_figure")),
            is_minor=_bool_status(case.get("minor")),
            relationship_to_requester=case.get("relationship_to_requester"),
        ),
        source_media=SourceMedia(
            media_types=_media_types(case, person_type),
            source_owner=case.get("source_owner"),
            collection_context=case.get("collection_context"),
            pii_categories=["face", "voice"] if person_type != PersonType.FULLY_SYNTHETIC else [],
            evidence_status=authorization,
        ),
        intended_use=IntendedUsePlan(
            use_case=_use_case(case.get("use_case"), case.get("content_type")),
            commercial_use=commercial,
            sensitive_context=_sensitive_context(case.get("sensitive_context")),
            distribution_regions=regions,
            publication_channel=case.get("publication_channel"),
        ),
        consent=ConsentRecordInput(
            consent_status=authorization,
            authorizing_party=case.get("authorizing_party"),
            authorized_party=case.get("authorized_party"),
            purpose=(case.get("license_scope") or {}).get("purpose"),
            likeness_scope=authorization if person_type != PersonType.FULLY_SYNTHETIC else VerificationStatus.NOT_PROVIDED,
            voice_scope=authorization if case.get("mediaVoice", True) else VerificationStatus.NOT_PROVIDED,
            commercial_use_authorized=commercial if authorization == VerificationStatus.VERIFIED else YesNoUnknown.UNKNOWN,
            training_use_authorized=YesNoUnknown.YES if training_requested == YesNoUnknown.YES and authorization == VerificationStatus.VERIFIED else YesNoUnknown.NO,
            secondary_use_authorized=YesNoUnknown.UNKNOWN,
            territory=regions,
            duration_start=today if authorization == VerificationStatus.VERIFIED else None,
            duration_end=today + timedelta(days=180) if authorization == VerificationStatus.VERIFIED else None,
            revocation_path=(case.get("license_scope") or {}).get("revocation"),
            compensation_terms=(case.get("license_scope") or {}).get("compensation"),
            evidence_reference=", ".join(case.get("consent_evidence", [])) if case.get("consent_evidence") else None,
        ),
        disclosure_plan=DisclosurePlan(
            visible_label=VerificationStatus.VERIFIED if case.get("ai_labeled", False) else VerificationStatus.NOT_PROVIDED,
            machine_readable_metadata=VerificationStatus.VERIFIED if case.get("machine_readable_metadata", case.get("ai_labeled", False)) else VerificationStatus.NOT_PROVIDED,
            watermark=VerificationStatus.VERIFIED if case.get("watermark", False) else VerificationStatus.NOT_PROVIDED,
            platform_disclosure=VerificationStatus.VERIFIED if case.get("ai_labeled", False) else VerificationStatus.NOT_PROVIDED,
        ),
        provenance_controls=ProvenanceControls(
            source_media_hashing=VerificationStatus.UNKNOWN,
            output_hash_registry=VerificationStatus.VERIFIED if case.get("watermark", False) else VerificationStatus.UNKNOWN,
            model_version_logged=VerificationStatus.UNKNOWN,
            export_event_logged=VerificationStatus.UNKNOWN,
        ),
        evidence_attachments=[
            EvidenceAttachment(
                evidence_type="consent_record",
                owner=case.get("authorizing_party"),
                uri=item,
                verification_status=authorization,
            )
            for item in case.get("consent_evidence", [])
        ],
        timestamps=TimestampMetadata(retention_until=today + timedelta(days=365)),
    )

