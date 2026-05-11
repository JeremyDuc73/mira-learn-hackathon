"""Modèle SQLAlchemy — mentor_profile (lecture catalogue Group C)."""

from __future__ import annotations

from datetime import datetime
from decimal import Decimal

from sqlalchemy import DateTime, Integer, Numeric, String, Text, func, text
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base, SoftDeleteMixin, TimestampMixin


class MentorProfile(Base, TimestampMixin, SoftDeleteMixin):
    __tablename__ = "mentor_profile"

    id: Mapped[str] = mapped_column(
        UUID(as_uuid=False),
        primary_key=True,
        server_default=text("uuid_generate_v4()"),
    )
    user_id: Mapped[str] = mapped_column(
        UUID(as_uuid=False), nullable=False, unique=True
    )

    slug: Mapped[str] = mapped_column(String(120), nullable=False, unique=True)
    display_name: Mapped[str] = mapped_column(String(120), nullable=False)
    headline: Mapped[str] = mapped_column(String(255), nullable=False, default="")
    bio: Mapped[str] = mapped_column(Text, nullable=False, default="")
    avatar_url: Mapped[str | None] = mapped_column(String(500))
    cover_url: Mapped[str | None] = mapped_column(String(500))

    professional_journey: Mapped[list] = mapped_column(
        JSONB, nullable=False, server_default=text("'[]'::jsonb")
    )

    linkedin_url: Mapped[str | None] = mapped_column(String(255))
    instagram_url: Mapped[str | None] = mapped_column(String(255))
    website_url: Mapped[str | None] = mapped_column(String(255))

    status: Mapped[str] = mapped_column(String(16), nullable=False, default="active")

    aggregate_rating: Mapped[Decimal | None] = mapped_column(Numeric(3, 2))
    rating_count: Mapped[int] = mapped_column(
        Integer, nullable=False, server_default="0"
    )
    classes_given_count: Mapped[int] = mapped_column(
        Integer, nullable=False, server_default="0"
    )

    validated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )
