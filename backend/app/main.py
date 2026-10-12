
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import get_connection


# Create FastAPI application
app = FastAPI(
    title="Australian Tech Job Market API",
    description=(
        "REST API for analysing Australian "
        "technology job posting samples."
    ),
    version="1.0.0",
)


# Allow the local Next.js frontend to access the API
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


# Root endpoint
@app.get("/")
def root():
    return {
        "message": "Australian Tech Job Market API",
        "status": "running",
    }


# Health check endpoint
@app.get("/api/health")
def health_check():
    return {
        "status": "ok",
        "service": "aus-tech-job-market-api",
    }


# Database health check endpoint
@app.get("/api/health/db")
def database_health_check():
    try:
        with get_connection() as conn:
            with conn.cursor() as cur:
                cur.execute("SELECT 1")
                result = cur.fetchone()

        if result is None or result[0] != 1:
            raise RuntimeError("Database health check failed")

        return {
            "status": "ok",
            "database": "connected",
        }

    except Exception:
        # Do not expose database credentials or internal
        # connection errors in the HTTP response.
        from fastapi import HTTPException

        raise HTTPException(
            status_code=503,
            detail="Database unavailable",
        )
