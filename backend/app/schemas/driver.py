"""Pydantic schemas for driver CRUD and assignment."""

import re
from datetime import datetime

from pydantic import BaseModel, EmailStr, field_validator

from app.models.driver import DriverStatus

_NAME_MIN, _NAME_MAX = 2, 100
_LICENSE_MIN, _LICENSE_MAX = 5, 20
# Accepts international phone formats: +91-9876543210, 9876543210, etc.
_PHONE_RE = re.compile(r"^\+?[\d\s\-\(\)]{7,20}$")


class DriverCreate(BaseModel):
    name: str
    phone: str
    email: EmailStr | None = None
    license_no: str

    @field_validator("name")
    @classmethod
    def validate_name(cls, v: str) -> str:
        v = v.strip()
        if not (_NAME_MIN <= len(v) <= _NAME_MAX):
            raise ValueError(f"Name must be {_NAME_MIN}-{_NAME_MAX} characters")
        return v

    @field_validator("phone")
    @classmethod
    def validate_phone(cls, v: str) -> str:
        v = v.strip()
        if not _PHONE_RE.match(v):
            raise ValueError("Invalid phone number format")
        return v

    @field_validator("license_no")
    @classmethod
    def validate_license(cls, v: str) -> str:
        v = v.strip().upper()
        if not (_LICENSE_MIN <= len(v) <= _LICENSE_MAX):
            raise ValueError(f"License number must be {_LICENSE_MIN}-{_LICENSE_MAX} characters")
        if not v.isalnum():
            raise ValueError("License number must be alphanumeric")
        return v


class DriverUpdate(BaseModel):
    name: str | None = None
    phone: str | None = None
    email: EmailStr | None = None

    @field_validator("phone")
    @classmethod
    def validate_phone(cls, v: str | None) -> str | None:
        if v is None:
            return v
        v = v.strip()
        if not _PHONE_RE.match(v):
            raise ValueError("Invalid phone number format")
        return v


class DriverAssign(BaseModel):
    vehicle_id: str


class DriverResponse(BaseModel):
    id: str
    name: str
    phone: str
    email: str | None
    license_no: str
    status: DriverStatus
    vehicle_id: str | None
    created_at: datetime
    updated_at: datetime | None

    model_config = {"from_attributes": True}
