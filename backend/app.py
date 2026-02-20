from flask import Flask, jsonify
from flask_cors import CORS
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager

# Blueprints
from routes.upload_routes import upload_bp
from routes.auth_routes import auth_bp
from routes.ml_routes import ml_bp

# Table creation
from models.user import create_user_table
from models.student import create_student_table
from models.semester import create_semester_table
from models.performance import create_performance_table

app = Flask(__name__)

app.config["JWT_SECRET_KEY"] = "super-secret-key-change-this"
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = 86400
app.config["TEACHER_SECRET_KEY"] = "FACULTY2024"

jwt = JWTManager(app)
CORS(app)
bcrypt = Bcrypt(app)

# Create tables
create_user_table()
create_student_table()
create_semester_table()
create_performance_table()

app.register_blueprint(upload_bp)
app.register_blueprint(auth_bp)
app.register_blueprint(ml_bp)

@app.route("/")
def home():
    return jsonify({"message": "Smart Academic Insights Backend is running"})

if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000, debug=True)
