from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from database.db import get_connection

student_bp = Blueprint("student", __name__)

@student_bp.route("/api/student/performance", methods=["GET"])
@jwt_required()
def get_student_performance():
    user_id = int(get_jwt_identity())

    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT s.id as student_id
        FROM students s
        WHERE s.user_id = ?
    """, (user_id,))

    student = cursor.fetchone()

    if not student:
        return jsonify({"error": "Student not found"}), 404

    student_id = student["student_id"]

    cursor.execute("""
        SELECT subject, semester, marks, attendance
        FROM performance
        WHERE student_id = ?
    """, (student_id,))

    data = cursor.fetchall()
    conn.close()

    return jsonify([dict(row) for row in data])