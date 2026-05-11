"""Parcours d'apprentissage — génération IA + lecture (nomad)."""

from __future__ import annotations

from typing import Annotated, Sequence

from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.auth import AuthenticatedUser, require_role
from app.core.db import get_db
from app.core.responses import success_response
from app.schemas.learning_path import (
    StudentLearningPathAbandon,
    StudentLearningPathDetailRead,
    StudentLearningPathGenerateRequest,
    StudentLearningPathRead,
    StudentLearningPathRegenerateRequest,
    StudentLearningPathStepRead,
    StudentPathRegenerationLogRead,
)
from app.services import learning_path_service

router = APIRouter()


def _dump_path(row: object) -> dict:
    return StudentLearningPathRead.model_validate(row).model_dump(mode="json")


def _current_step_position(steps: Sequence[object]) -> int | None:
    ordered = sorted(steps, key=lambda s: getattr(s, "position", 0))
    for s in ordered:
        status = getattr(s, "status", "")
        if status in ("pending", "in_progress"):
            return int(getattr(s, "position", 0))
    return None


def _dump_detail(path: object, steps: Sequence[object]) -> dict:
    base = StudentLearningPathRead.model_validate(path).model_dump(mode="python")
    base["steps"] = [
        StudentLearningPathStepRead.model_validate(s).model_dump(mode="python")
        for s in steps
    ]
    base["current_step_position"] = _current_step_position(steps)
    return StudentLearningPathDetailRead.model_validate(base).model_dump(mode="json")


@router.post(
    "/me/learning-paths",
    status_code=status.HTTP_201_CREATED,
    summary="Créer et générer mon parcours IA",
)
async def post_generate_learning_path(
    body: StudentLearningPathGenerateRequest,
    db: Annotated[AsyncSession, Depends(get_db)],
    user: Annotated[AuthenticatedUser, Depends(require_role("nomad"))],
) -> dict:
    path = await learning_path_service.generate_and_create(db, user.user_id, body)
    path, steps = await learning_path_service.get_path_with_steps(
        db, user.user_id, path.id
    )
    return success_response(data=_dump_detail(path, steps))


@router.get("/me/learning-paths", summary="Lister mes parcours")
async def get_learning_paths(
    db: Annotated[AsyncSession, Depends(get_db)],
    user: Annotated[AuthenticatedUser, Depends(require_role("nomad"))],
) -> dict:
    rows = await learning_path_service.list_paths(db, user.user_id)
    return success_response(data={"items": [_dump_path(p) for p in rows]})


@router.get("/me/learning-paths/{path_id}", summary="Détail d'un parcours (+ steps)")
async def get_learning_path(
    path_id: str,
    db: Annotated[AsyncSession, Depends(get_db)],
    user: Annotated[AuthenticatedUser, Depends(require_role("nomad"))],
) -> dict:
    path, steps = await learning_path_service.get_path_with_steps(
        db, user.user_id, path_id
    )
    return success_response(data=_dump_detail(path, steps))


@router.get(
    "/me/learning-paths/{path_id}/regeneration-log",
    summary="Historique des générations / régénérations IA",
)
async def get_learning_path_regeneration_log(
    path_id: str,
    db: Annotated[AsyncSession, Depends(get_db)],
    user: Annotated[AuthenticatedUser, Depends(require_role("nomad"))],
) -> dict:
    rows = await learning_path_service.list_regeneration_logs(db, user.user_id, path_id)
    data = [
        StudentPathRegenerationLogRead.model_validate(r).model_dump(mode="json")
        for r in rows
    ]
    return success_response(data={"items": data})


@router.post(
    "/me/learning-paths/{path_id}/regenerate", summary="Régénérer le parcours (IA)"
)
async def post_regenerate_learning_path(
    path_id: str,
    body: StudentLearningPathRegenerateRequest,
    db: Annotated[AsyncSession, Depends(get_db)],
    user: Annotated[AuthenticatedUser, Depends(require_role("nomad"))],
) -> dict:
    path = await learning_path_service.regenerate_path(db, user.user_id, path_id, body)
    path, steps = await learning_path_service.get_path_with_steps(
        db, user.user_id, path.id
    )
    return success_response(data=_dump_detail(path, steps))


@router.post("/me/learning-paths/{path_id}/abandon", summary="Abandonner un parcours")
async def post_abandon_learning_path(
    path_id: str,
    body: StudentLearningPathAbandon,
    db: Annotated[AsyncSession, Depends(get_db)],
    user: Annotated[AuthenticatedUser, Depends(require_role("nomad"))],
) -> dict:
    path = await learning_path_service.abandon_path(db, user.user_id, path_id, body)
    return success_response(data=_dump_path(path))


@router.delete("/me/learning-paths/{path_id}", summary="Supprimer (soft) un parcours")
async def delete_learning_path(
    path_id: str,
    db: Annotated[AsyncSession, Depends(get_db)],
    user: Annotated[AuthenticatedUser, Depends(require_role("nomad"))],
) -> dict:
    await learning_path_service.soft_delete_path(db, user.user_id, path_id)
    return success_response(data=None, message="Learning path deleted")
