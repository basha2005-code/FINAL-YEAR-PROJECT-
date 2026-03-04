from flask import Blueprint, app, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from models.performance import get_semester_trend, predict_next_marks
from models.performance import get_subject_difficulty
from models.performance import calculate_class_health  # 🔥 ADD THIS IMPORT
from models.performance import get_semester_trend
from models.performance import generate_interventions
from models.performance import generate_comparative_insight
from services.ml_service import (
    get_student_insight,
    get_top_risk_students,
    get_class_health
)

from database.db import get_connection

ml_bp = Blueprint("ml", __name__, url_prefix="/api/ml")


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

    cursor.execute("SELECT id FROM students WHERE user_id = ?", (user_id,))
    student = cursor.fetchone()

    if not student:
        conn.close()
        return jsonify({"error": "Student not found"}), 404

    student_id = student["id"]

    cursor.execute("""
        SELECT marks, attendance 
        FROM performance 
        WHERE student_id = ?
    """, (student_id,))
    rows = cursor.fetchall()

    if not rows:
        conn.close()
        return jsonify({"error": "No performance data"}), 404

    avg_marks = sum(r["marks"] for r in rows) / len(rows)
    avg_attendance = sum(r["attendance"] for r in rows) / len(rows)

    predicted_marks = predict_next_marks(student_id)

    # 🔥 RISK SCORE
    risk_score = 0
    if avg_marks < 40:
        risk_score += 50
    elif avg_marks < 60:
        risk_score += 25

    if avg_attendance < 75:
        risk_score += 30

    risk_score = min(risk_score, 100)

    # 🔥 RISK LEVEL (THIS FIXES YOUR ISSUE)
    if risk_score >= 60:
        risk_level = "High"
    elif risk_score >= 30:
        risk_level = "Medium"
    else:
        risk_level = "Low"

    suggestions = []

    if avg_marks < 60:
        suggestions.append("Improve subject understanding and practice more.")

    if avg_attendance < 75:
        suggestions.append("Increase attendance for better performance.")

    if avg_marks >= 70 and avg_attendance >= 80:
        suggestions.append("Great work! Keep maintaining consistency.")

    conn.close()

    return jsonify({
        "predicted_next_marks": float(predicted_marks),
        "risk_score": float(risk_score),
        "risk_level": risk_level,  # ✅ THIS FIXES FRONTEND
        "features": {
            "average_marks": float(round(avg_marks, 2)),
            "average_attendance": float(round(avg_attendance, 2))
        },
        "suggestions": suggestions
    })

# 🔹 TOP RISK STUDENTS (Teacher View)
@ml_bp.route("/top-risk", methods=["GET"])
@jwt_required()
def top_risk_students():
    claims = get_jwt()
    role = claims.get("role")

    if role != "teacher":
        return jsonify({"error": "Unauthorized"}), 403

    teacher_id = int(get_jwt_identity())  # 🔥 ADD THIS

    results = get_top_risk_students(teacher_id)  # 🔥 PASS IT

    return jsonify(results)

@ml_bp.route("/subject-difficulty", methods=["GET"])
@jwt_required()
def subject_difficulty():
    claims = get_jwt()
    role = claims.get("role")

    if role != "teacher":
        return jsonify({"error": "Unauthorized"}), 403

    teacher_id = int(get_jwt_identity())

    data = get_subject_difficulty(teacher_id)

    return jsonify(data)

@ml_bp.route("/test-class-health/<int:user_id>", methods=["GET"])
def test_class_health(user_id):
    result = calculate_class_health(user_id)
    return jsonify(result)

@ml_bp.route("/class-health", methods=["GET"])
@jwt_required()
def class_health():
    claims = get_jwt()
    role = claims.get("role")

    if role != "teacher":
        return jsonify({"error": "Unauthorized"}), 403

    teacher_user_id = int(get_jwt_identity())

    semester = request.args.get("semester")  # 🔥 new

    result = calculate_class_health(teacher_user_id, semester)

    return jsonify(result), 200

@ml_bp.route("/semester-trend", methods=["GET"])
@jwt_required()
def semester_trend():
    claims = get_jwt()
    role = claims.get("role")

    if role != "teacher":
        return jsonify({"error": "Unauthorized"}), 403

    teacher_user_id = int(get_jwt_identity())
    data = get_semester_trend(teacher_user_id)

    return jsonify(data), 200

@ml_bp.route("/interventions", methods=["GET"])
@jwt_required()
def intervention_engine():
    claims = get_jwt()
    role = claims.get("role")

    if role != "teacher":
        return jsonify({"error": "Unauthorized"}), 403

    teacher_user_id = int(get_jwt_identity())
    data = generate_interventions(teacher_user_id)

    return jsonify(data), 200


@ml_bp.route("/comparison-insight", methods=["GET"])
@jwt_required()
def comparison_insight():
    claims = get_jwt()
    role = claims.get("role")

    if role != "teacher":
        return jsonify({"error": "Unauthorized"}), 403

    teacher_user_id = int(get_jwt_identity())

    data = generate_comparative_insight(teacher_user_id)

    return jsonify(data), 200

@ml_bp.route("/test-comparison/<int:user_id>")
def test_comparison(user_id):
    return jsonify(generate_comparative_insight(user_id))