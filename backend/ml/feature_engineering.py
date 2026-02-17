import numpy as np
from sklearn.linear_model import LinearRegression


def build_student_features(student_df):
    features = {}

    # Average Marks
    features["average_marks"] = float(student_df["marks"].mean())

    # Attendance Rate
    features["attendance_rate"] = float(student_df["attendance"].mean())

    # Failed Subjects Count
    features["failed_subjects"] = int((student_df["marks"] < 40).sum())

    # Marks Variance (performance stability)
    features["marks_variance"] = float(student_df["marks"].var() or 0)

    # ---- Performance Trend ----
    if len(student_df) > 1:
        X = np.arange(len(student_df)).reshape(-1, 1)
        y_marks = student_df["marks"].values

        model_marks = LinearRegression().fit(X, y_marks)
        features["performance_trend"] = float(model_marks.coef_[0])
    else:
        features["performance_trend"] = 0.0

    # ---- Attendance Trend ----
    if len(student_df) > 1:
        X = np.arange(len(student_df)).reshape(-1, 1)
        y_att = student_df["attendance"].values

        model_att = LinearRegression().fit(X, y_att)
        features["attendance_trend"] = float(model_att.coef_[0])
    else:
        features["attendance_trend"] = 0.0

    return features