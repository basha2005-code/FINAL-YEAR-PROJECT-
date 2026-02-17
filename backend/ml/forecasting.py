import numpy as np
from sklearn.linear_model import LinearRegression


def forecast_next_marks(student_df):
    if len(student_df) < 2:
        return float(student_df["marks"].mean())

    X = np.arange(len(student_df)).reshape(-1, 1)
    y = student_df["marks"].values

    model = LinearRegression().fit(X, y)

    next_semester = np.array([[len(student_df)]])
    prediction = model.predict(next_semester)

    return float(prediction[0])