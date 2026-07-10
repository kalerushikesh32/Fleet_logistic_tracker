# Architecture

## Overview

A classic three-tier web application:

```
┌──────────────────────────────┐
│  React SPA (Vite, Bootstrap) │  Browser
│  TanStack Query · Auth ctx   │
└──────────────┬───────────────┘
               │ HTTP/REST + JWT
┌──────────────▼───────────────┐
│  FastAPI  (routes → services)│  Application
│  Pydantic validation         │
│  Central exception handlers  │
└──────────────┬───────────────┘
               │ SQLAlchemy ORM
┌──────────────▼───────────────┐
│  SQLite (WAL mode)           │  Data
└──────────────────────────────┘
```

## Backend Layering

Requests flow strictly through layers; each has one responsibility:

1. **Routes** (`app/api/routes/`) — HTTP concerns only. Thin. No business logic.
   Auth is applied once per router via `dependencies=[Depends(get_current_user)]`.
2. **Services** (`app/services/`) — all business rules and state transitions.
   Raise `DomainError` subclasses; never deal with HTTP.
3. **Models** (`app/models/`) — SQLAlchemy ORM entities and enums.
4. **Schemas** (`app/schemas/`) — Pydantic request/response contracts + validation.

### Error handling

Services raise domain exceptions from `app/core/exceptions.py`:

| Exception | HTTP | `code` |
|-----------|------|--------|
| `NotFoundError` | 404 | `NOT_FOUND` |
| `ConflictError` | 409 | `CONFLICT` |
| `InvalidStateError` | 409 | `INVALID_STATE` |
| `ValidationError` (Pydantic) | 400 | `VALIDATION_ERROR` |

A single handler in `main.py` maps them to the uniform response shape:

```json
{ "status": 409, "code": "CONFLICT", "message": "License plate 'X' is already registered" }
```

## Data Model

```
User                       Vehicle ──1:1── Driver
                              │
                    ┌─────────┼──────────┐
                  1:N        1:N        1:N
                    ▼          ▼          ▼
                Location    Cargo ──1:N── Operation
```

- **Vehicle**: `AVAILABLE · IN_USE · MAINTENANCE · INACTIVE`
- **Cargo**: `PENDING → LOADED → (IN_TRANSIT) → UNLOADED → DELIVERED`
- **Operation**: immutable audit record (`LOADING` / `UNLOADING`)
- **Location**: append-only GPS history; current position = latest timestamp

## Cargo Lifecycle Rules

Enforced in `app/services/operation_service.py`:

- Only `PENDING` cargo can be **loaded**; loading sets cargo `LOADED` and vehicle `IN_USE`.
- Only `LOADED`/`IN_TRANSIT` cargo can be **unloaded**; the vehicle returns to
  `AVAILABLE` only once it carries no other active cargo.
- Operations are never modified or deleted (audit integrity).

## Frontend Structure

```
src/
├── pages/         # route screens (Dashboard, Vehicles, Cargo, …)
├── components/
│   ├── common/    # Modal, SearchBar, StatusBadge, ErrorAlert
│   ├── layout/    # AppLayout, Sidebar (responsive)
│   └── dashboard/ # FleetMap
├── hooks/         # TanStack Query hooks per domain
├── services/      # axios client, per-domain services, maps/ abstraction
├── contexts/      # AuthContext
└── types/         # shared TypeScript contracts
```

- **Data fetching**: TanStack Query hooks (`useVehicles`, `useCargo`, …) own caching
  and invalidation.
- **Auth**: `AuthContext` + `ProtectedRoute`. On any 401 the API client fires an
  `auth:expired` event; the context clears state and routing redirects to `/login`.
- **Maps**: all map code sits behind `services/maps/IMapProvider.ts`. Only Leaflet
  is implemented; add a provider there to support Google Maps/Mapbox.

## Key Decisions & Scope

Full rationale lives in `.kiro/specs/fleet-logistics-tracker/decisions.md`.

**Deferred (out of current scope):** multi-tenancy, pricing-tier feature flags,
white-label theming, and a driver mobile app. The code reads config from the
environment so these can be layered on later without rewrites.
