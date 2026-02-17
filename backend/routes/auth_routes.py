from flask import Blueprint, request, jsonify
from models.user import get_user_by_roll

auth_bp = Blueprint("auth_routes", __name__, url_prefix="/api")


@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json()

    roll_number = data.get("roll_number")

    if not roll_number:
        return jsonify({"error": "Roll number required"}), 400

    user = get_user_by_roll(roll_number)

    if not user:
        return jsonify({"error": "User not found"}), 404

    user_id, name, roll, email, password_hash, role = user

    return jsonify({
        "role": role,
        "student_id": roll
    })