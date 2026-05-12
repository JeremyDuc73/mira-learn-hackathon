"""Modèle — student_cv_import (0001 schema)."""

from __future__ import annotations
from typing import Optional

from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Integer, String, Text, text
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base, SoftDeleteMixin, TimestampMixin


class StudentCvImport(Base, TimestampMixin, SoftDeleteMixin):
    __tablename__ = "student_cv_import"

    id: Mapped[str] = mapped_column(
        UUID(as_uuid=False),
        primary_key=True,
        server_default=text("uuid_generate_v4()"),
    )
    profile_id: Mapped[str] = mapped_column(
        UUID(as_uuid=False),
        ForeignKey("student_profile.id", ondelete="CASCADE"),
        nullable=False,
    )

    source_type: Mapped[str] = mapped_column(String(32), nullable=False)
    file_url: Mapped[Optional[str]] = mapped_column(String(500))
    source_url: Mapped[Optional[str]] = mapped_column(String(500))
    raw_text: Mapped[Optional[str]] = mapped_column(Text)

    status: Mapped[str] = mapped_column(
        String(32), nullable=False, server_default="uploaded"
    )
    error_message: Mapped[Optional[str]] = mapped_column(Text)

    extracted_experiences_raw: Mapped[Optional[list]] = mapped_column(JSONB)
    extracted_skills_raw: Mapped[Optional[list]] = mapped_column(JSONB)
    validated_experiences: Mapped[Optional[list]] = mapped_column(JSONB)
    validated_skills: Mapped[Optional[list]] = mapped_column(JSONB)

    extracted_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))

    validated_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))
    llm_model_used: Mapped[Optional[str]] = mapped_column(String(64))
    llm_tokens_consumed: Mapped[Optional[int]] = mapped_column(Integer)
