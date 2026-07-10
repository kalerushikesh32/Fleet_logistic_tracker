"""Cargo load/unload operation routes and history."""

from datetime import datetime

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.api.dependencies import get_current_user, get_db
from app.schemas.cargo import CargoResponse
from app.schemas.operation import LoadRequest, OperationResponse, UnloadRequest
from app.schemas.vehicle import VehicleResponse
from app.services.operation_service import list_operations, load_cargo, unload_cargo

router = APIRouter(
    prefix="/api/operations",
    tags=["operations"],
    dependencies=[Depends(get_current_user)],
)


@router.get("", response_model=list[OperationResponse])
def list_operations_route(
    from_dt: datetime | None = Query(None, alias="from"),
    to_dt: datetime | None = Query(None, alias="to"),
    vehicle_id: str | None = Query(None),
    cargo_id: str | None = Query(None),
    db: Session = Depends(get_db),
) -> list[OperationResponse]:
    """Return operations in chronological order with optional filters (Req 8.3, 8.4)."""
    return list_operations(
        db, from_dt=from_dt, to_dt=to_dt, vehicle_id=vehicle_id, cargo_id=cargo_id
    )


def _operation_result(operation, cargo, vehicle) -> dict:
    """Shared response shape for load/unload — the two operations return identical data."""
    return {
        "operation": OperationResponse.model_validate(operation),
        "cargo": CargoResponse.model_validate(cargo),
        "vehicle": VehicleResponse.model_validate(vehicle),
    }


@router.post("/load", response_model=dict, status_code=status.HTTP_201_CREATED)
def load_cargo_route(payload: LoadRequest, db: Session = Depends(get_db)) -> dict:
    """Load cargo onto a vehicle (Req 6.1-6.5)."""
    return _operation_result(*load_cargo(db, payload))


@router.post("/unload", response_model=dict, status_code=status.HTTP_201_CREATED)
def unload_cargo_route(payload: UnloadRequest, db: Session = Depends(get_db)) -> dict:
    """Unload cargo from its vehicle (Req 7.1-7.5)."""
    return _operation_result(*unload_cargo(db, payload))
