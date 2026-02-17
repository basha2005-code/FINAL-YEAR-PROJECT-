from flask import Flask, jsonify
from flask_cors import CORS

from models.performance import create_performance_table
from routes.upload_routes import upload_bp

app = Flask(__name__)
CORS(app)

# Initialize database tables
create_performance_table()

# Register blueprints
app.register_blueprint(upload_bp)

@app.route("/")
def home():
    return jsonify({
        "message": "Smart Academic Insights Backend is running"
    })

if __name__ == "__main__":
    app.run(host="localhost", port=5000, debug=True)

