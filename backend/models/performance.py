from database.db import get_connection
from datetime import datetime

def create_performance_table():
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS performance (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            student_id INTEGER,
            teacher_id INTEGER,
            subject TEXT,
            semester TEXT,
            marks INTEGER,
            attendance INTEGER,
            recorded_at TEXT,
            FOREIGN KEY (student_id) REFERENCES students(id),
            FOREIGN KEY (teacher_id) REFERENCES users(id)
        )
    """)

    conn.commit()
    conn.close()


def get_or_create_student(cursor, roll_number):
    # Check if user exists
    cursor.execute(
        "SELECT id FROM users WHERE roll_number = ?",
        (roll_number,)
    )
    user = cursor.fetchone()

    if not user:
        cursor.execute(
            "INSERT INTO users (roll_number, password_hash, role) VALUES (?, ?, 'student')",
            (roll_number, "default123")
        )
        user_id = cursor.lastrowid
    else:
        user_id = user["id"]

    cursor.execute(
        "SELECT id FROM students WHERE user_id = ?",
        (user_id,)
    )
    student = cursor.fetchone()

    if not student:
        cursor.execute(
            "INSERT INTO students (user_id, name, department, section, batch) VALUES (?, ?, ?, ?, ?)",
            (user_id, roll_number, "BTECH", "A", "2024")
        )
        student_id = cursor.lastrowid
    else:
        student_id = student["id"]

    return student_id


def insert_performance_data(rows, semester, teacher_id):
    conn = get_connection()
    cursor = conn.cursor()

    count = 0

    for row in rows:
        roll = row["student_id"]
        subject = row["subject"]
        marks = int(row["marks"])
        attendance = int(row["attendance"])

        student_id = get_or_create_student(cursor, roll)

        cursor.execute("""
            SELECT id FROM performance
            WHERE student_id = ? AND subject = ? AND semester = ? AND teacher_id = ?
        """, (student_id, subject, semester, teacher_id))

        existing = cursor.fetchone()

        if existing:
            cursor.execute("""
                UPDATE performance
                SET marks = ?, attendance = ?, recorded_at = ?
                WHERE id = ?
            """, (
                marks,
                attendance,
                datetime.now().isoformat(),
                existing["id"]
            ))
        else:
            cursor.execute("""
                INSERT INTO performance
                (student_id, teacher_id, subject, semester, marks, attendance, recorded_at)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            """, (
                student_id,
                teacher_id,
                subject,
                semester,
                marks,
                attendance,
                datetime.now().isoformat()
            ))
            count += 1

    conn.commit()
    conn.close()

    return count


def get_all_performance_data(teacher_id):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT 
            s.id as student_id,
            u.roll_number,
            s.name,
            p.subject,
            p.semester,
            p.marks,
            p.attendance,
            p.recorded_at
        FROM performance p
        JOIN students s ON p.student_id = s.id
        JOIN users u ON s.user_id = u.id
        WHERE p.teacher_id = ?
    """, (teacher_id,))

    rows = cursor.fetchall()
    conn.close()

    return [dict(row) for row in rows]

def get_average_marks(teacher_id):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT AVG(marks) as avg_marks
        FROM performance
        WHERE teacher_id = ?
    """, (teacher_id,))

    result = cursor.fetchone()
    conn.close()

    return round(result["avg_marks"] or 0, 2)


def get_average_attendance(teacher_id):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT AVG(attendance) as avg_att
        FROM performance
        WHERE teacher_id = ?
    """, (teacher_id,))

    result = cursor.fetchone()
    conn.close()

    return round(result["avg_att"] or 0, 2)


def get_pass_fail_count(teacher_id):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT 
            SUM(CASE WHEN marks >= 40 THEN 1 ELSE 0 END) as pass,
            SUM(CASE WHEN marks < 40 THEN 1 ELSE 0 END) as fail
        FROM performance
        WHERE teacher_id = ?
    """, (teacher_id,))

    result = cursor.fetchone()
    conn.close()

    return {
        "pass": result["pass"] or 0,
        "fail": result["fail"] or 0
    }


def calculate_risk(avg_marks, avg_attendance):
    risk = 0
    if avg_marks < 40:
        risk += 50
    elif avg_marks < 60:
        risk += 25
    if avg_attendance < 75:
        risk += 30
    return min(risk, 100)


def get_at_risk_students(teacher_id):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT 
            s.id as student_id,
            u.roll_number,
            AVG(p.marks) as avg_marks,
            AVG(p.attendance) as avg_attendance,
            COUNT(p.subject) as subject_count
        FROM performance p
        JOIN students s ON p.student_id = s.id
        JOIN users u ON s.user_id = u.id
        WHERE p.teacher_id = ?
        GROUP BY s.id
    """, (teacher_id,))

    rows = cursor.fetchall()
    conn.close()

    results = []

    for r in rows:
        avg_marks = round(r["avg_marks"] or 0, 2)
        avg_att = round(r["avg_attendance"] or 0, 2)

        risk_score = calculate_risk(avg_marks, avg_att)

        if risk_score > 0:
            results.append({
                "student_id": r["student_id"],
                "roll_number": r["roll_number"],
                "subject_count": r["subject_count"],
                "average_marks": avg_marks,
                "average_attendance": avg_att,
                "risk_score": risk_score,
                "risk_level": "High" if risk_score > 60 else "Medium"
            })

    return results
# 🔹 SIMPLE TREND-BASED PREDICTION
def predict_next_marks(student_id):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT marks
        FROM performance
        WHERE student_id = ?
        ORDER BY recorded_at
    """, (student_id,))

    rows = cursor.fetchall()
    conn.close()

    if not rows:
        return 0

    if len(rows) == 1:
        return rows[0]["marks"]

    improvements = []
    for i in range(1, len(rows)):
        improvements.append(rows[i]["marks"] - rows[i - 1]["marks"])

    avg_change = sum(improvements) / len(improvements)

    return round(rows[-1]["marks"] + avg_change, 2)
