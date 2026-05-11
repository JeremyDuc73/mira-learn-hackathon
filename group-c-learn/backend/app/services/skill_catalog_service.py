"""Lecture catalogue skills + graphe skill_relation."""

from __future__ import annotations

from typing import Sequence

from sqlalchemy import Select, func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import NotFoundError
from app.models.skill import Skill
from app.models.skill_relation import SkillRelation


async def list_skills(
    db: AsyncSession,
    *,
    category: str | None = None,
    q: str | None = None,
    limit: int = 100,
    offset: int = 0,
) -> tuple[Sequence[Skill], int]:
    c_stmt = select(func.count()).select_from(Skill).where(Skill.deleted_at.is_(None))
    stmt: Select[tuple[Skill]] = select(Skill).where(Skill.deleted_at.is_(None))
    if category:
        stmt = stmt.where(Skill.category == category)
        c_stmt = c_stmt.where(Skill.category == category)
    if q:
        pat = f"%{q}%"
        stmt = stmt.where(or_(Skill.name.ilike(pat), Skill.slug.ilike(pat)))
        c_stmt = c_stmt.where(or_(Skill.name.ilike(pat), Skill.slug.ilike(pat)))

    total = int((await db.execute(c_stmt)).scalar_one() or 0)
    stmt = (
        stmt.order_by(Skill.popularity_score.desc(), Skill.name.asc())
        .offset(offset)
        .limit(limit)
    )
    items = (await db.execute(stmt)).scalars().all()
    return items, total


async def get_skill(db: AsyncSession, skill_id: str) -> Skill:
    stmt = select(Skill).where(Skill.id == skill_id, Skill.deleted_at.is_(None))
    row = (await db.execute(stmt)).scalar_one_or_none()
    if not row:
        raise NotFoundError(resource="Skill", identifier=skill_id)
    return row


async def list_relations_from(
    db: AsyncSession, skill_id: str
) -> Sequence[SkillRelation]:
    await get_skill(db, skill_id)  # 404 si skill inconnue
    stmt = (
        select(SkillRelation)
        .where(SkillRelation.from_skill_id == skill_id)
        .order_by(SkillRelation.relation_type, SkillRelation.created_at)
    )
    return (await db.execute(stmt)).scalars().all()


async def list_prerequisites(
    db: AsyncSession, skill_id: str
) -> Sequence[SkillRelation]:
    """Relations entrantes : X prerequisite_of cette skill (= to_skill_id)."""
    await get_skill(db, skill_id)
    stmt = (
        select(SkillRelation)
        .where(
            SkillRelation.to_skill_id == skill_id,
            SkillRelation.relation_type == "prerequisite_of",
        )
        .order_by(SkillRelation.strength.desc())
    )
    return (await db.execute(stmt)).scalars().all()


async def list_related(db: AsyncSession, skill_id: str) -> Sequence[SkillRelation]:
    """Relations related_to depuis cette skill."""
    await get_skill(db, skill_id)
    stmt = (
        select(SkillRelation)
        .where(
            SkillRelation.from_skill_id == skill_id,
            SkillRelation.relation_type == "related_to",
        )
        .order_by(SkillRelation.strength.desc())
    )
    return (await db.execute(stmt)).scalars().all()
