import csv
from io import TextIOWrapper

REQUIRED_HEADERS = [
    "student_id",
    "subject",
    "semester",
    "marks",
    "attendance"
]

def parse_csv(file):
    file.stream.seek(0)
    stream = TextIOWrapper(file.stream, encoding="utf-8-sig", newline="")

    reader = csv.DictReader(stream)

    headers = [h.strip().lower() for h in reader.fieldnames]

    if headers != REQUIRED_HEADERS:
        raise ValueError(f"Expected headers {REQUIRED_HEADERS}, got {headers}")

    data = []

    for row in reader:
        try:
            data.append({
                "student_id": row["student_id"].strip(),
                "subject": row["subject"].strip(),
                "semester": row["semester"].strip(),
                "marks": int(row["marks"]),
                "attendance": int(row["attendance"]),
            })
        except:
            continue

    return data