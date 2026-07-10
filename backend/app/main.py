"""
Fleet and Logistics Management System — FastAPI application entry point.

Domain errors raised by services are translated to HTTP responses by the
handlers registered here, so route handlers stay free of try/except noise.
"""

from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import ValidationError

from app.api.routes.auth import router as auth_router
from app.api.routes.cargo import router as cargo_router
from app.api.routes.dashboard import router as dashboard_router
from app.api.routes.drivers import router as drivers_router
from app.api.routes.operations import router as operations_router
from app.api.routes.vehicles import router as vehicles_router
from app.core.config import settings
from app.core.exceptions import DomainError

app = FastAPI(
    title="Fleet and Logistics Management System",
    description="Track fleet vehicles and cargo loading/unloading operations.",
    version="0.1.0",
)

# CORS — explicit origins from config; never "*" with credentials
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register all domain routers
app.include_router(auth_router)
app.include_router(vehicles_router)
app.include_router(cargo_router)
app.include_router(operations_router)
app.include_router(drivers_router)
app.include_router(dashboard_router)


@app.exception_handler(DomainError)
async def domain_error_handler(_request: Request, exc: DomainError) -> JSONResponse:
    """Map any business-rule error to a consistent JSON error response."""
    return JSONResponse(
        status_code=exc.status_code,
        content={"status": exc.status_code, "code": exc.code, "message": exc.message},
    )


@app.exception_handler(ValidationError)
async def validation_error_handler(_request: Request, exc: ValidationError) -> JSONResponse:
    """Normalize Pydantic validation errors to the same error shape with field details."""
    details: dict[str, list[str]] = {}
    for error in exc.errors():
        field = ".".join(str(loc) for loc in error["loc"])
        details.setdefault(field, []).append(error["msg"])
    return JSONResponse(
        status_code=status.HTTP_400_BAD_REQUEST,
        content={
            "status": 400,
            "code": "VALIDATION_ERROR",
            "message": "Invalid input data",
            "details": details,
        },
    )


@app.get("/health", tags=["health"])
def health_check() -> dict:
    """Liveness check — confirms the server is running."""
    return {"status": "ok"}
