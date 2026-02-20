from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt

from models.performance import (
    calculate_risk,
    predict_next_marks
)

from database.db import get_connection

ml_bp = Blueprint("ml", __name__, url_prefix="/api/ml")


# 🔹 STUDENT INSIGHT (MAIN ML ENDPOINT)
@ml_bp.route("/student-insight", methods=["GET"])
@jwt_required()
def student_insight():
    user_id = int(get_jwt_identity())
    claims = get_jwt()
    role = claims.get("role")

    if role != "student":
        return jsonify({"error": "Unauthorized"}), 403

    conn = get_connection()
    cursor = conn.cursor()

    # Get student id
    cursor.execute("""
        SELECT id, name FROM students
        WHERE user_id = ?
    """, (user_id,))
    student = cursor.fetchone()

    if not student:
        conn.close()
        return jsonify({"error": "Student not found"}), 404

    student_id = student["id"]

    # Get averages
    cursor.execute("""
        SELECT AVG(marks) as avg_marks,
               AVG(attendance) as avg_att
        FROM performance
        WHERE student_id = ?
    """, (student_id,))
    stats = cursor.fetchone()

    avg_marks = round(stats["avg_marks"] or 0, 2)
    avg_att = round(stats["avg_att"] or 0, 2)

    # Risk score
    risk_score = calculate_risk(avg_marks, avg_att)

    # Prediction
    predicted = predict_next_marks(student_id)

    conn.close()

    return jsonify({
        "student_name": student["name"],
        "average_marks": avg_marks,
        "average_attendance": avg_att,
        "risk_score": risk_score,
        "predicted_next_semester_marks": predicted
    })


# 🔹 TOP RISK STUDENTS (Teacher View)
@ml_bp.route("/top-risk", methods=["GET"])
@jwt_required()
def top_risk_students():
    claims = get_jwt()
    role = claims.get("role")

    if role != "teacher":
        return jsonify({"error": "Unauthorized"}), 403

    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT s.name,
               AVG(p.marks) as avg_marks,
               AVG(p.attendance) as avg_att
        FROM performance p
        JOIN students s ON p.student_id = s.id
        GROUP BY s.id
    """)

    rows = cursor.fetchall()
    conn.close()

    results = []

    for r in rows:
        avg_marks = r["avg_marks"] or 0
        avg_att = r["avg_att"] or 0
        risk = calculate_risk(avg_marks, avg_att)

        results.append({
            "name": r["name"],
            "risk_score": risk
        })

    results.sort(key=lambda x: x["risk_score"], reverse=True)

    return jsonify(results)


# 🔹 CLASS HEALTH (Teacher View)
@ml_bp.route("/class-health", methods=["GET"])
@jwt_required()
def class_health():
    claims = get_jwt()
    role = claims.get("role")

    if role != "teacher":
        return jsonify({"error": "Unauthorized"}), 403

    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT AVG(marks) as avg_marks FROM performance")
    result = cursor.fetchone()
    conn.close()

    avg = round(result["avg_marks"] or 0, 2)

    return jsonify({
        "class_average": avg,
        "health_status": "Good" if avg >= 60 else "Needs Improvement"
    })
