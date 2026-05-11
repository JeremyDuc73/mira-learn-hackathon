"""Service — student_skill (CRUD nomad)."""

from __future__ import annotations

from datetime import datetime, timezone

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import ConflictError, NotFoundError, ValidationError
from app.models.student_skill import StudentSkill
from app.schemas.student_skill import StudentSkillCreate, StudentSkillUpdate
from app.services.skill_catalog_service import get_skill


def _enforce_student_skill_state(row: StudentSkill) -> None:
    if not row.validated:
        row.validated_at = None
    if row.validated and row.source in ("class_completion", "quiz"):
        if not row.validation_evidence:
            raise ValidationError(
                "validation_evidence is required when validated with this source",
                field="validation_evidence",
            )
    if row.validated and row.validated_at is None:
        row.validated_at = datetime.now(timezone.utc)


async def _get_row(
    db: AsyncSession, profile_id: str, student_skill_id: str
) -> StudentSkill | None:
    stmt = select(StudentSkill).where(
        StudentSkill.id == student_skill_id,
        StudentSkill.profile_id == profile_id,
    )
    return (await db.execute(stmt)).scalar_one_or_none()


async def get_row_or_404(
    db: AsyncSession, profile_id: str, student_skill_id: str
) -> StudentSkill:
    row = await _get_row(db, profile_id, student_skill_id)
    if not row:
        raise NotFoundError(resource="StudentSkill", identifier=student_skill_id)
    return row


async def list_for_profile(db: AsyncSession, profile_id: str) -> list[StudentSkill]:
    stmt = (
        select(StudentSkill)
        .where(StudentSkill.profile_id == profile_id)
        .order_by(StudentSkill.created_at.desc())
    )
    return list((await db.execute(stmt)).scalars().all())


async def create_student_skill(
    db: AsyncSession,
    profile_id: str,
    body: StudentSkillCreate,
) -> StudentSkill:
    await get_skill(db, body.skill_id)

    existing = await db.execute(
        select(StudentSkill).where(
            StudentSkill.profile_id == profile_id,
            StudentSkill.skill_id == body.skill_id,
        )
    )
    if existing.scalar_one_or_none():
        raise ConflictError(
            "This skill is already in your profile",
            data={"skill_id": body.skill_id},
        )

    row = StudentSkill(
        profile_id=profile_id,
        skill_id=body.skill_id,
        level=body.level,
        validated=body.validated,
        source=body.source,
        validation_evidence=body.validation_evidence,
    )
    _enforce_student_skill_state(row)
    db.add(row)
    await db.flush()
    await db.refresh(row)
    return row


async def update_student_skill(
    db: AsyncSession,
    profile_id: str,
    student_skill_id: str,
    body: StudentSkillUpdate,
) -> StudentSkill:
    row = await get_row_or_404(db, profile_id, student_skill_id)
    patch = body.model_dump(exclude_unset=True)
    for field, value in patch.items():
        setattr(row, field, value)
    _enforce_student_skill_state(row)
    await db.flush()
    await db.refresh(row)
    return row


async def delete_student_skill(
    db: AsyncSession, profile_id: str, student_skill_id: str
) -> None:
    row = await get_row_or_404(db, profile_id, student_skill_id)
    await db.delete(row)
    await db.flush()


async def validate_student_skill_manual(
    db: AsyncSession,
    profile_id: str,
    student_skill_id: str,
) -> StudentSkill:
    """Confirmation manuelle (profil) — typiquement self_declared déjà en place."""
    row = await get_row_or_404(db, profile_id, student_skill_id)
    if row.validated:
        return row
    if row.source not in ("self_declared", "cv_import"):
        raise ValidationError(
            "Manual validate only applies to self_declared or cv_import skills",
            field="source",
        )
    row.validated = True
    row.validated_at = datetime.now(timezone.utc)
    _enforce_student_skill_state(row)
    await db.flush()
    await db.refresh(row)
    return row
