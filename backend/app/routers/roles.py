
from fastapi import APIRouter, HTTPException

from app.database import get_connection


router = APIRouter(
    prefix="/api/roles",
    tags=["Roles"],
)


# -----------------------------------------
# GET /api/roles
# -----------------------------------------

@router.get("")
def get_roles():
    """Return job counts for all role categories."""

    try:
        with get_connection() as conn:
            with conn.cursor() as cur:
                cur.execute("""
                    SELECT
                        role_category,
                        COUNT(*) AS job_count
                    FROM jobs
                    GROUP BY role_category
                    ORDER BY job_count DESC, role_category
                """)

                rows = cur.fetchall()

                cur.execute("SELECT COUNT(*) FROM jobs")
                total_jobs = cur.fetchone()[0]

        roles = [
            {
                "role": role,
                "count": count,
                "percentage": (
                    round(count / total_jobs * 100, 2)
                    if total_jobs else 0.0
                ),
            }
            for role, count in rows
        ]

        return {
            "data_type": "sample",
            "total_jobs": total_jobs,
            "roles": roles,
        }

    except Exception as exc:
        raise HTTPException(
            status_code=503,
            detail="Unable to retrieve role data",
        ) from exc


# -----------------------------------------
# GET /api/roles/{role_name}
# -----------------------------------------

@router.get("/{role_name}")
def get_role_detail(role_name: str):
    """Return statistics for a specific role."""

    try:
        with get_connection() as conn:
            with conn.cursor() as cur:

                # Resolve a valid role category
                cur.execute("""
                    SELECT DISTINCT role_category
                    FROM jobs
                    WHERE LOWER(role_category) = LOWER(%s)
                """, (role_name,))

                result = cur.fetchone()

                if result is None:
                    raise HTTPException(
                        status_code=404,
                        detail="Role not found",
                    )

                actual_role = result[0]

                # Job count
                cur.execute("""
                    SELECT COUNT(*)
                    FROM jobs
                    WHERE role_category = %s
                """, (actual_role,))

                total_jobs = cur.fetchone()[0]

                # City distribution
                cur.execute("""
                    SELECT city, COUNT(*) AS job_count
                    FROM jobs
                    WHERE role_category = %s
                    GROUP BY city
                    ORDER BY job_count DESC, city
                """, (actual_role,))

                cities = [
                    {"city": city, "count": count}
                    for city, count in cur.fetchall()
                ]

                # Top skills for this role
                cur.execute("""
                    SELECT
                        s.skill_name,
                        COUNT(DISTINCT j.job_id) AS job_count
                    FROM jobs AS j
                    JOIN job_skills AS js
                        ON j.job_id = js.job_id
                    JOIN skills AS s
                        ON js.skill_id = s.skill_id
                    WHERE j.role_category = %s
                    GROUP BY s.skill_id, s.skill_name
                    ORDER BY job_count DESC, s.skill_name
                    LIMIT 10
                """, (actual_role,))

                top_skills = [
                    {"skill": skill, "count": count}
                    for skill, count in cur.fetchall()
                ]

        return {
            "data_type": "sample",
            "role": actual_role,
            "total_jobs": total_jobs,
            "city_distribution": cities,
            "top_skills": top_skills,
        }

    except HTTPException:
        raise

    except Exception as exc:
        raise HTTPException(
            status_code=503,
            detail="Unable to retrieve role details",
        ) from exc
