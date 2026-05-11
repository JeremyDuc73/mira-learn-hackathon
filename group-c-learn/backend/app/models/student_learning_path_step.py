"""Modèle SQLAlchemy — student_learning_path_step."""

from __future__ import annotations

from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Integer, String, Text, text
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base, TimestampMixin


class StudentLearningPathStep(Base, TimestampMixin):
    __tablename__ = "student_learning_path_step"

    id: Mapped[str] = mapped_column(
        UUID(as_uuid=False),
        primary_key=True,
        server_default=text("uuid_generate_v4()"),
    )
    path_id: Mapped[str] = mapped_column(
        UUID(as_uuid=False),
        ForeignKey("student_learning_path.id", ondelete="CASCADE"),
        nullable=False,
    )
    position: Mapped[int] = mapped_column(Integer, nullable=False)
    skill_id: Mapped[str] = mapped_column(UUID(as_uuid=False), nullable=False)

    recommended_class_ids: Mapped[list] = mapped_column(
        JSONB, nullable=False, server_default=text("'[]'::jsonb")
    )
    justification: Mapped[str] = mapped_column(Text, nullable=False, server_default="")
    estimated_duration_hours: Mapped[int] = mapped_column(
        Integer, nullable=False, server_default="0"
    )

    status: Mapped[str] = mapped_column(
        String(32), nullable=False, server_default="pending"
    )

    started_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    validated_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    validated_via: Mapped[str | None] = mapped_column(String(32), nullable=True)
    validated_via_class_session_id: Mapped[str | None] = mapped_column(
        UUID(as_uuid=False), nullable=True
    )
    skipped_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    skipped_reason: Mapped[str | None] = mapped_column(Text, nullable=True)
