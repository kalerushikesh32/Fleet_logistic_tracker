"""Cargo CRUD routes."""

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.api.dependencies import get_current_user, get_db
from app.models.cargo import CargoStatus
from app.models.operation import Operation
from app.schemas.cargo import CargoCreate, CargoResponse, CargoUpdate
from app.schemas.operation import OperationResponse
from app.services.cargo_service import (
    create_cargo,
    delete_cargo,
    get_cargo_or_404,
    list_cargo,
    update_cargo,
)

router = APIRouter(
    prefix="/api/cargo",
    tags=["cargo"],
    dependencies=[Depends(get_current_user)],
)


@router.get("", response_model=list[CargoResponse])
def list_cargo_route(
    status: CargoStatus | None = Query(None),
    search: str | None = Query(None),
    db: Session = Depends(get_db),
) -> list[CargoResponse]:
    return list_cargo(db, status_filter=status, search=search)


@router.get("/{cargo_id}", response_model=dict)
def get_cargo_route(cargo_id: str, db: Session = Depends(get_db)) -> dict:
    """Return cargo details plus its full operation history (Req 8.1)."""
    cargo = get_cargo_or_404(db, cargo_id)
    ops = (
        db.query(Operation)
        .filter(Operation.cargo_id == cargo_id)
        .order_by(Operation.timestamp.asc())
        .all()
    )
    return {
        "cargo": CargoResponse.model_validate(cargo),
        "operations": [OperationResponse.model_validate(op) for op in ops],
    }


@router.post("", response_model=CargoResponse, status_code=status.HTTP_201_CREATED)
def create_cargo_route(payload: CargoCreate, db: Session = Depends(get_db)) -> CargoResponse:
    return create_cargo(db, payload)


@router.put("/{cargo_id}", response_model=CargoResponse)
def update_cargo_route(
    cargo_id: str, payload: CargoUpdate, db: Session = Depends(get_db)
) -> CargoResponse:
    return update_cargo(db, cargo_id, payload)


@router.delete("/{cargo_id}", status_code=status.HTTP_200_OK)
def delete_cargo_route(cargo_id: str, db: Session = Depends(get_db)) -> dict:
    delete_cargo(db, cargo_id)
    return {"success": True}
