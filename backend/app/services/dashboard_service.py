"""
Dashboard aggregation — counts and recent activity.
Keeps all aggregation SQL in one place for easy tuning later.
"""

from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.cargo import Cargo, CargoStatus
from app.models.location import Location
from app.models.operation import Operation
from app.models.vehicle import Vehicle, VehicleStatus
from app.schemas.location import LocationResponse

_RECENT_OPERATIONS_LIMIT = 20


def get_vehicle_stats(db: Session) -> dict:
    rows = db.query(Vehicle.status, func.count(Vehicle.id)).group_by(Vehicle.status).all()
    counts = {row[0]: row[1] for row in rows}
    total = sum(counts.values())
    return {
        "total": total,
        "available": counts.get(VehicleStatus.AVAILABLE, 0),
        "in_use": counts.get(VehicleStatus.IN_USE, 0),
        "maintenance": counts.get(VehicleStatus.MAINTENANCE, 0),
        "inactive": counts.get(VehicleStatus.INACTIVE, 0),
    }


def get_cargo_stats(db: Session) -> dict:
    rows = db.query(Cargo.status, func.count(Cargo.id)).group_by(Cargo.status).all()
    counts = {row[0]: row[1] for row in rows}
    return {
        "pending": counts.get(CargoStatus.PENDING, 0),
        "loaded": counts.get(CargoStatus.LOADED, 0),
        "in_transit": counts.get(CargoStatus.IN_TRANSIT, 0),
        "unloaded": counts.get(CargoStatus.UNLOADED, 0),
        "delivered": counts.get(CargoStatus.DELIVERED, 0),
    }


def get_map_data(db: Session) -> list[dict]:
    """
    Return active vehicles with their latest location for the map view.
    Uses a subquery to fetch only the most recent location per vehicle.
    """
    active_vehicles = (
        db.query(Vehicle)
        .filter(Vehicle.status.in_([VehicleStatus.AVAILABLE, VehicleStatus.IN_USE]))
        .all()
    )
    result = []
    for vehicle in active_vehicles:
        latest = (
            db.query(Location)
            .filter(Location.vehicle_id == vehicle.id)
            .order_by(Location.timestamp.desc())
            .first()
        )
        result.append(
            {
                "vehicle_id": vehicle.id,
                "license_plate": vehicle.license_plate,
                "type": vehicle.type,
                "status": vehicle.status,
                "location": LocationResponse.model_validate(latest) if latest else None,
            }
        )
    return result


def get_recent_operations(db: Session) -> list[Operation]:
    return (
        db.query(Operation)
        .order_by(Operation.timestamp.desc())
        .limit(_RECENT_OPERATIONS_LIMIT)
        .all()
    )
