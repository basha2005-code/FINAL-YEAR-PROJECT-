import { useEffect, useMemo, useState } from "react";
import { fetchAtRiskStudents } from "../../services/api";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

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

  /* 🔥 SORT BY RISK */
  const sorted = useMemo(() => {
    return [...students].sort((a, b) => b.risk_score - a.risk_score);
  }, [students]);

  /* 🔥 STATS */
  const total = students.length;
  const highRisk = students.filter((s) => s.risk_score > 60).length;

  /* 🔥 CHART DATA */
  const chartData = sorted.slice(0, 5).map((s) => ({
    name: s.roll_number,
    risk: s.risk_score,
  }));

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="p-8">
      <h1 className="mb-6 text-xl font-semibold">
        At-Risk Students
      </h1>

      {/* 🔥 KPI CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card title="Total At-Risk Students" value={total} />
        <Card title="High Risk Students" value={highRisk} />
      </div>

      {/* 🔥 CHART */}
      <div className="bg-white border rounded-lg p-6 shadow-sm mb-8">
        <h3 className="mb-4">Top Risk Students</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="risk" fill="#000000" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* 🔥 TABLE */}
      <div className="bg-white border rounded-lg p-6 shadow-sm">
        <h3 className="mb-4">Detailed Risk Report</h3>

        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-2 text-left">Roll</th>
              <th className="p-2 text-left">Subjects</th>
              <th className="p-2 text-left">Marks</th>
              <th className="p-2 text-left">Attendance</th>
              <th className="p-2 text-left">Risk Score</th>
              <th className="p-2 text-left">Risk Level</th>
            </tr>
          </thead>

          <tbody>
            {sorted.map((s, i) => (
              <tr key={i} className="border-b hover:bg-gray-50">
                <td className="p-2">{s.roll_number}</td>

                <td className="p-2">{s.subject_count}</td>

                <td
                  className={`p-2 ${
                    s.average_marks < 60
                      ? "text-red-600"
                      : "text-black"
                  }`}
                >
                  {s.average_marks}
                </td>

                <td
                  className={`p-2 ${
                    s.average_attendance < 75
                      ? "text-red-600"
                      : "text-black"
                  }`}
                >
                  {s.average_attendance}%
                </td>

                <td className="p-2 font-medium">
                  {s.risk_score}
                </td>

                <td className="p-2">
                  <span
                    className={`px-3 py-1 rounded text-xs font-medium ${
                      s.risk_score > 60
                        ? "bg-black text-white"
                        : "bg-gray-200 text-black"
                    }`}
                  >
                    {s.risk_level}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* 🔹 CARD */
function Card({ title, value }: any) {
  return (
    <div className="bg-white border p-6 rounded shadow-sm">
      <p className="text-sm text-gray-500">{title}</p>
      <h2 className="text-xl font-semibold">{value}</h2>
    </div>
  );
}