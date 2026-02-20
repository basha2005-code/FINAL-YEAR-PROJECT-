from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token
from flask_bcrypt import Bcrypt
from database.db import get_connection

auth_bp = Blueprint("auth", __name__)

bcrypt = Bcrypt()


@auth_bp.route("/api/login", methods=["POST"])
def login():
    data = request.get_json()

    if not data:
        return jsonify({"error": "Missing JSON body"}), 400

    roll_number = data.get("roll_number")
    password = data.get("password")

    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT id, password_hash, role
        FROM users
        WHERE roll_number = ?
    """, (roll_number,))

    user = cursor.fetchone()
    conn.close()

    if not user:
        return jsonify({"error": "Invalid credentials"}), 401

    user_id = user["id"]
    password_hash = user["password_hash"]
    role = user["role"]

    if not bcrypt.check_password_hash(password_hash, password):
        return jsonify({"error": "Invalid credentials"}), 401

    # ✅ FIXED JWT FORMAT
    access_token = create_access_token(
        identity=str(user_id),
        additional_claims={"role": role}
    )

    return jsonify({
        "access_token": access_token,
        "role": role
    }), 200

@auth_bp.route("/api/register-teacher", methods=["POST"])
def register_teacher():
    data = request.get_json()

    roll_number = data.get("roll_number")
    password = data.get("password")
    secret_key = data.get("secret_key")

    # 🔐 Secret protection
    if secret_key != "TEACHER_SECRET_2024":
        return jsonify({"error": "Invalid secret key"}), 403

    if not roll_number or not password:
        return jsonify({"error": "Missing fields"}), 400

    conn = get_connection()
    cursor = conn.cursor()

    # Check if exists
    cursor.execute("SELECT id FROM users WHERE roll_number = ?", (roll_number,))
    if cursor.fetchone():
        conn.close()
        return jsonify({"error": "User already exists"}), 400

    hashed = bcrypt.generate_password_hash(password).decode("utf-8")

    cursor.execute("""
        INSERT INTO users (roll_number, password_hash, role)
        VALUES (?, ?, 'teacher')
    """, (roll_number, hashed))

    conn.commit()
    conn.close()

    return jsonify({"message": "Teacher registered successfully"}), 201
