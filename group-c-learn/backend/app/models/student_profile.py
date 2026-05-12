"""
Modèle SQLAlchemy — student_profile (Group C).
"""

from __future__ import annotations
from typing import Optional

from sqlalchemy import String, Text, text
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base, SoftDeleteMixin, TimestampMixin


class StudentProfile(Base, TimestampMixin, SoftDeleteMixin):
    """Profil apprenant — aligné sur Alembic 0001."""

    __tablename__ = "student_profile"

    id: Mapped[str] = mapped_column(
        UUID(as_uuid=False),
        primary_key=True,
        server_default=text("uuid_generate_v4()"),
    )
    user_id: Mapped[str] = mapped_column(
        UUID(as_uuid=False), nullable=False, unique=True
    )

    display_name: Mapped[str] = mapped_column(String(120), nullable=False)
    headline: Mapped[str] = mapped_column(String(255), nullable=False, default="")
    bio: Mapped[str] = mapped_column(Text, nullable=False, default="")
    avatar_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)

    professional_journey: Mapped[list] = mapped_column(
        JSONB, nullable=False, server_default=text("'[]'::jsonb")
    )

    linkedin_url: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    twitter_url: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    website_url: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)

    target_skills: Mapped[list] = mapped_column(
        JSONB, nullable=False, server_default=text("'[]'::jsonb")
    )
    learning_horizon: Mapped[Optional[str]] = mapped_column(String(16), nullable=True)
    motivation: Mapped[str] = mapped_column(Text, nullable=False, default="")

    preferred_formats: Mapped[list] = mapped_column(
        JSONB, nullable=False, server_default=text("'[]'::jsonb")
    )
    preferred_destinations: Mapped[list] = mapped_column(
        JSONB, nullable=False, server_default=text("'[]'::jsonb")
    )
    timezone: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)

    current_country: Mapped[Optional[str]] = mapped_column(String(128), nullable=True)

    community_visibility: Mapped[str] = mapped_column(
        String(16),
        nullable=False,
        server_default="private",
    )
