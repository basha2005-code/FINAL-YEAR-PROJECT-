from models.performance import get_all_performance_data
from ml.feature_engineering import build_student_features
from ml.risk_engine import calculate_risk_score
from ml.forecasting import forecast_next_marks
from ml.suggestions import generate_suggestions

import pandas as pd


def get_student_insight(student_id):
    all_data = get_all_performance_data()
    df = pd.DataFrame(all_data)

    if df.empty:
        return {"error": "No performance data available"}

    student_df = df[df["student_id"] == str(student_id)]

    if student_df.empty:
        return {"error": "Student not found"}

    student_df = student_df.sort_values(by="semester")

    features = build_student_features(student_df)

    # 🔥 FIX NaN values
    import math
    for key, value in features.items():
        if isinstance(value, float) and math.isnan(value):
            features[key] = 0

    risk_score, risk_level = calculate_risk_score(features)

    predicted_marks = forecast_next_marks(student_df)

    suggestions = generate_suggestions(features)

    return {
        "student_id": student_id,
        "risk_score": round(risk_score, 2),
        "risk_level": risk_level,
        "predicted_next_marks": round(predicted_marks, 2),
        "features": features,
        "suggestions": suggestions,
    }
def get_top_risk_students():
    all_data = get_all_performance_data()
    df = pd.DataFrame(all_data)

    results = []

    for student_id in df["student_id"].unique():
        student_df = df[df["student_id"] == student_id]
        student_df = student_df.sort_values(by="semester")

        features = build_student_features(student_df)
        risk_score, risk_level = calculate_risk_score(features)

        results.append({
            "student_id": student_id,
            "risk_score": round(risk_score, 2),
            "risk_level": risk_level
        })

    results = sorted(results, key=lambda x: x["risk_score"], reverse=True)

    return results[:10]

def get_subject_difficulty():
    all_data = get_all_performance_data()
    df = pd.DataFrame(all_data)

    subjects = []

    for subject in df["subject"].unique():
        sub_df = df[df["subject"] == subject]

        avg_marks = sub_df["marks"].mean()
        fail_rate = (sub_df["marks"] < 40).mean() * 100

        difficulty_score = (100 - avg_marks) * 0.6 + fail_rate * 0.4

        subjects.append({
            "subject": subject,
            "average_marks": round(avg_marks, 2),
            "fail_rate": round(fail_rate, 2),
            "difficulty_score": round(difficulty_score, 2)
        })

    subjects = sorted(subjects, key=lambda x: x["difficulty_score"], reverse=True)

    return subjects

def get_class_health():
    all_data = get_all_performance_data()
    df = pd.DataFrame(all_data)

    if df.empty:
        return {
            "health_score": 0,
            "status": "No Data",
            "predicted_marks": 0,
            "pass_probability": 0,
            "current_avg": 0
        }

    avg_marks = df["marks"].mean()
    avg_attendance = df["attendance"].mean()
    pass_rate = (df["marks"] >= 40).mean() * 100

    # 🔮 Simple forecast logic (class-level trend)
    predicted_marks = min(avg_marks + 2, 100)

    health_score = (
        avg_marks * 0.4 +
        avg_attendance * 0.3 +
        pass_rate * 0.3
    )

    if health_score >= 75:
        level = "Healthy"
    elif health_score >= 50:
        level = "Monitor"
    else:
        level = "Critical"

    return {
        "health_score": round(health_score, 2),
        "status": level,
        "predicted_marks": round(predicted_marks, 2),
        "pass_probability": round(pass_rate, 2),
        "current_avg": round(avg_marks, 2)
    }