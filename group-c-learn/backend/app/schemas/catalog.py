"""Schémas Pydantic — catalogue mentors + classes (lecture publique)."""

from __future__ import annotations

from datetime import datetime
from decimal import Decimal
from typing import Any, Literal, Optional

from pydantic import BaseModel, ConfigDict, Field

MentorStatus = Literal["active", "paused", "archived"]
ClassStatus = Literal[
    "draft",
    "submitted",
    "in_review",
    "validated_draft",
    "enrichment_in_progress",
    "published",
    "rejected",
    "archived",
]
ClassFormat = Literal["physical", "virtual", "both"]


class MentorCatalogItem(BaseModel):
    id: str
    user_id: str
    slug: str
    display_name: str
    headline: str
    avatar_url: Optional[str] = None
    status: MentorStatus
    aggregate_rating: Optional[Decimal] = None
    rating_count: int = Field(ge=0)
    classes_given_count: int = Field(ge=0)

    model_config = ConfigDict(from_attributes=True)


class MentorPublicRead(MentorCatalogItem):
    bio: str
    cover_url: Optional[str] = None
    professional_journey: list[Any] = Field(default_factory=list)
    linkedin_url: Optional[str] = None
    instagram_url: Optional[str] = None
    website_url: Optional[str] = None
    validated_at: datetime


class MiraClassCatalogItem(BaseModel):
    id: str
    mentor_user_id: str
    title: str
    slug: Optional[str] = None
    delivery_language: str = "fr"
    description: str
    skills_taught: list[str]
    total_hours: int = Field(ge=0)
    format_envisaged: ClassFormat
    status: ClassStatus
    published_at: Optional[datetime] = None
    recommended_price_per_hour_collective_cents: int = Field(ge=0, default=0)
    recommended_price_per_hour_individual_cents: int = Field(ge=0, default=0)
    mentor_display_name: str
    mentor_slug: str
    mentor_avatar_url: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class MiraClassModuleRead(BaseModel):
    id: str
    class_id: str
    position: int = Field(ge=1)
    title: str
    summary: str

    model_config = ConfigDict(from_attributes=True)


class MiraClassSessionRead(BaseModel):
    id: str
    class_id: str
    title: str
    starts_at: Optional[datetime] = None
    spots_available: int = Field(ge=0)
    format_envisaged: ClassFormat

    model_config = ConfigDict(from_attributes=True)


class MiraClassDetailRead(BaseModel):
    id: str
    mentor_user_id: str
    title: str
    slug: Optional[str] = None
    delivery_language: str = "fr"
    description: str
    skills_taught: list[str]
    total_hours_collective: int = Field(ge=0)
    total_hours_individual: int = Field(ge=0)
    total_hours: int = Field(ge=0)
    format_envisaged: ClassFormat
    rythm_pattern: Optional[str] = None
    target_cities: list[Any] = Field(default_factory=list)
    recommended_price_per_hour_collective_cents: int = Field(ge=0)
    recommended_price_per_hour_individual_cents: int = Field(ge=0)
    status: ClassStatus
    published_at: Optional[datetime] = None
    ai_assisted: bool
    modules: list[MiraClassModuleRead] = Field(default_factory=list)
    sessions: list[MiraClassSessionRead] = Field(default_factory=list)
    mentor: MentorCatalogItem

    model_config = ConfigDict(from_attributes=True)
