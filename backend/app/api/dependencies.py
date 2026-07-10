"""
Shared FastAPI dependencies used across all route modules.
Import get_db and get_current_user from here — not from core directly.
"""

from app.api.routes.auth import get_current_user  # noqa: F401 — re-export
from app.core.database import get_db  # noqa: F401 — re-export

__all__ = ["get_db", "get_current_user"]
