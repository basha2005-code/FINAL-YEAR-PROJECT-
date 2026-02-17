from flask import Blueprint, jsonify

from services.ml_service import (
    get_student_insight,
    get_top_risk_students,
    get_subject_difficulty,
    get_class_health,
)

ml_bp = Blueprint("ml", __name__, url_prefix="/api/ml")


# 🔥 Always show first student insight (for now)
@ml_bp.route("/student-insight", methods=["GET"])
def student_insight():
    # Hardcode first student for now
    student_id = "1"
    result = get_student_insight(student_id)
    return jsonify(result)


@ml_bp.route("/top-risk", methods=["GET"])
def top_risk_students():
    return jsonify(get_top_risk_students())


@ml_bp.route("/subject-difficulty", methods=["GET"])
def subject_difficulty():
    return jsonify(get_subject_difficulty())


@ml_bp.route("/class-health", methods=["GET"])
def class_health():
    return jsonify(get_class_health())