
import re


# -----------------------------------
# Job title classification rules
# -----------------------------------

ROLE_PATTERNS = {
    "Full Stack Developer": [
        r"\bfull[\s-]?stack\b",
        r"\bfullstack\b",
    ],

    "Frontend Developer": [
        r"\bfront[\s-]?end\b",
        r"\bfrontend\b",
        r"\breact developer\b",
        r"\breact engineer\b",
        r"\bangular developer\b",
        r"\bvue(?:\.js)? developer\b",
        r"\bjavascript ui developer\b",
    ],

    "Data Analyst": [
        r"\bdata analyst\b",
        r"\bdata analytics analyst\b",
        r"\bbusiness intelligence analyst\b",
        r"\bbi analyst\b",
        r"\breporting analyst\b",
    ],

    "IT Support": [
        r"\bit support\b",
        r"\bit service desk\b",
        r"\bservice desk\b",
        r"\bhelp[\s-]?desk\b",
        r"\bdesktop support\b",
        r"\btechnical support\b",
        r"\bsupport technician\b",
        r"\bit support officer\b",
        r"\bit support engineer\b",
    ],

    "Software Engineer": [
        r"\bsoftware engineer\b",
        r"\bsoftware developer\b",
        r"\bbackend developer\b",
        r"\bback[\s-]?end engineer\b",
        r"\bpython developer\b",
        r"\bjava developer\b",
        r"\bnet developer\b",
        r"\b\.net developer\b",
        r"\bapplication developer\b",
    ],
}


# -----------------------------------
# Classify one job title
# -----------------------------------

def classify_job_title(title):
    if not isinstance(title, str):
        return "Other"

    cleaned_title = title.strip().lower()

    if not cleaned_title:
        return "Other"

    for role, patterns in ROLE_PATTERNS.items():
        for pattern in patterns:
            if re.search(
                pattern,
                cleaned_title,
                flags=re.IGNORECASE,
            ):
                return role

    return "Other"


# -----------------------------------
# Check whether classification matched
# -----------------------------------

def classification_status(role):
    if role == "Other":
        return "unclassified"

    return "classified"
