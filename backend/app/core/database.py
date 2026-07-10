"""
SQLAlchemy engine and session factory.

The database URL is resolved from config so we never hardcode paths.
SQLite is configured with WAL mode for better read concurrency.
"""

import os
from collections.abc import Generator

from sqlalchemy import create_engine, event
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker

from app.core.config import settings


def _build_database_url() -> str:
    if settings.db_type == "postgresql":
        # PostgreSQL URL must be set via POSTGRESQL_URL env var when db_type=postgresql
        url = os.getenv("POSTGRESQL_URL")
        if not url:
            raise RuntimeError(
                "POSTGRESQL_URL environment variable is required when DB_TYPE=postgresql"
            )
        return url
    # Default: SQLite — ensure the data directory exists
    os.makedirs(os.path.dirname(settings.db_file), exist_ok=True)
    return f"sqlite:///{settings.db_file}"


DATABASE_URL = _build_database_url()

engine = create_engine(
    DATABASE_URL,
    # SQLite-specific: needed for multi-thread access inside a single process
    connect_args={"check_same_thread": False} if "sqlite" in DATABASE_URL else {},
)


# Enable WAL mode for SQLite so reads don't block writes
@event.listens_for(engine, "connect")
def _set_sqlite_pragma(dbapi_connection, _connection_record):
    if "sqlite" in DATABASE_URL:
        cursor = dbapi_connection.cursor()
        cursor.execute("PRAGMA journal_mode=WAL")
        cursor.execute("PRAGMA busy_timeout=5000")
        cursor.close()


SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    """Shared declarative base — all ORM models inherit from this."""

    pass


def get_db() -> Generator[Session, None, None]:
    """
    FastAPI dependency that provides a database session per request.
    Guarantees the session is closed even if the handler raises.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
