import logging

logger = logging.getLogger(__name__)
router = APIRouter(
    prefix="/api",
    tags=["Overview"],
)
from fastapi import APIRouter, HTTPException

from app.database import get_connection

from app.schemas.overview import OverviewResponse


@router.get(
    "/overview",
    response_model=OverviewResponse,
)
def get_overview():
    """
    Return summary statistics and distributions
    for the current job posting sample.
    """

    try:
        with get_connection() as conn:
            with conn.cursor() as cur:

                # 1. Summary statistics
                cur.execute("""
                    SELECT
                        (SELECT COUNT(*) FROM jobs)
                            AS total_jobs,

                        (SELECT COUNT(*) FROM skills)
                            AS total_skills,

                        (
                            SELECT COUNT(DISTINCT city)
                            FROM jobs
                            WHERE city <> 'Unknown'
                        ) AS known_cities,

                        (
                            SELECT COUNT(*)
                            FROM jobs
                            WHERE city = 'Unknown'
                        ) AS unknown_city_jobs,

                        (
                            SELECT COUNT(*)
                            FROM jobs
                            WHERE salary_is_usable = TRUE
                        ) AS usable_salary_jobs
                """)

                (
                    total_jobs,
                    total_skills,
                    known_cities,
                    unknown_city_jobs,
                    usable_salary_jobs,
                ) = cur.fetchone()

                # 2. Role distribution
                cur.execute("""
                    SELECT
                        role_category,
                        COUNT(*) AS job_count
                    FROM jobs
                    GROUP BY role_category
                    ORDER BY job_count DESC, role_category
                """)

                role_distribution = [
                    {
                        "role": role,
                        "count": count,
                    }
                    for role, count in cur.fetchall()
                ]

                # 3. City distribution
                cur.execute("""
                    SELECT
                        city,
                        COUNT(*) AS job_count
                    FROM jobs
                    GROUP BY city
                    ORDER BY job_count DESC, city
                """)

                city_distribution = [
                    {
                        "city": city,
                        "count": count,
                    }
                    for city, count in cur.fetchall()
                ]

                # 4. Top skills
                cur.execute("""
                    SELECT
                        s.skill_name,
                        COUNT(DISTINCT js.job_id) AS job_count
                    FROM skills AS s
                    JOIN job_skills AS js
                        ON s.skill_id = js.skill_id
                    GROUP BY s.skill_id, s.skill_name
                    ORDER BY job_count DESC, s.skill_name
                    LIMIT 10
                """)

                top_skills = [
                    {
                        "skill": skill,
                        "count": count,
                    }
                    for skill, count in cur.fetchall()
                ]

                # 5. Jobs with detected skills
                cur.execute("""
                    SELECT COUNT(DISTINCT job_id)
                    FROM job_skills
                """)

                jobs_with_skills = cur.fetchone()[0]

        # Calculate coverage after the database
        # connection has closed.
        skill_coverage = (
            round(jobs_with_skills / total_jobs * 100, 2)
            if total_jobs else 0.0
        )

        salary_coverage = (
            round(usable_salary_jobs / total_jobs * 100, 2)
            if total_jobs else 0.0
        )

        top_role = (
            role_distribution[0]["role"]
            if role_distribution else None
        )

        top_skill = (
            top_skills[0]["skill"]
            if top_skills else None
        )

        return {
            "data_type": "sample",
            "total_jobs": total_jobs,
            "total_skills": total_skills,
            "known_cities": known_cities,
            "unknown_city_jobs": unknown_city_jobs,
            "top_role": top_role,
            "top_skill": top_skill,
            "skill_coverage_percentage": skill_coverage,
            "salary_coverage_percentage": salary_coverage,
            "role_distribution": role_distribution,
            "city_distribution": city_distribution,
            "top_skills": top_skills,
        }

    except Exception as exc:
        logger.error(
            "Failed to retrieve overview data",
            exc_info=True,
        )

        raise HTTPException(
            status_code=503,
            detail="Unable to retrieve overview data",
        ) from exc
