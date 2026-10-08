
from salary_cleaner import clean_salary


def check(
    minimum,
    maximum,
    description,
    predicted,
    expected_status,
    expected_annual_min=None,
):
    result = clean_salary(
        minimum,
        maximum,
        description,
        predicted,
    )

    assert result["salary_status"] == expected_status, (
        f"Expected {expected_status}, "
        f"got {result['salary_status']}"
    )

    if expected_annual_min is not None:
        assert (
            result["salary_annual_min"]
            == expected_annual_min
        )

    print(f"PASS: {expected_status}")


# Missing salary
check(
    None, None, "", 0,
    "missing",
)

# Unknown unit
check(
    85, 85, "IT Support Officer", 0,
    "unknown_unit",
)

# Confirmed hourly unit
check(
    40, 50, "Salary: $40 to $50 per hour", 0,
    "usable",
    79040,
)

# Confirmed annual unit
check(
    85000, 90000,
    "Annual salary: $85,000 to $90,000",
    0,
    "usable",
    85000,
)

# Predicted salary
check(
    85000, 90000,
    "Annual salary",
    1,
    "predicted",
)

# Invalid range
check(
    100000, 80000,
    "Annual salary",
    0,
    "invalid",
)

# Ambiguous units
check(
    85, 85,
    "Annual salary plus $85 per hour consulting",
    0,
    "ambiguous_unit",
)

# Missing prediction flag
check(
    85000, 90000,
    "Annual salary",
    None,
    "prediction_unknown",
)

print("\nAll salary cleaning tests passed!")
