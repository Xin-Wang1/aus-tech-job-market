
from fastapi.testclient import TestClient

from app.main import app


client = TestClient(app)


def test_overview_endpoint():
    response = client.get("/api/overview")

    assert response.status_code == 200

    data = response.json()

    assert data["data_type"] == "sample"

    assert isinstance(data["total_jobs"], int)
    assert isinstance(data["total_skills"], int)
    assert isinstance(data["known_cities"], int)

    assert isinstance(data["role_distribution"], list)
    assert isinstance(data["city_distribution"], list)
    assert isinstance(data["top_skills"], list)

    assert data["total_jobs"] >= 0
    assert data["total_skills"] >= 0

    assert sum(
        item["count"]
        for item in data["role_distribution"]
    ) == data["total_jobs"]

    assert sum(
        item["count"]
        for item in data["city_distribution"]
    ) == data["total_jobs"]
