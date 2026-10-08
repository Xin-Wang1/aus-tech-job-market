
import csv
import os
import sys
from datetime import datetime, timezone
from pathlib import Path

import requests
from dotenv import load_dotenv


# Project paths
BACKEND_DIR = Path(__file__).resolve().parents[1]
RAW_DIR = BACKEND_DIR / "data" / "raw"

load_dotenv(BACKEND_DIR / ".env")

APP_ID = os.getenv("ADZUNA_APP_ID")
APP_KEY = os.getenv("ADZUNA_APP_KEY")

# Small development sample
SEARCH_TERMS = [
    "Frontend Developer",
    "Data Analyst",
    "IT Support",
]

RESULTS_PER_PAGE = 20

FIELDS = [
    "job_id",
    "search_term",
    "title",
    "company",
    "location",
    "salary_min",
    "salary_max",
    "salary_is_predicted",
    "posted_date",
    "description",
    "job_url",
    "collected_at",
]


def fetch_jobs(search_term):
    url = "https://api.adzuna.com/v1/api/jobs/au/search/1"

    params = {
        "app_id": APP_ID,
        "app_key": APP_KEY,
        "results_per_page": RESULTS_PER_PAGE,
        "what": search_term,
    }

    response = requests.get(
        url,
        params=params,
        headers={"Accept": "application/json"},
        timeout=30,
    )

    # Avoid printing the request URL because it contains credentials
    response.raise_for_status()

    data = response.json()

    print(
        f"Search: {search_term} | "
        f"API reported matches: {data.get('count', 'N/A')} | "
        f"Returned: {len(data.get('results', []))}"
    )

    return data.get("results", [])


def transform_job(job, search_term, collected_at):
    return {
        "job_id": str(job.get("id", "")),
        "search_term": search_term,
        "title": job.get("title", ""),
        "company": (
            job.get("company") or {}
        ).get("display_name", ""),
        "location": (
            job.get("location") or {}
        ).get("display_name", ""),
        "salary_min": job.get("salary_min"),
        "salary_max": job.get("salary_max"),
        "salary_is_predicted": job.get(
            "salary_is_predicted"
        ),
        "posted_date": job.get("created", ""),
        "description": job.get("description", ""),
        "job_url": job.get("redirect_url", ""),
        "collected_at": collected_at,
    }


def main():
    if (
        not APP_ID
        or not APP_KEY
        or APP_ID == "your_app_id"
        or APP_KEY == "your_app_key"
    ):
        sys.exit(
            "Missing Adzuna credentials. "
            "Check backend/.env."
        )

    RAW_DIR.mkdir(parents=True, exist_ok=True)

    collected_at = datetime.now(
        timezone.utc
    ).isoformat()

    all_jobs = []
    seen_ids = set()

    for search_term in SEARCH_TERMS:
        print(f"\nFetching: {search_term}")

        try:
            results = fetch_jobs(search_term)
        except requests.exceptions.RequestException as error:
            # Do not print full request details containing API keys
            status = (
                error.response.status_code
                if isinstance(error, requests.HTTPError)
                and error.response is not None
                else None
            )
            print(
                f"Request failed for {search_term}. "
                f"HTTP status: {status or 'unknown'}"
            )
            continue

        for job in results:
            job_id = str(job.get("id", ""))

            if not job_id or job_id in seen_ids:
                continue

            seen_ids.add(job_id)

            all_jobs.append(
                transform_job(
                    job,
                    search_term,
                    collected_at,
                )
            )

    if not all_jobs:
        print(
            "\nNo jobs collected. "
            "Check API access and search results."
        )
        return

    timestamp = datetime.now(
        timezone.utc
    ).strftime("%Y%m%d_%H%M%S")

    output_path = (
        RAW_DIR / f"adzuna_jobs_{timestamp}.csv"
    )

    with output_path.open(
        "w",
        newline="",
        encoding="utf-8-sig",
    ) as file:
        writer = csv.DictWriter(
            file,
            fieldnames=FIELDS,
        )
        writer.writeheader()
        writer.writerows(all_jobs)

    print("\nCollection complete!")
    print(f"Unique jobs saved: {len(all_jobs)}")
    print(f"CSV file: {output_path}")


if __name__ == "__main__":
    main()
