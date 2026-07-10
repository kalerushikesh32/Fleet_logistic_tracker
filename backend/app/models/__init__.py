"""
Import all models here so SQLAlchemy's metadata is fully populated.
Alembic and Base.metadata.create_all() both depend on this module being imported.
"""

from app.models.cargo import Cargo, CargoStatus
from app.models.driver import Driver, DriverStatus
from app.models.location import Location
from app.models.operation import Operation, OperationType
from app.models.user import User
from app.models.vehicle import Vehicle, VehicleStatus, VehicleType

__all__ = [
    "User",
    "Vehicle",
    "VehicleType",
    "VehicleStatus",
    "Driver",
    "DriverStatus",
    "Location",
    "Cargo",
    "CargoStatus",
    "Operation",
    "OperationType",
]
