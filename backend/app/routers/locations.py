
from fastapi import APIRouter, HTTPException

from app.database import get_connection


router = APIRouter(
    prefix="/api/locations",
    tags=["Locations"],
)


# -----------------------------------------
# GET /api/locations
# -----------------------------------------

@router.get("")
def get_locations():
    """Return job counts by city."""

    try:
        with get_connection() as conn:
            with conn.cursor() as cur:

                cur.execute("""
                    SELECT city, COUNT(*) AS job_count
                    FROM jobs
                    GROUP BY city
                    ORDER BY job_count DESC, city
                """)

                rows = cur.fetchall()

                cur.execute("SELECT COUNT(*) FROM jobs")
                total_jobs = cur.fetchone()[0]

        locations = [
            {
                "city": city,
                "count": count,
                "percentage": (
                    round(count / total_jobs * 100, 2)
                    if total_jobs else 0.0
                ),
            }
            for city, count in rows
        ]

        return {
            "data_type": "sample",
            "total_jobs": total_jobs,
            "locations": locations,
        }

    except Exception as exc:
        raise HTTPException(
            status_code=503,
            detail="Unable to retrieve location data",
        ) from exc


# -----------------------------------------
# GET /api/locations/{city}
# -----------------------------------------

@router.get("/{city}")
def get_location_detail(city: str):
    """Return role distribution for a city."""

    try:
        with get_connection() as conn:
            with conn.cursor() as cur:

                # Resolve city name, case-insensitively
                cur.execute("""
                    SELECT DISTINCT city
                    FROM jobs
                    WHERE LOWER(city) = LOWER(%s)
                """, (city,))

                result = cur.fetchone()

                if result is None:
                    raise HTTPException(
                        status_code=404,
                        detail="City not found",
                    )

                actual_city = result[0]

                # Total jobs in this city
                cur.execute("""
                    SELECT COUNT(*)
                    FROM jobs
                    WHERE city = %s
                """, (actual_city,))

                total_jobs = cur.fetchone()[0]

                # Role distribution
                cur.execute("""
                    SELECT
                        role_category,
                        COUNT(*) AS job_count
                    FROM jobs
                    WHERE city = %s
                    GROUP BY role_category
                    ORDER BY job_count DESC, role_category
                """, (actual_city,))

                roles = [
                    {
                        "role": role,
                        "count": count,
                    }
                    for role, count in cur.fetchall()
                ]

                # Top skills for this city
                cur.execute("""
                    SELECT
                        s.skill_name,
                        COUNT(DISTINCT j.job_id) AS job_count
                    FROM jobs AS j
                    JOIN job_skills AS js
                        ON j.job_id = js.job_id
                    JOIN skills AS s
                        ON js.skill_id = s.skill_id
                    WHERE j.city = %s
                    GROUP BY s.skill_id, s.skill_name
                    ORDER BY job_count DESC, s.skill_name
                    LIMIT 10
                """, (actual_city,))

                top_skills = [
                    {
                        "skill": skill,
                        "count": count,
                    }
                    for skill, count in cur.fetchall()
                ]

        return {
            "data_type": "sample",
            "city": actual_city,
            "total_jobs": total_jobs,
            "role_distribution": roles,
            "top_skills": top_skills,
        }

    except HTTPException:
        raise

    except Exception as exc:
        raise HTTPException(
            status_code=503,
            detail="Unable to retrieve location details",
        ) from exc
