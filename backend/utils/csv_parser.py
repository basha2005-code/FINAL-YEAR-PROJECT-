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

    # Read raw header line
    first_line = stream.readline().strip()

    # Remove surrounding quotes if present
    if first_line.startswith('"') and first_line.endswith('"'):
        first_line = first_line[1:-1]

    # Detect delimiter safely
    delimiter = ";" if ";" in first_line and "," not in first_line else ","

    headers = [h.strip().lower() for h in first_line.split(delimiter)]

    if headers != REQUIRED_HEADERS:
        raise ValueError(
            f"Invalid CSV headers. Expected {REQUIRED_HEADERS}, got {headers}"
        )

    # Reset stream and read rows
    stream.seek(0)
    reader = csv.reader(stream, delimiter=delimiter)

    # Skip header
    next(reader, None)

    data = []

    for row in reader:
        # Handle rows wrapped as single quoted cell
        if len(row) == 1:
            row = row[0].strip('"').split(delimiter)

        if len(row) != 5:
            continue

        try:
            data.append({
                "student_id": row[0].strip(),
                "subject": row[1].strip(),
                "semester": int(row[2]),
                "marks": int(row[3]),
                "attendance": int(row[4]),
            })
        except ValueError:
            continue

    return data
