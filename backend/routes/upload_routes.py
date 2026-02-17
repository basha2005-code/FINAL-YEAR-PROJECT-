from flask import Blueprint, request, jsonify
from utils.csv_parser import parse_csv
from models.performance import clear_performance_data
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
def upload_csv():
    if "file" not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    file = request.files["file"]

    if not file.filename.lower().endswith(".csv"):
        return jsonify({"error": "Only CSV files allowed"}), 400

    try:
        rows = parse_csv(file)
    except ValueError as e:
        return jsonify({"error": str(e)}), 400

    if not rows:
        return jsonify({"error": "CSV contains no valid rows"}), 400

    clear_performance_data()
    insert_performance_data(rows)

    return jsonify({
        "message": "Data uploaded successfully",
        "rows_inserted": len(rows)
    })



@upload_bp.route("/api/performance", methods=["GET"])
def get_performance():
    data = get_all_performance_data()
    return jsonify({"count": len(data), "data": data})


@upload_bp.route("/api/analytics/average-marks", methods=["GET"])
def average_marks():
    return jsonify({"average_marks": get_average_marks()})


@upload_bp.route("/api/analytics/average-attendance", methods=["GET"])
def average_attendance():
    return jsonify({"average_attendance": get_average_attendance()})


@upload_bp.route("/api/analytics/pass-fail", methods=["GET"])
def pass_fail():
    return jsonify(get_pass_fail_count())


@upload_bp.route("/api/analytics/at-risk", methods=["GET"])
def at_risk_students():
    return jsonify(get_at_risk_students())

