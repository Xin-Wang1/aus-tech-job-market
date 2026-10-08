
import json
import sys
from datetime import datetime, timezone
from pathlib import Path

import pandas as pd


# -----------------------------------
# 1. Project paths
# -----------------------------------

BACKEND_DIR = Path(__file__).resolve().parents[1]

PROCESSED_DIR = BACKEND_DIR / "data" / "processed"
REPORT_DIR = BACKEND_DIR / "reports"

JOBS_FILE = PROCESSED_DIR / "cleaned_jobs.csv"
SKILLS_FILE = PROCESSED_DIR / "job_skills.csv"

REPORT_DIR.mkdir(parents=True, exist_ok=True)


# -----------------------------------
# 2. Validation settings
# -----------------------------------

VALID_ROLES = {
    "Software Engineer",
    "Data Analyst",
    "Frontend Developer",
    "Full Stack Developer",
    "IT Support",
    "Other",
}

VALID_LOCATION_STATUSES = {
    "matched",
    "unknown",
    "ambiguous",
}

REQUIRED_JOB_COLUMNS = {
    "job_id",
    "title",
    "company",
    "location",
    "city",
    "location_status",
    "role_category",
    "salary_min",
    "salary_max",
    "salary_status",
    "salary_annual_min",
    "salary_annual_max",
    "salary_midpoint",
    "salary_is_usable",
    "skills",
    "skill_count",
}

REQUIRED_SKILL_COLUMNS = {
    "job_id",
    "role_category",
    "city",
    "skill",
}


# -----------------------------------
# 3. Helper functions
# -----------------------------------

errors = []
warnings = []
checks = []


def add_check(name, passed, details=""):
    checks.append({
        "name": name,
        "passed": bool(passed),
        "details": details,
    })

    status = "PASS" if passed else "FAIL"
    print(f"[{status}] {name}")

    if details:
        print(f"       {details}")

    if not passed:
        errors.append(f"{name}: {details}")


def add_warning(message):
    warnings.append(message)
    print(f"[WARN] {message}")


def is_blank(series):
    return (
        series.isna()
        | series.astype("string").str.strip().eq("")
    ).fillna(True)


def parse_boolean(series):
    values = series.astype("string").str.lower().str.strip()

    return values.map({
        "true": True,
        "false": False,
        "1": True,
        "0": False,
    }).astype("boolean")


# -----------------------------------
# 4. Load datasets
# -----------------------------------

def main():
    print("=" * 60)
    print("AUSTRALIAN TECH JOB MARKET")
    print("FINAL DATA VALIDATION")
    print("=" * 60)

    if not JOBS_FILE.exists():
        sys.exit(f"Missing file: {JOBS_FILE}")

    if not SKILLS_FILE.exists():
        sys.exit(f"Missing file: {SKILLS_FILE}")

    jobs = pd.read_csv(
        JOBS_FILE,
        dtype={"job_id": "string"},
    )

    job_skills = pd.read_csv(
        SKILLS_FILE,
        dtype={"job_id": "string"},
    )

    print(f"\nJobs loaded: {len(jobs)}")
    print(f"Job-skill relationships: {len(job_skills)}")

    # -----------------------------------
    # 5. Required columns
    # -----------------------------------

    print("\n[1] SCHEMA VALIDATION")

    missing_job_columns = (
        REQUIRED_JOB_COLUMNS - set(jobs.columns)
    )

    missing_skill_columns = (
        REQUIRED_SKILL_COLUMNS - set(job_skills.columns)
    )

    add_check(
        "Required job columns",
        not missing_job_columns,
        f"Missing: {sorted(missing_job_columns)}",
    )

    add_check(
        "Required skill columns",
        not missing_skill_columns,
        f"Missing: {sorted(missing_skill_columns)}",
    )

    if missing_job_columns or missing_skill_columns:
        write_report(jobs, job_skills)
        sys.exit(1)

    # -----------------------------------
    # 6. Job ID validation
    # -----------------------------------

    print("\n[2] JOB ID VALIDATION")

    blank_job_ids = int(
        is_blank(jobs["job_id"]).sum()
    )

    duplicate_job_ids = int(
        jobs["job_id"].duplicated().sum()
    )

    add_check(
        "No missing Job IDs",
        blank_job_ids == 0,
        f"Missing: {blank_job_ids}",
    )

    add_check(
        "Unique Job IDs",
        duplicate_job_ids == 0,
        f"Duplicates: {duplicate_job_ids}",
    )

    # -----------------------------------
    # 7. Job category validation
    # -----------------------------------

    print("\n[3] ROLE CLASSIFICATION")

    invalid_roles = jobs[
        ~jobs["role_category"].isin(VALID_ROLES)
    ]

    add_check(
        "Valid role categories",
        len(invalid_roles) == 0,
        f"Invalid records: {len(invalid_roles)}",
    )

    other_count = int(
        (jobs["role_category"] == "Other").sum()
    )

    if other_count:
        add_warning(
            f"{other_count} jobs classified as Other"
        )

    # -----------------------------------
    # 8. Location validation
    # -----------------------------------

    print("\n[4] LOCATION VALIDATION")

    blank_cities = int(
        is_blank(jobs["city"]).sum()
    )

    invalid_location_statuses = int(
        (
            ~jobs["location_status"].isin(
                VALID_LOCATION_STATUSES
            )
        ).sum()
    )

    add_check(
        "No blank city values",
        blank_cities == 0,
        f"Blank cities: {blank_cities}",
    )

    add_check(
        "Valid location statuses",
        invalid_location_statuses == 0,
        f"Invalid statuses: {invalid_location_statuses}",
    )

    unknown_cities = int(
        (jobs["city"] == "Unknown").sum()
    )

    if unknown_cities:
        add_warning(
            f"{unknown_cities} jobs have Unknown city"
        )

    # -----------------------------------
    # 9. Salary validation
    # -----------------------------------

    print("\n[5] SALARY VALIDATION")

    usable = parse_boolean(
        jobs["salary_is_usable"]
    )

    invalid_flags = int(
        usable.isna().sum()
    )

    add_check(
        "Valid salary usability flags",
        invalid_flags == 0,
        f"Invalid flags: {invalid_flags}",
    )

    usable_mask = usable.fillna(False).astype(bool)
    usable_jobs = jobs.loc[usable_mask].copy()

    for column in [
        "salary_annual_min",
        "salary_annual_max",
        "salary_midpoint",
    ]:
        usable_jobs[column] = pd.to_numeric(
            usable_jobs[column],
            errors="coerce",
        )

    invalid_salary = (
        usable_jobs["salary_annual_min"].isna()
        | usable_jobs["salary_annual_max"].isna()
        | usable_jobs["salary_midpoint"].isna()
        | (
            usable_jobs["salary_annual_min"]
            <= 0
        )
        | (
            usable_jobs["salary_annual_min"]
            > usable_jobs["salary_annual_max"]
        )
    )

    invalid_salary_count = int(
        invalid_salary.sum()
    )

    add_check(
        "Usable salaries have valid ranges",
        invalid_salary_count == 0,
        f"Invalid usable salaries: {invalid_salary_count}",
    )

    if len(usable_jobs) > 0:
        expected_midpoint = (
            usable_jobs["salary_annual_min"]
            + usable_jobs["salary_annual_max"]
        ) / 2

        midpoint_mismatch = int(
            (
                (
                    usable_jobs["salary_midpoint"]
                    - expected_midpoint
                ).abs() > 0.02
            ).sum()
        )

        add_check(
            "Salary midpoint consistency",
            midpoint_mismatch == 0,
            f"Mismatches: {midpoint_mismatch}",
        )

    salary_coverage = (
        len(usable_jobs) / len(jobs) * 100
        if len(jobs) else 0
    )

    if salary_coverage < 50:
        add_warning(
            f"Low usable salary coverage: "
            f"{salary_coverage:.1f}%"
        )

    # -----------------------------------
    # 10. Job-skill relationships
    # -----------------------------------

    print("\n[6] SKILLS VALIDATION")

    missing_skill_job_ids = int(
        (
            ~job_skills["job_id"].isin(
                jobs["job_id"]
            )
        ).sum()
    )

    add_check(
        "All skills reference existing jobs",
        missing_skill_job_ids == 0,
        f"Orphan relationships: {missing_skill_job_ids}",
    )

    duplicate_relationships = int(
        job_skills.duplicated(
            subset=["job_id", "skill"]
        ).sum()
    )

    add_check(
        "No duplicate job-skill relationships",
        duplicate_relationships == 0,
        f"Duplicates: {duplicate_relationships}",
    )

    blank_skills = int(
        is_blank(job_skills["skill"]).sum()
    )

    add_check(
        "No blank skill names",
        blank_skills == 0,
        f"Blank skills: {blank_skills}",
    )

    # Compare recorded skill counts to relationship counts
    actual_counts = (
        job_skills.groupby("job_id")["skill"]
        .nunique()
    )

    expected_counts = pd.to_numeric(
        jobs["skill_count"],
        errors="coerce",
    )

    actual_per_job = (
        jobs["job_id"]
        .map(actual_counts)
        .fillna(0)
    )

    mismatches = int(
        (
            expected_counts.isna()
            | (expected_counts != actual_per_job)
        ).sum()
    )

    add_check(
        "Skill counts match job-skill relationships",
        mismatches == 0,
        f"Mismatched jobs: {mismatches}",
    )

    # Cross-file consistency
    job_attributes = jobs.set_index("job_id")[
        ["role_category", "city"]
    ]

    joined = job_skills.join(
        job_attributes,
        on="job_id",
        rsuffix="_job",
    )

    attribute_mismatches = int(
        (
            (
                joined["role_category"]
                != joined["role_category_job"]
            )
            | (
                joined["city"]
                != joined["city_job"]
            )
        ).fillna(True).sum()
    )

    add_check(
        "Skill role and city consistency",
        attribute_mismatches == 0,
        f"Mismatched relationships: {attribute_mismatches}",
    )

    # -----------------------------------
    # 11. Data quality warnings
    # -----------------------------------

    print("\n[7] DATA QUALITY WARNINGS")

    jobs_with_skills = int(
        (expected_counts > 0).sum()
    )

    skill_coverage = (
        jobs_with_skills / len(jobs) * 100
        if len(jobs) else 0
    )

    if skill_coverage < 70:
        add_warning(
            f"Low skill extraction coverage: "
            f"{skill_coverage:.1f}%"
        )

    if len(jobs) < 100:
        add_warning(
            "Small dataset: avoid treating sample "
            "statistics as market-wide estimates"
        )

    # -----------------------------------
    # 12. Export report
    # -----------------------------------

    print("\n[8] EXPORT VALIDATION REPORT")

    write_report(jobs, job_skills)

    failed_checks = sum(
        not check["passed"]
        for check in checks
    )

    print("\n" + "=" * 60)

    if failed_checks == 0:
        print("VALIDATION PASSED")
    else:
        print("VALIDATION FAILED")

    print(f"Checks: {len(checks)}")
    print(f"Failed: {failed_checks}")
    print(f"Warnings: {len(warnings)}")

    if failed_checks:
        sys.exit(1)


# -----------------------------------
# 13. Write JSON report
# -----------------------------------

def write_report(jobs, job_skills):
    report = {
        "generated_at": datetime.now(
            timezone.utc
        ).isoformat(),
        "dataset": {
            "jobs": int(len(jobs)),
            "job_skill_relationships": int(
                len(job_skills)
            ),
        },
        "status": (
            "passed"
            if all(check["passed"] for check in checks)
            else "failed"
        ),
        "checks": checks,
        "warnings": warnings,
        "errors": errors,
    }

    output_path = (
        REPORT_DIR / "validation_report.json"
    )

    with output_path.open(
        "w",
        encoding="utf-8",
    ) as file:
        json.dump(
            report,
            file,
            indent=2,
            ensure_ascii=False,
        )

    print(f"Report saved: {output_path}")


if __name__ == "__main__":
    main()
