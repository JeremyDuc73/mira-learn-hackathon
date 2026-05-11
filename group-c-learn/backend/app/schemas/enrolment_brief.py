"""Schémas — POST /v1/enrolments (aligné brief : statut `applied` = intent `submitted`)."""

from __future__ import annotations

from datetime import datetime
from typing import Literal, Optional

from pydantic import BaseModel, ConfigDict, Field

BriefEnrolmentStatus = Literal["draft", "applied", "transmitted_to_mentor"]


class EnrolmentApplyCreate(BaseModel):
    """Pré-inscription depuis la fiche classe (slug front)."""

    class_slug: str = Field(..., max_length=130)
    session_id: Optional[str] = Field(
        default=None,
        description="Optionnel : sinon première session publiée pour la classe",
    )
    application_data: dict[str, object] = Field(default_factory=dict)
    source_learning_path_id: Optional[str] = None
    source_learning_path_step_id: Optional[str] = None


class EnrolmentRead(BaseModel):
    id: str
    profile_id: str
    class_id: str
    class_slug: Optional[str] = None
    session_id: str
    application_data: dict[str, object]
    status: BriefEnrolmentStatus
    internal_status: Literal["draft", "submitted", "transmitted_to_mentor"]
    submitted_at: Optional[datetime] = None
    transmitted_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
