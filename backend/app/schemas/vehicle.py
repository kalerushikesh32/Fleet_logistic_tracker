"""Pydantic schemas for vehicle CRUD and status operations."""

from datetime import datetime

from pydantic import BaseModel, field_validator

from app.models.vehicle import VehicleStatus, VehicleType

_CURRENT_YEAR = datetime.now().year
_MIN_YEAR = 1900
_MAX_YEAR = _CURRENT_YEAR + 1

_PLATE_MIN = 2
_PLATE_MAX = 15
_NAME_MIN = 2
_NAME_MAX = 50


class VehicleCreate(BaseModel):
    license_plate: str
    type: VehicleType
    make: str
    model: str
    year: int

    @field_validator("license_plate")
    @classmethod
    def validate_plate(cls, v: str) -> str:
        v = v.strip().upper()
        if not (_PLATE_MIN <= len(v) <= _PLATE_MAX):
            raise ValueError(f"License plate must be {_PLATE_MIN}-{_PLATE_MAX} characters")
        if not all(c.isalnum() or c == "-" for c in v):
            raise ValueError("License plate may only contain letters, digits, and hyphens")
        return v

    @field_validator("make", "model")
    @classmethod
    def validate_name(cls, v: str) -> str:
        v = v.strip()
        if not (_NAME_MIN <= len(v) <= _NAME_MAX):
            raise ValueError(f"Must be {_NAME_MIN}-{_NAME_MAX} characters")
        return v

    @field_validator("year")
    @classmethod
    def validate_year(cls, v: int) -> int:
        if not (_MIN_YEAR <= v <= _MAX_YEAR):
            raise ValueError(f"Year must be between {_MIN_YEAR} and {_MAX_YEAR}")
        return v


class VehicleUpdate(BaseModel):
    license_plate: str | None = None
    type: VehicleType | None = None
    make: str | None = None
    model: str | None = None
    year: int | None = None

    @field_validator("license_plate")
    @classmethod
    def validate_plate(cls, v: str | None) -> str | None:
        if v is None:
            return v
        v = v.strip().upper()
        if not (_PLATE_MIN <= len(v) <= _PLATE_MAX):
            raise ValueError(f"License plate must be {_PLATE_MIN}-{_PLATE_MAX} characters")
        if not all(c.isalnum() or c == "-" for c in v):
            raise ValueError("License plate may only contain letters, digits, and hyphens")
        return v

    @field_validator("make", "model")
    @classmethod
    def validate_name(cls, v: str | None) -> str | None:
        if v is None:
            return v
        v = v.strip()
        if not (_NAME_MIN <= len(v) <= _NAME_MAX):
            raise ValueError(f"Must be {_NAME_MIN}-{_NAME_MAX} characters")
        return v

    @field_validator("year")
    @classmethod
    def validate_year(cls, v: int | None) -> int | None:
        if v is None:
            return v
        if not (_MIN_YEAR <= v <= _MAX_YEAR):
            raise ValueError(f"Year must be between {_MIN_YEAR} and {_MAX_YEAR}")
        return v


class VehicleStatusUpdate(BaseModel):
    status: VehicleStatus


class VehicleResponse(BaseModel):
    id: str
    license_plate: str
    type: VehicleType
    make: str
    model: str
    year: int
    status: VehicleStatus
    created_at: datetime
    updated_at: datetime | None

    model_config = {"from_attributes": True}
