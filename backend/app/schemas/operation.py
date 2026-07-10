"""Pydantic schemas for cargo loading/unloading operations."""

from datetime import datetime

from pydantic import BaseModel

from app.models.operation import OperationType


class LoadRequest(BaseModel):
    cargo_id: str
    vehicle_id: str
    latitude: float | None = None
    longitude: float | None = None
    notes: str | None = None


class UnloadRequest(BaseModel):
    cargo_id: str
    latitude: float | None = None
    longitude: float | None = None
    notes: str | None = None
    # When True, cargo status becomes DELIVERED instead of UNLOADED
    mark_delivered: bool = False


class OperationResponse(BaseModel):
    id: str
    cargo_id: str
    vehicle_id: str
    type: OperationType
    latitude: float | None
    longitude: float | None
    notes: str | None
    timestamp: datetime

    model_config = {"from_attributes": True}
