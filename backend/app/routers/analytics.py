
from fastapi import APIRouter, HTTPException, Query
from psycopg.rows import dict_row

from app.database import get_db_connection


router = APIRouter(
    prefix="/api",
    tags=["Analytics"],
)


# =====================================
# Helper: Execute SQL and return rows
# =====================================

def fetch_all(query: str, params=None):
    try:
        with get_db_connection() as conn:
            with conn.cursor(row_factory=dict_row) as cur:
                cur.execute(query, params)
                return cur.fetchall()

    except Exception as exc:
        print(f"Database query failed: {exc}")
        raise HTTPException(
            status_code=503,
            detail="Database query unavailable",
        ) from exc


def fetch_one(query: str, params=None):
    try:
        with get_db_connection() as conn:
            with conn.cursor(row_factory=dict_row) as cur:
                cur.execute(query, params)
                return cur.fetchone()

    except Exception as exc:
        print(f"Database query failed: {exc}")
        raise HTTPException(
            status_code=503,
            detail="Database query unavailable",
        ) from exc


# =====================================
# 1. Overview API
# GET /api/overview
# =====================================

@router.get("/overview")
def get_overview():

    query = """
        SELECT
            (SELECT COUNT(*) FROM jobs) AS total_jobs,

            (
                SELECT COUNT(DISTINCT city)
                FROM jobs
                WHERE city <> 'Unknown'
            ) AS total_cities,

            (SELECT COUNT(*) FROM skills) AS total_skills,

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
    """

    result = fetch_one(query)

    return {
        **result,
        "data_type": "sample",
        "source": "Adzuna API",
    }


# =====================================
# 2. Roles API
# GET /api/roles
# =====================================

@router.get("/roles")
def get_roles():

    query = """
        SELECT
            role_category,
            COUNT(*) AS job_count
        FROM jobs
        GROUP BY role_category
        ORDER BY job_count DESC, role_category
    """

    rows = fetch_all(query)

    return {
        "data": rows,
        "total_roles": len(rows),
        "data_type": "sample",
    }


# =====================================
# 3. Locations API
# GET /api/locations
# =====================================

@router.get("/locations")
def get_locations(
    include_unknown: bool = Query(default=True)
):

    query = """
        SELECT
            city,
            COUNT(*) AS job_count
        FROM jobs
        WHERE (%s OR city <> 'Unknown')
        GROUP BY city
        ORDER BY job_count DESC, city
    """

    rows = fetch_all(
        query,
        (include_unknown,),
    )

    return {
        "data": rows,
        "total_locations": len(rows),
        "include_unknown": include_unknown,
        "data_type": "sample",
    }


# =====================================
# 4. Top Skills API
# GET /api/skills
# =====================================

@router.get("/skills")
def get_skills(
    limit: int = Query(default=10, ge=1, le=100)
):

    query = """
        SELECT
            s.skill_name,
            COUNT(DISTINCT js.job_id) AS job_count
        FROM skills AS s
        JOIN job_skills AS js
            ON s.skill_id = js.skill_id
        GROUP BY s.skill_id, s.skill_name
        ORDER BY job_count DESC, s.skill_name
        LIMIT %s
    """

    rows = fetch_all(query, (limit,))

    return {
        "data": rows,
        "limit": limit,
        "data_type": "sample",
    }


# =====================================
# 5. Skills by Role API
# GET /api/skills/by-role
# =====================================

@router.get("/skills/by-role")
def get_skills_by_role(
    role: str | None = Query(default=None)
):

    query = """
        SELECT
            j.role_category,
            s.skill_name,
            COUNT(DISTINCT j.job_id) AS job_count
        FROM jobs AS j
        JOIN job_skills AS js
            ON j.job_id = js.job_id
        JOIN skills AS s
            ON js.skill_id = s.skill_id
        WHERE (%s IS NULL OR j.role_category = %s)
        GROUP BY
            j.role_category,
            s.skill_id,
            s.skill_name
        ORDER BY
            j.role_category,
            job_count DESC,
            s.skill_name
    """

    rows = fetch_all(
        query,
        (role, role),
    )

    return {
        "data": rows,
        "role_filter": role,
        "data_type": "sample",
    }
