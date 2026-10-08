
from pathlib import Path
import pandas as pd


# -----------------------------------
# 1. Define file paths
# -----------------------------------

BACKEND_DIR = Path(__file__).resolve().parents[1]

RAW_DIR = BACKEND_DIR / "data" / "raw"
REPORT_DIR = BACKEND_DIR / "reports"

REPORT_DIR.mkdir(parents=True, exist_ok=True)


# -----------------------------------
# 2. Find the latest CSV file
# -----------------------------------

csv_files = sorted(
    RAW_DIR.glob("adzuna_jobs_*.csv"),
    key=lambda file: file.stat().st_mtime,
    reverse=True,
)

if not csv_files:
    raise FileNotFoundError(
        "No Adzuna CSV files found in backend/data/raw/"
    )

csv_path = csv_files[0]

print("=" * 60)
print("AUSTRALIAN TECH JOB MARKET")
print("DATA QUALITY REPORT")
print("=" * 60)

print(f"\nReading file: {csv_path.name}")


# -----------------------------------
# 3. Load dataset
# -----------------------------------

df = pd.read_csv(
    csv_path,
    dtype={"job_id": "string"},
)

print("\n[1] DATASET OVERVIEW")

print(f"Total rows: {df.shape[0]}")
print(f"Total columns: {df.shape[1]}")

print("\nColumn names:")
print(df.columns.tolist())

print("\nFirst 5 records:")
print(
    df[
        [
            "job_id",
            "search_term",
            "title",
            "company",
            "location",
        ]
    ].head().to_string(index=False)
)


# -----------------------------------
# 4. Check data types
# -----------------------------------

print("\n[2] DATA TYPES")

print(df.dtypes.to_string())


# -----------------------------------
# 5. Check missing values
# -----------------------------------

print("\n[3] MISSING VALUES")

missing_count = df.isna().sum()

missing_percentage = (
    df.isna().mean() * 100
).round(2)

missing_report = pd.DataFrame({
    "missing_count": missing_count,
    "missing_percentage": missing_percentage,
})

missing_report = missing_report.sort_values(
    by="missing_percentage",
    ascending=False,
)

print(missing_report.to_string())


# -----------------------------------
# 6. Check duplicate records
# -----------------------------------

print("\n[4] DUPLICATE RECORDS")

duplicate_ids = df.duplicated(
    subset=["job_id"]
).sum()

duplicate_rows = df.duplicated().sum()

print(f"Duplicate Job IDs: {duplicate_ids}")
print(f"Completely duplicate rows: {duplicate_rows}")


# -----------------------------------
# 7. Role distribution
# -----------------------------------

print("\n[5] SEARCH TERM DISTRIBUTION")

role_counts = df["search_term"].value_counts(
    dropna=False
)

print(role_counts.to_string())


# -----------------------------------
# 8. Location distribution
# -----------------------------------

print("\n[6] TOP 10 LOCATIONS")

location_counts = df["location"].value_counts(
    dropna=False
).head(10)

print(location_counts.to_string())


# -----------------------------------
# 9. Salary inspection
# -----------------------------------

print("\n[7] SALARY INSPECTION")

salary_columns = [
    "salary_min",
    "salary_max",
]

for column in salary_columns:
    df[column] = pd.to_numeric(
        df[column],
        errors="coerce",
    )

print("\nSalary summary:")
print(
    df[salary_columns]
    .describe()
    .to_string()
)

salary_available = df[
    salary_columns
].notna().all(axis=1).sum()

print(
    f"\nJobs with both salary bounds: "
    f"{salary_available}"
)

invalid_salary = (
    df["salary_min"].notna()
    & df["salary_max"].notna()
    & (df["salary_min"] > df["salary_max"])
).sum()

print(
    f"Jobs with minimum salary above maximum: "
    f"{invalid_salary}"
)

if "salary_is_predicted" in df.columns:
    print("\nSalary prediction flags:")
    print(
        df["salary_is_predicted"]
        .value_counts(dropna=False)
        .to_string()
    )


# -----------------------------------
# 10. Date inspection
# -----------------------------------

print("\n[8] DATE INSPECTION")

df["posted_date_parsed"] = pd.to_datetime(
    df["posted_date"],
    errors="coerce",
    utc=True,
)

print(
    "Invalid posted dates:",
    df["posted_date_parsed"].isna().sum(),
)

print(
    "Earliest posted date:",
    df["posted_date_parsed"].min(),
)

print(
    "Latest posted date:",
    df["posted_date_parsed"].max(),
)


# -----------------------------------
# 11. Export missing value report
# -----------------------------------

missing_report.to_csv(
    REPORT_DIR / "missing_values_report.csv",
    index_label="column",
)

# Export search term distribution
role_counts.rename_axis(
    "search_term"
).reset_index(
    name="job_count"
).to_csv(
    REPORT_DIR / "role_distribution.csv",
    index=False,
)

# Export location distribution
df["location"].value_counts(
    dropna=False
).rename_axis(
    "location"
).reset_index(
    name="job_count"
).to_csv(
    REPORT_DIR / "location_distribution.csv",
    index=False,
)


# -----------------------------------
# 12. Final summary
# -----------------------------------

print("\n[9] REPORT FILES CREATED")

print("missing_values_report.csv")
print("role_distribution.csv")
print("location_distribution.csv")

print("\nData inspection completed!")
