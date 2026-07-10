"""Driver CRUD and vehicle assignment routes."""

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.api.dependencies import get_current_user, get_db
from app.models.driver import DriverStatus
from app.schemas.driver import DriverAssign, DriverCreate, DriverResponse, DriverUpdate
from app.services.driver_service import (
    assign_driver,
    create_driver,
    deactivate_driver,
    force_assign_driver,
    get_driver_or_404,
    list_drivers,
    unassign_driver,
    update_driver,
)

router = APIRouter(
    prefix="/api/drivers",
    tags=["drivers"],
    dependencies=[Depends(get_current_user)],
)


@router.get("", response_model=list[DriverResponse])
def list_drivers_route(
    status: DriverStatus | None = Query(None),
    search: str | None = Query(None),
    db: Session = Depends(get_db),
) -> list[DriverResponse]:
    return list_drivers(db, status_filter=status, search=search)


@router.get("/{driver_id}", response_model=DriverResponse)
def get_driver_route(driver_id: str, db: Session = Depends(get_db)) -> DriverResponse:
    return get_driver_or_404(db, driver_id)


@router.post("", response_model=DriverResponse, status_code=status.HTTP_201_CREATED)
def create_driver_route(payload: DriverCreate, db: Session = Depends(get_db)) -> DriverResponse:
    return create_driver(db, payload)


@router.put("/{driver_id}", response_model=DriverResponse)
def update_driver_route(
    driver_id: str, payload: DriverUpdate, db: Session = Depends(get_db)
) -> DriverResponse:
    return update_driver(db, driver_id, payload)


@router.post("/{driver_id}/assign", response_model=DriverResponse)
def assign_driver_route(
    driver_id: str,
    payload: DriverAssign,
    force: bool = Query(False, description="Reassign even if already assigned (user confirmed)"),
    db: Session = Depends(get_db),
) -> DriverResponse:
    """
    Assign driver to vehicle. When the driver is already assigned and force=false,
    the service raises DriverAlreadyAssigned (409, code DRIVER_ALREADY_ASSIGNED);
    the client then confirms and retries with force=true (Req 9.6).
    """
    if force:
        return force_assign_driver(db, driver_id, payload.vehicle_id)
    return assign_driver(db, driver_id, payload.vehicle_id)


@router.post("/{driver_id}/unassign", response_model=DriverResponse)
def unassign_driver_route(driver_id: str, db: Session = Depends(get_db)) -> DriverResponse:
    return unassign_driver(db, driver_id)


@router.delete("/{driver_id}", status_code=status.HTTP_200_OK)
def deactivate_driver_route(driver_id: str, db: Session = Depends(get_db)) -> dict:
    deactivate_driver(db, driver_id)
    return {"success": True}
