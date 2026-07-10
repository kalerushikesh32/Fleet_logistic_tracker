"""Cargo model — tracks goods being transported."""

import enum
import uuid
from datetime import datetime

from sqlalchemy import DateTime, Enum, Float, ForeignKey, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class CargoStatus(str, enum.Enum):
    PENDING = "PENDING"
    LOADED = "LOADED"
    # IN_TRANSIT is set explicitly when a vehicle departs; not auto-assigned by load
    IN_TRANSIT = "IN_TRANSIT"
    UNLOADED = "UNLOADED"
    DELIVERED = "DELIVERED"


class Cargo(Base):
    __tablename__ = "cargo"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    description: Mapped[str] = mapped_column(String, nullable=False)
    weight: Mapped[float] = mapped_column(Float, nullable=False)
    # Optional physical dimensions
    length: Mapped[float | None] = mapped_column(Float, nullable=True)
    width: Mapped[float | None] = mapped_column(Float, nullable=True)
    height: Mapped[float | None] = mapped_column(Float, nullable=True)
    origin: Mapped[str] = mapped_column(String, nullable=False)
    destination: Mapped[str] = mapped_column(String, nullable=False)
    status: Mapped[CargoStatus] = mapped_column(
        Enum(CargoStatus), default=CargoStatus.PENDING, nullable=False, index=True
    )
    # Null when not loaded; set on load, cleared on unload
    vehicle_id: Mapped[str | None] = mapped_column(String, ForeignKey("vehicles.id"), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime | None] = mapped_column(
        DateTime, onupdate=func.now(), nullable=True
    )

    vehicle: Mapped["Vehicle | None"] = relationship("Vehicle", back_populates="cargo")
    operations: Mapped[list["Operation"]] = relationship(
        "Operation", back_populates="cargo", cascade="all, delete-orphan"
    )
