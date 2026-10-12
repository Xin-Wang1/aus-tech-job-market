
# Australian Tech Job Market Analytics — Backend

A Python FastAPI backend for exploring a sample of
Australian technology job advertisements.

The backend retrieves aggregated job statistics from
PostgreSQL and exposes them through REST APIs.

## Tech Stack

- Python
- FastAPI
- PostgreSQL
- psycopg
- Pandas
- Pytest
- Uvicorn

## Features

- Job role distribution
- City-based job statistics
- Skill frequency analysis
- Skills by job role
- Data quality metrics
- REST API documentation
- Automated API tests
- Error handling and logging

## Project Structure

```text
backend/
├── app/
│   ├── main.py
│   ├── database.py
│   ├── exceptions.py
│   ├── logging_config.py
│   ├── routers/
│   └── schemas/
├── scripts/
├── sql/
├── tests/
├── .env.example
└── requirements.txt
```

## Local Setup

### 1. Create a virtual environment

```powershell
python -m venv .venv
```

### 2. Install dependencies

```powershell
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
```

### 3. Configure environment variables

Copy `.env.example` to `.env` and replace the placeholder
values with your local PostgreSQL credentials.

### 4. Prepare PostgreSQL

Create the `aus_tech_jobs` database, apply the schema in
`sql/`, and import cleaned data using the scripts in
`scripts/`.

Database permissions must be configured for the application
user before starting the API.

### 5. Start the server

```powershell
.\.venv\Scripts\python.exe -m uvicorn app.main:app --reload --port 8000
```

API documentation:

http://127.0.0.1:8000/docs

## API Endpoints

| Endpoint | Description |
|---|---|
| GET /api/health | API health check |
| GET /api/health/db | Database connectivity |
| GET /api/overview | Overview statistics |
| GET /api/roles | Role distribution |
| GET /api/roles/{role_name} | Role details |
| GET /api/locations | City distribution |
| GET /api/locations/{city} | City details |
| GET /api/skills | All detected skills |
| GET /api/skills/top | Top skills |
| GET /api/skills/by-role | Skills by role |
| GET /api/skills/{skill_name} | Skill details |

## Testing

```powershell
.\.venv\Scripts\python.exe -m pytest tests/ -v
```

Integration tests require a running PostgreSQL database
with the expected schema and imported data.

## Data Limitations

The initial dataset contains 40 unique job advertisements
collected through the Adzuna API.

The data is a small, non-representative sample.

Skill extraction is rule-based and may miss relevant
technologies or skills.

Salary information is largely unavailable, so reliable
market salary estimates cannot currently be produced.

Statistics must not be interpreted as comprehensive
Australian labour-market estimates.

## Security

- Database credentials are stored in `.env`.
- `.env` is excluded from version control.
- SQL queries use parameterized inputs.
- Database errors are not exposed in public API responses.
