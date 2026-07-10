"""Pydantic schemas for vehicle location tracking."""

from datetime import datetime

from pydantic import BaseModel, field_validator

_LAT_MIN, _LAT_MAX = -90.0, 90.0
_LON_MIN, _LON_MAX = -180.0, 180.0


class LocationCreate(BaseModel):
    latitude: float
    longitude: float

    @field_validator("latitude")
    @classmethod
    def validate_lat(cls, v: float) -> float:
        if not (_LAT_MIN <= v <= _LAT_MAX):
            raise ValueError(f"Latitude must be between {_LAT_MIN} and {_LAT_MAX}")
        return v

    @field_validator("longitude")
    @classmethod
    def validate_lon(cls, v: float) -> float:
        if not (_LON_MIN <= v <= _LON_MAX):
            raise ValueError(f"Longitude must be between {_LON_MIN} and {_LON_MAX}")
        return v


class LocationResponse(BaseModel):
    id: str
    vehicle_id: str
    latitude: float
    longitude: float
    timestamp: datetime

    model_config = {"from_attributes": True}
