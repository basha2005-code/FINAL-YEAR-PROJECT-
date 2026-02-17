def generate_suggestions(features):
    suggestions = []

    if features["attendance_rate"] < 75:
        suggestions.append("Improve attendance to at least 75%")

    if features["average_marks"] < 50:
        suggestions.append("Focus on improving low-performing subjects")

    if features["failed_subjects"] > 0:
        suggestions.append("Arrange remedial support for failed subjects")

    if features["performance_trend"] < 0:
        suggestions.append("Performance declining, schedule mentoring session")

    if not suggestions:
        suggestions.append("Performance stable. Continue consistent effort.")

    return suggestions