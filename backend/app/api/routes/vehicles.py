"""Vehicle CRUD and location-tracking routes."""

from datetime import datetime

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.api.dependencies import get_current_user, get_db
from app.models.vehicle import VehicleStatus, VehicleType
from app.schemas.location import LocationCreate, LocationResponse
from app.schemas.vehicle import VehicleCreate, VehicleResponse, VehicleStatusUpdate, VehicleUpdate
from app.services.location_service import add_location, get_location_history
from app.services.vehicle_service import (
    create_vehicle,
    deactivate_vehicle,
    get_vehicle_or_404,
    list_vehicles,
    update_vehicle,
    update_vehicle_status,
)

# Auth applied once here — every route in this router requires a valid token.
router = APIRouter(
    prefix="/api/vehicles",
    tags=["vehicles"],
    dependencies=[Depends(get_current_user)],
)


@router.get("", response_model=list[VehicleResponse])
def list_vehicles_route(
    type: VehicleType | None = Query(None),
    status: VehicleStatus | None = Query(None),
    search: str | None = Query(None),
    db: Session = Depends(get_db),
) -> list[VehicleResponse]:
    """List vehicles with optional type, status, and text search filters."""
    return list_vehicles(db, type_filter=type, status_filter=status, search=search)


@router.get("/{vehicle_id}", response_model=VehicleResponse)
def get_vehicle_route(vehicle_id: str, db: Session = Depends(get_db)) -> VehicleResponse:
    return get_vehicle_or_404(db, vehicle_id)


@router.post("", response_model=VehicleResponse, status_code=status.HTTP_201_CREATED)
def create_vehicle_route(payload: VehicleCreate, db: Session = Depends(get_db)) -> VehicleResponse:
    return create_vehicle(db, payload)


@router.put("/{vehicle_id}", response_model=VehicleResponse)
def update_vehicle_route(
    vehicle_id: str, payload: VehicleUpdate, db: Session = Depends(get_db)
) -> VehicleResponse:
    return update_vehicle(db, vehicle_id, payload)


@router.patch("/{vehicle_id}/status", response_model=VehicleResponse)
def update_status_route(
    vehicle_id: str, payload: VehicleStatusUpdate, db: Session = Depends(get_db)
) -> VehicleResponse:
    return update_vehicle_status(db, vehicle_id, payload.status)


@router.delete("/{vehicle_id}", status_code=status.HTTP_200_OK)
def deactivate_vehicle_route(vehicle_id: str, db: Session = Depends(get_db)) -> dict:
    deactivate_vehicle(db, vehicle_id)
    return {"success": True}


@router.post(
    "/{vehicle_id}/locations", response_model=LocationResponse, status_code=status.HTTP_201_CREATED
)
def add_location_route(
    vehicle_id: str, payload: LocationCreate, db: Session = Depends(get_db)
) -> LocationResponse:
    return add_location(db, vehicle_id, payload)


@router.get("/{vehicle_id}/locations", response_model=list[LocationResponse])
def get_locations_route(
    vehicle_id: str,
    from_dt: datetime | None = Query(None, alias="from"),
    to_dt: datetime | None = Query(None, alias="to"),
    db: Session = Depends(get_db),
) -> list[LocationResponse]:
    return get_location_history(db, vehicle_id, from_dt=from_dt, to_dt=to_dt)
