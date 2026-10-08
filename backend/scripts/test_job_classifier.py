
from job_classifier import classify_job_title


test_cases = [
    (
        "Frontend Developer",
        "Frontend Developer",
    ),
    (
        "Senior React Developer",
        "Frontend Developer",
    ),
    (
        "Full Stack Developer",
        "Full Stack Developer",
    ),
    (
        "React / Node.js Full Stack Developer",
        "Full Stack Developer",
    ),
    (
        "IT Support Officer",
        "IT Support",
    ),
    (
        "Service Desk Analyst",
        "IT Support",
    ),
    (
        "Helpdesk Technician",
        "IT Support",
    ),
    (
        "Data Analyst",
        "Data Analyst",
    ),
    (
        "Business Intelligence Analyst",
        "Data Analyst",
    ),
    (
        "Backend Software Engineer",
        "Software Engineer",
    ),
    (
        "Python Software Developer",
        "Software Engineer",
    ),
    (
        "Marketing Manager",
        "Other",
    ),
    (
        "",
        "Other",
    ),
    (
        None,
        "Other",
    ),
]


for title, expected_role in test_cases:
    actual_role = classify_job_title(title)

    assert actual_role == expected_role, (
        f"FAILED: {title!r}\n"
        f"Expected: {expected_role}\n"
        f"Actual: {actual_role}"
    )

    print(
        f"PASS: {title!r} -> {actual_role}"
    )


print("\nAll job classification tests passed!")
