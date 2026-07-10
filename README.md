# Fleet & Logistics Management System

A web application for tracking fleet vehicles (trucks and small vehicles) and cargo
loading/unloading operations. Built for a single operator, with an architecture that
leaves room for a future driver mobile app.

[![pipeline](https://img.shields.io/badge/CI-GitLab-orange)](./.gitlab-ci.yml)
[![python](https://img.shields.io/badge/python-3.11%2B-blue)]()
[![node](https://img.shields.io/badge/node-20%2B-green)]()

---

## Features

- 🚛 **Fleet management** — add, edit, deactivate trucks and small vehicles
- 📍 **Location tracking** — record GPS positions with full history
- 📦 **Cargo lifecycle** — create cargo, load onto vehicles, unload, deliver
- 🔄 **Operation audit trail** — every load/unload is timestamped and immutable
- 👤 **Driver management** — register drivers and assign them to vehicles
- 📊 **Dashboard** — fleet/cargo stats, live map, recent activity
- 🔐 **JWT authentication** — secure single-user access

## Tech Stack

| Layer      | Technology                                              |
|------------|---------------------------------------------------------|
| Backend    | Python 3.11+, FastAPI, SQLAlchemy 2.0, Alembic          |
| Database   | SQLite (WAL mode)                                       |
| Auth       | JWT (python-jose) + bcrypt (passlib)                    |
| Frontend   | React 18, TypeScript, Vite, Bootstrap 5, TanStack Query |
| Maps       | Leaflet (behind a swappable `IMapProvider` interface)   |
| Deploy     | Docker + Docker Compose                                 |

## Documentation

| Doc | Purpose |
|-----|---------|
| [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md) | Local setup, running, testing, code quality |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | System design, layering, data model |
| [docs/API.md](docs/API.md) | REST endpoint reference |
| [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) | Docker & production deployment |
| [CONTRIBUTING.md](CONTRIBUTING.md) | Branching, commits, merge requests |

## Quick Start

> Full instructions in [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md).

```bash
# 1. Backend
cd backend
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt -r requirements-dev.txt
cp .env.example .env                 # set a strong JWT_SECRET_KEY
alembic upgrade head
uvicorn app.main:app --reload        # http://localhost:8000/docs

# 2. Frontend (new terminal)
cd frontend
npm install
cp .env.example .env.local
npm run dev                          # http://localhost:5173
```

Create the first login:

```bash
cd backend && python -c "from app.core.database import SessionLocal; \
from app.services.auth_service import create_initial_user; \
db=SessionLocal(); create_initial_user(db,'admin@example.com','changeme','Admin'); db.close()"
```

## Project Layout

```
project_1/
├── backend/     # FastAPI app, models, services, migrations, tests
├── frontend/    # React + TypeScript SPA
├── docs/        # Project documentation
├── Dockerfile
├── docker-compose.yml
└── .gitlab-ci.yml
```

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for the detailed structure.

## License

Proprietary — © the project owner. Not for redistribution without permission.
