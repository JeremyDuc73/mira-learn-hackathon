"""Modèle SQLAlchemy — student_learning_path."""

from __future__ import annotations

from datetime import datetime
from decimal import Decimal

from sqlalchemy import DateTime, Integer, Numeric, String, text
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base, SoftDeleteMixin, TimestampMixin


class StudentLearningPath(Base, TimestampMixin, SoftDeleteMixin):
    __tablename__ = "student_learning_path"

    id: Mapped[str] = mapped_column(
        UUID(as_uuid=False),
        primary_key=True,
        server_default=text("uuid_generate_v4()"),
    )
    profile_id: Mapped[str] = mapped_column(UUID(as_uuid=False), nullable=False)

    name: Mapped[str] = mapped_column(String(200), nullable=False, server_default="")
    target_skills: Mapped[list] = mapped_column(
        JSONB, nullable=False, server_default=text("'[]'::jsonb")
    )
    target_horizon: Mapped[str] = mapped_column(String(16), nullable=False)

    total_steps: Mapped[int] = mapped_column(
        Integer, nullable=False, server_default="0"
    )
    estimated_duration_hours: Mapped[int] = mapped_column(
        Integer, nullable=False, server_default="0"
    )
    completion_pct: Mapped[Decimal] = mapped_column(
        Numeric(5, 2), nullable=False, server_default="0"
    )

    status: Mapped[str] = mapped_column(
        String(32), nullable=False, server_default="active"
    )

    generated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False
    )
    llm_model_used: Mapped[str] = mapped_column(String(64), nullable=False)
    llm_tokens_consumed: Mapped[int | None] = mapped_column(Integer, nullable=True)

    started_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    completed_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    abandoned_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    abandoned_reason: Mapped[str | None] = mapped_column(String(64), nullable=True)
