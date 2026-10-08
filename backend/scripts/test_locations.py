
from clean_jobs import normalise_location


test_cases = [
    ("Melbourne, Victoria", "Melbourne", "matched"),
    ("Melbourne CBD", "Melbourne", "matched"),
    ("Sydney, NSW", "Sydney", "matched"),
    ("Brisbane, Queensland", "Brisbane", "matched"),
    ("Perth Region, WA", "Perth", "matched"),
    ("Remote - Australia", "Unknown", "unknown"),
    ("Australia", "Unknown", "unknown"),
    (
        "Sydney or Melbourne",
        "Unknown",
        "ambiguous",
    ),
]

for location, expected_city, expected_status in test_cases:
    actual_city, actual_status = normalise_location(
        location
    )

    assert actual_city == expected_city, (
        f"{location}: expected {expected_city}, "
        f"got {actual_city}"
    )

    assert actual_status == expected_status, (
        f"{location}: expected {expected_status}, "
        f"got {actual_status}"
    )

    print(f"PASS: {location} -> {actual_city}")

print("\nAll location tests passed!")
