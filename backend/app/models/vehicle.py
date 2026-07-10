"""Vehicle model with type and status enums."""

import enum
import uuid
from datetime import datetime

from sqlalchemy import DateTime, Enum, Integer, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class VehicleType(str, enum.Enum):
    TRUCK = "TRUCK"
    SMALL_VEHICLE = "SMALL_VEHICLE"


class VehicleStatus(str, enum.Enum):
    AVAILABLE = "AVAILABLE"
    IN_USE = "IN_USE"
    MAINTENANCE = "MAINTENANCE"
    INACTIVE = "INACTIVE"


class Vehicle(Base):
    __tablename__ = "vehicles"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    license_plate: Mapped[str] = mapped_column(String, unique=True, nullable=False, index=True)
    type: Mapped[VehicleType] = mapped_column(Enum(VehicleType), nullable=False)
    make: Mapped[str] = mapped_column(String, nullable=False)
    model: Mapped[str] = mapped_column(String, nullable=False)
    year: Mapped[int] = mapped_column(Integer, nullable=False)
    status: Mapped[VehicleStatus] = mapped_column(
        Enum(VehicleStatus), default=VehicleStatus.AVAILABLE, nullable=False
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime | None] = mapped_column(
        DateTime, onupdate=func.now(), nullable=True
    )

    # Relationships — defined here; back_populates wired in each related model
    driver: Mapped["Driver | None"] = relationship(
        "Driver", back_populates="vehicle", uselist=False
    )
    locations: Mapped[list["Location"]] = relationship(
        "Location", back_populates="vehicle", cascade="all, delete-orphan"
    )
    cargo: Mapped[list["Cargo"]] = relationship("Cargo", back_populates="vehicle")
    operations: Mapped[list["Operation"]] = relationship("Operation", back_populates="vehicle")
