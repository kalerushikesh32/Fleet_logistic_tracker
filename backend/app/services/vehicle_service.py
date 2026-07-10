"""
Vehicle CRUD and status management service.
All business logic lives here; routes stay thin.
"""

from datetime import datetime

from sqlalchemy.orm import Session

from app.core.exceptions import ConflictError, NotFoundError
from app.models.vehicle import Vehicle, VehicleStatus, VehicleType
from app.schemas.vehicle import VehicleCreate, VehicleUpdate


class VehicleNotFound(NotFoundError):
    pass


class DuplicateLicensePlate(ConflictError):
    pass


def get_vehicle_or_404(db: Session, vehicle_id: str) -> Vehicle:
    vehicle = db.query(Vehicle).filter(Vehicle.id == vehicle_id).first()
    if vehicle is None:
        raise VehicleNotFound(f"Vehicle {vehicle_id} not found")
    return vehicle


def list_vehicles(
    db: Session,
    type_filter: VehicleType | None = None,
    status_filter: VehicleStatus | None = None,
    search: str | None = None,
) -> list[Vehicle]:
    query = db.query(Vehicle)
    if type_filter is not None:
        query = query.filter(Vehicle.type == type_filter)
    if status_filter is not None:
        query = query.filter(Vehicle.status == status_filter)
    if search:
        term = f"%{search.lower()}%"
        query = query.filter(
            Vehicle.license_plate.ilike(term) | Vehicle.make.ilike(term) | Vehicle.model.ilike(term)
        )
    return query.order_by(Vehicle.created_at.desc()).all()


def create_vehicle(db: Session, payload: VehicleCreate) -> Vehicle:
    _assert_unique_plate(db, payload.license_plate)
    vehicle = Vehicle(
        license_plate=payload.license_plate,
        type=payload.type,
        make=payload.make,
        model=payload.model,
        year=payload.year,
    )
    db.add(vehicle)
    db.commit()
    db.refresh(vehicle)
    return vehicle


def update_vehicle(db: Session, vehicle_id: str, payload: VehicleUpdate) -> Vehicle:
    vehicle = get_vehicle_or_404(db, vehicle_id)
    if payload.license_plate and payload.license_plate != vehicle.license_plate:
        _assert_unique_plate(db, payload.license_plate)
    for field, value in payload.model_dump(exclude_none=True).items():
        setattr(vehicle, field, value)
    vehicle.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(vehicle)
    return vehicle


def update_vehicle_status(db: Session, vehicle_id: str, new_status: VehicleStatus) -> Vehicle:
    vehicle = get_vehicle_or_404(db, vehicle_id)
    vehicle.status = new_status
    vehicle.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(vehicle)
    return vehicle


def deactivate_vehicle(db: Session, vehicle_id: str) -> Vehicle:
    """Soft-delete: mark vehicle as INACTIVE rather than deleting the record."""
    return update_vehicle_status(db, vehicle_id, VehicleStatus.INACTIVE)


def _assert_unique_plate(db: Session, plate: str) -> None:
    exists = db.query(Vehicle).filter(Vehicle.license_plate == plate).first()
    if exists:
        raise DuplicateLicensePlate(f"License plate '{plate}' is already registered")
