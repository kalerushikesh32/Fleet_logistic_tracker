# Deployment

The app ships as a single Docker image: FastAPI serves the API **and** the compiled
React frontend, backed by a SQLite file on a mounted volume.

## Build & Run with Docker Compose

```bash
# From the project root
docker compose up -d --build
```

This will:
1. Build the frontend (`npm run build`) into static assets.
2. Install backend dependencies.
3. Run `alembic upgrade head` on startup.
4. Serve on port `8000`.

The SQLite database and backups persist in `./data` (mounted volume), so they
survive container restarts and image rebuilds.

## Configuration

Compose reads `backend/.env`. **Required** for production:

```bash
# Generate a strong secret
python -c "import secrets; print(secrets.token_urlsafe(48))"
```

```ini
JWT_SECRET_KEY=<strong-random-value>     # REQUIRED — app won't start without it
JWT_EXPIRE_HOURS=24
CORS_ORIGINS=https://your-domain.example # comma-separated; never "*"
DB_TYPE=sqlite
DB_FILE=data/fleet.db
MAP_PROVIDER=leaflet
```

## First-Run: Create the Initial User

```bash
docker compose exec app python -c "from app.core.database import SessionLocal; \
from app.services.auth_service import create_initial_user; \
db=SessionLocal(); create_initial_user(db,'admin@your-domain.example','CHANGE_ME','Admin'); db.close()"
```

## Updating a Deployment

```bash
git pull
docker compose up -d --build      # migrations run automatically on startup
```

## Backups

SQLite must be backed up with a consistent snapshot — **do not** `cp` a live file.

```bash
docker compose exec app sqlite3 data/fleet.db ".backup 'data/backups/fleet-$(date +%F).db'"
```

Restore by stopping the app and replacing `data/fleet.db` with a backup.

## Production Checklist

- [ ] `JWT_SECRET_KEY` set to a unique strong value (not the dev default)
- [ ] `CORS_ORIGINS` restricted to the real frontend origin(s)
- [ ] HTTPS terminated in front (reverse proxy / load balancer)
- [ ] Automated daily backup of `data/fleet.db` via the `.backup` command
- [ ] Container restart policy set (`restart: unless-stopped` — already in compose)
- [ ] Log aggregation configured for the container

## Scaling Note

SQLite fits the single-user scope. Migrate to PostgreSQL (set `DB_TYPE=postgresql`
and `POSTGRESQL_URL`) when you add concurrent writers — e.g. the driver mobile app
or real-time GPS ingestion. SQLAlchemy + Alembic make this a low-friction switch.
