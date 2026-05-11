"""Service — annuaire apprenants opt-in (profils publics)."""

from __future__ import annotations

from typing import Any

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.student_profile import StudentProfile


async def list_public_learners(
    db: AsyncSession,
    *,
    destination_city: str | None = None,
    limit: int = 50,
    offset: int = 0,
) -> tuple[list[StudentProfile], int]:
    w: list[Any] = [
        StudentProfile.deleted_at.is_(None),
        StudentProfile.community_visibility == "public",
    ]
    if destination_city:
        w.append(StudentProfile.preferred_destinations.contains([destination_city]))

    total = int(
        (
            await db.execute(select(func.count()).select_from(StudentProfile).where(*w))
        ).scalar_one()
        or 0,
    )

    stmt = (
        select(StudentProfile)
        .where(*w)
        .order_by(StudentProfile.updated_at.desc())
        .offset(offset)
        .limit(limit)
    )
    rows = list((await db.execute(stmt)).scalars().all())
    return rows, total
