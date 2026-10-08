
from skill_extractor import extract_skills


def check(title, description, expected):
    actual = extract_skills(title, description)

    assert actual == sorted(
        expected,
        key=str.casefold,
    ), (
        f"\nTitle: {title}\n"
        f"Expected: {expected}\n"
        f"Actual: {actual}"
    )

    print(f"PASS: {title} -> {actual}")


# Frontend development
check(
    "Frontend Developer",
    "Experience with React, TypeScript and JavaScript.",
    ["React", "TypeScript", "JavaScript"],
)

# Full-stack development
check(
    "Full Stack Developer",
    "React, Node.js, PostgreSQL, Docker and AWS.",
    ["React", "Node.js", "PostgreSQL", "Docker", "AWS"],
)

# Data analysis
check(
    "Data Analyst",
    "Strong SQL, Python, Excel and Power BI skills.",
    ["SQL", "Python", "Excel", "Power BI"],
)

# IT support
check(
    "IT Support Officer",
    "Experience with Microsoft 365, Active Directory, Windows and DNS.",
    [
        "Microsoft 365",
        "Active Directory",
        "Windows",
        "Networking",
    ],
)

# Skill aliases
check(
    "Support Engineer",
    "Experience with M365, O365 and Entra ID.",
    ["Microsoft 365", "Active Directory"],
)

# Avoid matching partial words
check(
    "Developer",
    "We are developing a new application.",
    [],
)

# Duplicate skill mentions
check(
    "Python Developer",
    "Python and PYTHON are required.",
    ["Python"],
)

# Missing values
check(
    None,
    None,
    [],
)

print("\nAll skill extraction tests passed!")
