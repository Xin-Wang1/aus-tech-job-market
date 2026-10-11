
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import get_db_connection


# Create FastAPI application
app = FastAPI(
    title="Australian Tech Job Market API",
    description=(
        "REST API for Australian technology "
        "job market analytics."
    ),
    version="1.0.0",
)


# Allow local Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=False,
    allow_methods=["GET"],
    allow_headers=["*"],
)


# -----------------------------------
# 1. Root endpoint
# -----------------------------------

@app.get("/")
def root():
    return {
        "message": "Australian Tech Job Market API",
        "status": "running",
    }


# -----------------------------------
# 2. Health check endpoint
# -----------------------------------

@app.get("/api/health")
def health_check():

    try:
        with get_db_connection() as conn:
            with conn.cursor() as cur:

                cur.execute("SELECT 1")
                cur.fetchone()

        return {
            "status": "healthy",
            "database": "connected",
        }

    except Exception:
        return {
            "status": "unhealthy",
            "database": "disconnected",
        }


# -----------------------------------
# 3. Database statistics endpoint
# -----------------------------------

@app.get("/api/stats")
def database_stats():

    with get_db_connection() as conn:
        with conn.cursor() as cur:

            cur.execute("""
                SELECT
                    (SELECT COUNT(*) FROM jobs),
                    (SELECT COUNT(*) FROM skills),
                    (SELECT COUNT(*) FROM job_skills)
            """)

            jobs, skills, relationships = cur.fetchone()

    return {
        "total_jobs": jobs,
        "total_skills": skills,
        "total_job_skill_relationships": relationships,
        "data_type": "sample",
    }
