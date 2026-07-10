"""
Operation — immutable audit record of a cargo loading or unloading event.
Once created, operations are never modified or deleted (Correctness Property 8).
"""

import enum
import uuid
from datetime import datetime

from sqlalchemy import DateTime, Enum, Float, ForeignKey, Index, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class OperationType(str, enum.Enum):
    LOADING = "LOADING"
    UNLOADING = "UNLOADING"


class Operation(Base):
    __tablename__ = "operations"
    __table_args__ = (
        Index("ix_operations_cargo_timestamp", "cargo_id", "timestamp"),
        Index("ix_operations_vehicle_timestamp", "vehicle_id", "timestamp"),
    )

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    cargo_id: Mapped[str] = mapped_column(
        String, ForeignKey("cargo.id"), nullable=False, index=True
    )
    vehicle_id: Mapped[str] = mapped_column(
        String, ForeignKey("vehicles.id"), nullable=False, index=True
    )
    type: Mapped[OperationType] = mapped_column(Enum(OperationType), nullable=False)
    # Optional GPS coordinates at the time of the operation
    latitude: Mapped[float | None] = mapped_column(Float, nullable=True)
    longitude: Mapped[float | None] = mapped_column(Float, nullable=True)
    notes: Mapped[str | None] = mapped_column(String, nullable=True)
    timestamp: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now(), nullable=False
    )

    cargo: Mapped["Cargo"] = relationship("Cargo", back_populates="operations")
    vehicle: Mapped["Vehicle"] = relationship("Vehicle", back_populates="operations")
