"""Intentions d'inscription — pré-enrolment (nomad)."""

from __future__ import annotations

from typing import Annotated

from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.auth import AuthenticatedUser, require_role
from app.core.db import get_db
from app.core.responses import success_response
from app.schemas.student_enrolment_intent import (
    StudentEnrolmentIntentCreate,
    StudentEnrolmentIntentRead,
    StudentEnrolmentIntentUpdate,
)
from app.services import enrolment_intent_service

router = APIRouter()


def _dump(row: object) -> dict:
    return StudentEnrolmentIntentRead.model_validate(row).model_dump(mode="json")


@router.post(
    "/me/enrolment-intents",
    status_code=status.HTTP_201_CREATED,
    summary="Créer une intention (draft)",
)
async def create_intent(
    body: StudentEnrolmentIntentCreate,
    db: Annotated[AsyncSession, Depends(get_db)],
    user: Annotated[AuthenticatedUser, Depends(require_role("nomad"))],
) -> dict:
    row = await enrolment_intent_service.create_intent(db, user.user_id, body)
    return success_response(data=_dump(row))


@router.get("/me/enrolment-intents", summary="Lister mes intentions")
async def list_intents(
    db: Annotated[AsyncSession, Depends(get_db)],
    user: Annotated[AuthenticatedUser, Depends(require_role("nomad"))],
) -> dict:
    rows = await enrolment_intent_service.list_intents(db, user.user_id)
    return success_response(data={"items": [_dump(r) for r in rows]})


@router.patch("/me/enrolment-intents/{intent_id}", summary="Mettre à jour un draft")
async def patch_intent(
    intent_id: str,
    body: StudentEnrolmentIntentUpdate,
    db: Annotated[AsyncSession, Depends(get_db)],
    user: Annotated[AuthenticatedUser, Depends(require_role("nomad"))],
) -> dict:
    row = await enrolment_intent_service.update_intent_draft(
        db, user.user_id, intent_id, body
    )
    return success_response(data=_dump(row))


@router.post(
    "/me/enrolment-intents/{intent_id}/submit", summary="Soumettre (draft → submitted)"
)
async def submit_intent(
    intent_id: str,
    db: Annotated[AsyncSession, Depends(get_db)],
    user: Annotated[AuthenticatedUser, Depends(require_role("nomad"))],
) -> dict:
    row = await enrolment_intent_service.submit_intent(db, user.user_id, intent_id)
    return success_response(data=_dump(row))


@router.post(
    "/me/enrolment-intents/{intent_id}/transmit",
    summary="Mock transfert mentor (submitted → transmitted)",
)
async def transmit_intent(
    intent_id: str,
    db: Annotated[AsyncSession, Depends(get_db)],
    user: Annotated[AuthenticatedUser, Depends(require_role("nomad"))],
) -> dict:
    row = await enrolment_intent_service.transmit_to_mentor(db, user.user_id, intent_id)
    return success_response(data=_dump(row))


@router.delete("/me/enrolment-intents/{intent_id}", summary="Annuler un draft")
async def delete_intent(
    intent_id: str,
    db: Annotated[AsyncSession, Depends(get_db)],
    user: Annotated[AuthenticatedUser, Depends(require_role("nomad"))],
) -> dict:
    await enrolment_intent_service.delete_intent_draft(db, user.user_id, intent_id)
    return success_response(data=None, message="Enrolment intent cancelled")
