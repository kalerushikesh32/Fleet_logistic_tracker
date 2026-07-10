"""
Vehicle location recording and history retrieval.
Current position = most recent Location row (Property 9).
"""

from datetime import datetime

from sqlalchemy.orm import Session

from app.models.location import Location
from app.schemas.location import LocationCreate
from app.services.vehicle_service import get_vehicle_or_404


def add_location(db: Session, vehicle_id: str, payload: LocationCreate) -> Location:
    # Verify vehicle exists before recording location
    get_vehicle_or_404(db, vehicle_id)
    loc = Location(
        vehicle_id=vehicle_id,
        latitude=payload.latitude,
        longitude=payload.longitude,
    )
    db.add(loc)
    db.commit()
    db.refresh(loc)
    return loc


def get_current_location(db: Session, vehicle_id: str) -> Location | None:
    """Return the most recent location snapshot for the vehicle, or None."""
    return (
        db.query(Location)
        .filter(Location.vehicle_id == vehicle_id)
        .order_by(Location.timestamp.desc())
        .first()
    )


def get_location_history(
    db: Session,
    vehicle_id: str,
    from_dt: datetime | None = None,
    to_dt: datetime | None = None,
) -> list[Location]:
    """Return all location records within the optional time window, oldest first."""
    query = db.query(Location).filter(Location.vehicle_id == vehicle_id)
    if from_dt:
        query = query.filter(Location.timestamp >= from_dt)
    if to_dt:
        query = query.filter(Location.timestamp <= to_dt)
    return query.order_by(Location.timestamp.asc()).all()
