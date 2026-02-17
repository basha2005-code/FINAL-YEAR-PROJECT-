def calculate_risk_score(features):
    score = 0

    # Marks impact (40% weight)
    score += (100 - features["average_marks"]) * 0.4

    # Attendance impact (30% weight)
    score += (100 - features["attendance_rate"]) * 0.3

    # Failed subjects impact
    score += features["failed_subjects"] * 5

    # Negative performance trend impact
    if features["performance_trend"] < 0:
        score += abs(features["performance_trend"]) * 2

    # Cap score at 100
    score = min(score, 100)

    # Risk level classification
    if score >= 70:
        level = "High"
    elif score >= 40:
        level = "Medium"
    else:
        level = "Low"

    return score, level