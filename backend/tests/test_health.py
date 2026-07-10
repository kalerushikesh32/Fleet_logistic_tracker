"""Smoke tests — verify the app boots and auth is enforced."""


def test_health_ok(client):
    resp = client.get("/health")
    assert resp.status_code == 200
    assert resp.json() == {"status": "ok"}


def test_vehicles_require_auth(client):
    # No token → 401, proving router-level auth is wired up.
    resp = client.get("/api/vehicles")
    assert resp.status_code == 401


def test_login_rejects_bad_credentials(client):
    resp = client.post("/api/auth/login", json={"email": "nobody@example.com", "password": "x"})
    assert resp.status_code == 401
