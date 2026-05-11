"""Service — intentions d'inscription (draft → submitted)."""

from __future__ import annotations

from datetime import datetime, timezone

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import ConflictError, NotFoundError, ValidationError
from app.models.mira_class import MiraClass
from app.models.student_enrolment_intent import StudentEnrolmentIntent
from app.models.student_learning_path import StudentLearningPath
from app.models.student_learning_path_step import StudentLearningPathStep
from app.schemas.student_enrolment_intent import (
    StudentEnrolmentIntentCreate,
    StudentEnrolmentIntentUpdate,
)
from app.services import student_profile_service


async def _mira_class_exists(db: AsyncSession, class_id: str) -> bool:
    stmt = select(MiraClass.id).where(
        MiraClass.id == class_id, MiraClass.deleted_at.is_(None)
    )
    return (await db.execute(stmt)).scalar_one_or_none() is not None


async def _verify_path_sources_if_present(
    db: AsyncSession,
    profile_id: str,
    path_id: str | None,
    step_id: str | None,
) -> None:
    if path_id is None and step_id is None:
        return
    if path_id is None and step_id is not None:
        raise ValidationError(
            "source_learning_path_id required when step is set",
            field="source_learning_path_step_id",
        )
    stmt = select(StudentLearningPath).where(
        StudentLearningPath.id == path_id,
        StudentLearningPath.profile_id == profile_id,
        StudentLearningPath.deleted_at.is_(None),
    )
    lp = (await db.execute(stmt)).scalar_one_or_none()
    if not lp:
        raise ValidationError(
            "Invalid or unknown learning path for this profile",
            field="source_learning_path_id",
        )
    if step_id is not None:
        st = (
            await db.execute(
                select(StudentLearningPathStep).where(
                    StudentLearningPathStep.id == step_id,
                    StudentLearningPathStep.path_id == path_id,
                ),
            )
        ).scalar_one_or_none()
        if not st:
            raise ValidationError(
                "Step does not belong to the given learning path",
                field="source_learning_path_step_id",
            )


async def _non_draft_exists_for_session(
    db: AsyncSession, profile_id: str, session_id: str
) -> bool:
    stmt = select(StudentEnrolmentIntent.id).where(
        StudentEnrolmentIntent.profile_id == profile_id,
        StudentEnrolmentIntent.session_id == session_id,
        StudentEnrolmentIntent.status != "draft",
    )
    return (await db.execute(stmt)).scalar_one_or_none() is not None


async def create_intent(
    db: AsyncSession, user_id: str, body: StudentEnrolmentIntentCreate
) -> StudentEnrolmentIntent:
    profile = await student_profile_service.get_profile_or_404(db, user_id)
    if not await _mira_class_exists(db, body.class_id):
        raise ValidationError(
            "class_id does not reference an existing class", field="class_id"
        )

    await _verify_path_sources_if_present(
        db,
        profile.id,
        body.source_learning_path_id,
        body.source_learning_path_step_id,
    )

    row = StudentEnrolmentIntent(
        profile_id=profile.id,
        session_id=body.session_id,
        class_id=body.class_id,
        application_data=dict(body.application_data),
        status="draft",
        source_learning_path_id=body.source_learning_path_id,
        source_learning_path_step_id=body.source_learning_path_step_id,
    )
    db.add(row)
    await db.flush()
    await db.refresh(row)
    return row


async def list_intents(db: AsyncSession, user_id: str) -> list[StudentEnrolmentIntent]:
    profile = await student_profile_service.get_profile_or_404(db, user_id)
    stmt = (
        select(StudentEnrolmentIntent)
        .where(StudentEnrolmentIntent.profile_id == profile.id)
        .order_by(StudentEnrolmentIntent.created_at.desc())
    )
    return list((await db.execute(stmt)).scalars().all())


async def get_intent_owned(
    db: AsyncSession, profile_id: str, intent_id: str
) -> StudentEnrolmentIntent | None:
    stmt = select(StudentEnrolmentIntent).where(
        StudentEnrolmentIntent.id == intent_id,
        StudentEnrolmentIntent.profile_id == profile_id,
    )
    return (await db.execute(stmt)).scalar_one_or_none()


async def update_intent_draft(
    db: AsyncSession, user_id: str, intent_id: str, body: StudentEnrolmentIntentUpdate
) -> StudentEnrolmentIntent:
    profile = await student_profile_service.get_profile_or_404(db, user_id)
    row = await get_intent_owned(db, profile.id, intent_id)
    if not row:
        raise NotFoundError(resource="StudentEnrolmentIntent", identifier=intent_id)
    if row.status != "draft":
        raise ValidationError("Only draft intents can be updated", field="status")
    if body.application_data is not None:
        row.application_data = dict(body.application_data)
    await db.flush()
    await db.refresh(row)
    return row


async def submit_intent(
    db: AsyncSession, user_id: str, intent_id: str
) -> StudentEnrolmentIntent:
    profile = await student_profile_service.get_profile_or_404(db, user_id)
    row = await get_intent_owned(db, profile.id, intent_id)
    if not row:
        raise NotFoundError(resource="StudentEnrolmentIntent", identifier=intent_id)
    if row.status != "draft":
        raise ValidationError("Only draft intents can be submitted", field="status")

    # Index unique (profile, session) WHERE status != draft
    if await _non_draft_exists_for_session(db, profile.id, row.session_id):
        raise ConflictError("Another submitted intent already exists for this session")

    if not await _mira_class_exists(db, row.class_id):
        raise ValidationError("class_id no longer valid", field="class_id")

    now = datetime.now(timezone.utc)
    row.status = "submitted"
    row.submitted_at = now
    await db.flush()
    await db.refresh(row)
    return row


async def transmit_to_mentor(
    db: AsyncSession, user_id: str, intent_id: str
) -> StudentEnrolmentIntent:
    """Hackathon mock : passe en transmitted_to_mentor (storytelling transfert groupe B)."""
    profile = await student_profile_service.get_profile_or_404(db, user_id)
    row = await get_intent_owned(db, profile.id, intent_id)
    if not row:
        raise NotFoundError(resource="StudentEnrolmentIntent", identifier=intent_id)
    if row.status != "submitted":
        raise ValidationError(
            "Only submitted intents can be marked as transmitted",
            field="status",
        )
    now = datetime.now(timezone.utc)
    row.status = "transmitted_to_mentor"
    row.transmitted_at = now
    await db.flush()
    await db.refresh(row)
    return row


async def delete_intent_draft(db: AsyncSession, user_id: str, intent_id: str) -> None:
    profile = await student_profile_service.get_profile_or_404(db, user_id)
    row = await get_intent_owned(db, profile.id, intent_id)
    if not row:
        raise NotFoundError(resource="StudentEnrolmentIntent", identifier=intent_id)
    if row.status != "draft":
        raise ValidationError("Only draft intents can be deleted", field="status")
    await db.delete(row)
    await db.flush()
