
import json
from pathlib import Path

from app.main import app


BACKEND_DIR = Path(__file__).resolve().parents[1]
OUTPUT_DIR = BACKEND_DIR / "docs"

OUTPUT_DIR.mkdir(
    parents=True,
    exist_ok=True,
)

output_file = OUTPUT_DIR / "openapi.json"

schema = app.openapi()

with open(
    output_file,
    "w",
    encoding="utf-8",
) as file:
    json.dump(
        schema,
        file,
        indent=2,
        ensure_ascii=False,
    )

print(f"OpenAPI schema exported: {output_file}")
print(f"Documented paths: {len(schema['paths'])}")
