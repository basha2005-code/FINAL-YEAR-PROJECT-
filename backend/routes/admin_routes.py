from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from database.db import get_connection

admin_bp = Blueprint("admin", __name__, url_prefix="/api/admin")


@admin_bp.route("/semester", methods=["POST"])
@jwt_required()
def create_semester():
    user_id = get_jwt_identity()
    claims = get_jwt()
    role = claims.get("role")

    if role != "admin":
        return jsonify({"error": "Unauthorized"}), 403

    data = request.get_json()

    name = data.get("name")
    academic_year = data.get("academic_year")

    if not name or not academic_year:
        return jsonify({"error": "Missing fields"}), 400

    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        INSERT INTO semesters (name, academic_year)
        VALUES (?, ?)
    """, (name, academic_year))

    conn.commit()
    conn.close()

    return jsonify({"message": "Semester created successfully"})


@admin_bp.route("/semesters", methods=["GET"])
@jwt_required()
def get_semesters():
    claims = get_jwt()
    role = claims.get("role")

    if role != "admin":
        return jsonify({"error": "Unauthorized"}), 403

    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM semesters")
    semesters = cursor.fetchall()
    conn.close()

    return jsonify([dict(row) for row in semesters])

@admin_bp.route("/bulk-students", methods=["POST"])
@jwt_required()
def bulk_upload_students():
    claims = get_jwt()
    role = claims.get("role")

    if role != "admin":
        return jsonify({"error": "Unauthorized"}), 403

    if "file" not in request.files:
        return jsonify({"error": "CSV file required"}), 400

    semester_id = request.form.get("semester_id")

    if not semester_id:
        return jsonify({"error": "Semester ID required"}), 400

    file = request.files["file"]

    import csv
    from io import StringIO
    from flask_bcrypt import Bcrypt

    bcrypt = Bcrypt()

    stream = StringIO(file.stream.read().decode("UTF8"), newline=None)
    reader = csv.DictReader(stream)

    conn = get_connection()
    cursor = conn.cursor()

    count = 0

    for row in reader:
        roll_number = row["roll_number"]
        name = row["name"]
        department = row["department"]
        section = row["section"]
        batch = row["batch"]
        password = row["password"]

        password_hash = bcrypt.generate_password_hash(password).decode("utf-8")

        # Insert user
        cursor.execute("""
            INSERT INTO users (roll_number, password_hash, role)
            VALUES (?, ?, ?)
        """, (roll_number, password_hash, "student"))

        user_id = cursor.lastrowid

        # Insert student
        cursor.execute("""
            INSERT INTO students (user_id, name, department, section, batch)
            VALUES (?, ?, ?, ?, ?)
        """, (user_id, name, department, section, batch))

        student_id = cursor.lastrowid

        # 🔥 Auto enroll student to selected semester
        cursor.execute("""
            INSERT INTO student_semester_enrollment (student_id, semester_id)
            VALUES (?, ?)
        """, (student_id, semester_id))

        count += 1

    conn.commit()
    conn.close()

    return jsonify({
        "message": "Students uploaded and enrolled successfully",
        "students_created": count
    })

@admin_bp.route("/students", methods=["GET"])
@jwt_required()
def get_students():
    claims = get_jwt()
    role = claims.get("role")

    if role != "admin":
        return jsonify({"error": "Unauthorized"}), 403

    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT s.id, u.roll_number, s.name, s.department, s.section, s.batch
        FROM students s
        JOIN users u ON s.user_id = u.id
    """)

    students = cursor.fetchall()
    conn.close()

    return jsonify([dict(row) for row in students])
@admin_bp.route("/assign-students", methods=["POST"])
@jwt_required()
def assign_students_to_semester():
    claims = get_jwt()
    role = claims.get("role")

    if role != "admin":
        return jsonify({"error": "Unauthorized"}), 403

    data = request.get_json()
    semester_id = data.get("semester_id")
    student_ids = data.get("student_ids")

    if not semester_id or not student_ids:
        return jsonify({"error": "Missing fields"}), 400

    conn = get_connection()
    cursor = conn.cursor()

    for sid in student_ids:
        cursor.execute("""
            INSERT INTO student_semester_enrollment (student_id, semester_id)
            VALUES (?, ?)
        """, (sid, semester_id))

    conn.commit()
    conn.close()

    return jsonify({"message": "Students assigned successfully"})
@admin_bp.route("/assign-all-to-semester", methods=["POST"])
@jwt_required()
def assign_all_students_to_semester():
    claims = get_jwt()
    role = claims.get("role")

    if role != "admin":
        return jsonify({"error": "Unauthorized"}), 403

    data = request.get_json()
    semester_id = data.get("semester_id")

    if not semester_id:
        return jsonify({"error": "Semester ID required"}), 400

    conn = get_connection()
    cursor = conn.cursor()

    # Get all students
    cursor.execute("SELECT id FROM students")
    students = cursor.fetchall()

    count = 0

    for student in students:
        cursor.execute("""
            INSERT OR IGNORE INTO student_semester_enrollment
            (student_id, semester_id)
            VALUES (?, ?)
        """, (student["id"], semester_id))
        count += 1

    conn.commit()
    conn.close()

    return jsonify({
        "message": "All students assigned successfully",
        "students_assigned": count
    })
