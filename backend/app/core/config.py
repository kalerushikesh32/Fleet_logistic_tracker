"""
Application settings loaded from environment variables or a .env file.
All secrets and paths must come from the environment — no hardcoding.
"""

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # Security — jwt_secret_key has NO default on purpose: the app must fail fast
    # at startup if it is not provided, rather than run with a known/guessable key.
    jwt_secret_key: str
    jwt_algorithm: str = "HS256"
    jwt_expire_hours: int = 24

    # CORS — comma-separated allowed origins in the env var.
    # Stored as a raw string; use the `cors_origins` property for the parsed list.
    # Never use "*" together with credentials.
    cors_origins_raw: str = Field(default="http://localhost:5173", validation_alias="CORS_ORIGINS")

    # Database
    db_type: str = "sqlite"
    db_file: str = "data/fleet.db"

    # Maps
    map_provider: str = "leaflet"

    @property
    def cors_origins(self) -> list[str]:
        """Parse the comma-separated CORS origins string into a list."""
        return [o.strip() for o in self.cors_origins_raw.split(",") if o.strip()]

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )


# Single shared instance — import this everywhere
settings = Settings()
