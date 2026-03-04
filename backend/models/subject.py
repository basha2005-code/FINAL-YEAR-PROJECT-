from database.db import get_connection

def create_subject_table():
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS subjects (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT UNIQUE NOT NULL,
            code TEXT,
            credits INTEGER DEFAULT 4
        )
    """)

    conn.commit()
    conn.close()