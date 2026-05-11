"""Modèle — student_cv_import (0001 schema)."""

from __future__ import annotations

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
    file_url: Mapped[str | None] = mapped_column(String(500))
    source_url: Mapped[str | None] = mapped_column(String(500))
    raw_text: Mapped[str | None] = mapped_column(Text)

    status: Mapped[str] = mapped_column(
        String(32), nullable=False, server_default="uploaded"
    )
    error_message: Mapped[str | None] = mapped_column(Text)

    extracted_experiences_raw: Mapped[list | None] = mapped_column(JSONB)
    extracted_skills_raw: Mapped[list | None] = mapped_column(JSONB)
    validated_experiences: Mapped[list | None] = mapped_column(JSONB)
    validated_skills: Mapped[list | None] = mapped_column(JSONB)

    extracted_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))

    validated_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    llm_model_used: Mapped[str | None] = mapped_column(String(64))
    llm_tokens_consumed: Mapped[int | None] = mapped_column(Integer)
