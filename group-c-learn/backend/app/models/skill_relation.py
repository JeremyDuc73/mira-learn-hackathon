"""Modèle SQLAlchemy — skill_relation."""

from __future__ import annotations

from datetime import datetime
from decimal import Decimal

from sqlalchemy import DateTime, Numeric, String, func, text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base


class SkillRelation(Base):
    __tablename__ = "skill_relation"

    id: Mapped[str] = mapped_column(
        UUID(as_uuid=False),
        primary_key=True,
        server_default=text("uuid_generate_v4()"),
    )
    from_skill_id: Mapped[str] = mapped_column(UUID(as_uuid=False), nullable=False)
    to_skill_id: Mapped[str] = mapped_column(UUID(as_uuid=False), nullable=False)
    relation_type: Mapped[str] = mapped_column(String(32), nullable=False)
    strength: Mapped[Decimal] = mapped_column(
        Numeric(3, 2), nullable=False, server_default="1.0"
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
    )
