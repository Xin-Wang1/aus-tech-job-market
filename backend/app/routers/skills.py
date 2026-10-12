import logging

from fastapi import APIRouter, HTTPException, Query
from app.database import get_connection

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/api/skills",
    tags=["Skills"],
)
from fastapi import APIRouter, HTTPException, Query

from app.database import get_connection


router = APIRouter(
    prefix="/api/skills",
    tags=["Skills"],
)


# =========================================
# Helper: Convert SQL rows into JSON objects
# =========================================

def format_skills(rows):
    return [
        {
            "skill": skill,
            "job_count": count,
        }
        for skill, count in rows
    ]


# =========================================
# 1. GET /api/skills
# =========================================

@router.get("")
def get_all_skills():
    """Return all detected skills and job counts."""

    try:
        with get_connection() as conn:
            with conn.cursor() as cur:

                cur.execute("""
                    SELECT
                        s.skill_name,
                        COUNT(DISTINCT js.job_id) AS job_count
                    FROM skills AS s
                    LEFT JOIN job_skills AS js
                        ON s.skill_id = js.skill_id
                    GROUP BY s.skill_id, s.skill_name
                    ORDER BY job_count DESC, s.skill_name
                """)

                skills = format_skills(cur.fetchall())

                cur.execute("""
                    SELECT COUNT(DISTINCT job_id)
                    FROM job_skills
                """)

                jobs_with_skills = cur.fetchone()[0]

                cur.execute("""
                    SELECT COUNT(*)
                    FROM jobs
                """)

                total_jobs = cur.fetchone()[0]

        coverage = (
            round(jobs_with_skills / total_jobs * 100, 2)
            if total_jobs else 0.0
        )

        return {
            "data_type": "sample",
            "total_skills": len(skills),
            "total_jobs": total_jobs,
            "jobs_with_skills": jobs_with_skills,
            "skill_coverage_percentage": coverage,
            "skills": skills,
        }

    except Exception as exc:
        logger.error(
            "Failed to retrieve all skills",
            exc_info=True,
        )

        raise HTTPException(
            status_code=503,
            detail="Unable to retrieve skills",
        ) from exc


# =========================================
# 2. GET /api/skills/top?limit=5
# =========================================

@router.get("/top")
def get_top_skills(
    limit: int = Query(default=10, ge=1, le=50),
):
    """Return the top N detected skills."""

    try:
        with get_connection() as conn:
            with conn.cursor() as cur:

                cur.execute("""
                    SELECT
                        s.skill_name,
                        COUNT(DISTINCT js.job_id) AS job_count
                    FROM skills AS s
                    JOIN job_skills AS js
                        ON s.skill_id = js.skill_id
                    GROUP BY s.skill_id, s.skill_name
                    ORDER BY job_count DESC, s.skill_name
                    LIMIT %s
                """, (limit,))

                skills = format_skills(cur.fetchall())

        return {
            "data_type": "sample",
            "limit": limit,
            "skills": skills,
        }

    except Exception as exc:
        logger.error(
            "Failed to retrieve top skills",
            exc_info=True,
        )

        raise HTTPException(
            status_code=503,
            detail="Unable to retrieve top skills",
        ) from exc


# =========================================
# 3. GET /api/skills/by-role?role=IT Support
# =========================================

@router.get("/by-role")
def get_skills_by_role(
    role: str = Query(min_length=1),
):
    """Return detected skills for a role category."""

    try:
        with get_connection() as conn:
            with conn.cursor() as cur:

                # Resolve role category
                cur.execute("""
                    SELECT DISTINCT role_category
                    FROM jobs
                    WHERE LOWER(role_category) = LOWER(%s)
                """, (role,))

                result = cur.fetchone()

                if result is None:
                    raise HTTPException(
                        status_code=404,
                        detail="Role not found",
                    )

                actual_role = result[0]

                # Total jobs for the selected role
                cur.execute("""
                    SELECT COUNT(*)
                    FROM jobs
                    WHERE role_category = %s
                """, (actual_role,))

                total_jobs = cur.fetchone()[0]

                # Skills for this role
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
                """, (actual_role,))

                rows = cur.fetchall()

        skills = [
            {
                "skill": skill,
                "job_count": count,
                "percentage": (
                    round(count / total_jobs * 100, 2)
                    if total_jobs else 0.0
                ),
            }
            for skill, count in rows
        ]

        return {
            "data_type": "sample",
            "role": actual_role,
            "total_jobs": total_jobs,
            "skills": skills,
        }

    except HTTPException:
        raise

    except Exception as exc:
        logger.error(
            "Unable to retrieve role skills",
            exc_info=True,
        )

        raise HTTPException(
            status_code=503,
            detail="Unable to retrieve role skills",
        ) from exc

# =========================================
# 4. GET /api/skills/{skill_name}
# =========================================

@router.get("/{skill_name}")
def get_skill_detail(skill_name: str):
    """Return role and city distributions for a skill."""

    try:
        with get_connection() as conn:
            with conn.cursor() as cur:

                # Resolve skill name
                cur.execute("""
                    SELECT skill_id, skill_name
                    FROM skills
                    WHERE LOWER(skill_name) = LOWER(%s)
                """, (skill_name,))

                result = cur.fetchone()

                if result is None:
                    raise HTTPException(
                        status_code=404,
                        detail="Skill not found",
                    )

                skill_id, actual_skill = result

                # Total jobs mentioning the skill
                cur.execute("""
                    SELECT COUNT(DISTINCT job_id)
                    FROM job_skills
                    WHERE skill_id = %s
                """, (skill_id,))

                total_jobs = cur.fetchone()[0]

                # Distribution by role
                cur.execute("""
                    SELECT
                        j.role_category,
                        COUNT(DISTINCT j.job_id) AS job_count
                    FROM jobs AS j
                    JOIN job_skills AS js
                        ON j.job_id = js.job_id
                    WHERE js.skill_id = %s
                    GROUP BY j.role_category
                    ORDER BY job_count DESC, j.role_category
                """, (skill_id,))

                role_distribution = [
                    {
                        "role": role,
                        "count": count,
                    }
                    for role, count in cur.fetchall()
                ]

                # Distribution by city
                cur.execute("""
                    SELECT
                        j.city,
                        COUNT(DISTINCT j.job_id) AS job_count
                    FROM jobs AS j
                    JOIN job_skills AS js
                        ON j.job_id = js.job_id
                    WHERE js.skill_id = %s
                    GROUP BY j.city
                    ORDER BY job_count DESC, j.city
                """, (skill_id,))

                city_distribution = [
                    {
                        "city": city,
                        "count": count,
                    }
                    for city, count in cur.fetchall()
                ]

        return {
            "data_type": "sample",
            "skill": actual_skill,
            "total_jobs": total_jobs,
            "role_distribution": role_distribution,
            "city_distribution": city_distribution,
        }

    except HTTPException:
        raise

    except Exception as exc:
        logger.error(
            "Unable to retrieve skill details",
            exc_info=True,
        )

        raise HTTPException(
            status_code=503,
            detail="Unable to retrieve skill details",
        ) from exc
