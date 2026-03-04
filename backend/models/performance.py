from models.teacher import create_teacher_table
from models.semester import create_semester_table
from database.db import get_connection
from datetime import datetime

def create_performance_table():
    conn = get_connection()
    cursor = conn.cursor()

    # 🔹 Create table if not exists
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
            allocation_id INTEGER,
            FOREIGN KEY (student_id) REFERENCES students(id),
            FOREIGN KEY (teacher_id) REFERENCES users(id)
        )
    """)

    # 🔹 Ensure allocation_id column exists (production-safe migration)
    cursor.execute("PRAGMA table_info(performance)")
    columns = [col[1] for col in cursor.fetchall()]

    if "allocation_id" not in columns:
        cursor.execute("ALTER TABLE performance ADD COLUMN allocation_id INTEGER")

    conn.commit()
    conn.close()


def get_or_create_student(cursor, roll_number):
    from flask_bcrypt import Bcrypt
    from flask import current_app

    # 🔹 Check if user exists
    cursor.execute(
        "SELECT id FROM users WHERE roll_number = ?",
        (roll_number,)
    )
    user = cursor.fetchone()

    if not user:
        # 🔥 Hash password = roll_number
        bcrypt = Bcrypt(current_app)
        hashed_password = bcrypt.generate_password_hash(
            roll_number
        ).decode("utf-8")

        cursor.execute(
            "INSERT INTO users (roll_number, password_hash, role) VALUES (?, ?, 'student')",
            (roll_number, hashed_password)
        )

        user_id = cursor.lastrowid
    else:
        user_id = user["id"]

    # 🔹 Check if student record exists
    cursor.execute(
        "SELECT id FROM students WHERE user_id = ?",
        (user_id,)
    )
    student = cursor.fetchone()

    if not student:
        cursor.execute(
            """
            INSERT INTO students 
            (user_id, name, department, section, batch) 
            VALUES (?, ?, ?, ?, ?)
            """,
            (user_id, roll_number, "BTECH", "A", "2024")
        )
        student_id = cursor.lastrowid
    else:
        student_id = student["id"]

    return student_id
def get_or_create_subject(cursor, subject_name):
    cursor.execute(
        "SELECT id FROM subjects WHERE name = ?",
        (subject_name,)
    )

    subject = cursor.fetchone()

    if subject:
        return subject["id"]

    cursor.execute(
        "INSERT INTO subjects (name, code, credits) VALUES (?, ?, ?)",
        (subject_name, subject_name[:3].upper(), 4)
    )

    return cursor.lastrowid

def get_or_create_subject_allocation(cursor, subject_id, teacher_user_id, semester_name):
    # 🔹 Get semester id
    cursor.execute(
        "SELECT id FROM semesters WHERE name = ?",
        (semester_name,)
    )
    semester = cursor.fetchone()

    # 🔥 Auto-create semester if not exists
    if not semester:
        cursor.execute("""
            INSERT INTO semesters (name, academic_year, active_status)
            VALUES (?, ?, ?)
        """, (semester_name, "2025-2026", 1))

        semester_id = cursor.lastrowid
    else:
        semester_id = semester["id"]

    # 🔹 Get teacher id from teachers table
    cursor.execute(
        "SELECT id FROM teachers WHERE user_id = ?",
        (teacher_user_id,)
    )
    teacher = cursor.fetchone()

    # 🔥 Auto-create teacher if not exists (production safe)
    if not teacher:
        cursor.execute("""
            INSERT INTO teachers (user_id, department)
            VALUES (?, ?)
        """, (teacher_user_id, "General"))

        teacher_id = cursor.lastrowid
    else:
        teacher_id = teacher["id"]

    # 🔹 Check if allocation exists
    cursor.execute("""
        SELECT id FROM subject_allocations
        WHERE subject_id = ? AND teacher_id = ? AND semester_id = ?
    """, (subject_id, teacher_id, semester_id))

    allocation = cursor.fetchone()

    if allocation:
        return allocation["id"]

    # 🔹 Create allocation
    cursor.execute("""
        INSERT INTO subject_allocations (subject_id, teacher_id, semester_id)
        VALUES (?, ?, ?)
    """, (subject_id, teacher_id, semester_id))

    return cursor.lastrowid

def insert_performance_data(rows, semester, teacher_id):
    conn = get_connection()
    cursor = conn.cursor()

    count = 0

    for row in rows:
        roll = row["student_id"]
        subject = row["subject"]
        marks = int(row["marks"])
        attendance = int(row["attendance"])

        # 🔹 Ensure subject exists
        subject_id = get_or_create_subject(cursor, subject)

        # 🔹 Ensure student exists
        student_id = get_or_create_student(cursor, roll)

        # 🔹 Ensure subject allocation exists (NEW UPGRADE)
        allocation_id = get_or_create_subject_allocation(
            cursor,
            subject_id,
            teacher_id,
            semester
        )

        # 🔹 Keep old performance logic (safe phase)
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

def get_all_performance_data(teacher_user_id):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT 
            s.id as student_id,
            u.roll_number,
            s.name,
            sub.name as subject,
            sem.name as semester,
            p.marks,
            p.attendance,
            p.recorded_at
        FROM performance p
        JOIN students s ON p.student_id = s.id
        JOIN users u ON s.user_id = u.id
        JOIN subject_allocations sa ON p.allocation_id = sa.id
        JOIN subjects sub ON sa.subject_id = sub.id
        JOIN semesters sem ON sa.semester_id = sem.id
        JOIN teachers t ON sa.teacher_id = t.id
        WHERE t.user_id = ?
    """, (teacher_user_id,))

    rows = cursor.fetchall()
    conn.close()

    return [dict(row) for row in rows]

def get_average_marks(teacher_user_id):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT AVG(p.marks) as avg_marks
        FROM performance p
        JOIN subject_allocations sa ON p.allocation_id = sa.id
        JOIN teachers t ON sa.teacher_id = t.id
        WHERE t.user_id = ?
    """, (teacher_user_id,))

    result = cursor.fetchone()
    conn.close()

    return round(result["avg_marks"] or 0, 2)


def get_average_attendance(teacher_user_id):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT AVG(p.attendance) as avg_att
        FROM performance p
        JOIN subject_allocations sa ON p.allocation_id = sa.id
        JOIN teachers t ON sa.teacher_id = t.id
        WHERE t.user_id = ?
    """, (teacher_user_id,))

    result = cursor.fetchone()
    conn.close()

    return round(result["avg_att"] or 0, 2)


def get_pass_fail_count(teacher_user_id):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT 
            SUM(CASE WHEN p.marks >= 40 THEN 1 ELSE 0 END) as pass,
            SUM(CASE WHEN p.marks < 40 THEN 1 ELSE 0 END) as fail
        FROM performance p
        JOIN subject_allocations sa ON p.allocation_id = sa.id
        JOIN teachers t ON sa.teacher_id = t.id
        WHERE t.user_id = ?
    """, (teacher_user_id,))

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


def get_at_risk_students(teacher_user_id):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT 
            s.id as student_id,
            u.roll_number,
            AVG(p.marks) as avg_marks,
            AVG(p.attendance) as avg_attendance,
            COUNT(p.id) as subject_count
        FROM performance p
        JOIN students s ON p.student_id = s.id
        JOIN users u ON s.user_id = u.id
        JOIN subject_allocations sa ON p.allocation_id = sa.id
        JOIN teachers t ON sa.teacher_id = t.id
        WHERE t.user_id = ?
        GROUP BY s.id
    """, (teacher_user_id,))

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

def get_subject_difficulty(teacher_id):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT subject, AVG(marks) as avg_marks
        FROM performance
        WHERE teacher_id = ?
        GROUP BY subject
    """, (teacher_id,))

    rows = cursor.fetchall()
    conn.close()

    results = []

    for r in rows:
        avg = round(r["avg_marks"], 2)

        if avg < 50:
            difficulty = "Hard"
        elif avg < 70:
            difficulty = "Medium"
        else:
            difficulty = "Easy"

        results.append({
            "subject": r["subject"],
            "average_marks": avg,
            "difficulty": difficulty
        })

    return results
def migrate_performance_allocation():
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT id, subject, semester, teacher_id
        FROM performance
        WHERE allocation_id IS NULL
    """)

    rows = cursor.fetchall()

    for row in rows:
        perf_id = row["id"]
        subject_name = row["subject"]
        semester_name = row["semester"]
        teacher_user_id = row["teacher_id"]

        # Get subject_id
        subject_id = get_or_create_subject(cursor, subject_name)

        # Get allocation_id
        allocation_id = get_or_create_subject_allocation(
            cursor,
            subject_id,
            teacher_user_id,
            semester_name
        )

        # Update performance row
        cursor.execute("""
            UPDATE performance
            SET allocation_id = ?
            WHERE id = ?
        """, (allocation_id, perf_id))

    conn.commit()
    conn.close()
     
def calculate_class_health(teacher_user_id, semester_name=None):
    conn = get_connection()
    cursor = conn.cursor()

    semester_filter = ""
    params = [teacher_user_id]

    if semester_name:
        semester_filter = "AND sem.name = ?"
        params.append(semester_name)

    # Average Marks
    cursor.execute(f"""
        SELECT AVG(p.marks) as avg_marks
        FROM performance p
        JOIN subject_allocations sa ON p.allocation_id = sa.id
        JOIN teachers t ON sa.teacher_id = t.id
        JOIN semesters sem ON sa.semester_id = sem.id
        WHERE t.user_id = ?
        {semester_filter}
    """, tuple(params))
    avg_marks = cursor.fetchone()["avg_marks"] or 0

    # Average Attendance
    cursor.execute(f"""
        SELECT AVG(p.attendance) as avg_att
        FROM performance p
        JOIN subject_allocations sa ON p.allocation_id = sa.id
        JOIN teachers t ON sa.teacher_id = t.id
        JOIN semesters sem ON sa.semester_id = sem.id
        WHERE t.user_id = ?
        {semester_filter}
    """, tuple(params))
    avg_att = cursor.fetchone()["avg_att"] or 0

    # Pass Rate
    cursor.execute(f"""
        SELECT 
            SUM(CASE WHEN p.marks >= 40 THEN 1 ELSE 0 END) as pass,
            COUNT(p.id) as total
        FROM performance p
        JOIN subject_allocations sa ON p.allocation_id = sa.id
        JOIN teachers t ON sa.teacher_id = t.id
        JOIN semesters sem ON sa.semester_id = sem.id
        WHERE t.user_id = ?
        {semester_filter}
    """, tuple(params))
    result = cursor.fetchone()

    pass_count = result["pass"] or 0
    total = result["total"] or 1
    pass_rate = (pass_count / total) * 100

    # Risk Distribution
    at_risk = len(get_at_risk_students(teacher_user_id))
    risk_penalty = max(0, 100 - (at_risk * 5))

    conn.close()

    health_score = (
        (avg_marks * 0.4) +
        (avg_att * 0.3) +
        (pass_rate * 0.2) +
        (risk_penalty * 0.1)
    )

    health_score = round(min(health_score, 100), 2)

    if health_score >= 80:
        status = "Healthy"
    elif health_score >= 60:
        status = "Moderate"
    else:
        status = "Critical"

    return {
        "health_score": health_score,
        "status": status,
        "semester": semester_name if semester_name else "All"
    }

def get_semester_trend(teacher_user_id):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT DISTINCT sem.name as semester
        FROM performance p
        JOIN subject_allocations sa ON p.allocation_id = sa.id
        JOIN teachers t ON sa.teacher_id = t.id
        JOIN semesters sem ON sa.semester_id = sem.id
        WHERE t.user_id = ?
        ORDER BY sem.name
    """, (teacher_user_id,))

    semesters = cursor.fetchall()
    conn.close()

    trend_data = []

    for s in semesters:
        semester_name = s["semester"]
        result = calculate_class_health(teacher_user_id, semester_name)
        trend_data.append({
            "semester": semester_name,
            "health_score": result["health_score"],
            "status": result["status"]
        })

    return trend_data

def generate_interventions(teacher_user_id):
    at_risk_students = get_at_risk_students(teacher_user_id)

    interventions = []

    for student in at_risk_students:
        risk_score = student["risk_score"]
        avg_marks = student["average_marks"]
        avg_att = student["average_attendance"]

        if risk_score >= 60:
            priority = "Immediate"
            recommendation = "Schedule 1-on-1 mentoring and assign remedial tasks."
        elif risk_score >= 30:
            priority = "Monitor"
            recommendation = "Provide additional practice materials and monitor weekly."
        else:
            priority = "Low"
            recommendation = "Encourage consistent performance."

        # Extra intelligence layer
        if avg_att < 60:
            recommendation += " Focus on improving attendance."
        if avg_marks < 40:
            recommendation += " Provide subject-specific doubt clearing sessions."

        interventions.append({
            "student_id": student["student_id"],
            "roll_number": student["roll_number"],
            "risk_level": student["risk_level"],
            "risk_score": student["risk_score"],
            "priority": priority,
            "recommendation": recommendation
        })

    return interventions

def generate_comparative_insight(teacher_user_id):
    trend_data = get_semester_trend(teacher_user_id)

    if len(trend_data) < 2:
        return {
            "message": "Not enough semester data for comparison."
        }

    # Sort semesters numerically (if they are numbers)
    trend_data = sorted(trend_data, key=lambda x: int(x["semester"]))

    previous = trend_data[-2]
    current = trend_data[-1]

    prev_score = previous["health_score"]
    curr_score = current["health_score"]

    difference = round(curr_score - prev_score, 2)

    percentage_change = round((difference / prev_score) * 100, 2) if prev_score != 0 else 0

    if difference > 0:
        trend = "Improvement"
        insight = "Class performance improved compared to previous semester."
    elif difference < 0:
        trend = "Decline"
        insight = "Class health declined significantly. Attendance and academic performance need review."
    else:
        trend = "Stable"
        insight = "Class performance remained stable across semesters."

    return {
        "previous_semester": previous["semester"],
        "current_semester": current["semester"],
        "previous_score": prev_score,
        "current_score": curr_score,
        "difference": difference,
        "percentage_change": percentage_change,
        "trend": trend,
        "insight": insight
    }