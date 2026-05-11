"""Routes import CV apprenant (/v1/students/me/cv-imports) + job internal."""

from __future__ import annotations

from typing import Annotated

from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.auth import AuthenticatedUser, require_role
from app.core.db import get_db
from app.core.exceptions import NotFoundError
from app.core.responses import success_response
from app.schemas.student_cv_import import (
    StudentCVImportCreate,
    StudentCVImportRead,
    StudentCVImportValidate,
)
from app.services import student_cv_import_service, student_profile_service

router = APIRouter()

internal_router = APIRouter(prefix="/internal", tags=["internal"])


def _dump(row: object) -> dict:
    return StudentCVImportRead.model_validate(row).model_dump(mode="json")


@router.post(
    "/me/cv-imports",
    status_code=status.HTTP_201_CREATED,
    summary="Créer un import CV et lancer l'extraction IA",
)
async def post_cv_import(
    body: StudentCVImportCreate,
    db: Annotated[AsyncSession, Depends(get_db)],
    user: Annotated[AuthenticatedUser, Depends(require_role("nomad"))],
) -> dict:
    row = await student_cv_import_service.create_import(db, user.user_id, body)
    row = await student_cv_import_service.run_extract(db, row.id)
    return success_response(data=_dump(row))


@router.get("/me/cv-imports", summary="Lister mes imports CV")
async def list_cv_imports(
    db: Annotated[AsyncSession, Depends(get_db)],
    user: Annotated[AuthenticatedUser, Depends(require_role("nomad"))],
) -> dict:
    rows = await student_cv_import_service.list_imports(db, user.user_id)
    return success_response(data={"items": [_dump(r) for r in rows]})


@router.get("/me/cv-imports/{import_id}", summary="Détail import (polling)")
async def get_cv_import(
    import_id: str,
    db: Annotated[AsyncSession, Depends(get_db)],
    user: Annotated[AuthenticatedUser, Depends(require_role("nomad"))],
) -> dict:
    profile = await student_profile_service.get_profile_or_404(db, user.user_id)
    row = await student_cv_import_service.get_import_owned(db, profile.id, import_id)
    if not row:
        raise NotFoundError(resource="StudentCvImport", identifier=import_id)
    return success_response(data=_dump(row))


@router.patch(
    "/me/cv-imports/{import_id}/validate",
    summary="Valider et injecter profil + student_skill",
)
async def patch_cv_import_validate(
    import_id: str,
    body: StudentCVImportValidate,
    db: Annotated[AsyncSession, Depends(get_db)],
    user: Annotated[AuthenticatedUser, Depends(require_role("nomad"))],
) -> dict:
    row = await student_cv_import_service.validate_import(
        db, user.user_id, import_id, body
    )
    return success_response(data=_dump(row))


@router.delete("/me/cv-imports/{import_id}", summary="Supprimer (soft) un import CV")
async def delete_cv_import(
    import_id: str,
    db: Annotated[AsyncSession, Depends(get_db)],
    user: Annotated[AuthenticatedUser, Depends(require_role("nomad"))],
) -> dict:
    await student_cv_import_service.soft_delete_import(db, user.user_id, import_id)
    return success_response(data=None, message="CV import deleted")


@internal_router.post(
    "/cv-imports/{import_id}/extract",
    summary="Worker : relancer l'extraction IA (hackathon, non sécurisé)",
)
async def internal_cv_extract(
    import_id: str, db: Annotated[AsyncSession, Depends(get_db)]
) -> dict:
    row = await student_cv_import_service.run_extract(db, import_id)
    return success_response(data=_dump(row))
