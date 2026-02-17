const BASE_URL = "http://127.0.0.1:5000";

function getAuthHeaders() {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

/* ===========================
   AUTH
=========================== */

export async function login(roll_number: string, password: string) {
  const res = await fetch(`${BASE_URL}/api/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ roll_number, password }),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Login failed");
  }

  return res.json();
}

/* ===========================
   PERFORMANCE / ANALYTICS
=========================== */

export async function fetchAllPerformance() {
  const res = await fetch(`${BASE_URL}/api/performance`);
  if (!res.ok) throw new Error("Failed to fetch performance data");
  return res.json();
}

export async function fetchAverageMarks() {
  const res = await fetch(`${BASE_URL}/api/analytics/average-marks`);
  if (!res.ok) throw new Error("Failed to fetch average marks");
  return res.json();
}

export async function fetchAverageAttendance() {
  const res = await fetch(`${BASE_URL}/api/analytics/average-attendance`);
  if (!res.ok) throw new Error("Failed to fetch average attendance");
  return res.json();
}

export async function fetchPassFail() {
  const res = await fetch(`${BASE_URL}/api/analytics/pass-fail`);
  if (!res.ok) throw new Error("Failed to fetch pass/fail");
  return res.json();
}

export async function fetchAtRiskStudents() {
  const res = await fetch(`${BASE_URL}/api/analytics/at-risk`);
  if (!res.ok) throw new Error("Failed to fetch at-risk students");
  return res.json();
}

export async function uploadCSV(file: File) {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(`${BASE_URL}/api/upload/csv`, {
    method: "POST",
    body: formData,
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || "CSV upload failed");
  }

  return data;
}

/* ===========================
   ML APIs
=========================== */

export async function fetchStudentInsight() {
  const res = await fetch(`http://127.0.0.1:5000/api/ml/student-insight`);

  if (!res.ok) {
    throw new Error("Failed to fetch student insight");
  }

  return res.json();
}

export async function fetchSubjectDifficulty() {
  const res = await fetch(`${BASE_URL}/api/ml/subject-difficulty`);
  if (!res.ok) throw new Error("Failed to fetch subject difficulty");
  return res.json();
}