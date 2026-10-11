
import os
from contextlib import contextmanager
from pathlib import Path

import psycopg
from dotenv import load_dotenv


# Locate backend directory
BACKEND_DIR = Path(__file__).resolve().parents[1]

# Load environment variables
load_dotenv(BACKEND_DIR / ".env", override=True)


@contextmanager
def get_db_connection():
    """
    Create a PostgreSQL connection.

    The connection is closed automatically
    when the context manager exits.
    """

    conn = psycopg.connect(
        host=os.getenv("DB_HOST", "localhost"),
        port=os.getenv("DB_PORT", "5432"),
        dbname=os.getenv("DB_NAME"),
        user=os.getenv("DB_USER"),
        password=os.getenv("DB_PASSWORD"),
        connect_timeout=10,
    )

    try:
        yield conn
    finally:
        conn.close()
