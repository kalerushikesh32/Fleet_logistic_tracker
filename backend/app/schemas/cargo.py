"""Pydantic schemas for cargo CRUD."""

from datetime import datetime

from pydantic import BaseModel, field_validator

from app.models.cargo import CargoStatus

_DESC_MIN, _DESC_MAX = 3, 200
_PLACE_MIN, _PLACE_MAX = 2, 100
_WEIGHT_MAX = 100_000.0


class CargoCreate(BaseModel):
    description: str
    weight: float
    length: float | None = None
    width: float | None = None
    height: float | None = None
    origin: str
    destination: str

    @field_validator("description")
    @classmethod
    def validate_description(cls, v: str) -> str:
        v = v.strip()
        if not (_DESC_MIN <= len(v) <= _DESC_MAX):
            raise ValueError(f"Description must be {_DESC_MIN}-{_DESC_MAX} characters")
        return v

    @field_validator("weight")
    @classmethod
    def validate_weight(cls, v: float) -> float:
        if v <= 0:
            raise ValueError("Weight must be a positive number")
        if v > _WEIGHT_MAX:
            raise ValueError(f"Weight cannot exceed {_WEIGHT_MAX} kg")
        return v

    @field_validator("length", "width", "height")
    @classmethod
    def validate_dimension(cls, v: float | None) -> float | None:
        if v is not None and v <= 0:
            raise ValueError("Dimensions must be positive numbers")
        return v

    @field_validator("origin", "destination")
    @classmethod
    def validate_place(cls, v: str) -> str:
        v = v.strip()
        if not (_PLACE_MIN <= len(v) <= _PLACE_MAX):
            raise ValueError(f"Must be {_PLACE_MIN}-{_PLACE_MAX} characters")
        return v


class CargoUpdate(BaseModel):
    description: str | None = None
    weight: float | None = None
    length: float | None = None
    width: float | None = None
    height: float | None = None
    origin: str | None = None
    destination: str | None = None

    @field_validator("weight")
    @classmethod
    def validate_weight(cls, v: float | None) -> float | None:
        if v is not None and v <= 0:
            raise ValueError("Weight must be a positive number")
        return v

    @field_validator("length", "width", "height")
    @classmethod
    def validate_dimension(cls, v: float | None) -> float | None:
        if v is not None and v <= 0:
            raise ValueError("Dimensions must be positive numbers")
        return v


class CargoResponse(BaseModel):
    id: str
    description: str
    weight: float
    length: float | None
    width: float | None
    height: float | None
    origin: str
    destination: str
    status: CargoStatus
    vehicle_id: str | None
    created_at: datetime
    updated_at: datetime | None

    model_config = {"from_attributes": True}
