
from fastapi.testclient import TestClient

from app.main import app


client = TestClient(app)


def test_all_skills():
    response = client.get("/api/skills")

    assert response.status_code == 200

    data = response.json()

    assert data["data_type"] == "sample"
    assert isinstance(data["skills"], list)

    assert data["total_skills"] == len(data["skills"])
    assert data["jobs_with_skills"] <= data["total_jobs"]

    assert 0 <= data["skill_coverage_percentage"] <= 100


def test_top_skills():
    response = client.get("/api/skills/top?limit=5")

    assert response.status_code == 200

    data = response.json()

    assert data["limit"] == 5
    assert len(data["skills"]) <= 5

    counts = [
        item["job_count"]
        for item in data["skills"]
    ]

    assert counts == sorted(counts, reverse=True)


def test_skills_by_role():
    response = client.get(
        "/api/skills/by-role",
        params={"role": "Frontend Developer"},
    )

    assert response.status_code == 200

    data = response.json()

    assert data["role"] == "Frontend Developer"

    for skill in data["skills"]:
        assert skill["job_count"] <= data["total_jobs"]
        assert 0 <= skill["percentage"] <= 100


def test_skill_detail():
    response = client.get("/api/skills/React")

    assert response.status_code == 200

    data = response.json()

    assert data["skill"] == "React"

    assert sum(
        item["count"]
        for item in data["role_distribution"]
    ) == data["total_jobs"]

    assert sum(
        item["count"]
        for item in data["city_distribution"]
    ) == data["total_jobs"]


def test_case_insensitive_skill():
    response = client.get("/api/skills/react")

    assert response.status_code == 200
    assert response.json()["skill"] == "React"


def test_unknown_skill():
    response = client.get(
        "/api/skills/NonexistentSkill123"
    )

    assert response.status_code == 404


def test_unknown_role():
    response = client.get(
        "/api/skills/by-role",
        params={"role": "NonexistentRole123"},
    )

    assert response.status_code == 404


def test_invalid_limit():
    response = client.get("/api/skills/top?limit=0")
    assert response.status_code == 422

    response = client.get("/api/skills/top?limit=100")
    assert response.status_code == 422
