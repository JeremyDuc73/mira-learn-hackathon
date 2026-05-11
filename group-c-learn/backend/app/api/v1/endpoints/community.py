"""Routes publiques annuaire communauté (filtre destination)."""

from __future__ import annotations

from typing import Annotated

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.db import get_db
from app.core.responses import success_response
from app.schemas.community import CommunityLearnerRead
from app.services import community_learn_service

router = APIRouter()


def _dest_list(raw: object) -> list[str]:
    if isinstance(raw, list):
        return [str(x) for x in raw]
    return []


@router.get("/learners", summary="Apprenants visibles (opt-in public)")
async def list_learners_endpoint(
    db: Annotated[AsyncSession, Depends(get_db)],
    destination: str | None = Query(
        default=None,
        description="Filtre ville dans preferred_destinations (égalité exacte)",
    ),
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
) -> dict:
    rows, total = await community_learn_service.list_public_learners(
        db,
        destination_city=destination,
        limit=limit,
        offset=offset,
    )
    items = []
    for row in rows:
        dump = CommunityLearnerRead(
            profile_id=row.id,
            display_name=row.display_name,
            headline=row.headline,
            avatar_url=row.avatar_url,
            current_country=row.current_country,
            preferred_destinations=_dest_list(row.preferred_destinations),
        )
        items.append(dump.model_dump(mode="json"))
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
