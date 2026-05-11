"""
Service métier — profil apprenant.
"""

from __future__ import annotations

from datetime import datetime, timezone

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import ConflictError, NotFoundError, ValidationError
from app.models.student_profile import StudentProfile
from app.schemas.student_profile import (
    StudentProfileCreate,
    StudentProfileUpdate,
)


def _validate_targets_and_horizon(
    target_skills: list[str],
    learning_horizon: str | None,
) -> None:
    if len(target_skills) > 10:
        raise ValidationError("At most 10 target skills", field="target_skills")
    if len(target_skills) >= 1 and learning_horizon is None:
        raise ValidationError(
            "learning_horizon is required when target_skills is non-empty",
            field="learning_horizon",
        )


async def get_profile_by_user(
    db: AsyncSession,
    user_id: str,
    *,
    include_deleted: bool = False,
) -> StudentProfile | None:
    stmt = select(StudentProfile).where(StudentProfile.user_id == user_id)
    if not include_deleted:
        stmt = stmt.where(StudentProfile.deleted_at.is_(None))
    result = await db.execute(stmt)
    return result.scalar_one_or_none()


async def get_profile_or_404(db: AsyncSession, user_id: str) -> StudentProfile:
    profile = await get_profile_by_user(db, user_id)
    if not profile:
        raise NotFoundError(resource="StudentProfile", identifier=user_id)
    return profile


async def create_profile(
    db: AsyncSession, user_id: str, body: StudentProfileCreate
) -> StudentProfile:
    existing = await get_profile_by_user(db, user_id)
    if existing:
        raise ConflictError("Student profile already exists for this user")

    target_skills = list(body.target_skills)
    _validate_targets_and_horizon(target_skills, body.learning_horizon)

    journey = [j.model_dump() for j in body.professional_journey]

    instance = StudentProfile(
        user_id=user_id,
        display_name=body.display_name,
        headline=body.headline,
        bio=body.bio,
        avatar_url=body.avatar_url,
        professional_journey=journey,
        linkedin_url=body.linkedin_url,
        twitter_url=body.twitter_url,
        website_url=body.website_url,
        target_skills=target_skills,
        learning_horizon=body.learning_horizon,
        motivation=body.motivation,
        preferred_formats=list(body.preferred_formats),
        preferred_destinations=list(body.preferred_destinations),
        timezone=body.timezone,
        current_country=body.current_country,
        community_visibility=body.community_visibility,
    )
    db.add(instance)
    await db.flush()
    await db.refresh(instance)
    return instance


async def update_profile(
    db: AsyncSession, user_id: str, body: StudentProfileUpdate
) -> StudentProfile:
    profile = await get_profile_or_404(db, user_id)
    data = body.model_dump(exclude_unset=True)

    if "professional_journey" in data:
        if body.professional_journey is not None:
            profile.professional_journey = [
                j.model_dump() for j in body.professional_journey
            ]
        del data["professional_journey"]

    for field, value in data.items():
        setattr(profile, field, value)

    # Re-read merged target_skills / horizon for validation
    target_skills: list[str] = list(profile.target_skills or [])
    horizon = profile.learning_horizon
    _validate_targets_and_horizon(target_skills, horizon)

    await db.flush()
    await db.refresh(profile)
    return profile


async def set_avatar_url(
    db: AsyncSession, user_id: str, avatar_url: str
) -> StudentProfile:
    profile = await get_profile_or_404(db, user_id)
    profile.avatar_url = avatar_url
    await db.flush()
    await db.refresh(profile)
    return profile


async def soft_delete_profile(db: AsyncSession, user_id: str) -> None:
    profile = await get_profile_or_404(db, user_id)
    profile.deleted_at = datetime.now(timezone.utc)
    await db.flush()
