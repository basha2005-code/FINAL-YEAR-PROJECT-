from database.db import get_connection

def create_semester_table():
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS semesters (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            academic_year TEXT NOT NULL,
            active_status INTEGER DEFAULT 1
        )
    """)

    conn.commit()
    conn.close()