"""Schémas — annuaire communauté apprenants (nice-to-have brief)."""

from __future__ import annotations

from pydantic import BaseModel, ConfigDict, Field


class CommunityLearnerRead(BaseModel):
    profile_id: str
    display_name: str
    headline: str = ""
    avatar_url: str | None = None
    current_country: str | None = None
    preferred_destinations: list[str] = Field(default_factory=list)

    model_config = ConfigDict(from_attributes=True)
