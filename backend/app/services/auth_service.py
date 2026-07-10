"""
Authentication business logic.

Keeps route handlers thin — all auth decisions live here.
"""

from sqlalchemy.orm import Session

from app.core.security import create_access_token, hash_password, verify_password
from app.models.user import User


class AuthError(Exception):
    """Raised when authentication fails. Message is safe to surface to the client."""


def authenticate_user(db: Session, email: str, password: str) -> User:
    """
    Verify credentials and return the User on success.
    Raises AuthError with a generic message — never reveal which field was wrong.
    """
    user = db.query(User).filter(User.email == email).first()
    if user is None or not verify_password(password, user.password):
        raise AuthError("Invalid email or password")
    return user


def build_token(user: User) -> str:
    """Create a JWT access token for the given user."""
    return create_access_token(subject=user.id)


def create_initial_user(db: Session, email: str, password: str, name: str) -> User:
    """
    Create the single system user if no user exists.
    Used for first-run setup — not exposed via API in current scope.
    Raises ValueError if a user already exists.
    """
    if db.query(User).count() > 0:
        raise ValueError("A user already exists. Only one user is supported.")
    user = User(email=email, password=hash_password(password), name=name)
    db.add(user)
    db.commit()
    db.refresh(user)
    return user
