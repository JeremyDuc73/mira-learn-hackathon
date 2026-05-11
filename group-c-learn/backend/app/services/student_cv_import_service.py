"""Service — import CV étudiant + extraction IA (OpenRouter)."""

from __future__ import annotations

import json
from datetime import datetime, timezone
from typing import Any, cast

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.exceptions import NotFoundError, ValidationError
from app.integrations.openrouter import llm_client
from app.models.skill import Skill
from app.models.student_cv_import import StudentCvImport
from app.models.student_skill import StudentSkill
from app.schemas.student_cv_import import (
    ExtractedExperience,
    ExtractedSkill,
    StudentCVImportCreate,
    StudentCVImportValidate,
)
from app.services import student_profile_service


def _has_source_payload(body: StudentCVImportCreate) -> bool:
    return bool(
        body.file_url or body.source_url or (body.raw_text and body.raw_text.strip())
    )


async def _skill_slugs_hint(db: AsyncSession, limit: int = 120) -> str:
    stmt = (
        select(Skill.slug)
        .where(Skill.deleted_at.is_(None))
        .order_by(Skill.popularity_score.desc())
        .limit(limit)
    )
    rows = [r[0] for r in (await db.execute(stmt)).all()]
    return ", ".join(sorted(rows))


async def _resolve_skill_id(db: AsyncSession, skill_slug: str) -> str | None:
    slug = skill_slug.strip().lower()
    if not slug:
        return None
    stmt = select(Skill.id).where(
        func.lower(Skill.slug) == slug,
        Skill.deleted_at.is_(None),
    )
    return (await db.execute(stmt)).scalar_one_or_none()


def _combined_cv_text(body: StudentCVImportCreate) -> str:
    parts: list[str] = []
    if body.raw_text and body.raw_text.strip():
        parts.append(body.raw_text.strip())
    if body.source_url:
        parts.append(f"[Source URL déclarée] {body.source_url}")
    if body.file_url:
        parts.append(
            f"[Fichier déclaré — URL storage] {body.file_url} "
            "(texte OCR non fourni → infère si possible depuis le résumé ci-dessus).",
        )
    return "\n\n".join(parts) if parts else ""


async def create_import(
    db: AsyncSession,
    user_id: str,
    body: StudentCVImportCreate,
) -> StudentCvImport:
    profile = await student_profile_service.get_profile_or_404(db, user_id)
    if not _has_source_payload(body):
        raise ValidationError(
            "At least one of file_url, source_url, or raw_text is required",
            field="raw_text",
        )
    row = StudentCvImport(
        profile_id=profile.id,
        source_type=body.source_type,
        file_url=body.file_url,
        source_url=body.source_url,
        raw_text=body.raw_text,
        status="uploaded",
    )
    db.add(row)
    await db.flush()
    await db.refresh(row)
    return row


async def get_import_owned(
    db: AsyncSession, profile_id: str, import_id: str
) -> StudentCvImport | None:
    stmt = select(StudentCvImport).where(
        StudentCvImport.id == import_id,
        StudentCvImport.profile_id == profile_id,
        StudentCvImport.deleted_at.is_(None),
    )
    return (await db.execute(stmt)).scalar_one_or_none()


async def list_imports(db: AsyncSession, user_id: str) -> list[StudentCvImport]:
    profile = await student_profile_service.get_profile_or_404(db, user_id)
    stmt = (
        select(StudentCvImport)
        .where(
            StudentCvImport.profile_id == profile.id,
            StudentCvImport.deleted_at.is_(None),
        )
        .order_by(StudentCvImport.created_at.desc())
    )
    return list((await db.execute(stmt)).scalars().all())


async def run_extract(db: AsyncSession, import_id: str) -> StudentCvImport:
    stmt = select(StudentCvImport).where(
        StudentCvImport.id == import_id,
        StudentCvImport.deleted_at.is_(None),
    )
    row = (await db.execute(stmt)).scalar_one_or_none()
    if not row:
        raise NotFoundError(resource="StudentCvImport", identifier=import_id)

    if row.status not in ("uploaded", "extracting", "failed"):
        return row

    body = StudentCVImportCreate(
        source_type=cast(Any, row.source_type),
        file_url=row.file_url,
        source_url=row.source_url,
        raw_text=row.raw_text,
    )
    combined = _combined_cv_text(body)
    if not combined.strip():
        row.status = "failed"
        row.error_message = "No text available for extraction"
        await db.flush()
        await db.refresh(row)
        return row

    model = settings.OPENROUTER_DEFAULT_MODEL
    row.status = "extracting"
    row.error_message = None
    await db.flush()

    slug_hint = await _skill_slugs_hint(db)
    prompt = (
        "Tu es un extracteur de CV pour la plateforme Mira Learn.\n"
        "Réponds uniquement avec un JSON compact : "
        '{"experiences":[{"role":str,"company":str,"start_year":int,"end_year":int|null,'
        '"description":str}],"skills":[{"skill_slug":str,"level":str,'
        '"confidence":float,"evidence":str}]}\n'
        f"Skill slugs connus (préfère un de ces slugs si pertinent) : {slug_hint}\n\n"
        f"Contenu candidat :\n{combined[:14000]}"
    )
    tokens = 0
    try:
        completion = await llm_client.complete(
            [
                {
                    "role": "system",
                    "content": "Tu réponds uniquement avec un objet JSON valide, sans markdown.",
                },
                {"role": "user", "content": prompt},
            ],
            model=model,
            temperature=0.2,
            max_tokens=4000,
            response_format={"type": "json_object"},
        )
        usage = completion.get("usage") or {}
        tokens = int(usage.get("total_tokens") or 0)
        data = json.loads(completion["content"])
        ex_raw = data.get("experiences") or []
        sk_raw = data.get("skills") or []
        valid_ex: list[dict[str, Any]] = []
        for item in ex_raw[:50]:
            try:
                valid_ex.append(ExtractedExperience.model_validate(item).model_dump())
            except Exception:
                continue
        valid_sk: list[dict[str, Any]] = []
        for item in sk_raw[:80]:
            try:
                valid_sk.append(ExtractedSkill.model_validate(item).model_dump())
            except Exception:
                continue
        row.extracted_experiences_raw = valid_ex
        row.extracted_skills_raw = valid_sk
        row.status = "extracted"
        row.extracted_at = datetime.now(timezone.utc)
        row.llm_model_used = model
        row.llm_tokens_consumed = tokens
    except Exception as exc:  # noqa: BLE001
        row.status = "failed"
        row.error_message = str(exc)[:2000]
        row.llm_model_used = model
        row.llm_tokens_consumed = tokens
    await db.flush()
    await db.refresh(row)
    return row


async def validate_import(
    db: AsyncSession,
    user_id: str,
    import_id: str,
    body: StudentCVImportValidate,
) -> StudentCvImport:
    profile = await student_profile_service.get_profile_or_404(db, user_id)
    row = await get_import_owned(db, profile.id, import_id)
    if not row:
        raise NotFoundError(resource="StudentCvImport", identifier=import_id)
    if row.status != "extracted":
        raise ValidationError("Only extracted imports can be validated", field="status")

    now = datetime.now(timezone.utc)
    row.validated_experiences = [e.model_dump() for e in body.validated_experiences]
    row.validated_skills = [s.model_dump() for s in body.validated_skills]
    row.status = "validated"
    row.validated_at = now

    journey = list(profile.professional_journey or [])
    for exp in body.validated_experiences:
        journey.append(exp.model_dump())
    profile.professional_journey = journey

    for sk in body.validated_skills:
        sid = await _resolve_skill_id(db, sk.skill_slug)
        if not sid:
            continue
        stmt = select(StudentSkill).where(
            StudentSkill.profile_id == profile.id,
            StudentSkill.skill_id == sid,
        )
        existing = (await db.execute(stmt)).scalar_one_or_none()
        if existing:
            existing.level = sk.level
            existing.validated = True
            existing.source = "cv_import"
            existing.validated_at = now
            existing.validation_evidence = {
                "cv_import_id": row.id,
                "evidence": sk.evidence,
            }
        else:
            db.add(
                StudentSkill(
                    profile_id=profile.id,
                    skill_id=sid,
                    level=sk.level,
                    validated=True,
                    source="cv_import",
                    validated_at=now,
                    validation_evidence={
                        "cv_import_id": row.id,
                        "evidence": sk.evidence,
                    },
                ),
            )

    await db.flush()
    await db.refresh(row)
    return row


async def soft_delete_import(db: AsyncSession, user_id: str, import_id: str) -> None:
    profile = await student_profile_service.get_profile_or_404(db, user_id)
    row = await get_import_owned(db, profile.id, import_id)
    if not row:
        raise NotFoundError(resource="StudentCvImport", identifier=import_id)
    row.deleted_at = datetime.now(timezone.utc)
    await db.flush()
