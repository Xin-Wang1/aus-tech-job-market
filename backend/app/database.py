
import os
from pathlib import Path

import psycopg
from dotenv import load_dotenv


# Backend root directory
BACKEND_DIR = Path(__file__).resolve().parents[1]

# Load environment variables
load_dotenv(BACKEND_DIR / ".env", override=True)


def get_connection():
    """
    Create a PostgreSQL database connection.
    """

    return psycopg.connect(
        host=os.getenv("DB_HOST", "localhost"),
        port=os.getenv("DB_PORT", "5432"),
        dbname=os.getenv("DB_NAME"),
        user=os.getenv("DB_USER"),
        password=os.getenv("DB_PASSWORD"),
        connect_timeout=10,
    )
