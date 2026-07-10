"""Authentication endpoints — login, logout, current user."""

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

# Import get_db directly from core to avoid a circular import:
# dependencies.py re-exports get_current_user from this module, so this module
# must not import from dependencies.py in return.
from app.core.database import get_db
from app.core.security import INVALID_TOKEN, decode_access_token
from app.models.user import User
from app.schemas.user import LoginRequest, TokenResponse, UserResponse
from app.services.auth_service import AuthError, authenticate_user, build_token

router = APIRouter(prefix="/api/auth", tags=["auth"])

_bearer = HTTPBearer(auto_error=False)


def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(_bearer),
    db: Session = Depends(get_db),
) -> User:
    """
    FastAPI dependency — resolves the authenticated user from the JWT bearer token.
    Returns 401 on missing, invalid, or expired token.
    Import and use this in any route that requires authentication.
    """
    if credentials is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")

    user_id = decode_access_token(credentials.credentials)
    if user_id is INVALID_TOKEN:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired token"
        )

    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")

    return user


@router.post("/login", response_model=TokenResponse, status_code=status.HTTP_200_OK)
def login(payload: LoginRequest, db: Session = Depends(get_db)) -> TokenResponse:
    """Authenticate and return a JWT access token."""
    try:
        user = authenticate_user(db, payload.email, payload.password)
    except AuthError as exc:
        # Use 401 with WWW-Authenticate header per RFC 7235
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(exc),
            headers={"WWW-Authenticate": "Bearer"},
        ) from exc
    token = build_token(user)
    return TokenResponse(access_token=token, user=UserResponse.model_validate(user))


@router.post("/logout", status_code=status.HTTP_200_OK)
def logout(_user: User = Depends(get_current_user)) -> dict:
    """
    Client-side logout — instructs the client to discard the token.
    JWT is stateless so true server-side revocation requires a blocklist (future enhancement).
    """
    return {"success": True}


@router.get("/me", response_model=UserResponse)
def me(current_user: User = Depends(get_current_user)) -> UserResponse:
    """Return the profile of the currently authenticated user."""
    return UserResponse.model_validate(current_user)
