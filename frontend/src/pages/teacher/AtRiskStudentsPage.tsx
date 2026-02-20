import { useEffect, useState } from "react";
import { fetchAtRiskStudents } from "../../services/api";

type AtRiskStudent = {
  student_id: number;
  roll_number: string;
  subject_count: number;
  average_marks: number;
  average_attendance: number;
  risk_score: number;
  risk_level: string;
};

export default function AtRiskStudentsPage() {
  const [students, setStudents] = useState<AtRiskStudent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAtRiskStudents()
      .then((res) => setStudents(res || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="p-8">
      <h1 className="mb-6 text-xl font-semibold">At-Risk Students</h1>

      <table className="w-full text-sm border">
        <thead className="bg-gray-50">
          <tr>
            <th className="p-2">Roll No</th>
            <th className="p-2">Subjects</th>
            <th className="p-2">Avg Marks</th>
            <th className="p-2">Avg Attendance</th>
            <th className="p-2">Risk Score</th>
            <th className="p-2">Risk Level</th>
          </tr>
        </thead>
        <tbody>
          {students.map((s, i) => (
            <tr key={i} className="border-b">
              <td className="p-2">{s.roll_number}</td>
              <td className="p-2">{s.subject_count}</td>
              <td className="p-2 text-red-600">{s.average_marks}</td>
              <td className="p-2 text-red-600">{s.average_attendance}%</td>
              <td className="p-2">{s.risk_score}</td>
              <td className="p-2 font-medium">
                {s.risk_level}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}