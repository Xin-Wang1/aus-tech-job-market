
import os
from pathlib import Path

import pandas as pd
import psycopg
from dotenv import load_dotenv
from psycopg import sql


# =====================================
# 1. Paths and environment
# =====================================

BACKEND_DIR = Path(__file__).resolve().parents[1]

DATA_DIR = BACKEND_DIR / "data" / "processed"

JOBS_FILE = DATA_DIR / "cleaned_jobs.csv"
JOB_SKILLS_FILE = DATA_DIR / "job_skills.csv"

load_dotenv(BACKEND_DIR / ".env")


# Columns supported by our jobs table.
# Other CSV columns are intentionally ignored.

JOB_COLUMNS = [
    "job_id",
    "title",
    "company",
    "description",
    "location",
    "city",
    "location_status",
    "role_category",
    "classification_status",
    "salary_min",
    "salary_max",
    "salary_unit",
    "salary_annual_min",
    "salary_annual_max",
    "salary_midpoint",
    "salary_status",
    "salary_is_usable",
    "salary_is_predicted",
    "skills",
    "skill_count",
    "skills_source",
    "skills_extraction_method",
]

REQUIRED_JOB_COLUMNS = [
    "job_id",
    "title",
    "city",
    "role_category",
    "salary_is_usable",
    "skill_count",
]

REQUIRED_SKILL_COLUMNS = [
    "job_id",
    "skill",
]


# =====================================
# 2. Helper functions
# =====================================

def get_connection():
    return psycopg.connect(
        host=os.getenv("DB_HOST", "localhost"),
        port=os.getenv("DB_PORT", "5432"),
        dbname=os.getenv("DB_NAME"),
        user=os.getenv("DB_USER"),
        password=os.getenv("DB_PASSWORD"),
        connect_timeout=10,
    )


def clean_value(value):
    """Convert Pandas missing values to SQL NULL."""
    if pd.isna(value):
        return None

    if hasattr(value, "item"):
        return value.item()

    return value


def parse_boolean(value):
    if pd.isna(value):
        return None

    if isinstance(value, bool):
        return value

    text = str(value).strip().lower()

    if text in ("true", "1"):
        return True

    if text in ("false", "0"):
        return False

    raise ValueError(f"Invalid boolean value: {value}")


def load_csv_files():
    print("[1] Loading CSV files...")

    if not JOBS_FILE.exists():
        raise FileNotFoundError(JOBS_FILE)

    if not JOB_SKILLS_FILE.exists():
        raise FileNotFoundError(JOB_SKILLS_FILE)

    jobs = pd.read_csv(
        JOBS_FILE,
        dtype={"job_id": "string"},
    )

    job_skills = pd.read_csv(
        JOB_SKILLS_FILE,
        dtype={"job_id": "string"},
    )

    print(f"Jobs loaded: {len(jobs)}")
    print(f"Job-skill relationships: {len(job_skills)}")

    return jobs, job_skills


def validate_input(jobs, job_skills):
    print("\n[2] Checking import data...")

    missing_jobs = set(REQUIRED_JOB_COLUMNS) - set(jobs.columns)
    missing_skills = set(REQUIRED_SKILL_COLUMNS) - set(job_skills.columns)

    if missing_jobs or missing_skills:
        raise ValueError(
            f"Missing columns: jobs={missing_jobs}, "
            f"skills={missing_skills}"
        )

    if jobs["job_id"].isna().any():
        raise ValueError("Missing Job IDs")

    if jobs["job_id"].duplicated().any():
        raise ValueError("Duplicate Job IDs")

    if job_skills["job_id"].isna().any():
        raise ValueError("Missing job IDs in job_skills")

    if job_skills["skill"].isna().any():
        raise ValueError("Missing skill names")

    if not job_skills["job_id"].isin(jobs["job_id"]).all():
        raise ValueError("Orphan job-skill relationships")

    print("Input checks passed.")


# =====================================
# 3. Import jobs
# =====================================

def import_jobs(cur, jobs):
    print("\n[3] Importing jobs...")

    columns = [
        col for col in JOB_COLUMNS
        if col in jobs.columns
    ]

    insert_query = sql.SQL("""
        INSERT INTO jobs ({columns})
        VALUES ({placeholders})
        ON CONFLICT (job_id)
        DO NOTHING
    """).format(
        columns=sql.SQL(", ").join(
            sql.Identifier(col) for col in columns
        ),
        placeholders=sql.SQL(", ").join(
            sql.Placeholder() for _ in columns
        ),
    )

    records = []

    for row in jobs[columns].itertuples(
        index=False,
        name=None,
    ):
        record = []

        for column, value in zip(columns, row):
            if column in (
                "salary_is_usable",
                "salary_is_predicted",
            ):
                record.append(parse_boolean(value))

            elif column in ("job_id", "skill_count"):
                record.append(
                    None if pd.isna(value) else int(value)
                )

            else:
                record.append(clean_value(value))

        records.append(tuple(record))

    cur.executemany(insert_query, records)

    print(f"Processed {len(records)} job records.")


# =====================================
# 4. Import unique skills
# =====================================

def import_skills(cur, job_skills):
    print("\n[4] Importing unique skills...")

    skill_names = sorted(
        set(
            job_skills["skill"]
            .dropna()
            .astype(str)
            .str.strip()
        ) - {""}
    )

    query = """
        INSERT INTO skills (skill_name)
        VALUES (%s)
        ON CONFLICT (skill_name)
        DO NOTHING
    """

    cur.executemany(
        query,
        [(name,) for name in skill_names],
    )

    print(f"Processed {len(skill_names)} unique skills.")


# =====================================
# 5. Import job-skill relationships
# =====================================

def import_job_skills(cur, job_skills):
    print("\n[5] Importing job-skill relationships...")

    cur.execute("""
        SELECT skill_id, skill_name
        FROM skills
    """)

    skill_lookup = {
        name: skill_id
        for skill_id, name in cur.fetchall()
    }

    records = []

    for row in job_skills.itertuples(index=False):
        skill_name = str(row.skill).strip()

        if skill_name not in skill_lookup:
            raise ValueError(
                f"Skill not found: {skill_name}"
            )

        records.append((
            int(row.job_id),
            skill_lookup[skill_name],
        ))

    query = """
        INSERT INTO job_skills (job_id, skill_id)
        VALUES (%s, %s)
        ON CONFLICT (job_id, skill_id)
        DO NOTHING
    """

    cur.executemany(query, records)

    print(f"Processed {len(records)} relationships.")


# =====================================
# 6. Verify database counts
# =====================================

def verify_import(cur):
    print("\n[6] Verifying database...")

    for table in ("jobs", "skills", "job_skills"):
        query = sql.SQL(
            "SELECT COUNT(*) FROM {}"
        ).format(sql.Identifier(table))

        cur.execute(query)

        count = cur.fetchone()[0]

        print(f"{table}: {count}")


# =====================================
# 7. Main
# =====================================

def main():
    print("=" * 55)
    print("AUSTRALIAN TECH JOB MARKET")
    print("CSV TO POSTGRESQL IMPORT")
    print("=" * 55)

    jobs, job_skills = load_csv_files()

    validate_input(jobs, job_skills)

    print("\nConnecting to PostgreSQL...")

    # Transaction commits only if all steps succeed.
    # Exceptions trigger automatic rollback.

    with get_connection() as conn:
        with conn.cursor() as cur:
            import_jobs(cur, jobs)
            import_skills(cur, job_skills)
            import_job_skills(cur, job_skills)
            verify_import(cur)

    print("\nIMPORT COMPLETED SUCCESSFULLY")


if __name__ == "__main__":
    main()
