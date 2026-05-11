"""Modèle — mira_class_session (sessions inscription démo groupe C)."""

from __future__ import annotations

from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Integer, String, func, text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base


class MiraClassSession(Base):
    __tablename__ = "mira_class_session"

    id: Mapped[str] = mapped_column(
        UUID(as_uuid=False),
        primary_key=True,
        server_default=text("uuid_generate_v4()"),
    )
    class_id: Mapped[str] = mapped_column(
        UUID(as_uuid=False),
        ForeignKey("mira_class.id", ondelete="CASCADE"),
        nullable=False,
    )
    title: Mapped[str] = mapped_column(String(200), nullable=False, default="")
    starts_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    spots_available: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    format_envisaged: Mapped[str] = mapped_column(
        String(16), nullable=False, default="both"
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
    )
