"""Schémas Pydantic — skill_relation."""

from __future__ import annotations

from datetime import datetime
from decimal import Decimal
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field


RelationType = Literal["prerequisite_of", "related_to", "builds_on"]


class SkillRelationRead(BaseModel):
    id: str
    from_skill_id: str
    to_skill_id: str
    relation_type: RelationType
    strength: Decimal = Field(ge=0, le=1)
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
