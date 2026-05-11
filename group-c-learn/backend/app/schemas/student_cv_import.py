"""Schémas — student_cv_import (contracts/group-c-learn/student_cv_import.md)."""

from __future__ import annotations

from datetime import datetime
from typing import Literal, Optional

from pydantic import BaseModel, ConfigDict, Field

CVImportStatus = Literal["uploaded", "extracting", "extracted", "validated", "failed"]
CVSourceType = Literal["pdf", "linkedin_url", "manual_paste"]


class ExtractedExperience(BaseModel):
    role: str = Field(default="", max_length=120)
    company: str = Field(default="", max_length=120)
    start_year: int = Field(default=2000, ge=1970, le=2035)
    end_year: Optional[int] = Field(None, ge=1970, le=2035)
    description: str = Field(default="", max_length=4000)


class ExtractedSkill(BaseModel):
    skill_slug: str = Field(default="", max_length=64)
    level: Literal["intermediate", "advanced", "expert"] = "intermediate"
    confidence: float = Field(ge=0.0, le=1.0, default=0.7)
    evidence: str = Field(default="", max_length=4000)


class StudentCVImportCreate(BaseModel):
    source_type: CVSourceType
    file_url: Optional[str] = Field(None, max_length=500)
    source_url: Optional[str] = Field(None, max_length=500)
    raw_text: Optional[str] = None


class StudentCVImportValidate(BaseModel):
    validated_experiences: list[ExtractedExperience]
    validated_skills: list[ExtractedSkill]


class StudentCVImportRead(BaseModel):
    id: str
    profile_id: str
    source_type: CVSourceType
    status: CVImportStatus
    error_message: Optional[str] = None
    extracted_experiences_raw: Optional[list[ExtractedExperience]] = None
    extracted_skills_raw: Optional[list[ExtractedSkill]] = None
    validated_experiences: Optional[list[ExtractedExperience]] = None
    validated_skills: Optional[list[ExtractedSkill]] = None
    extracted_at: Optional[datetime] = None
    validated_at: Optional[datetime] = None
    llm_model_used: Optional[str] = None
    llm_tokens_consumed: Optional[int] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
