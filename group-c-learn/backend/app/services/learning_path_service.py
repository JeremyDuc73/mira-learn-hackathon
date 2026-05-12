"""Service — génération + persistance des parcours IA (student_learning_path*)."""

from __future__ import annotations

import time
from datetime import datetime, timezone
from decimal import Decimal
from typing import Sequence

from sqlalchemy import delete, or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.exceptions import NotFoundError, ValidationError
from app.integrations.openrouter import llm_client
from app.models.mira_class import MiraClass
from app.models.skill import Skill
from app.models.skill_relation import SkillRelation
from app.models.student_learning_path import StudentLearningPath
from app.models.student_learning_path_step import StudentLearningPathStep
from app.models.student_path_regeneration_log import StudentPathRegenerationLog
from app.models.student_profile import StudentProfile
from app.models.student_skill import StudentSkill
from app.schemas.learning_path import (
    StudentLearningPathAbandon,
    StudentLearningPathGenerateRequest,
    StudentLearningPathRegenerateRequest,
)
from app.services import student_profile_service
from app.services.path_generator import (
    LLMPathPayload,
    LLMStepRow,
    PathPromptContext,
    build_user_prompt,
    parse_llm_path_payload,
    sha256_prompt,
)


def _skills_taught_list(raw: object) -> list[str]:
    if raw is None:
        return []
    if isinstance(raw, list):
        return [str(x) for x in raw]
    return []


async def _ensure_skills_exist(db: AsyncSession, skill_ids: Sequence[str]) -> None:
    if not skill_ids:
        raise ValidationError("target_skills must not be empty", field="target_skills")
    stmt = select(Skill.id).where(
        Skill.id.in_(list(skill_ids)), Skill.deleted_at.is_(None)
    )
    found = {row[0] for row in (await db.execute(stmt)).all()}
    missing = set(skill_ids) - found
    if missing:
        raise ValidationError(
            f"Unknown or inactive skills: {sorted(missing)}",
            field="target_skills",
        )


async def _acquired_skill_ids(db: AsyncSession, profile_id: str) -> list[str]:
    stmt = select(StudentSkill.skill_id).where(
        StudentSkill.profile_id == profile_id,
        StudentSkill.validated.is_(True),
    )
    return [r[0] for r in (await db.execute(stmt)).all()]


async def _abandon_active_paths(db: AsyncSession, profile_id: str) -> None:
    stmt = select(StudentLearningPath).where(
        StudentLearningPath.profile_id == profile_id,
        StudentLearningPath.status == "active",
        StudentLearningPath.deleted_at.is_(None),
    )
    now = datetime.now(timezone.utc)
    for p in (await db.execute(stmt)).scalars().all():
        p.status = "abandoned"
        p.abandoned_at = now
        p.abandoned_reason = "changed_goals"


async def _load_published_classes(db: AsyncSession) -> list[MiraClass]:
    stmt = (
        select(MiraClass)
        .where(MiraClass.deleted_at.is_(None), MiraClass.status == "published")
        .order_by(MiraClass.published_at.desc().nullslast(), MiraClass.title.asc())
    )
    return list((await db.execute(stmt)).scalars().all())


async def _relations_lines(db: AsyncSession, skill_ids: Sequence[str]) -> str:
    if not skill_ids:
        return ""
    sid = set(skill_ids)
    stmt = select(SkillRelation).where(
        or_(SkillRelation.from_skill_id.in_(sid), SkillRelation.to_skill_id.in_(sid))
    )
    rows = list((await db.execute(stmt)).scalars().all())[:300]
    return "\n".join(
        f"{r.from_skill_id} → {r.to_skill_id} ({r.relation_type})" for r in rows
    )


async def _skills_payload_for_targets(
    db: AsyncSession, target_skill_ids: Sequence[str]
) -> list[dict[str, str]]:
    stmt = select(Skill).where(
        Skill.id.in_(list(target_skill_ids)), Skill.deleted_at.is_(None)
    )
    by_id = {s.id: s for s in (await db.execute(stmt)).scalars().all()}
    out: list[dict[str, str]] = []
    for sid in target_skill_ids:
        s = by_id.get(sid)
        if s:
            out.append({"id": s.id, "name": s.name, "slug": s.slug})
    return out


def _catalog_text(classes: Sequence[MiraClass]) -> str:
    lines: list[str] = []
    for c in classes:
        st = _skills_taught_list(c.skills_taught)
        slug = c.slug or ""
        lines.append(
            f"- {c.id}: slug={slug!r} {c.title!r} — "
            f"skills_taught={st} — {c.total_hours}h — "
            f"format={c.format_envisaged} — lang={c.delivery_language}",
        )
    return (
        "\n".join(lines)
        if lines
        else "(aucune classe publiée en base — indique un tableau steps avec recommended_class_ids vide)"
    )


async def _build_prompt_context(
    db: AsyncSession,
    profile: StudentProfile,
    target_skill_ids: list[str],
    target_horizon: str,
) -> tuple[PathPromptContext, list[MiraClass]]:
    acquired = await _acquired_skill_ids(db, profile.id)
    acquired_set = set(acquired)
    targets = [s for s in target_skill_ids if s not in acquired_set]
    if not targets:
        raise ValidationError(
            "All target skills are already validated — pick new targets",
            field="target_skills",
        )

    classes = await _load_published_classes(db)
    rel_text = await _relations_lines(db, list(set(targets) | acquired_set))
    skills_payload = await _skills_payload_for_targets(db, targets)

    return (
        PathPromptContext(
            display_name=profile.display_name,
            headline=profile.headline,
            motivation=profile.motivation,
            profile_learning_horizon=profile.learning_horizon,
            target_skill_ids=targets,
            target_horizon=target_horizon,
            acquired_skill_ids=acquired,
            skills_payload=skills_payload,
            relations_text=rel_text,
            catalog_text=_catalog_text(classes),
            catalog_class_count=len(classes),
        ),
        classes,
    )


def _classes_teaching_skill(classes: Sequence[MiraClass], skill_id: str) -> list[str]:
    out: list[str] = []
    for c in classes:
        if skill_id in _skills_taught_list(c.skills_taught):
            out.append(c.id)
    return out


def _normalize_steps(
    payload: LLMPathPayload,
    target_skill_ids: Sequence[str],
    classes: Sequence[MiraClass],
) -> list[LLMStepRow]:
    target_set = list(dict.fromkeys(target_skill_ids))  # preserve order, unique
    seen: set[str] = set()
    ordered: list[LLMStepRow] = []
    for row in sorted(payload.steps, key=lambda x: x.position):
        if row.skill_id not in target_set or row.skill_id in seen:
            continue
        allowed = set(_classes_teaching_skill(classes, row.skill_id))
        picked = [x for x in row.recommended_class_ids if x in allowed][:3]
        if len(picked) < 3:
            for cid in _classes_teaching_skill(classes, row.skill_id):
                if cid not in picked:
                    picked.append(cid)
                if len(picked) >= 3:
                    break
        ordered.append(
            LLMStepRow(
                position=len(ordered) + 1,
                skill_id=row.skill_id,
                justification=row.justification or "",
                recommended_class_ids=picked[:3],
                estimated_duration_hours=row.estimated_duration_hours,
            )
        )
        seen.add(row.skill_id)

    for sid in target_set:
        if sid in seen:
            continue
        fallback = _classes_teaching_skill(classes, sid)[:3]
        ordered.append(
            LLMStepRow(
                position=len(ordered) + 1,
                skill_id=sid,
                justification="Étape complétée automatiquement (skill absente de la réponse modèle).",
                recommended_class_ids=fallback,
                estimated_duration_hours=12,
            )
        )
        seen.add(sid)

    for i, row in enumerate(ordered, start=1):
        row.position = i
    return ordered


async def _run_llm_and_persist_steps(
    db: AsyncSession,
    path: StudentLearningPath,
    ctx: PathPromptContext,
    *,
    trigger: str,
    published_classes: Sequence[MiraClass],
) -> None:
    prompt = build_user_prompt(ctx)
    phash = sha256_prompt(prompt)
    model = settings.OPENROUTER_DEFAULT_MODEL
    t0 = time.monotonic()

    acquired = list(ctx.acquired_skill_ids)
    targets = list(ctx.target_skill_ids)
    catalog_n = ctx.catalog_class_count

    messages = [
        {
            "role": "system",
            "content": "Tu réponds uniquement avec un objet JSON valide, sans markdown ni prose.",
        },
        {"role": "user", "content": prompt},
    ]

    tokens = 0
    latency: int | None = None

    _DEMO_KEY_SENTINEL = "REPLACE_WITH"
    _use_mock = _DEMO_KEY_SENTINEL in settings.OPENROUTER_API_KEY

    try:
        if _use_mock:
            # No real API key — build a deterministic mock payload from the catalog
            mock_steps = [
                LLMStepRow(
                    position=i + 1,
                    skill_id=sid,
                    justification="Étape recommandée par Mira AI pour atteindre ton objectif.",
                    recommended_class_ids=_classes_teaching_skill(published_classes, sid)[:3],
                    estimated_duration_hours=12,
                )
                for i, sid in enumerate(targets)
            ]
            parsed = LLMPathPayload(
                steps=mock_steps,
                total_estimated_duration_hours=len(mock_steps) * 12,
            )
        else:
            raw = await llm_client.complete(
                messages,
                model=model,
                temperature=0.35,
                max_tokens=6000,
                response_format={"type": "json_object"},
            )
            latency = int((time.monotonic() - t0) * 1000)
            usage = raw.get("usage") or {}
            tokens = int(usage.get("total_tokens") or 0)
            parsed = parse_llm_path_payload(raw["content"])

        steps = _normalize_steps(parsed, targets, published_classes)
        total_h = parsed.total_estimated_duration_hours
        if total_h is None or total_h <= 0:
            total_h = sum(s.estimated_duration_hours for s in steps) or 0

        path.target_skills = targets
        path.target_horizon = ctx.target_horizon
        path.total_steps = len(steps)
        path.estimated_duration_hours = int(total_h)
        path.completion_pct = Decimal("0")
        path.generated_at = datetime.now(timezone.utc)
        path.llm_model_used = model
        path.llm_tokens_consumed = tokens
        path.status = "active"

        for s in steps:
            db.add(
                StudentLearningPathStep(
                    path_id=path.id,
                    position=s.position,
                    skill_id=s.skill_id,
                    recommended_class_ids=s.recommended_class_ids,
                    justification=s.justification,
                    estimated_duration_hours=s.estimated_duration_hours,
                    status="in_progress" if s.position == 1 else "pending",
                )
            )

        db.add(
            StudentPathRegenerationLog(
                path_id=path.id,
                trigger_reason=trigger,
                input_target_skills=targets,
                input_horizon=ctx.target_horizon,
                input_acquired_skills=acquired,
                input_catalog_snapshot_count=catalog_n,
                output_total_steps=len(steps),
                output_estimated_duration_hours=int(total_h),
                llm_model_used=model,
                llm_tokens_consumed=tokens,
                generation_prompt_hash=phash,
                generation_latency_ms=latency,
                generation_success=True,
            )
        )

    except Exception as exc:
        latency = latency or int((time.monotonic() - t0) * 1000)
        err_txt = str(exc)[:4000]
        path.status = "abandoned"
        path.abandoned_at = datetime.now(timezone.utc)
        path.abandoned_reason = "generation_failed"
        path.llm_tokens_consumed = tokens or None

        db.add(
            StudentPathRegenerationLog(
                path_id=path.id,
                trigger_reason=trigger,
                input_target_skills=targets,
                input_horizon=ctx.target_horizon,
                input_acquired_skills=acquired,
                input_catalog_snapshot_count=catalog_n,
                output_total_steps=0,
                output_estimated_duration_hours=0,
                llm_model_used=model,
                llm_tokens_consumed=tokens,
                generation_prompt_hash=phash,
                generation_latency_ms=latency,
                generation_success=False,
                error_message=err_txt,
            )
        )
    finally:
        # WHY : sans flush, un refresh() ultérieur sur `path` relit encore les valeurs INSERT initiales (ex. total_steps=0).
        await db.flush()


async def generate_and_create(
    db: AsyncSession, user_id: str, body: StudentLearningPathGenerateRequest
) -> StudentLearningPath:
    profile = await student_profile_service.get_profile_or_404(db, user_id)
    await _ensure_skills_exist(db, body.target_skills)

    await _abandon_active_paths(db, profile.id)

    model = settings.OPENROUTER_DEFAULT_MODEL
    now = datetime.now(timezone.utc)

    ctx, published = await _build_prompt_context(
        db, profile, list(body.target_skills), body.target_horizon
    )

    path = StudentLearningPath(
        profile_id=profile.id,
        name=(body.name or "").strip(),
        target_skills=list(ctx.target_skill_ids),
        target_horizon=body.target_horizon,
        total_steps=0,
        estimated_duration_hours=0,
        completion_pct=Decimal("0"),
        status="active",
        generated_at=now,
        llm_model_used=model,
        llm_tokens_consumed=None,
    )
    db.add(path)
    await db.flush()

    await _run_llm_and_persist_steps(
        db,
        path,
        ctx,
        trigger="initial",
        published_classes=published,
    )
    await db.refresh(path)
    return path


async def regenerate_path(
    db: AsyncSession,
    user_id: str,
    path_id: str,
    body: StudentLearningPathRegenerateRequest,
) -> StudentLearningPath:
    profile = await student_profile_service.get_profile_or_404(db, user_id)
    path = await get_path_owned(db, profile.id, path_id)
    if path.status != "active":
        raise ValidationError(
            "Only an active learning path can be regenerated",
            field="path_id",
        )

    targets = [str(x) for x in (body.new_target_skills or path.target_skills or [])]
    horizon = body.new_target_horizon or path.target_horizon
    await _ensure_skills_exist(db, targets)

    await db.execute(
        delete(StudentLearningPathStep).where(
            StudentLearningPathStep.path_id == path.id
        )
    )

    ctx, published = await _build_prompt_context(db, profile, targets, horizon)

    path.total_steps = 0
    path.estimated_duration_hours = 0
    path.completion_pct = Decimal("0")

    await _run_llm_and_persist_steps(
        db,
        path,
        ctx,
        trigger="manual_request",
        published_classes=published,
    )
    await db.refresh(path)
    return path


async def list_paths(db: AsyncSession, user_id: str) -> list[StudentLearningPath]:
    profile = await student_profile_service.get_profile_or_404(db, user_id)
    stmt = (
        select(StudentLearningPath)
        .where(
            StudentLearningPath.profile_id == profile.id,
            StudentLearningPath.deleted_at.is_(None),
        )
        .order_by(StudentLearningPath.created_at.desc())
    )
    return list((await db.execute(stmt)).scalars().all())


async def get_path_owned(
    db: AsyncSession, profile_id: str, path_id: str
) -> StudentLearningPath:
    stmt = select(StudentLearningPath).where(
        StudentLearningPath.id == path_id,
        StudentLearningPath.profile_id == profile_id,
        StudentLearningPath.deleted_at.is_(None),
    )
    row = (await db.execute(stmt)).scalar_one_or_none()
    if not row:
        raise NotFoundError(resource="StudentLearningPath", identifier=path_id)
    return row


async def get_path_with_steps(
    db: AsyncSession, user_id: str, path_id: str
) -> tuple[StudentLearningPath, list[StudentLearningPathStep]]:
    profile = await student_profile_service.get_profile_or_404(db, user_id)
    path = await get_path_owned(db, profile.id, path_id)
    stmt = (
        select(StudentLearningPathStep)
        .where(StudentLearningPathStep.path_id == path.id)
        .order_by(StudentLearningPathStep.position.asc())
    )
    steps = list((await db.execute(stmt)).scalars().all())
    return path, steps


async def list_regeneration_logs(
    db: AsyncSession, user_id: str, path_id: str
) -> list[StudentPathRegenerationLog]:
    profile = await student_profile_service.get_profile_or_404(db, user_id)
    await get_path_owned(db, profile.id, path_id)
    stmt = (
        select(StudentPathRegenerationLog)
        .where(StudentPathRegenerationLog.path_id == path_id)
        .order_by(StudentPathRegenerationLog.generated_at.desc())
    )
    return list((await db.execute(stmt)).scalars().all())


async def abandon_path(
    db: AsyncSession, user_id: str, path_id: str, body: StudentLearningPathAbandon
) -> StudentLearningPath:
    profile = await student_profile_service.get_profile_or_404(db, user_id)
    path = await get_path_owned(db, profile.id, path_id)
    if path.status == "abandoned":
        return path
    now = datetime.now(timezone.utc)
    path.status = "abandoned"
    path.abandoned_at = now
    path.abandoned_reason = body.reason
    await db.flush()
    await db.refresh(path)
    return path


async def soft_delete_path(db: AsyncSession, user_id: str, path_id: str) -> None:
    profile = await student_profile_service.get_profile_or_404(db, user_id)
    path = await get_path_owned(db, profile.id, path_id)
    path.deleted_at = datetime.now(timezone.utc)
    await db.flush()
