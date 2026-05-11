"""Schémas Pydantic — student_skill."""

from __future__ import annotations

from datetime import datetime
from typing import Any, Literal, Optional

from pydantic import BaseModel, ConfigDict


SkillLevel = Literal["beginner", "intermediate", "advanced", "expert"]
SkillSource = Literal["self_declared", "cv_import", "class_completion", "quiz", "seed"]


class StudentSkillBase(BaseModel):
    skill_id: str
    level: SkillLevel
    validated: bool = False
    source: SkillSource
    validation_evidence: Optional[dict[str, Any]] = None


class StudentSkillCreate(StudentSkillBase):
    pass


class StudentSkillUpdate(BaseModel):
    level: Optional[SkillLevel] = None
    validated: Optional[bool] = None
    source: Optional[SkillSource] = None
    validation_evidence: Optional[dict[str, Any]] = None


class StudentSkillRead(StudentSkillBase):
    id: str
    profile_id: str
    validated_at: Optional[datetime]
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
