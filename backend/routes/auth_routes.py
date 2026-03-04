from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import create_access_token
from database.db import get_connection
from flask_bcrypt import Bcrypt

auth_bp = Blueprint("auth", __name__)

# -------------------- LOGIN --------------------

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

    bcrypt = Bcrypt(current_app)

    if not bcrypt.check_password_hash(user["password_hash"], password):
        return jsonify({"error": "Invalid credentials"}), 401

    access_token = create_access_token(
        identity=str(user["id"]),
        additional_claims={"role": user["role"]}
    )

    return jsonify({
        "access_token": access_token,
        "role": user["role"]
    }), 200


# -------------------- REGISTER TEACHER --------------------

@auth_bp.route("/api/register-teacher", methods=["POST"])
def register_teacher():
    data = request.get_json()

    roll_number = data.get("roll_number")
    password = data.get("password")
    secret_key = data.get("secret_key")

    if secret_key != current_app.config["TEACHER_SECRET_KEY"]:
        return jsonify({"error": "Invalid secret key"}), 403

    if not roll_number or not password:
        return jsonify({"error": "Missing fields"}), 400

    conn = get_connection()
    cursor = conn.cursor()

    # Check if user already exists
    cursor.execute(
        "SELECT id FROM users WHERE roll_number = ?",
        (roll_number,)
    )

    if cursor.fetchone():
        conn.close()
        return jsonify({"error": "User already exists"}), 400

    bcrypt = Bcrypt(current_app)
    hashed = bcrypt.generate_password_hash(password).decode("utf-8")

    # Insert into users table
    cursor.execute("""
        INSERT INTO users (roll_number, password_hash, role)
        VALUES (?, ?, 'teacher')
    """, (roll_number, hashed))

    user_id = cursor.lastrowid  # 🔥 Get newly created user ID

    # 🔥 Insert into teachers table (NEW INDUSTRY STRUCTURE)
    cursor.execute("""
        INSERT INTO teachers (user_id, department)
        VALUES (?, ?)
    """, (user_id, "General"))

    conn.commit()
    conn.close()

    return jsonify({"message": "Teacher registered successfully"}), 201