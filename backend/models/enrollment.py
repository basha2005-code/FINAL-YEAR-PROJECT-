from database.db import get_connection

def create_enrollment_table():
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS student_semester_enrollment (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            student_id INTEGER,
            semester_id INTEGER,
            status TEXT DEFAULT 'active',
            FOREIGN KEY (student_id) REFERENCES students(id),
            FOREIGN KEY (semester_id) REFERENCES semesters(id)
        )
    """)

    conn.commit()
    conn.close()
