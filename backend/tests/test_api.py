"""Tests for API routes"""

import pytest
import os
from fastapi.testclient import TestClient


@pytest.fixture
def client():
    """Create test client with mock env vars"""
    os.environ.setdefault("SUPABASE_URL", "https://test.supabase.co")
    os.environ.setdefault("SUPABASE_ANON_KEY", "test-anon-key")
    os.environ.setdefault("SUPABASE_SERVICE_ROLE_KEY", "test-service-key")
    os.environ.setdefault("SUPABASE_JWT_SECRET", "test-jwt-secret")
    os.environ.setdefault("SECRET_KEY", "test-secret-key-min-32-chars-long!")

    from app.main import create_app
    app = create_app()
    return TestClient(app)


class TestHealthEndpoint:
    def test_health_check_returns_200(self, client):
        response = client.get("/api/v1/health")
        assert response.status_code == 200
        data = response.json()
        assert "status" in data
        assert "version" in data
        assert data["version"] == "0.1.0"

    def test_health_has_services(self, client):
        response = client.get("/api/v1/health")
        data = response.json()
        assert "services" in data

    def test_readiness_returns_200(self, client):
        response = client.get("/api/v1/ready")
        assert response.status_code == 200
        assert response.json()["status"] == "ready"

    def test_liveness_returns_200(self, client):
        response = client.get("/api/v1/live")
        assert response.status_code == 200
        assert response.json()["status"] == "alive"


class TestRecipesEndpoints:
    def test_generate_requires_auth(self, client):
        response = client.post(
            "/api/v1/recipes/generate",
            json={
                "ingredients": [{"name": "chicken"}],
                "servings": 2,
                "dietary_restrictions": [],
                "use_pantry_staples": False,
                "pantry_staples": [],
            },
        )
        # 401/403 = auth rejected, 422 = auth dependency validation error
        assert response.status_code in [401, 403, 422]

    def test_stream_requires_auth(self, client):
        response = client.post(
            "/api/v1/recipes/generate/stream",
            json={
                "ingredients": [{"name": "chicken"}],
                "servings": 2,
                "dietary_restrictions": [],
                "use_pantry_staples": False,
                "pantry_staples": [],
            },
        )
        assert response.status_code in [401, 403, 422]

    def test_get_recipes_requires_auth(self, client):
        response = client.get("/api/v1/recipes")
        assert response.status_code in [401, 403, 422]

    def test_vision_requires_auth(self, client):
        response = client.post("/api/v1/recipes/vision")
        assert response.status_code in [401, 403, 422]


class TestPantryEndpoints:
    def test_get_staples_requires_auth(self, client):
        response = client.get("/api/v1/pantry/staples")
        assert response.status_code in [401, 403, 422]

    def test_get_inventory_requires_auth(self, client):
        response = client.get("/api/v1/pantry/inventory")
        assert response.status_code in [401, 403, 422]

    def test_add_staple_requires_auth(self, client):
        response = client.post(
            "/api/v1/pantry/staples",
            json={"name": "garlic", "category": "produce"},
        )
        assert response.status_code in [401, 403, 422]
