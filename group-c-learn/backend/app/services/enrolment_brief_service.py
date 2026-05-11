"""Service — flux brief POST /v1/enrolments (wrap student_enrolment_intent)."""

from __future__ import annotations

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.mira_class import MiraClass
from app.models.student_enrolment_intent import StudentEnrolmentIntent
from app.schemas.enrolment_brief import (
    BriefEnrolmentStatus,
    EnrolmentApplyCreate,
    EnrolmentRead,
)
from app.schemas.student_enrolment_intent import StudentEnrolmentIntentCreate
from app.services import catalog_learn_service, enrolment_intent_service


def _brief_status(internal: str) -> BriefEnrolmentStatus:
    if internal == "submitted":
        return "applied"
    return internal  # type: ignore[return-value]


async def intent_to_read(
    db: AsyncSession, row: StudentEnrolmentIntent
) -> EnrolmentRead:
    stmt = select(MiraClass.slug).where(MiraClass.id == row.class_id)
    slug = (await db.execute(stmt)).scalar_one_or_none()

    return EnrolmentRead(
        id=row.id,
        profile_id=row.profile_id,
        class_id=row.class_id,
        class_slug=slug,
        session_id=row.session_id,
        application_data=dict(row.application_data or {}),
        status=_brief_status(row.status),
        internal_status=row.status,  # type: ignore[arg-type]
        submitted_at=row.submitted_at,
        transmitted_at=row.transmitted_at,
        created_at=row.created_at,
        updated_at=row.updated_at,
    )


async def apply_enrolment(
    db: AsyncSession,
    user_id: str,
    body: EnrolmentApplyCreate,
) -> StudentEnrolmentIntent:
    cl = await catalog_learn_service.get_published_class_by_slug_entity(
        db, body.class_slug
    )
    session = await catalog_learn_service.resolve_session_for_class(
        db,
        class_id=cl.id,
        session_id=body.session_id,
    )
    row = await enrolment_intent_service.create_intent(
        db,
        user_id,
        StudentEnrolmentIntentCreate(
            session_id=session.id,
            class_id=cl.id,
            application_data=dict(body.application_data),
            source_learning_path_id=body.source_learning_path_id,
            source_learning_path_step_id=body.source_learning_path_step_id,
        ),
    )
    return await enrolment_intent_service.submit_intent(db, user_id, row.id)


async def list_my_enrolments(db: AsyncSession, user_id: str) -> list[EnrolmentRead]:
    rows = await enrolment_intent_service.list_intents(db, user_id)
    out: list[EnrolmentRead] = []
    for r in rows:
        out.append(await intent_to_read(db, r))
    return out
