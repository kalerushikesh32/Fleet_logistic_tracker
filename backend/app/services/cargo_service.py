"""
Cargo CRUD service.
Status transitions (LOADED, UNLOADED, etc.) are handled by operation_service
to keep state-machine logic in one place.
"""

from datetime import datetime

from sqlalchemy.orm import Session

from app.core.exceptions import NotFoundError
from app.models.cargo import Cargo, CargoStatus
from app.schemas.cargo import CargoCreate, CargoUpdate


class CargoNotFound(NotFoundError):
    pass


def get_cargo_or_404(db: Session, cargo_id: str) -> Cargo:
    cargo = db.query(Cargo).filter(Cargo.id == cargo_id).first()
    if cargo is None:
        raise CargoNotFound(f"Cargo {cargo_id} not found")
    return cargo


def list_cargo(
    db: Session,
    status_filter: CargoStatus | None = None,
    search: str | None = None,
) -> list[Cargo]:
    query = db.query(Cargo)
    if status_filter is not None:
        query = query.filter(Cargo.status == status_filter)
    if search:
        term = f"%{search.lower()}%"
        query = query.filter(
            Cargo.description.ilike(term) | Cargo.origin.ilike(term) | Cargo.destination.ilike(term)
        )
    return query.order_by(Cargo.created_at.desc()).all()


def create_cargo(db: Session, payload: CargoCreate) -> Cargo:
    cargo = Cargo(**payload.model_dump())
    db.add(cargo)
    db.commit()
    db.refresh(cargo)
    return cargo


def update_cargo(db: Session, cargo_id: str, payload: CargoUpdate) -> Cargo:
    cargo = get_cargo_or_404(db, cargo_id)
    for field, value in payload.model_dump(exclude_none=True).items():
        setattr(cargo, field, value)
    cargo.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(cargo)
    return cargo


def delete_cargo(db: Session, cargo_id: str) -> None:
    """Hard-delete cargo. Only allowed when cargo is PENDING or DELIVERED (not in transit)."""
    cargo = get_cargo_or_404(db, cargo_id)
    db.delete(cargo)
    db.commit()
