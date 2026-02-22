const BASE_URL = "http://localhost:5000";

/* ================= AUTH HEADER ================= */
function getAuthHeaders() {
  const token = localStorage.getItem("token");

  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

/* ================= AUTH ================= */
export async function authenticateUser(
  roll_number: string,
  password: string
) {
  const res = await fetch(`${BASE_URL}/api/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ roll_number, password }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Authentication failed");

  return data;
}

/* ================= ACADEMIC TERMS ================= */
export async function createAcademicTerm(
  name: string,
  academic_year: string
) {
  const res = await fetch(`${BASE_URL}/api/admin/semester`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ name, academic_year }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to create term");

  return data;
}

export async function fetchAcademicTerms() {
  const res = await fetch(`${BASE_URL}/api/admin/semesters`, {
    headers: getAuthHeaders(),
  });

  if (!res.ok) throw new Error("Failed to fetch terms");
  return res.json();
}

/* ================= STUDENTS ================= */
export async function registerStudentsBatch(
  file: File,
  semester_id: number
) {
  const token = localStorage.getItem("token");
  const formData = new FormData();
  formData.append("file", file);
  formData.append("semester_id", semester_id.toString());

  const res = await fetch(`${BASE_URL}/api/admin/bulk-students`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Registration failed");

  return data;
}


export async function fetchRegisteredStudents() {
  const res = await fetch(`${BASE_URL}/api/admin/students`, {
    headers: getAuthHeaders(),
  });

  if (!res.ok) throw new Error("Failed to fetch students");
  return res.json();
}

/* ================= PERFORMANCE ================= */
export async function fetchInstitutionPerformance() {
  const res = await fetch(`${BASE_URL}/api/performance`, {
    headers: getAuthHeaders(),
  });

  if (!res.ok) throw new Error("Failed to fetch performance");
  return res.json();
}

/* ===== Restore Teacher Dashboard APIs ===== */

export async function fetchAllPerformance() {
  return fetchInstitutionPerformance();
}

export async function fetchAverageMarks() {
  const res = await fetch(`${BASE_URL}/api/analytics/average-marks`, {
    headers: getAuthHeaders(),
  });

  if (!res.ok) throw new Error("Failed to fetch average marks");
  return res.json();
}

export async function fetchAverageAttendance() {
  const res = await fetch(`${BASE_URL}/api/analytics/average-attendance`, {
    headers: getAuthHeaders(),
  });

  if (!res.ok) throw new Error("Failed to fetch attendance");
  return res.json();
}

export async function fetchPassFail() {
  const res = await fetch(`${BASE_URL}/api/analytics/pass-fail`, {
    headers: getAuthHeaders(),
  });

  if (!res.ok) throw new Error("Failed to fetch pass/fail");
  return res.json();
}

export async function fetchAtRiskStudents() {
  const res = await fetch(`${BASE_URL}/api/analytics/at-risk`, {
    headers: getAuthHeaders(),
  });

  if (!res.ok) throw new Error("Failed to fetch at-risk students");
  return res.json();
}

export async function uploadCSV(file: File, semester?: number) {
  const token = localStorage.getItem("token");
  const formData = new FormData();
  formData.append("file", file);

  if (semester) {
    formData.append("semester", semester.toString()); // FIXED
  }

  const res = await fetch(`${BASE_URL}/api/upload/csv`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Upload failed");

  return data;
}

/* ================= ML INSIGHTS ================= */

export async function fetchStudentInsight() {
  const token = localStorage.getItem("token");

  const res = await fetch(`http://localhost:5000/api/ml/student-insight`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`, // 🔥 IMPORTANT
    },
  });

  const data = await res.json();

  if (!res.ok) throw new Error(data.error || "Failed to fetch student insight");

  return data;
}

export async function fetchSubjectDifficulty() {
  const res = await fetch(`${BASE_URL}/api/ml/subject-difficulty`, {
    headers: getAuthHeaders(),
  });

  if (!res.ok) throw new Error("Failed to fetch subject difficulty");

  return res.json();
}

export async function fetchTopRiskStudents() {
  const res = await fetch(`${BASE_URL}/api/ml/top-risk`, {
    headers: getAuthHeaders(),
  });

  if (!res.ok) throw new Error("Failed to fetch top risk students");

  return res.json();
}

export async function fetchClassHealth() {
  const res = await fetch(`${BASE_URL}/api/ml/class-health`, {
    headers: getAuthHeaders(),
  });

  if (!res.ok) throw new Error("Failed to fetch class health");

  return res.json();
}

export async function registerTeacher(
  roll_number: string,
  password: string,
  secret_key: string
) {
  const res = await fetch(`${BASE_URL}/api/register-teacher`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ roll_number, password, secret_key }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Registration failed");

  return data;
}
export async function fetchStudentPerformance() {
  const res = await fetch(`${BASE_URL}/api/student/performance`, {
    headers: getAuthHeaders(),
  });

  if (!res.ok) throw new Error("Failed to fetch student performance");

  return res.json();
}
