from database.db import get_connection

def create_subject_allocation_table():
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS subject_allocations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            subject_id INTEGER,
            teacher_id INTEGER,
            semester_id INTEGER,
            FOREIGN KEY(subject_id) REFERENCES subjects(id),
            FOREIGN KEY(teacher_id) REFERENCES teachers(id),
            FOREIGN KEY(semester_id) REFERENCES semesters(id)
        )
    """)

    conn.commit()
    conn.close()