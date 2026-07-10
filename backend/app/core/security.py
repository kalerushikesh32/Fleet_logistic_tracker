"""
Password hashing and JWT token utilities.

Kept as pure functions (no state) so they're easy to test and reuse.
passlib handles bcrypt; python-jose handles JWT encoding/decoding.
"""

from datetime import UTC, datetime, timedelta

from jose import JWTError, jwt
from passlib.context import CryptContext

from app.core.config import settings

# bcrypt is the recommended scheme; auto handles legacy hashes gracefully
_pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Sentinel value returned when token decoding fails — avoids raising in hot paths
INVALID_TOKEN = object()


def hash_password(plain: str) -> str:
    """Return a bcrypt hash of the plain-text password."""
    return _pwd_context.hash(plain)


def verify_password(plain: str, hashed: str) -> bool:
    """Return True if plain matches the stored hash."""
    return _pwd_context.verify(plain, hashed)


def create_access_token(subject: str) -> str:
    """
    Create a signed JWT for the given subject (user id).
    Expiry is controlled by settings.jwt_expire_hours.
    """
    expire = datetime.now(UTC) + timedelta(hours=settings.jwt_expire_hours)
    payload = {"sub": subject, "exp": expire}
    return jwt.encode(payload, settings.jwt_secret_key, algorithm=settings.jwt_algorithm)


def decode_access_token(token: str) -> str | object:
    """
    Decode a JWT and return the subject (user id).
    Returns INVALID_TOKEN sentinel on any failure (expired, malformed, wrong key).
    Callers must check `result is INVALID_TOKEN` before using the value.
    """
    try:
        payload = jwt.decode(token, settings.jwt_secret_key, algorithms=[settings.jwt_algorithm])
        subject: str | None = payload.get("sub")
        if subject is None:
            return INVALID_TOKEN
        return subject
    except JWTError:
        # Covers expiry, invalid signature, malformed token — all treated the same
        return INVALID_TOKEN
