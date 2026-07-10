"""Dashboard aggregation routes — summary stats, map data, recent operations."""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.dependencies import get_current_user, get_db
from app.schemas.operation import OperationResponse
from app.services.dashboard_service import (
    get_cargo_stats,
    get_map_data,
    get_recent_operations,
    get_vehicle_stats,
)

router = APIRouter(
    prefix="/api/dashboard",
    tags=["dashboard"],
    dependencies=[Depends(get_current_user)],
)


@router.get("/summary")
def get_summary(db: Session = Depends(get_db)) -> dict:
    """Vehicle and cargo counts grouped by status (Req 10.1, 10.2)."""
    return {"vehicles": get_vehicle_stats(db), "cargo": get_cargo_stats(db)}


@router.get("/map")
def get_map(db: Session = Depends(get_db)) -> dict:
    """Active vehicles with their latest known position for the map view (Req 10.3)."""
    return {"vehicles": get_map_data(db)}


@router.get("/recent-operations", response_model=list[OperationResponse])
def get_recent_ops(db: Session = Depends(get_db)) -> list[OperationResponse]:
    """Most recent operations across the fleet (Req 10.4)."""
    return get_recent_operations(db)
