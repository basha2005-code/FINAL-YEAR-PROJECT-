from models.performance import get_all_performance_data
from ml.feature_engineering import build_student_features
from ml.risk_engine import calculate_risk_score
from ml.forecasting import forecast_next_marks
from ml.suggestions import generate_suggestions

import pandas as pd
import math


# 🔹 STUDENT INSIGHT
def get_student_insight(student_id, teacher_id):
    all_data = get_all_performance_data(teacher_id)  # ✅ FIXED
    df = pd.DataFrame(all_data)

    if df.empty:
        return {"error": "No performance data available"}

    # 🔥 FIX TYPE MATCH (important)
    student_df = df[df["student_id"] == int(student_id)]

    if student_df.empty:
        return {"error": "Student not found"}

    student_df = student_df.sort_values(by="semester")

    features = build_student_features(student_df)

    # 🔥 FIX NaN values
    for key, value in features.items():
        if isinstance(value, float) and math.isnan(value):
            features[key] = 0

    risk_score, risk_level = calculate_risk_score(features)
    predicted_marks = forecast_next_marks(student_df)
    suggestions = generate_suggestions(features)

    return {
        "student_id": int(student_id),  # 🔥 FIX
        "risk_score": float(round(risk_score, 2)),  # 🔥 FIX
        "risk_level": str(risk_level),  # 🔥 FIX
        "predicted_next_marks": float(round(predicted_marks, 2)),  # 🔥 FIX
        "features": features,
        "suggestions": suggestions,
    }


# 🔹 TOP RISK STUDENTS
def get_top_risk_students(teacher_id):
    all_data = get_all_performance_data(teacher_id)
    df = pd.DataFrame(all_data)

    if df.empty:
        return []

    results = []

    for student_id in df["student_id"].unique():
        student_df = df[df["student_id"] == student_id]
        student_df = student_df.sort_values(by="semester")

        # 🔥 GET ROLL NUMBER
        roll_number = str(student_df.iloc[0]["roll_number"])

        features = build_student_features(student_df)
        risk_score, risk_level = calculate_risk_score(features)

        results.append({
            "student_id": int(student_id),
            "roll_number": roll_number,   # ✅ FIX
            "risk_score": float(round(risk_score, 2)),
            "risk_level": risk_level
        })

    results = sorted(results, key=lambda x: x["risk_score"], reverse=True)

    return results[:10]


# 🔹 CLASS HEALTH
def get_class_health(teacher_id):
    all_data = get_all_performance_data(teacher_id)
    df = pd.DataFrame(all_data)

    if df.empty:
        return {
            "health_score": 0,
            "status": "No Data",
            "predicted_marks": 0,
            "pass_probability": 0,
            "current_avg": 0
        }

    avg_marks = float(df["marks"].mean())  # 🔥 FIX
    avg_attendance = float(df["attendance"].mean())  # 🔥 FIX
    pass_rate = float((df["marks"] >= 40).mean() * 100)  # 🔥 FIX

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
        "health_score": float(round(health_score, 2)),  # 🔥 FIX
        "status": str(level),
        "predicted_marks": float(round(predicted_marks, 2)),  # 🔥 FIX
        "pass_probability": float(round(pass_rate, 2)),  # 🔥 FIX
        "current_avg": float(round(avg_marks, 2))  # 🔥 FIX
    }
def get_subject_difficulty(teacher_id):
    from models.performance import get_subject_difficulty as db_func
    
    data = db_func(teacher_id)

    return [
        {
            "subject": str(d["subject"]),
            "average_marks": float(d["average_marks"]),
            "difficulty": str(d["difficulty"])
        }
        for d in data
    ]