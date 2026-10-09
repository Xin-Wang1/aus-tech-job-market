
import os
from pathlib import Path

import psycopg
from dotenv import load_dotenv


BACKEND_DIR = Path(__file__).resolve().parents[1]

# load_dotenv(BACKEND_DIR / ".env")
load_dotenv(BACKEND_DIR / ".env", override=True)

def main():
    print("Testing PostgreSQL connection...")

    with psycopg.connect(
        host=os.getenv("DB_HOST", "localhost"),
        port=os.getenv("DB_PORT", "5432"),
        dbname=os.getenv("DB_NAME"),
        user=os.getenv("DB_USER"),
        password=os.getenv("DB_PASSWORD"),
        connect_timeout=10,
    ) as conn:

        with conn.cursor() as cur:
            cur.execute("""
                SELECT current_database(), current_user;
            """)

            database, user = cur.fetchone()

            print("Connection successful!")
            print(f"Database: {database}")
            print(f"User: {user}")


if __name__ == "__main__":
    main()
