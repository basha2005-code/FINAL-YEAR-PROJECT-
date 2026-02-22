from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from database.db import get_connection

student_bp = Blueprint("student", __name__, url_prefix="/api/student")


@student_bp.route("/performance", methods=["GET"])
@jwt_required()
def get_student_performance():
    user_id = int(get_jwt_identity())
    claims = get_jwt()
    role = claims.get("role")

    if role != "student":
        return jsonify({"error": "Unauthorized"}), 403

    conn = get_connection()
    cursor = conn.cursor()

    # Get student id
    cursor.execute("""
        SELECT id FROM students
        WHERE user_id = ?
    """, (user_id,))
    student = cursor.fetchone()

    if not student:
        conn.close()
        return jsonify({"error": "Student not found"}), 404

    student_id = student["id"]

    cursor.execute("""
        SELECT subject, semester, marks, attendance, recorded_at
        FROM performance
        WHERE student_id = ?
    """, (student_id,))

    rows = cursor.fetchall()
    conn.close()

    return jsonify([dict(row) for row in rows])