"""
Driver CRUD and vehicle assignment service.
Property 2: unique license_no — enforced here.
Property 3: one driver per vehicle, one vehicle per driver — enforced by assign.
"""

from datetime import datetime

from sqlalchemy.orm import Session

from app.core.exceptions import ConflictError, NotFoundError
from app.models.driver import Driver, DriverStatus
from app.models.vehicle import Vehicle
from app.schemas.driver import DriverCreate, DriverUpdate


class DriverNotFound(NotFoundError):
    pass


class DuplicateLicenseNumber(ConflictError):
    pass


class DriverAlreadyAssigned(ConflictError):
    """
    Raised when assigning a driver who is already assigned to another vehicle.
    Its distinct `code` lets the client prompt for reassignment confirmation (Req 9.6).
    """

    code = "DRIVER_ALREADY_ASSIGNED"

    def __init__(self, driver: "Driver"):
        self.driver = driver
        super().__init__(f"Driver is already assigned to vehicle {driver.vehicle_id}")


class VehicleAlreadyHasDriver(ConflictError):
    pass


def get_driver_or_404(db: Session, driver_id: str) -> Driver:
    driver = db.query(Driver).filter(Driver.id == driver_id).first()
    if driver is None:
        raise DriverNotFound(f"Driver {driver_id} not found")
    return driver


def list_drivers(
    db: Session,
    status_filter: DriverStatus | None = None,
    search: str | None = None,
) -> list[Driver]:
    query = db.query(Driver)
    if status_filter is not None:
        query = query.filter(Driver.status == status_filter)
    if search:
        term = f"%{search.lower()}%"
        query = query.filter(Driver.name.ilike(term) | Driver.license_no.ilike(term))
    return query.order_by(Driver.created_at.desc()).all()


def create_driver(db: Session, payload: DriverCreate) -> Driver:
    _assert_unique_license(db, payload.license_no)
    driver = Driver(**payload.model_dump())
    db.add(driver)
    db.commit()
    db.refresh(driver)
    return driver


def update_driver(db: Session, driver_id: str, payload: DriverUpdate) -> Driver:
    driver = get_driver_or_404(db, driver_id)
    for field, value in payload.model_dump(exclude_none=True).items():
        setattr(driver, field, value)
    driver.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(driver)
    return driver


def assign_driver(db: Session, driver_id: str, vehicle_id: str) -> Driver:
    """
    Assign driver to vehicle. Raises DriverAlreadyAssigned if driver has
    an existing assignment — the route layer decides whether to proceed after
    user confirmation (Req 9.6).
    """
    driver = get_driver_or_404(db, driver_id)
    if driver.vehicle_id is not None:
        raise DriverAlreadyAssigned(driver)

    vehicle = db.query(Vehicle).filter(Vehicle.id == vehicle_id).first()
    if vehicle is None:
        raise DriverNotFound(f"Vehicle {vehicle_id} not found")

    existing = db.query(Driver).filter(Driver.vehicle_id == vehicle_id).first()
    if existing:
        raise VehicleAlreadyHasDriver(f"Vehicle {vehicle_id} already has a driver assigned")

    driver.vehicle_id = vehicle_id
    driver.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(driver)
    return driver


def force_assign_driver(db: Session, driver_id: str, vehicle_id: str) -> Driver:
    """
    Force-assign driver even if already assigned elsewhere (user confirmed reassignment).
    Clears the old assignment before setting the new one.
    """
    driver = get_driver_or_404(db, driver_id)
    driver.vehicle_id = vehicle_id
    driver.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(driver)
    return driver


def unassign_driver(db: Session, driver_id: str) -> Driver:
    driver = get_driver_or_404(db, driver_id)
    driver.vehicle_id = None
    driver.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(driver)
    return driver


def deactivate_driver(db: Session, driver_id: str) -> Driver:
    driver = get_driver_or_404(db, driver_id)
    driver.status = DriverStatus.INACTIVE
    driver.vehicle_id = None  # unassign when deactivating
    driver.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(driver)
    return driver


def _assert_unique_license(db: Session, license_no: str) -> None:
    exists = db.query(Driver).filter(Driver.license_no == license_no).first()
    if exists:
        raise DuplicateLicenseNumber(f"License number '{license_no}' is already registered")
