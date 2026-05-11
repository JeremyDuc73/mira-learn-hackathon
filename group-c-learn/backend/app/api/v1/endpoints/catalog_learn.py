"""Catalogue mentors + classes (lecture publique)."""

from __future__ import annotations

from typing import Annotated

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.db import get_db
from app.core.responses import success_response
from app.schemas.catalog import (
    MentorCatalogItem,
    MentorPublicRead,
    MiraClassCatalogItem,
    MiraClassDetailRead,
    MiraClassModuleRead,
    MiraClassSessionRead,
)
from app.services import catalog_learn_service

classes_router = APIRouter()

mentors_router = APIRouter()


def _dump_class_detail(raw: dict) -> dict:
    mentor_row = raw["mentor"]
    payload = {
        k: v for k, v in raw.items() if k not in ("mentor", "modules", "sessions")
    }
    payload["mentor"] = MentorCatalogItem.model_validate(mentor_row).model_dump(
        mode="python"
    )
    payload["modules"] = [
        MiraClassModuleRead.model_validate(x).model_dump(mode="python")
        for x in raw["modules"]
    ]
    payload["sessions"] = [
        MiraClassSessionRead.model_validate(x).model_dump(mode="python")
        for x in raw["sessions"]
    ]
    return MiraClassDetailRead.model_validate(payload).model_dump(mode="json")


@classes_router.get("", summary="Classes publiées (catalogue)")
async def list_classes_endpoint(
    db: Annotated[AsyncSession, Depends(get_db)],
    skill_id: str | None = Query(
        default=None, description="Filtrer par skill présente dans skills_taught"
    ),
    format_envisaged: str | None = Query(
        default=None, description="physical | virtual | both"
    ),
    delivery_language: str | None = Query(
        default=None,
        description="Code langue principale du programme (ex. fr, en)",
        max_length=16,
    ),
    max_collective_hourly_cents: int | None = Query(
        default=None,
        ge=0,
        description="Prix conseillé collectif horaire maximal (filtre ≤)",
    ),
    max_individual_hourly_cents: int | None = Query(
        default=None,
        ge=0,
        description="Prix conseillé individuel horaire maximal (filtre ≤)",
    ),
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
) -> dict:
    items_raw, total = await catalog_learn_service.list_published_classes(
        db,
        skill_id=skill_id,
        format_envisaged=format_envisaged,
        delivery_language=delivery_language,
        max_collective_hourly_cents=max_collective_hourly_cents,
        max_individual_hourly_cents=max_individual_hourly_cents,
        limit=limit,
        offset=offset,
    )
    items = [
        MiraClassCatalogItem.model_validate(x).model_dump(mode="json")
        for x in items_raw
    ]
    return success_response(
        data={
            "items": items,
            "pagination": {
                "limit": limit,
                "offset": offset,
                "total": total,
                "returned": len(items),
            },
        },
    )


@classes_router.get(
    "/slug/{slug}", summary="Détail d'une classe publiée par slug (brief / SEO)"
)
async def get_class_by_slug_endpoint(
    slug: str,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> dict:
    raw = await catalog_learn_service.get_published_class_detail_by_slug(db, slug)
    return success_response(data=_dump_class_detail(raw))


@classes_router.get("/{class_id}", summary="Détail d'une classe publiée (par id)")
async def get_class_endpoint(
    class_id: str, db: Annotated[AsyncSession, Depends(get_db)]
) -> dict:
    raw = await catalog_learn_service.get_published_class_detail(db, class_id)
    return success_response(data=_dump_class_detail(raw))


@mentors_router.get("", summary="Mentors (catalogue)")
async def list_mentors_endpoint(
    db: Annotated[AsyncSession, Depends(get_db)],
    status: str | None = Query(
        default="active", description="Filtrer par statut ; vide = tous"
    ),
    q: str | None = Query(
        default=None, description="Recherche sur nom, slug, headline"
    ),
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
) -> dict:
    rows, total = await catalog_learn_service.list_mentors(
        db,
        status=status or None,
        q=q,
        limit=limit,
        offset=offset,
    )
    items = [MentorCatalogItem.model_validate(r).model_dump(mode="json") for r in rows]
    return success_response(
        data={
            "items": items,
            "pagination": {
                "limit": limit,
                "offset": offset,
                "total": total,
                "returned": len(items),
            },
        },
    )


@mentors_router.get("/{slug}", summary="Profil mentor public par slug")
async def get_mentor_endpoint(
    slug: str, db: Annotated[AsyncSession, Depends(get_db)]
) -> dict:
    m = await catalog_learn_service.get_mentor_by_slug(db, slug)
    return success_response(
        data=MentorPublicRead.model_validate(m).model_dump(mode="json")
    )
