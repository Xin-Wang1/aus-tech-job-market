
import re


# -----------------------------------
# Skill dictionary
# -----------------------------------

SKILL_PATTERNS = {
    # Programming languages
    "Python": [
        r"\bpython\b",
    ],
    "JavaScript": [
        r"\bjavascript\b",
        r"\bjava\s*script\b",
    ],
    "TypeScript": [
        r"\btypescript\b",
    ],
    "Java": [
        r"\bjava\b",
    ],
    "C#": [
        r"(?<!\w)c#(?!\w)",
        r"\bc\s*sharp\b",
    ],
    "PHP": [
        r"\bphp\b",
    ],

    # Frontend
    "React": [
        r"\breact(?:\.js)?\b",
    ],
    "Angular": [
        r"\bangular\b",
    ],
    "Vue.js": [
        r"\bvue(?:\.js)?\b",
    ],
    "Next.js": [
        r"\bnext\.js\b",
        r"\bnextjs\b",
    ],
    "HTML": [
        r"\bhtml(?:5)?\b",
    ],
    "CSS": [
        r"\bcss(?:3)?\b",
    ],
    "Tailwind CSS": [
        r"\btailwind(?:\s+css)?\b",
    ],

    # Backend
    "Node.js": [
        r"\bnode\.js\b",
        r"\bnodejs\b",
    ],
    "Django": [
        r"\bdjango\b",
    ],
    "Flask": [
        r"\bflask\b",
    ],
    "FastAPI": [
        r"\bfastapi\b",
    ],

    # Databases and analytics
    "SQL": [
        r"\bsql\b",
    ],
    "PostgreSQL": [
        r"\bpostgresql\b",
        r"\bpostgres\b",
    ],
    "MySQL": [
        r"\bmysql\b",
    ],
    "Power BI": [
        r"\bpower\s*bi\b",
    ],
    "Tableau": [
        r"\btableau\b",
    ],
    "Excel": [
        r"\bexcel\b",
        r"\bmicrosoft\s+excel\b",
    ],

    # Cloud and DevOps
    "AWS": [
        r"\baws\b",
        r"\bamazon\s+web\s+services\b",
    ],
    "Azure": [
        r"\bazure\b",
        r"\bmicrosoft\s+azure\b",
    ],
    "Docker": [
        r"\bdocker\b",
    ],
    "Kubernetes": [
        r"\bkubernetes\b",
        r"\bk8s\b",
    ],
    "Git": [
        r"\bgit\b",
    ],
    "GitHub": [
        r"\bgithub\b",
    ],
    "CI/CD": [
        r"\bci\s*/\s*cd\b",
        r"\bcontinuous\s+integration\b",
    ],

    # IT Support
    "Windows": [
        r"\bwindows\b",
        r"\bwindows\s+11\b",
    ],
    "Microsoft 365": [
        r"\bmicrosoft\s*365\b",
        r"\bm365\b",
        r"\boffice\s*365\b",
        r"\bo365\b",
    ],
    "Active Directory": [
        r"\bactive\s+directory\b",
        r"\bentra\s+id\b",
    ],
    "Networking": [
        r"\bnetworking\b",
        r"\btcp\s*/\s*ip\b",
        r"\bdns\b",
        r"\bdhcp\b",
    ],
    "Linux": [
        r"\blinux\b",
    ],
    "PowerShell": [
        r"\bpowershell\b",
    ],
    "ServiceNow": [
        r"\bservicenow\b",
    ],
    "Jira": [
        r"\bjira\b",
    ],
}


# Compile patterns once for efficiency
COMPILED_SKILLS = {
    skill: [
        re.compile(pattern, flags=re.IGNORECASE)
        for pattern in patterns
    ]
    for skill, patterns in SKILL_PATTERNS.items()
}


def extract_skills(title, description):
    """
    Extract unique technical skills from a job title
    and job description.

    Returns a sorted list of canonical skill names.
    """

    title_text = title if isinstance(title, str) else ""
    description_text = (
        description if isinstance(description, str) else ""
    )

    text = f"{title_text} {description_text}"

    if not text.strip():
        return []

    matched_skills = set()

    for skill, patterns in COMPILED_SKILLS.items():
        if any(
            pattern.search(text)
            for pattern in patterns
        ):
            matched_skills.add(skill)

    return sorted(matched_skills, key=str.casefold)
