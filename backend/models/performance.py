from database.db import get_connection
from datetime import datetime

def create_performance_table():
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS performance (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            student_id TEXT,
            subject TEXT,
            semester TEXT,
            marks INTEGER,
            attendance INTEGER,
            recorded_at TEXT
        )
    """)

    conn.commit()
    conn.close()


def insert_performance_data(rows):
    conn = get_connection()
    cursor = conn.cursor()

    for row in rows:
        cursor.execute("""
            INSERT INTO performance
            (student_id, subject, semester, marks, attendance, recorded_at)
            VALUES (?, ?, ?, ?, ?, ?)
        """, (
            row["student_id"],
            row["subject"],
            row["semester"],
            int(row["marks"]),
            int(row["attendance"]),
            datetime.now().isoformat()
        ))

    conn.commit()
    conn.close()


def get_all_performance_data():
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT student_id, subject, semester, marks, attendance, recorded_at
        FROM performance
        ORDER BY recorded_at
    """)

    rows = cursor.fetchall()
    conn.close()

    return [
        {
            "student_id": r[0],
            "subject": r[1],
            "semester": r[2],
            "marks": r[3],
            "attendance": r[4],
            "recorded_at": r[5],
        }
        for r in rows
    ]


def get_average_marks():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT AVG(marks) FROM performance")
    avg = cursor.fetchone()[0]
    conn.close()
    return round(avg, 2) if avg else 0


def get_average_attendance():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT AVG(attendance) FROM performance")
    avg = cursor.fetchone()[0]
    conn.close()
    return round(avg, 2) if avg else 0


def get_pass_fail_count():
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT
            SUM(CASE WHEN marks >= 40 THEN 1 ELSE 0 END),
            SUM(CASE WHEN marks < 40 THEN 1 ELSE 0 END)
        FROM performance
    """)

    passed, failed = cursor.fetchone()
    conn.close()

    return {
        "passed": passed or 0,
        "failed": failed or 0
    }


def get_at_risk_students():
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT student_id, subject, marks, attendance
        FROM performance
        WHERE marks < 40 OR attendance < 75
    """)

    rows = cursor.fetchall()
    conn.close()

    return {
        "count": len(rows),
        "students": [
            {
                "student_id": r[0],
                "subject": r[1],
                "marks": r[2],
                "attendance": r[3],
            }
            for r in rows
        ]
    }


def clear_performance_data():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM performance")
    conn.commit()
    conn.close()
