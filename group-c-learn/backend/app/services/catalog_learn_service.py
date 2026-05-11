"""Catalogue lecture seule — mentors + classes publiées."""

from __future__ import annotations

from typing import Any, Sequence

from sqlalchemy import func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import NotFoundError, ValidationError
from app.models.mira_class import MiraClass
from app.models.mira_class_module import MiraClassModule
from app.models.mira_class_session import MiraClassSession
from app.models.mentor_profile import MentorProfile


async def list_mentors(
    db: AsyncSession,
    *,
    status: str | None = "active",
    q: str | None = None,
    limit: int = 50,
    offset: int = 0,
) -> tuple[Sequence[MentorProfile], int]:
    w_all: list[Any] = [MentorProfile.deleted_at.is_(None)]
    if status:
        w_all.append(MentorProfile.status == status)
    if q:
        pat = f"%{q}%"
        w_all.append(
            or_(
                MentorProfile.display_name.ilike(pat),
                MentorProfile.slug.ilike(pat),
                MentorProfile.headline.ilike(pat),
            ),
        )

    total = int(
        (
            await db.execute(
                select(func.count()).select_from(MentorProfile).where(*w_all)
            )
        ).scalar_one()
        or 0,
    )

    stmt = select(MentorProfile).where(*w_all)

    stmt = (
        stmt.order_by(
            MentorProfile.aggregate_rating.desc().nullslast(),
            MentorProfile.display_name.asc(),
        )
        .offset(offset)
        .limit(limit)
    )

    items = (await db.execute(stmt)).scalars().all()
    return items, total


async def get_mentor_by_slug(db: AsyncSession, slug: str) -> MentorProfile:
    stmt = select(MentorProfile).where(
        MentorProfile.slug == slug,
        MentorProfile.deleted_at.is_(None),
    )
    row = (await db.execute(stmt)).scalar_one_or_none()
    if not row:
        raise NotFoundError(resource="MentorProfile", identifier=slug)
    return row


def _skills_taught_list(raw: Any) -> list[str]:
    if raw is None:
        return []
    if isinstance(raw, list):
        return [str(x) for x in raw]
    return []


def _class_join_conditions(
    *,
    skill_id: str | None,
    format_envisaged: str | None,
    delivery_language: str | None,
    max_collective_hourly_cents: int | None,
    max_individual_hourly_cents: int | None,
) -> list[Any]:
    w = [
        MiraClass.deleted_at.is_(None),
        MentorProfile.deleted_at.is_(None),
        MiraClass.status == "published",
    ]
    if skill_id:
        w.append(MiraClass.skills_taught.contains([skill_id]))
    if format_envisaged:
        w.append(MiraClass.format_envisaged == format_envisaged)
    if delivery_language:
        w.append(MiraClass.delivery_language == delivery_language)
    if max_collective_hourly_cents is not None:
        w.append(
            MiraClass.recommended_price_per_hour_collective_cents
            <= max_collective_hourly_cents
        )
    if max_individual_hourly_cents is not None:
        w.append(
            MiraClass.recommended_price_per_hour_individual_cents
            <= max_individual_hourly_cents
        )
    return w


async def list_published_classes(
    db: AsyncSession,
    *,
    skill_id: str | None = None,
    format_envisaged: str | None = None,
    delivery_language: str | None = None,
    max_collective_hourly_cents: int | None = None,
    max_individual_hourly_cents: int | None = None,
    limit: int = 50,
    offset: int = 0,
) -> tuple[list[dict[str, Any]], int]:
    """Dicts pré-hydratés pour MiraClassCatalogItem (avec mentor dénormalisé)."""
    w = _class_join_conditions(
        skill_id=skill_id,
        format_envisaged=format_envisaged,
        delivery_language=delivery_language,
        max_collective_hourly_cents=max_collective_hourly_cents,
        max_individual_hourly_cents=max_individual_hourly_cents,
    )

    id_sub = (
        select(MiraClass.id)
        .select_from(MiraClass)
        .join(MentorProfile, MentorProfile.user_id == MiraClass.mentor_user_id)
        .where(*w)
        .subquery()
    )
    total = int(
        (await db.execute(select(func.count()).select_from(id_sub))).scalar_one() or 0
    )

    full = (
        select(MiraClass, MentorProfile)
        .join(MentorProfile, MentorProfile.user_id == MiraClass.mentor_user_id)
        .where(*w)
        .order_by(MiraClass.published_at.desc().nullslast(), MiraClass.title.asc())
        .offset(offset)
        .limit(limit)
    )
    rows = (await db.execute(full)).all()

    out: list[dict[str, Any]] = []
    for cl, m in rows:
        out.append(
            {
                "id": cl.id,
                "mentor_user_id": cl.mentor_user_id,
                "title": cl.title,
                "slug": cl.slug,
                "delivery_language": cl.delivery_language,
                "description": cl.description,
                "skills_taught": _skills_taught_list(cl.skills_taught),
                "total_hours": cl.total_hours,
                "format_envisaged": cl.format_envisaged,
                "status": cl.status,
                "published_at": cl.published_at,
                "recommended_price_per_hour_collective_cents": int(
                    cl.recommended_price_per_hour_collective_cents,
                ),
                "recommended_price_per_hour_individual_cents": int(
                    cl.recommended_price_per_hour_individual_cents,
                ),
                "mentor_display_name": m.display_name,
                "mentor_slug": m.slug,
                "mentor_avatar_url": m.avatar_url,
            },
        )
    return out, total


async def _modules_for_class(db: AsyncSession, class_id: str) -> list[MiraClassModule]:
    stmt = (
        select(MiraClassModule)
        .where(MiraClassModule.class_id == class_id)
        .order_by(MiraClassModule.position.asc())
    )
    return list((await db.execute(stmt)).scalars().all())


async def _sessions_for_class(
    db: AsyncSession, class_id: str
) -> list[MiraClassSession]:
    stmt = (
        select(MiraClassSession)
        .where(MiraClassSession.class_id == class_id)
        .order_by(
            MiraClassSession.starts_at.asc().nullslast(),
            MiraClassSession.created_at.asc(),
        )
    )
    return list((await db.execute(stmt)).scalars().all())


async def _class_detail_bundle(db: AsyncSession, cl: MiraClass) -> dict[str, Any]:
    stmt_m = select(MentorProfile).where(
        MentorProfile.user_id == cl.mentor_user_id,
        MentorProfile.deleted_at.is_(None),
    )
    mentor = (await db.execute(stmt_m)).scalar_one_or_none()
    if not mentor:
        raise NotFoundError(resource="MentorProfile", identifier=cl.mentor_user_id)

    modules = await _modules_for_class(db, cl.id)
    sessions = await _sessions_for_class(db, cl.id)

    return {
        "id": cl.id,
        "mentor_user_id": cl.mentor_user_id,
        "title": cl.title,
        "slug": cl.slug,
        "delivery_language": cl.delivery_language,
        "description": cl.description,
        "skills_taught": _skills_taught_list(cl.skills_taught),
        "total_hours_collective": cl.total_hours_collective,
        "total_hours_individual": cl.total_hours_individual,
        "total_hours": cl.total_hours,
        "format_envisaged": cl.format_envisaged,
        "rythm_pattern": cl.rythm_pattern,
        "target_cities": cl.target_cities or [],
        "recommended_price_per_hour_collective_cents": int(
            cl.recommended_price_per_hour_collective_cents,
        ),
        "recommended_price_per_hour_individual_cents": int(
            cl.recommended_price_per_hour_individual_cents,
        ),
        "status": cl.status,
        "published_at": cl.published_at,
        "ai_assisted": cl.ai_assisted,
        "modules": modules,
        "sessions": sessions,
        "mentor": mentor,
    }


async def get_published_class_detail(db: AsyncSession, class_id: str) -> dict[str, Any]:
    stmt = select(MiraClass).where(
        MiraClass.id == class_id, MiraClass.deleted_at.is_(None)
    )
    cl = (await db.execute(stmt)).scalar_one_or_none()
    if not cl or cl.status != "published":
        raise NotFoundError(resource="MiraClass", identifier=class_id)
    return await _class_detail_bundle(db, cl)


async def get_published_class_detail_by_slug(
    db: AsyncSession, slug: str
) -> dict[str, Any]:
    stmt = select(MiraClass).where(
        MiraClass.slug == slug,
        MiraClass.deleted_at.is_(None),
        MiraClass.status == "published",
    )
    cl = (await db.execute(stmt)).scalar_one_or_none()
    if not cl:
        raise NotFoundError(resource="MiraClass", identifier=slug)
    return await _class_detail_bundle(db, cl)


async def get_first_session_for_class(
    db: AsyncSession, class_id: str
) -> MiraClassSession | None:
    rows = await _sessions_for_class(db, class_id)
    return rows[0] if rows else None


async def resolve_session_for_class(
    db: AsyncSession,
    *,
    class_id: str,
    session_id: str | None,
) -> MiraClassSession:
    if session_id:
        stmt = select(MiraClassSession).where(
            MiraClassSession.id == session_id,
            MiraClassSession.class_id == class_id,
        )
        row = (await db.execute(stmt)).scalar_one_or_none()
        if not row:
            raise ValidationError(
                "session_id does not belong to this class", field="session_id"
            )
        return row
    first = await get_first_session_for_class(db, class_id)
    if not first:
        raise ValidationError(
            "No session available for this class — configure mira_class_session",
            field="session_id",
        )
    return first


async def get_published_class_by_slug_entity(db: AsyncSession, slug: str) -> MiraClass:
    stmt = select(MiraClass).where(
        MiraClass.slug == slug,
        MiraClass.deleted_at.is_(None),
        MiraClass.status == "published",
    )
    cl = (await db.execute(stmt)).scalar_one_or_none()
    if not cl:
        raise NotFoundError(resource="MiraClass", identifier=slug)
    return cl
