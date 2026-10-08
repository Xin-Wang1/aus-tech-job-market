
from pathlib import Path
import re

import pandas as pd
from job_classifier import (
    classify_job_title,
    classification_status,
)
from salary_cleaner import clean_salary
from skill_extractor import extract_skills

# -----------------------------------
# 1. Project paths
# -----------------------------------

BACKEND_DIR = Path(__file__).resolve().parents[1]

RAW_DIR = BACKEND_DIR / "data" / "raw"
PROCESSED_DIR = BACKEND_DIR / "data" / "processed"
REPORT_DIR = BACKEND_DIR / "reports"

PROCESSED_DIR.mkdir(parents=True, exist_ok=True)
REPORT_DIR.mkdir(parents=True, exist_ok=True)


# -----------------------------------
# 2. City mapping
# -----------------------------------

CITY_ALIASES = {
    "Melbourne": [
        "melbourne",
        "melbourne cbd",
        "melbourne city",
    ],
    "Sydney": [
        "sydney",
        "sydney cbd",
        "sydney city",
    ],
    "Brisbane": [
        "brisbane",
        "brisbane cbd",
        "brisbane city",
    ],
    "Perth": [
        "perth",
        "perth cbd",
        "perth region",
    ],
    "Adelaide": [
        "adelaide",
        "adelaide cbd",
    ],
    "Canberra": [
        "canberra",
    ],
    "Hobart": [
        "hobart",
    ],
    "Darwin": [
        "darwin",
    ],
    "Gold Coast": [
        "gold coast",
        "gold coast city",
    ],
    "Geelong": [
        "geelong",
    ],
    "Newcastle": [
        "newcastle",
    ],
    "Wollongong": [
        "wollongong",
    ],
}


# -----------------------------------
# 3. Normalise location
# -----------------------------------

def normalise_location(value):
    if pd.isna(value):
        return "Unknown", "unknown"

    location = str(value).strip().lower()

    if not location:
        return "Unknown", "unknown"

    # Match complete city names, not partial words
    matched_cities = set()

    for city, aliases in CITY_ALIASES.items():
        for alias in aliases:
            pattern = (
                r"(?<!\w)"
                + re.escape(alias)
                + r"(?!\w)"
            )

            if re.search(pattern, location):
                matched_cities.add(city)
                break

    if len(matched_cities) == 1:
        return matched_cities.pop(), "matched"

    if len(matched_cities) > 1:
        return "Unknown", "ambiguous"

    return "Unknown", "unknown"


# -----------------------------------
# 4. Load latest raw dataset
# -----------------------------------

csv_files = sorted(
    RAW_DIR.glob("adzuna_jobs_*.csv"),
    key=lambda file: file.stat().st_mtime,
    reverse=True,
)

if not csv_files:
    raise FileNotFoundError(
        "No raw Adzuna CSV files found."
    )

input_file = csv_files[0]

print("=" * 60)
print("AUSTRALIAN TECH JOB MARKET")
print("LOCATION STANDARDISATION")
print("=" * 60)

print(f"\nInput file: {input_file.name}")

df = pd.read_csv(
    input_file,
    dtype={"job_id": "string"},
)

print(f"Original records: {len(df)}")


# -----------------------------------
# 5. Basic cleaning
# -----------------------------------

# Remove completely duplicated records
df = df.drop_duplicates()

# Remove repeated job IDs
df = df.drop_duplicates(
    subset=["job_id"],
    keep="first",
)

# Remove records without a valid job ID
df = df[
    df["job_id"].notna()
    & df["job_id"].str.strip().ne("")
].copy()

print(f"Records after deduplication: {len(df)}")


# -----------------------------------
# 6. Standardise cities
# -----------------------------------

results = df["location"].apply(
    normalise_location
)

df["city"] = results.apply(
    lambda result: result[0]
)

df["location_status"] = results.apply(
    lambda result: result[1]
)

# -----------------------------------
# Job title classification
# -----------------------------------

df["role_category"] = df["title"].apply(
    classify_job_title
)

df["classification_status"] = df[
    "role_category"
].apply(
    classification_status
)


# -----------------------------------
# Salary cleaning
# -----------------------------------

salary_results = df.apply(
    lambda row: clean_salary(
        salary_min=row["salary_min"],
        salary_max=row["salary_max"],
        description=row["description"],
        salary_is_predicted=row["salary_is_predicted"],
    ),
    axis=1,
)

salary_df = pd.DataFrame(
    salary_results.tolist(),
    index=df.index,
)

df = pd.concat(
    [df, salary_df],
    axis=1,
)

print("\n[SALARY CLEANING]")

print(
    df["salary_status"]
    .value_counts(dropna=False)
    .to_string()
)

print("\nUsable salary records:")

print(
    df["salary_is_usable"]
    .value_counts(dropna=False)
    .to_string()
)


# -----------------------------------
# Skill extraction
# -----------------------------------

df["skills_list"] = df.apply(
    lambda row: extract_skills(
        title=row["title"],
        description=row["description"],
    ),
    axis=1,
)

df["skills"] = df["skills_list"].apply(
    lambda skills: ", ".join(skills)
)

df["skill_count"] = df["skills_list"].apply(
    len
)

df["skills_source"] = "title_and_description"

df["skills_extraction_method"] = "rule_based_v1"


print("\n[SKILLS EXTRACTION]")

print(
    f"Jobs with at least one skill: "
    f"{(df['skill_count'] > 0).sum()}"
)

print(
    f"Jobs without detected skills: "
    f"{(df['skill_count'] == 0).sum()}"
)

print(
    f"Average detected skills per job: "
    f"{df['skill_count'].mean():.2f}"
)


print("\n[JOB TITLE CLASSIFICATION]")

print(
    df["role_category"]
    .value_counts()
    .to_string()
)

print("\nClassification status:")

print(
    df["classification_status"]
    .value_counts()
    .to_string()
)

# -----------------------------------
# 7. Generate quality report
# -----------------------------------

print("\n[1] CITY DISTRIBUTION")

city_counts = df["city"].value_counts(
    dropna=False
)

print(city_counts.to_string())

print("\n[2] LOCATION STATUS")

status_counts = df[
    "location_status"
].value_counts()

print(status_counts.to_string())


# -----------------------------------
# 8. Export unmatched locations
# -----------------------------------

unmatched = df[
    df["location_status"] != "matched"
][
    [
        "job_id",
        "title",
        "location",
        "location_status",
    ]
]

unmatched.to_csv(
    REPORT_DIR / "unmatched_locations.csv",
    index=False,
    encoding="utf-8-sig",
)

# -----------------------------------
# Export unclassified job titles
# -----------------------------------

unclassified = df[
    df["classification_status"] == "unclassified"
][
    [
        "job_id",
        "search_term",
        "title",
        "role_category",
    ]
]

unclassified.to_csv(
    REPORT_DIR / "unclassified_jobs.csv",
    index=False,
    encoding="utf-8-sig",
)


# -----------------------------------
# Export salary review report
# -----------------------------------

salary_review = df[
    df["salary_status"] != "missing"
][
    [
        "job_id",
        "title",
        "salary_min",
        "salary_max",
        "salary_is_predicted",
        "salary_unit",
        "salary_status",
        "salary_annual_min",
        "salary_annual_max",
        "salary_is_usable",
    ]
]

salary_review.to_csv(
    REPORT_DIR / "salary_review.csv",
    index=False,
    encoding="utf-8-sig",
)


# -----------------------------------
# Export job-skill relationships
# -----------------------------------

job_skills = df[
    [
        "job_id",
        "role_category",
        "city",
        "skills_list",
    ]
].explode("skills_list")

job_skills = job_skills.dropna(
    subset=["skills_list"]
)

job_skills = job_skills.rename(
    columns={"skills_list": "skill"}
)

job_skills = job_skills.drop_duplicates(
    subset=["job_id", "skill"]
)

job_skills.to_csv(
    PROCESSED_DIR / "job_skills.csv",
    index=False,
    encoding="utf-8-sig",
)

print(f"Job-skill relationships: {len(job_skills)}")

# -----------------------------------
# 9. Save cleaned dataset
# -----------------------------------

output_file = (
    PROCESSED_DIR / "cleaned_jobs.csv"
)

df.drop(
    columns=["skills_list"]
).to_csv(
    output_file,
    index=False,
    encoding="utf-8-sig",
)

print("\n[3] OUTPUT")

print(f"Cleaned records: {len(df)}")
print(f"Saved to: {output_file}")

print("\nLocation standardisation completed!")
