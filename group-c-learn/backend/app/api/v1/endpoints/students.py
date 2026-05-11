"""
Routes profil apprenant — contract student_profile.md (phase 1).
Skills — contract student_skill.md (phase 2).
"""

from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.auth import AuthenticatedUser, require_role
from app.core.db import get_db
from app.core.responses import success_response
from app.schemas.student_profile import (
    StudentAvatarUrlBody,
    StudentProfileCreate,
    StudentProfileRead,
    StudentProfileUpdate,
)
from app.schemas.student_skill import (
    StudentSkillCreate,
    StudentSkillRead,
    StudentSkillUpdate,
)
from app.services import student_profile_service, student_skill_service

router = APIRouter()


def _dump_profile(p: object) -> dict:
    return StudentProfileRead.model_validate(p).model_dump(mode="json")


@router.post(
    "/profiles",
    status_code=status.HTTP_201_CREATED,
    summary="Créer mon profil apprenant",
)
async def create_student_profile(
    body: StudentProfileCreate,
    db: AsyncSession = Depends(get_db),
    user: AuthenticatedUser = Depends(require_role("nomad")),
) -> dict:
    profile = await student_profile_service.create_profile(db, user.user_id, body)
    return success_response(data=_dump_profile(profile))


@router.get("/me", summary="Mon profil")
async def get_my_profile(
    db: AsyncSession = Depends(get_db),
    user: AuthenticatedUser = Depends(require_role("nomad")),
) -> dict:
    profile = await student_profile_service.get_profile_or_404(db, user.user_id)
    return success_response(data=_dump_profile(profile))


@router.patch("/me", summary="Mettre à jour mon profil")
async def patch_my_profile(
    body: StudentProfileUpdate,
    db: AsyncSession = Depends(get_db),
    user: AuthenticatedUser = Depends(require_role("nomad")),
) -> dict:
    profile = await student_profile_service.update_profile(db, user.user_id, body)
    return success_response(data=_dump_profile(profile))


@router.post("/me/avatar", summary="Définir l'URL de mon avatar")
async def post_my_avatar(
    body: StudentAvatarUrlBody,
    db: AsyncSession = Depends(get_db),
    user: AuthenticatedUser = Depends(require_role("nomad")),
) -> dict:
    """WHY : upload fichier via Supabase Storage côté client ; le backend stocke l'URL publique."""
    profile = await student_profile_service.set_avatar_url(
        db, user.user_id, body.avatar_url
    )
    return success_response(data=_dump_profile(profile))


@router.delete("/me", summary="Supprimer mon profil (soft delete)")
async def delete_my_profile(
    db: AsyncSession = Depends(get_db),
    user: AuthenticatedUser = Depends(require_role("nomad")),
) -> dict:
    await student_profile_service.soft_delete_profile(db, user.user_id)
    return success_response(data=None, message="Profile deleted")


def _dump_student_skill(row: object) -> dict:
    return StudentSkillRead.model_validate(row).model_dump(mode="json")


@router.get("/me/skills", summary="Liste mes student_skill")
async def list_my_student_skills(
    db: AsyncSession = Depends(get_db),
    user: AuthenticatedUser = Depends(require_role("nomad")),
) -> dict:
    profile = await student_profile_service.get_profile_or_404(db, user.user_id)
    rows = await student_skill_service.list_for_profile(db, profile.id)
    return success_response(data=[_dump_student_skill(r) for r in rows])


@router.post(
    "/me/skills",
    status_code=status.HTTP_201_CREATED,
    summary="Ajouter une skill à mon profil",
)
async def create_my_student_skill(
    body: StudentSkillCreate,
    db: AsyncSession = Depends(get_db),
    user: AuthenticatedUser = Depends(require_role("nomad")),
) -> dict:
    profile = await student_profile_service.get_profile_or_404(db, user.user_id)
    row = await student_skill_service.create_student_skill(db, profile.id, body)
    return success_response(data=_dump_student_skill(row))


@router.patch(
    "/me/skills/{student_skill_id}", summary="Mettre à jour une de mes student_skill"
)
async def patch_my_student_skill(
    student_skill_id: str,
    body: StudentSkillUpdate,
    db: AsyncSession = Depends(get_db),
    user: AuthenticatedUser = Depends(require_role("nomad")),
) -> dict:
    profile = await student_profile_service.get_profile_or_404(db, user.user_id)
    row = await student_skill_service.update_student_skill(
        db, profile.id, student_skill_id, body
    )
    return success_response(data=_dump_student_skill(row))


@router.delete("/me/skills/{student_skill_id}", summary="Retirer une student_skill")
async def delete_my_student_skill(
    student_skill_id: str,
    db: AsyncSession = Depends(get_db),
    user: AuthenticatedUser = Depends(require_role("nomad")),
) -> dict:
    profile = await student_profile_service.get_profile_or_404(db, user.user_id)
    await student_skill_service.delete_student_skill(db, profile.id, student_skill_id)
    return success_response(data=None, message="Student skill deleted")


@router.post(
    "/me/skills/{student_skill_id}/validate", summary="Valider manuellement (self/cv)"
)
async def validate_my_student_skill(
    student_skill_id: str,
    db: AsyncSession = Depends(get_db),
    user: AuthenticatedUser = Depends(require_role("nomad")),
) -> dict:
    profile = await student_profile_service.get_profile_or_404(db, user.user_id)
    row = await student_skill_service.validate_student_skill_manual(
        db, profile.id, student_skill_id
    )
    return success_response(data=_dump_student_skill(row))
