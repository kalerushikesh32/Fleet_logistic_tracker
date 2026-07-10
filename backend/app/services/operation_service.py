"""
Cargo load/unload operations — the state machine for cargo lifecycle.

Correctness properties enforced here:
  P4: cargo.vehicle_id is set on load, cleared on unload
  P5: only PENDING cargo can be loaded
  P6: only LOADED or IN_TRANSIT cargo can be unloaded
  P7: vehicle becomes IN_USE on first load, AVAILABLE when last cargo unloaded
  P8: operations are created, never modified or deleted
"""

from sqlalchemy.orm import Session

from app.core.exceptions import InvalidStateError
from app.models.cargo import Cargo, CargoStatus
from app.models.operation import Operation, OperationType
from app.models.vehicle import Vehicle, VehicleStatus
from app.schemas.operation import LoadRequest, UnloadRequest
from app.services.cargo_service import get_cargo_or_404
from app.services.vehicle_service import get_vehicle_or_404


class InvalidCargoState(InvalidStateError):
    """Raised when a load/unload is attempted on cargo in the wrong state."""


# Statuses that mean cargo is actively occupying a vehicle
_ACTIVE_CARGO_STATUSES = {CargoStatus.LOADED, CargoStatus.IN_TRANSIT}


def _has_other_active_cargo(db: Session, vehicle_id: str, excluding_cargo_id: str) -> bool:
    """True if the vehicle still carries active cargo other than the given one."""
    return (
        db.query(Cargo)
        .filter(
            Cargo.vehicle_id == vehicle_id,
            Cargo.status.in_(_ACTIVE_CARGO_STATUSES),
            Cargo.id != excluding_cargo_id,
        )
        .count()
        > 0
    )


def load_cargo(db: Session, payload: LoadRequest) -> tuple[Operation, Cargo, Vehicle]:
    """
    Load cargo onto a vehicle.
    Validates state, creates an immutable Operation record, and updates
    cargo and vehicle status atomically within one transaction.
    """
    cargo = get_cargo_or_404(db, payload.cargo_id)
    vehicle = get_vehicle_or_404(db, payload.vehicle_id)

    if cargo.status != CargoStatus.PENDING:
        raise InvalidCargoState(
            f"Cannot load cargo with status '{cargo.status}'. Only PENDING cargo can be loaded."
        )

    operation = Operation(
        cargo_id=cargo.id,
        vehicle_id=vehicle.id,
        type=OperationType.LOADING,
        latitude=payload.latitude,
        longitude=payload.longitude,
        notes=payload.notes,
    )
    db.add(operation)

    cargo.status = CargoStatus.LOADED
    cargo.vehicle_id = vehicle.id

    # Vehicle becomes IN_USE regardless of its prior AVAILABLE state
    vehicle.status = VehicleStatus.IN_USE

    db.commit()
    db.refresh(operation)
    db.refresh(cargo)
    db.refresh(vehicle)
    return operation, cargo, vehicle


def unload_cargo(db: Session, payload: UnloadRequest) -> tuple[Operation, Cargo, Vehicle]:
    """
    Unload cargo from its current vehicle.
    Validates state, creates an immutable Operation record, and updates
    cargo and vehicle status atomically within one transaction.
    """
    cargo = get_cargo_or_404(db, payload.cargo_id)

    if cargo.status not in _ACTIVE_CARGO_STATUSES:
        raise InvalidCargoState(
            f"Cannot unload cargo with status '{cargo.status}'. "
            "Only LOADED or IN_TRANSIT cargo can be unloaded."
        )

    vehicle = get_vehicle_or_404(db, cargo.vehicle_id)

    operation = Operation(
        cargo_id=cargo.id,
        vehicle_id=vehicle.id,
        type=OperationType.UNLOADING,
        latitude=payload.latitude,
        longitude=payload.longitude,
        notes=payload.notes,
    )
    db.add(operation)

    cargo.status = CargoStatus.DELIVERED if payload.mark_delivered else CargoStatus.UNLOADED
    cargo.vehicle_id = None

    # Free the vehicle once it is carrying no other active cargo
    if not _has_other_active_cargo(db, vehicle.id, excluding_cargo_id=cargo.id):
        vehicle.status = VehicleStatus.AVAILABLE

    db.commit()
    db.refresh(operation)
    db.refresh(cargo)
    db.refresh(vehicle)
    return operation, cargo, vehicle


def list_operations(
    db: Session,
    from_dt=None,
    to_dt=None,
    vehicle_id: str | None = None,
    cargo_id: str | None = None,
) -> list[Operation]:
    """Return operations in chronological (oldest-first) order, with optional filters."""
    query = db.query(Operation)
    if from_dt:
        query = query.filter(Operation.timestamp >= from_dt)
    if to_dt:
        query = query.filter(Operation.timestamp <= to_dt)
    if vehicle_id:
        query = query.filter(Operation.vehicle_id == vehicle_id)
    if cargo_id:
        query = query.filter(Operation.cargo_id == cargo_id)
    return query.order_by(Operation.timestamp.asc()).all()
