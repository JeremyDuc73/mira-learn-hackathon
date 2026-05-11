"""Schémas Pydantic — parcours d'apprentissage (contracts group-c-learn)."""

from __future__ import annotations

from datetime import datetime
from decimal import Decimal
from typing import Literal, Optional

from pydantic import BaseModel, ConfigDict, Field

LearningHorizon = Literal["3_months", "6_months", "1_year", "2_years"]
PathStatus = Literal["active", "completed", "abandoned"]
AbandonReason = Literal[
    "changed_goals",
    "too_long",
    "too_difficult",
    "not_motivated",
    "other",
]
StepStatus = Literal["pending", "in_progress", "validated", "skipped"]
ValidationSource = Literal["class_completion", "quiz", "self_declared"]
RegenTrigger = Literal[
    "initial",
    "target_skills_changed",
    "target_horizon_changed",
    "skill_validated_outside_path",
    "step_skipped",
    "manual_request",
]


class StudentLearningPathGenerateRequest(BaseModel):
    """Création + génération IA en une étape."""

    name: Optional[str] = Field(None, max_length=200)
    target_skills: list[str] = Field(..., min_length=1, max_length=10)
    target_horizon: LearningHorizon


class StudentLearningPathRegenerateRequest(BaseModel):
    """Re-génération (même path_id, nouveaux steps)."""

    new_target_skills: Optional[list[str]] = Field(None, max_length=10)
    new_target_horizon: Optional[LearningHorizon] = None
    trigger_reason: str = Field(..., max_length=120)


class StudentLearningPathStepRead(BaseModel):
    id: str
    path_id: str
    position: int = Field(ge=1)
    skill_id: str
    recommended_class_ids: list[str] = Field(default_factory=list)
    justification: str = ""
    estimated_duration_hours: int = Field(default=0, ge=0)
    status: StepStatus
    started_at: Optional[datetime] = None
    validated_at: Optional[datetime] = None
    validated_via: Optional[ValidationSource] = None
    validated_via_class_session_id: Optional[str] = None
    skipped_at: Optional[datetime] = None
    skipped_reason: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class StudentLearningPathRead(BaseModel):
    id: str
    profile_id: str
    name: str
    target_skills: list[str]
    target_horizon: LearningHorizon
    total_steps: int
    estimated_duration_hours: int
    completion_pct: Decimal
    status: PathStatus
    generated_at: datetime
    llm_model_used: str
    llm_tokens_consumed: Optional[int] = None
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    abandoned_at: Optional[datetime] = None
    abandoned_reason: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class StudentLearningPathDetailRead(StudentLearningPathRead):
    steps: list[StudentLearningPathStepRead] = Field(default_factory=list)
    current_step_position: Optional[int] = Field(
        default=None,
        description="Position de la première étape pending / in_progress",
        ge=1,
    )


class StudentPathRegenerationLogRead(BaseModel):
    id: str
    path_id: str
    trigger_reason: str
    input_target_skills: list[str]
    input_horizon: str
    input_acquired_skills: list[str]
    input_catalog_snapshot_count: int
    output_total_steps: int = Field(ge=0)
    output_estimated_duration_hours: int = Field(ge=0)
    llm_model_used: str
    llm_tokens_consumed: int
    llm_cost_estimated_cents: Optional[int] = None
    generation_prompt_hash: str
    generation_latency_ms: Optional[int] = None
    generation_success: bool
    error_message: Optional[str] = None
    generated_at: datetime
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class StudentLearningPathAbandon(BaseModel):
    reason: AbandonReason
