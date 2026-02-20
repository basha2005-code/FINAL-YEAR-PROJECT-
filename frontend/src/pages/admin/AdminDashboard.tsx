import { useEffect, useState } from "react";
import {
  fetchInstitutionPerformance,
  createAcademicTerm,
  fetchAcademicTerms,
  registerStudentsBatch,
  fetchRegisteredStudents,
} from "../../services/api";

export default function AdminDashboard() {
  const [performance, setPerformance] = useState<any[]>([]);
  const [terms, setTerms] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [termName, setTermName] = useState("");
  const [academicYear, setAcademicYear] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPerformance();
    loadAcademicTerms();
    loadStudents();
  }, []);

  async function loadPerformance() {
    try {
      const res = await fetchInstitutionPerformance();
      setPerformance(res.data || []);
    } catch {
      setPerformance([]);
    } finally {
      setLoading(false);
    }
  }

  async function loadAcademicTerms() {
    try {
      const res = await fetchAcademicTerms();
      setTerms(res);
    } catch {
      setTerms([]);
    }
  }

  async function loadStudents() {
    try {
      const res = await fetchRegisteredStudents();
      setStudents(res);
    } catch {
      setStudents([]);
    }
  }

  async function handleCreateTerm(e: React.FormEvent) {
    e.preventDefault();

    try {
      await createAcademicTerm(termName, academicYear);
      setTermName("");
      setAcademicYear("");
      loadAcademicTerms();
      alert("Academic term created successfully");
    } catch (err: any) {
      alert(err.message);
    }
  }

  async function handleStudentBatchUpload(e: React.FormEvent) {
    e.preventDefault();

    if (!file) {
      alert("Please select a CSV file");
      return;
    }

    try {
      const res = await registerStudentsBatch(file);
      alert(`${res.students_created} students registered successfully`);
      setFile(null);
      loadStudents();
    } catch (err: any) {
      alert(err.message);
    }
  }

  return (
    <div className="p-8 space-y-8">
      <h1 className="text-2xl font-semibold">Institution Administration</h1>

      {/* Academic Term Creation */}
      <div className="bg-white border rounded-lg p-6 shadow-sm">
        <h3 className="mb-4 font-medium">Create Academic Term</h3>

        <form onSubmit={handleCreateTerm} className="flex gap-4">
          <input
            type="text"
            placeholder="Term Name"
            value={termName}
            onChange={(e) => setTermName(e.target.value)}
            className="border p-2 rounded"
            required
          />

          <input
            type="text"
            placeholder="Academic Year"
            value={academicYear}
            onChange={(e) => setAcademicYear(e.target.value)}
            className="border p-2 rounded"
            required
          />

          <button
            type="submit"
            className="bg-black text-white px-4 py-2 rounded"
          >
            Create
          </button>
        </form>
      </div>

      {/* Academic Terms List */}
      <div className="bg-white border rounded-lg p-6 shadow-sm">
        <h3 className="mb-4 font-medium">Academic Terms</h3>

        {terms.length === 0 ? (
          <p className="text-gray-500">No academic terms available.</p>
        ) : (
          <ul className="space-y-2">
            {terms.map((term) => (
              <li key={term.id} className="border p-2 rounded">
                {term.name} ({term.academic_year})
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Student Batch Registration */}
      <div className="bg-white border rounded-lg p-6 shadow-sm">
        <h3 className="mb-4 font-medium">Student Batch Registration</h3>

        <form
          onSubmit={handleStudentBatchUpload}
          className="flex gap-4 items-center"
        >
          <input
            type="file"
            accept=".csv"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="border p-2 rounded"
            required
          />

          <button
            type="submit"
            className="bg-black text-white px-4 py-2 rounded"
          >
            Register Batch
          </button>
        </form>
      </div>

      {/* Registered Students */}
      <div className="bg-white border rounded-lg p-6 shadow-sm">
        <h3 className="mb-4 font-medium">Registered Students</h3>

        {students.length === 0 ? (
          <p className="text-gray-500">No registered students.</p>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left">Roll No</th>
                <th className="px-4 py-2 text-left">Name</th>
                <th className="px-4 py-2 text-left">Department</th>
                <th className="px-4 py-2 text-left">Section</th>
                <th className="px-4 py-2 text-left">Batch</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student) => (
                <tr key={student.id} className="border-b">
                  <td className="px-4 py-2">{student.roll_number}</td>
                  <td className="px-4 py-2">{student.name}</td>
                  <td className="px-4 py-2">{student.department}</td>
                  <td className="px-4 py-2">{student.section}</td>
                  <td className="px-4 py-2">{student.batch}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Performance Overview */}
      <div className="bg-white border rounded-lg p-6 shadow-sm">
        <h3 className="mb-4 font-medium">Performance Overview</h3>

        {loading ? (
          <p>Loading...</p>
        ) : performance.length === 0 ? (
          <p className="text-gray-500">No performance records available.</p>
        ) : (
          <p>{performance.length} performance records available.</p>
        )}
      </div>
    </div>
  );
}
