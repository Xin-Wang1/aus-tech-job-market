
from fastapi.testclient import TestClient

from app.main import app


client = TestClient(app)


def test_get_roles():
    response = client.get("/api/roles")

    assert response.status_code == 200

    data = response.json()

    assert data["data_type"] == "sample"
    assert isinstance(data["roles"], list)

    assert sum(
        role["count"] for role in data["roles"]
    ) == data["total_jobs"]


def test_role_detail():
    response = client.get(
        "/api/roles/Frontend%20Developer"
    )

    assert response.status_code == 200

    data = response.json()

    assert data["role"] == "Frontend Developer"

    assert sum(
        city["count"]
        for city in data["city_distribution"]
    ) == data["total_jobs"]


def test_unknown_role():
    response = client.get(
        "/api/roles/NonexistentRole123"
    )

    assert response.status_code == 404


def test_get_locations():
    response = client.get("/api/locations")

    assert response.status_code == 200

    data = response.json()

    assert data["data_type"] == "sample"

    assert sum(
        location["count"]
        for location in data["locations"]
    ) == data["total_jobs"]


def test_location_detail():
    response = client.get(
        "/api/locations/Melbourne"
    )

    assert response.status_code == 200

    data = response.json()

    assert data["city"] == "Melbourne"

    assert sum(
        role["count"]
        for role in data["role_distribution"]
    ) == data["total_jobs"]


def test_case_insensitive_city():
    response = client.get(
        "/api/locations/melbourne"
    )

    assert response.status_code == 200
    assert response.json()["city"] == "Melbourne"


def test_unknown_city():
    response = client.get(
        "/api/locations/NonexistentCity123"
    )

    assert response.status_code == 404
