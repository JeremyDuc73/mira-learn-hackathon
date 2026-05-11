"""Modèle SQLAlchemy — student_path_regeneration_log."""

from __future__ import annotations

from datetime import datetime

from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, String, Text, func, text
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base


class StudentPathRegenerationLog(Base):
    """Append-only audit des appels IA (parcours)."""

    __tablename__ = "student_path_regeneration_log"

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

    trigger_reason: Mapped[str] = mapped_column(String(64), nullable=False)

    input_target_skills: Mapped[list] = mapped_column(JSONB, nullable=False)
    input_horizon: Mapped[str] = mapped_column(String(16), nullable=False)
    input_acquired_skills: Mapped[list] = mapped_column(JSONB, nullable=False)
    input_catalog_snapshot_count: Mapped[int] = mapped_column(Integer, nullable=False)

    output_total_steps: Mapped[int] = mapped_column(Integer, nullable=False)
    output_estimated_duration_hours: Mapped[int] = mapped_column(
        Integer, nullable=False
    )

    llm_model_used: Mapped[str] = mapped_column(String(64), nullable=False)
    llm_tokens_consumed: Mapped[int] = mapped_column(Integer, nullable=False)
    llm_cost_estimated_cents: Mapped[int | None] = mapped_column(Integer, nullable=True)

    generation_prompt_hash: Mapped[str] = mapped_column(String(64), nullable=False)
    generation_latency_ms: Mapped[int | None] = mapped_column(Integer, nullable=True)
    generation_success: Mapped[bool] = mapped_column(
        Boolean, nullable=False, server_default=text("TRUE")
    )
    error_message: Mapped[str | None] = mapped_column(Text, nullable=True)

    generated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
    )
