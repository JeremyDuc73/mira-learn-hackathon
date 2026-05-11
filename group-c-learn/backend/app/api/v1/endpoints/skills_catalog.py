"""Catalogue public skills + relations (lecture — pas d'auth obligatoire)."""

from __future__ import annotations

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.db import get_db
from app.core.responses import success_response
from app.schemas.skill import SkillBrief, SkillRead
from app.schemas.skill_relation import SkillRelationRead
from app.services import skill_catalog_service

router = APIRouter()


def _relations_dump(rows: object) -> list[dict]:
    return [SkillRelationRead.model_validate(r).model_dump(mode="json") for r in rows]


@router.get("", summary="Liste des skills (catalogue)")
async def list_skills_endpoint(
    db: AsyncSession = Depends(get_db),
    category: str | None = Query(default=None),
    q: str | None = Query(default=None, description="Filtre sur name ou slug (ILIKE)"),
    limit: int = Query(100, ge=1, le=200),
    offset: int = Query(0, ge=0),
) -> dict:
    items, total = await skill_catalog_service.list_skills(
        db, category=category, q=q, limit=limit, offset=offset
    )
    return success_response(
        data={
            "items": [
                SkillBrief.model_validate(i).model_dump(mode="json") for i in items
            ],
            "pagination": {
                "limit": limit,
                "offset": offset,
                "total": total,
                "returned": len(items),
            },
        },
    )


@router.get("/{skill_id}", summary="Détail d'une skill")
async def get_skill_endpoint(skill_id: str, db: AsyncSession = Depends(get_db)) -> dict:
    skill = await skill_catalog_service.get_skill(db, skill_id)
    return success_response(
        data=SkillRead.model_validate(skill).model_dump(mode="json")
    )


@router.get("/{skill_id}/relations", summary="Relations sortantes depuis cette skill")
async def skill_relations_endpoint(
    skill_id: str, db: AsyncSession = Depends(get_db)
) -> dict:
    rows = await skill_catalog_service.list_relations_from(db, skill_id)
    return success_response(data=_relations_dump(rows))


@router.get(
    "/{skill_id}/prerequisites",
    summary="Prérequis (relations entrantes prerequisite_of)",
)
async def skill_prereq_endpoint(
    skill_id: str, db: AsyncSession = Depends(get_db)
) -> dict:
    rows = await skill_catalog_service.list_prerequisites(db, skill_id)
    return success_response(data=_relations_dump(rows))


@router.get(
    "/{skill_id}/related", summary="Skills liées (related_to depuis cette skill)"
)
async def skill_related_endpoint(
    skill_id: str, db: AsyncSession = Depends(get_db)
) -> dict:
    rows = await skill_catalog_service.list_related(db, skill_id)
    return success_response(data=_relations_dump(rows))
