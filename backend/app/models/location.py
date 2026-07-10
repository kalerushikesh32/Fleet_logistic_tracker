"""
Location history for vehicles.
Each row is an immutable snapshot (lat/lon + timestamp).
Current position = most recent row for a vehicle.
"""

import uuid
from datetime import datetime

from sqlalchemy import DateTime, Float, ForeignKey, Index, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class Location(Base):
    __tablename__ = "locations"
    __table_args__ = (
        # Composite index supports efficient "latest location per vehicle" queries
        Index("ix_locations_vehicle_timestamp", "vehicle_id", "timestamp"),
    )

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    vehicle_id: Mapped[str] = mapped_column(
        String, ForeignKey("vehicles.id"), nullable=False, index=True
    )
    latitude: Mapped[float] = mapped_column(Float, nullable=False)
    longitude: Mapped[float] = mapped_column(Float, nullable=False)
    timestamp: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), nullable=False)

    vehicle: Mapped["Vehicle"] = relationship("Vehicle", back_populates="locations")
