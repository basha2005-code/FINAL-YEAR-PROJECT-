from flask import Flask, jsonify
from flask_cors import CORS
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager

app = Flask(__name__)

CORS(app, resources={r"/*": {"origins": "*"}})

app.config["JWT_SECRET_KEY"] = "super-secret-key-change-this"
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = 86400
app.config["TEACHER_SECRET_KEY"] = "FACULTY2024"

jwt = JWTManager(app)
bcrypt = Bcrypt(app)

# --- DATABASE INIT ---
from database.init_db import init_database
init_database()

# --- IMPORT BLUEPRINTS ---
from routes.upload_routes import upload_bp
from routes.auth_routes import auth_bp
from routes.ml_routes import ml_bp
from routes.student_routes import student_bp

app.register_blueprint(upload_bp)
app.register_blueprint(auth_bp)
app.register_blueprint(ml_bp)
app.register_blueprint(student_bp)

@app.route("/")
def home():
    return jsonify({"message": "Backend running"})

if __name__ == "__main__":
    app.run(port=5000, debug=True)