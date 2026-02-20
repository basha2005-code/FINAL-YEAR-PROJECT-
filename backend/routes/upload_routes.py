from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from utils.csv_parser import parse_csv
from models.performance import (
    insert_performance_data,
    get_all_performance_data,
    get_average_marks,
    get_average_attendance,
    get_pass_fail_count,
    get_at_risk_students
)

upload_bp = Blueprint("upload_routes", __name__)


@upload_bp.route("/api/upload/csv", methods=["POST"])
@jwt_required()
def upload_csv():
    user_id = int(get_jwt_identity())
    claims = get_jwt()
    role = claims.get("role")

    if role != "teacher":
        return jsonify({"error": "Only teachers can upload"}), 403

    if "file" not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    semester = request.form.get("semester") or "1"

    if not semester:
        return jsonify({"error": "Semester required"}), 400

    file = request.files["file"]
    rows = parse_csv(file)

    inserted = insert_performance_data(rows, semester, user_id)

    return jsonify({
        "message": "Upload successful",
        "records_processed": inserted
    })


@upload_bp.route("/api/performance", methods=["GET"])
@jwt_required()
def get_performance():
    teacher_id = int(get_jwt_identity())
    data = get_all_performance_data(teacher_id)
    return jsonify({"count": len(data), "data": data})


@upload_bp.route("/api/analytics/average-marks", methods=["GET"])
@jwt_required()
def average_marks():
    teacher_id = int(get_jwt_identity())
    return jsonify({"average_marks": get_average_marks(teacher_id)})


@upload_bp.route("/api/analytics/average-attendance", methods=["GET"])
@jwt_required()
def average_attendance():
    teacher_id = int(get_jwt_identity())
    return jsonify({"average_attendance": get_average_attendance(teacher_id)})


@upload_bp.route("/api/analytics/pass-fail", methods=["GET"])
@jwt_required()
def pass_fail():
    teacher_id = int(get_jwt_identity())
    return jsonify(get_pass_fail_count(teacher_id))


@upload_bp.route("/api/analytics/at-risk", methods=["GET"])
@jwt_required()
def at_risk_students():
    teacher_id = int(get_jwt_identity())
    return jsonify(get_at_risk_students(teacher_id))
