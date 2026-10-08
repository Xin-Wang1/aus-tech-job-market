
import math
import re

import pandas as pd


# Salary conversion assumptions
HOURS_PER_WEEK = 38
WEEKS_PER_YEAR = 52
ANNUAL_HOURS = HOURS_PER_WEEK * WEEKS_PER_YEAR


def to_number(value):
    """Convert a value to float, or return None."""
    if pd.isna(value):
        return None

    try:
        number = float(value)
    except (ValueError, TypeError):
        return None

    if not math.isfinite(number):
        return None

    return number


def is_predicted_salary(value):
    """Interpret API prediction flags conservatively."""
    if pd.isna(value):
        return None

    if isinstance(value, str):
        value = value.strip().lower()

        if value in ("true", "1", "yes"):
            return True

        if value in ("false", "0", "no"):
            return False

        return None

    if value in (True, 1):
        return True

    if value in (False, 0):
        return False

    return None


def detect_salary_unit(description):
    """
    Detect explicit salary units from job descriptions.

    Return annual, hourly, ambiguous or unknown.
    """
    if not isinstance(description, str):
        return "unknown"

    text = description.lower()

    annual_patterns = [
        r"\bper\s+(?:year|annum)\b",
        r"\bp\.?\s*a\.?\b",
        r"\bannual\s+salary\b",
        r"\byearly\s+salary\b",
    ]

    hourly_patterns = [
        r"\bper\s+hour\b",
        r"\bp/?h\b",
        r"\bhourly\s+(?:rate|pay|salary)\b",
        r"/\s*(?:hr|hour)\b",
    ]

    annual_match = any(
        re.search(pattern, text)
        for pattern in annual_patterns
    )

    hourly_match = any(
        re.search(pattern, text)
        for pattern in hourly_patterns
    )

    if annual_match and hourly_match:
        return "ambiguous"

    if annual_match:
        return "annual"

    if hourly_match:
        return "hourly"

    return "unknown"


def clean_salary(
    salary_min,
    salary_max,
    description,
    salary_is_predicted,
):
    """
    Clean salary data without inventing missing values.
    """

    minimum = to_number(salary_min)
    maximum = to_number(salary_max)

    result = {
        "salary_unit": "missing",
        "salary_annual_min": None,
        "salary_annual_max": None,
        "salary_status": "missing",
        "salary_midpoint": None,
        "salary_is_usable": False,
    }

    # Both bounds must be available
    if minimum is None or maximum is None:
        if minimum is not None or maximum is not None:
            result["salary_status"] = "incomplete"

        return result

    if minimum <= 0 or maximum <= 0:
        result["salary_status"] = "invalid"
        return result

    if minimum > maximum:
        result["salary_status"] = "invalid"
        return result

    predicted = is_predicted_salary(
        salary_is_predicted
    )

    if predicted is True:
        result["salary_status"] = "predicted"
        return result

    if predicted is None:
        result["salary_status"] = "prediction_unknown"
        return result

    unit = detect_salary_unit(description)

    result["salary_unit"] = unit

    if unit == "ambiguous":
        result["salary_status"] = "ambiguous_unit"
        return result

    if unit == "unknown":
        result["salary_status"] = "unknown_unit"
        return result

    if unit == "hourly":
        # Plausibility checks, not proof of salary accuracy
        if not (15 <= minimum <= maximum <= 300):
            result["salary_status"] = "review_required"
            return result

        annual_min = minimum * ANNUAL_HOURS
        annual_max = maximum * ANNUAL_HOURS

    else:
        if not (
            20000 <= minimum <= maximum <= 1000000
        ):
            result["salary_status"] = "review_required"
            return result

        annual_min = minimum
        annual_max = maximum

    result.update({
        "salary_annual_min": round(annual_min, 2),
        "salary_annual_max": round(annual_max, 2),
        "salary_midpoint": round(
            (annual_min + annual_max) / 2,
            2,
        ),
        "salary_status": "usable",
        "salary_is_usable": True,
    })

    return result
