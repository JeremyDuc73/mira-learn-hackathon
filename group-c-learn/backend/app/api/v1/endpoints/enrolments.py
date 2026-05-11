"""POST /v1/enrolments — aligné brief storytelling (statut `applied`)."""

from __future__ import annotations

from typing import Annotated

from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.auth import AuthenticatedUser, require_role
from app.core.db import get_db
from app.core.responses import success_response
from app.schemas.enrolment_brief import EnrolmentApplyCreate
from app.services import enrolment_brief_service

router = APIRouter()


@router.post(
    "", status_code=status.HTTP_201_CREATED, summary="Postuler à une classe (via slug)"
)
async def post_enrolment_apply(
    body: EnrolmentApplyCreate,
    db: Annotated[AsyncSession, Depends(get_db)],
    user: Annotated[AuthenticatedUser, Depends(require_role("nomad"))],
) -> dict:
    row = await enrolment_brief_service.apply_enrolment(db, user.user_id, body)
    wrapped = await enrolment_brief_service.intent_to_read(db, row)
    return success_response(
        data=wrapped.model_dump(mode="json"),
        message="applied",
    )


@router.get("", summary="Lister mes inscriptions (intent → statut brief)")
async def list_my_enrolments_endpoint(
    db: Annotated[AsyncSession, Depends(get_db)],
    user: Annotated[AuthenticatedUser, Depends(require_role("nomad"))],
) -> dict:
    rows = await enrolment_brief_service.list_my_enrolments(db, user.user_id)
    items = [r.model_dump(mode="json") for r in rows]
    return success_response(data={"items": items})
