# API Reference

Base URL: `http://localhost:8000`
Interactive docs (auto-generated): `GET /docs`

All endpoints except `/health` and `/api/auth/login` require a JWT bearer token:

```
Authorization: Bearer <access_token>
```

## Error Shape

Every error returns a consistent body:

```json
{ "status": 409, "code": "CONFLICT", "message": "…", "details": { "field": ["…"] } }
```

`details` is present only for `VALIDATION_ERROR` (400).

## Authentication

| Method | Path | Description | Body |
|--------|------|-------------|------|
| POST | `/api/auth/login` | Log in, returns token + user | `{ email, password }` |
| POST | `/api/auth/logout` | Client-side logout | – |
| GET  | `/api/auth/me` | Current user | – |

## Vehicles

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/vehicles` | List (`?type=&status=&search=`) |
| GET | `/api/vehicles/{id}` | Get one |
| POST | `/api/vehicles` | Create |
| PUT | `/api/vehicles/{id}` | Update |
| PATCH | `/api/vehicles/{id}/status` | Change status |
| DELETE | `/api/vehicles/{id}` | Deactivate (soft delete) |
| GET | `/api/vehicles/{id}/locations` | Location history (`?from=&to=`) |
| POST | `/api/vehicles/{id}/locations` | Record a location |

## Cargo

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/cargo` | List (`?status=&search=`) |
| GET | `/api/cargo/{id}` | Get one + operation history |
| POST | `/api/cargo` | Create |
| PUT | `/api/cargo/{id}` | Update |
| DELETE | `/api/cargo/{id}` | Delete (PENDING or DELIVERED only) |

## Operations

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/operations` | List (`?from=&to=&vehicle_id=&cargo_id=`) |
| POST | `/api/operations/load` | Load cargo onto a vehicle |
| POST | `/api/operations/unload` | Unload cargo (`mark_delivered` optional) |

## Drivers

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/drivers` | List (`?status=&search=`) |
| GET | `/api/drivers/{id}` | Get one |
| POST | `/api/drivers` | Create |
| PUT | `/api/drivers/{id}` | Update |
| POST | `/api/drivers/{id}/assign` | Assign to vehicle (`?force=true` to reassign) |
| POST | `/api/drivers/{id}/unassign` | Unassign |
| DELETE | `/api/drivers/{id}` | Deactivate |

> Assigning an already-assigned driver returns `409` with code
> `DRIVER_ALREADY_ASSIGNED`; retry with `?force=true` after user confirmation.

## Dashboard

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/dashboard/summary` | Vehicle & cargo counts by status |
| GET | `/api/dashboard/map` | Active vehicles with latest location |
| GET | `/api/dashboard/recent-operations` | Recent load/unload activity |
