"""Génération de parcours IA — prompt + parsing JSON (OpenRouter via LLMClient)."""

from __future__ import annotations

import hashlib
import json
import re
from dataclasses import dataclass

from pydantic import BaseModel, Field, ValidationError

from app.core.exceptions import AppException


@dataclass(frozen=True)
class PathPromptContext:
    display_name: str
    headline: str
    motivation: str
    profile_learning_horizon: str | None
    target_skill_ids: list[str]
    target_horizon: str
    acquired_skill_ids: list[str]
    skills_payload: list[dict[str, str]]
    relations_text: str
    catalog_text: str
    catalog_class_count: int


class LLMStepRow(BaseModel):
    position: int = Field(ge=1)
    skill_id: str
    justification: str = ""
    recommended_class_ids: list[str] = Field(default_factory=list)
    estimated_duration_hours: int = Field(default=0, ge=0)


class LLMPathPayload(BaseModel):
    steps: list[LLMStepRow]
    total_estimated_duration_hours: int | None = Field(default=None, ge=0)


def sha256_prompt(text: str) -> str:
    return hashlib.sha256(text.encode("utf-8")).hexdigest()


def build_user_prompt(ctx: PathPromptContext) -> str:
    """Assemble le prompt utilisateur (hashe pour audit)."""
    skills_json = json.dumps(ctx.skills_payload, ensure_ascii=False)
    targets_json = json.dumps(ctx.target_skill_ids, ensure_ascii=False)
    acquired_json = json.dumps(ctx.acquired_skill_ids, ensure_ascii=False)
    return f"""Tu es le moteur de parcours Mira Learn pour digital nomads francophones.

Contexte apprenant :
- display_name : {ctx.display_name}
- headline : {ctx.headline}
- motivation : {ctx.motivation or "(non renseignée)"}
- learning_horizon (profil, info) : {ctx.profile_learning_horizon or "(non renseigné)"}
- horizon demandé pour CE parcours : {ctx.target_horizon}

Skills cibles (dans cet ordre logique possible, à réordonner si besoin) :
{targets_json}

Skills déjà acquises / validées (à exclure des étapes) :
{acquired_json}

Catalogue skills (id → nom) :
{skills_json}

Relations entre skills (lignes "from → to (type)") :
{ctx.relations_text or "(aucune chargée pour ce périmètre)"}

Catalogue classes publiées (utilise UNIQUEMENT ces IDs pour recommended_class_ids) :
{ctx.catalog_text}

Contraintes :
- Une étape = exactement une skill_id parmi les skills CIBLES (pas les acquises).
- Chaque skill cible doit apparaître dans exactement une étape.
- Pour chaque étape : jusqu'à 3 class IDs du catalogue ci-dessus dont skills_taught couvre la skill de l'étape.
- recommended_class_ids : ordre = préférence décroissante.
- estimated_duration_hours par étape : entier réaliste (heures de travail estimées).
- justification : 2–4 phrases, ton chaleureux Mira (exigeant mais bienveillant), en français.

Réponds avec un UNIQUE objet JSON :
{{
  "steps": [
    {{
      "position": 1,
      "skill_id": "uuid-skill",
      "justification": "...",
      "recommended_class_ids": ["uuid-class-1","uuid-class-2"],
      "estimated_duration_hours": 20
    }}
  ],
  "total_estimated_duration_hours": 80
}}

Pas de markdown, pas de texte hors JSON.
"""


_FENCE_RE = re.compile(r"```(?:json)?\s*(.*?)\s*```", re.DOTALL | re.IGNORECASE)


def _extract_json_blob(raw: str) -> str:
    s = raw.strip()
    m = _FENCE_RE.search(s)
    if m:
        return m.group(1).strip()
    return s


def parse_llm_path_payload(content: str) -> LLMPathPayload:
    """Parse et valide la réponse modèle."""
    blob = _extract_json_blob(content)
    try:
        data = json.loads(blob)
    except json.JSONDecodeError as exc:
        raise AppException(
            message="LLM returned invalid JSON",
            status_code=502,
            data={"detail": str(exc)},
        ) from exc
    try:
        return LLMPathPayload.model_validate(data)
    except ValidationError as exc:
        raise AppException(
            message="LLM JSON does not match expected schema",
            status_code=502,
            data={"detail": exc.errors()},
        ) from exc
