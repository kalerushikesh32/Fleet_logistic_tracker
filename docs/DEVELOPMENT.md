# Development Guide

How to set up, run, test, and maintain the project locally.

## Prerequisites

| Tool    | Version | Notes                                  |
|---------|---------|----------------------------------------|
| Python  | 3.11 or 3.12 | 3.13+ may lack prebuilt wheels for some deps |
| Node.js | 20+     | Includes npm 10+                       |
| Docker  | optional | For containerized runs                |

## 1. Backend Setup

```bash
cd backend

# Create and activate a virtual environment
python3 -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate

# Install runtime + dev dependencies
pip install -r requirements.txt -r requirements-dev.txt

# Configure environment
cp .env.example .env
```

Edit `.env` and set a strong secret (required — the app refuses to start without it):

```bash
python -c "import secrets; print(secrets.token_urlsafe(48))"
# paste the output into JWT_SECRET_KEY in .env
```

Apply database migrations (creates `data/fleet.db`):

```bash
alembic upgrade head
```

Create the initial user (one-time):

```bash
python -c "from app.core.database import SessionLocal; \
from app.services.auth_service import create_initial_user; \
db=SessionLocal(); create_initial_user(db,'admin@example.com','changeme','Admin'); db.close()"
```

Run the API:

```bash
uvicorn app.main:app --reload
```

- API base: `http://localhost:8000`
- Interactive docs (Swagger): `http://localhost:8000/docs`
- Health check: `http://localhost:8000/health`

## 2. Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env.local       # VITE_API_URL defaults to http://localhost:8000
npm run dev
```

App runs at `http://localhost:5173`. The Vite dev server proxies `/api` to the backend.

## 3. Running Tests

```bash
# Backend (pytest)
cd backend && pytest

# Frontend (Vitest)
cd frontend && npm test
```

## 4. Code Quality

```bash
# Backend — lint & format
cd backend
ruff check .
black --check .          # add --check to verify, drop it to auto-format

# Frontend — lint & format
cd frontend
npm run lint
npx prettier --check src
```

## 5. Database Migrations

After changing an ORM model, generate and apply a migration:

```bash
cd backend
alembic revision --autogenerate -m "describe your change"
alembic upgrade head
```

To roll back the last migration:

```bash
alembic downgrade -1
```

## 6. Common Issues

| Symptom | Fix |
|---------|-----|
| `ValidationError: jwt_secret_key` on startup | `JWT_SECRET_KEY` is missing from `.env` |
| Frontend 401 loops | Token expired — log in again; check `VITE_API_URL` |
| `pydantic-core` build fails | Use Python 3.11/3.12, not 3.13+ |
| CORS errors in browser | Add your frontend origin to `CORS_ORIGINS` in `.env` |
