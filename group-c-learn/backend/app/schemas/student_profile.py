"""
Schémas Pydantic — student_profile (contracts/group-c-learn/student_profile.md).
"""

from __future__ import annotations

from datetime import datetime
from typing import Literal, Optional

from pydantic import BaseModel, ConfigDict, Field, field_validator

LearningHorizon = Literal["3_months", "6_months", "1_year", "2_years"]
ClassFormat = Literal["physical", "virtual", "both"]
CommunityVisibility = Literal["private", "public"]


class ProfessionalExperience(BaseModel):
    role: str = Field(..., max_length=120)
    company: str = Field(..., max_length=120)
    start_year: int = Field(..., ge=1970, le=2035)
    end_year: Optional[int] = Field(None, ge=1970, le=2035)
    description: str = Field(default="", max_length=2000)


class StudentProfileBase(BaseModel):
    display_name: str = Field(..., max_length=120)
    headline: str = Field(default="", max_length=255)
    bio: str = Field(default="", max_length=10_000)
    avatar_url: Optional[str] = Field(None, max_length=500)
    professional_journey: list[ProfessionalExperience] = Field(default_factory=list)
    linkedin_url: Optional[str] = Field(None, max_length=255)
    twitter_url: Optional[str] = Field(None, max_length=255)
    website_url: Optional[str] = Field(None, max_length=255)
    target_skills: list[str] = Field(default_factory=list)
    learning_horizon: Optional[LearningHorizon] = None
    motivation: str = Field(default="", max_length=2000)
    preferred_formats: list[ClassFormat] = Field(default_factory=list)
    preferred_destinations: list[str] = Field(default_factory=list)
    timezone: Optional[str] = Field(None, max_length=64)
    current_country: Optional[str] = Field(None, max_length=128)
    community_visibility: CommunityVisibility = "private"

    @field_validator("target_skills")
    @classmethod
    def cap_target_skills(cls, v: list[str]) -> list[str]:
        if len(v) > 10:
            raise ValueError("target_skills must contain at most 10 skill IDs")
        return v


class StudentProfileCreate(StudentProfileBase):
    pass


class StudentProfileUpdate(BaseModel):
    display_name: Optional[str] = Field(None, max_length=120)
    headline: Optional[str] = Field(None, max_length=255)
    bio: Optional[str] = Field(None, max_length=10_000)
    avatar_url: Optional[str] = Field(None, max_length=500)
    professional_journey: Optional[list[ProfessionalExperience]] = None
    linkedin_url: Optional[str] = Field(None, max_length=255)
    twitter_url: Optional[str] = Field(None, max_length=255)
    website_url: Optional[str] = Field(None, max_length=255)
    target_skills: Optional[list[str]] = None
    learning_horizon: Optional[LearningHorizon] = None
    motivation: Optional[str] = Field(None, max_length=2000)
    preferred_formats: Optional[list[ClassFormat]] = None
    preferred_destinations: Optional[list[str]] = None
    timezone: Optional[str] = Field(None, max_length=64)
    current_country: Optional[str] = Field(None, max_length=128)
    community_visibility: Optional[CommunityVisibility] = None

    @field_validator("target_skills")
    @classmethod
    def cap_target_skills(cls, v: Optional[list[str]]) -> Optional[list[str]]:
        if v is not None and len(v) > 10:
            raise ValueError("target_skills must contain at most 10 skill IDs")
        return v


class StudentProfileRead(StudentProfileBase):
    id: str
    user_id: str
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class StudentAvatarUrlBody(BaseModel):
    """Phase 1 : URL déjà hébergée (upload Storage côté client ou flow ultérieur)."""

    avatar_url: str = Field(..., max_length=500)
