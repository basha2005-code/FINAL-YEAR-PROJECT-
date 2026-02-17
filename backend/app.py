from flask import Flask, jsonify
from flask_cors import CORS
from flask_bcrypt import Bcrypt

from models.performance import create_performance_table
from models.user import create_user_table, seed_default_users

from routes.upload_routes import upload_bp
from routes.auth_routes import auth_bp
from routes.ml_routes import ml_bp

app = Flask(__name__)
CORS(app)

bcrypt = Bcrypt(app)

create_user_table()
create_performance_table()
seed_default_users()

app.register_blueprint(upload_bp)
app.register_blueprint(auth_bp)
app.register_blueprint(ml_bp)


@app.route("/")
def home():
    return jsonify({
        "message": "Smart Academic Insights Backend is running"
    })


if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000, debug=True)