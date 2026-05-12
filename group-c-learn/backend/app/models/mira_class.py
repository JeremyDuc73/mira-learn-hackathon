"""Modèle SQLAlchemy — mira_class (lecture catalogue Group C)."""

from __future__ import annotations
from typing import Optional

from datetime import datetime

from sqlalchemy import BigInteger, Boolean, DateTime, Integer, String, Text, text
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base, SoftDeleteMixin, TimestampMixin


class MiraClass(Base, TimestampMixin, SoftDeleteMixin):
    __tablename__ = "mira_class"

    id: Mapped[str] = mapped_column(
        UUID(as_uuid=False),
        primary_key=True,
        server_default=text("uuid_generate_v4()"),
    )

    application_id: Mapped[Optional[str]] = mapped_column(UUID(as_uuid=False))
    mentor_user_id: Mapped[str] = mapped_column(UUID(as_uuid=False), nullable=False)

    title: Mapped[str] = mapped_column(String(200), nullable=False)
    slug: Mapped[Optional[str]] = mapped_column(String(130), nullable=True)
    description: Mapped[str] = mapped_column(Text, nullable=False, default="")
    skills_taught: Mapped[list] = mapped_column(
        JSONB, nullable=False, server_default=text("'[]'::jsonb")
    )

    total_hours_collective: Mapped[int] = mapped_column(
        Integer, nullable=False, server_default="0"
    )
    total_hours_individual: Mapped[int] = mapped_column(
        Integer, nullable=False, server_default="0"
    )
    total_hours: Mapped[int] = mapped_column(
        Integer, nullable=False, server_default="0"
    )

    format_envisaged: Mapped[str] = mapped_column(
        String(16), nullable=False, server_default="both"
    )

    delivery_language: Mapped[str] = mapped_column(
        String(16), nullable=False, server_default="fr"
    )
    rythm_pattern: Mapped[Optional[str]] = mapped_column(String(32))
    target_cities: Mapped[list] = mapped_column(
        JSONB, nullable=False, server_default=text("'[]'::jsonb")
    )

    recommended_price_per_hour_collective_cents: Mapped[int] = mapped_column(
        BigInteger, nullable=False, server_default="0"
    )
    recommended_price_per_hour_individual_cents: Mapped[int] = mapped_column(
        BigInteger, nullable=False, server_default="0"
    )

    status: Mapped[str] = mapped_column(
        String(32), nullable=False, server_default="draft"
    )
    rejection_reason: Mapped[Optional[str]] = mapped_column(Text)

    ai_assisted: Mapped[bool] = mapped_column(
        Boolean, nullable=False, server_default=text("FALSE")
    )
    source_suggestion_id: Mapped[Optional[str]] = mapped_column(UUID(as_uuid=False))

    submitted_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))
    validated_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))
    published_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))
    archived_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))
