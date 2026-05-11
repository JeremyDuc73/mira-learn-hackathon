"""Schémas Pydantic — student_enrolment_intent (contract group-c-learn)."""

from __future__ import annotations

from datetime import datetime
from typing import Literal, Optional

from pydantic import BaseModel, ConfigDict, Field

IntentStatus = Literal["draft", "submitted", "transmitted_to_mentor"]


class StudentEnrolmentIntentBase(BaseModel):
    session_id: str
    class_id: str
    application_data: dict[str, object] = Field(default_factory=dict)
    source_learning_path_id: Optional[str] = None
    source_learning_path_step_id: Optional[str] = None


class StudentEnrolmentIntentCreate(StudentEnrolmentIntentBase):
    pass


class StudentEnrolmentIntentUpdate(BaseModel):
    application_data: Optional[dict[str, object]] = None


class StudentEnrolmentIntentSubmit(BaseModel):
    """Confirmation de la postulation (body vide)."""


class StudentEnrolmentIntentRead(StudentEnrolmentIntentBase):
    id: str
    profile_id: str
    status: IntentStatus
    submitted_at: Optional[datetime] = None
    transmitted_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
