import { useEffect, useState } from "react";
import { fetchAllPerformance } from "../../services/api";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Users, TrendingUp, AlertTriangle, BookOpen } from "lucide-react";

interface PerformanceRow {
  student_id: number;
  subject: string;
  marks: number;
  attendance: number;
  semester: string;
}

export default function AdminDashboard() {
  const [data, setData] = useState<PerformanceRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const res = await fetchAllPerformance();
      setData(res.data);
      setLoading(false);
    }
    load();
  }, []);

  if (loading) {
    return <div className="p-8">Loading admin analytics...</div>;
  }

  // 🔥 Unique Students
  const uniqueStudents = [...new Set(data.map((d) => d.student_id))];

  // 🔥 Unique Subjects
  const uniqueSubjects = [...new Set(data.map((d) => d.subject))];

  // 🔥 Overall Average Marks
  const overallMarks =
    data.reduce((sum, row) => sum + row.marks, 0) / data.length;

  // 🔥 Overall Attendance
  const overallAttendance =
    data.reduce((sum, row) => sum + row.attendance, 0) / data.length;

  // 🔥 Students At Risk
  const studentStats = uniqueStudents.map((id) => {
    const studentRows = data.filter((d) => d.student_id === id);
    const avgMarks =
      studentRows.reduce((sum, r) => sum + r.marks, 0) /
      studentRows.length;
    const avgAttendance =
      studentRows.reduce((sum, r) => sum + r.attendance, 0) /
      studentRows.length;

    return {
      student_id: id,
      avgMarks,
      avgAttendance,
      atRisk: avgMarks < 60 || avgAttendance < 75,
    };
  });

  const atRiskCount = studentStats.filter((s) => s.atRisk).length;

  const passRate =
    ((studentStats.filter((s) => s.avgMarks >= 60).length /
      studentStats.length) *
      100).toFixed(1);

  // 🔥 Subject-wise averages
  const subjectStats = uniqueSubjects.map((subject) => {
    const subjectRows = data.filter((d) => d.subject === subject);
    return {
      subject,
      avgMarks:
        subjectRows.reduce((sum, r) => sum + r.marks, 0) /
        subjectRows.length,
      avgAttendance:
        subjectRows.reduce((sum, r) => sum + r.attendance, 0) /
        subjectRows.length,
    };
  });

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-2xl font-semibold mb-2">
          Admin Dashboard
        </h1>
        <p className="text-gray-500">
          Real-time institutional analytics overview
        </p>
      </div>

      {/* 🔥 KPI SECTION */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6">
        <KPI title="Total Students" value={uniqueStudents.length} icon={Users} />
        <KPI title="Total Subjects" value={uniqueSubjects.length} icon={BookOpen} />
        <KPI
          title="Avg Marks"
          value={`${overallMarks.toFixed(1)}%`}
          icon={TrendingUp}
        />
        <KPI
          title="Avg Attendance"
          value={`${overallAttendance.toFixed(1)}%`}
          icon={TrendingUp}
        />
        <KPI
          title="Students At Risk"
          value={atRiskCount}
          icon={AlertTriangle}
        />
        <KPI title="Pass Rate" value={`${passRate}%`} icon={TrendingUp} />
      </div>

      {/* 🔥 SUBJECT CHART */}
      <div className="bg-white border rounded-lg p-6 shadow-sm">
        <h3 className="mb-4 font-medium">
          Subject-wise Performance Overview
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={subjectStats}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="subject" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="avgMarks" fill="#000000" name="Avg Marks" />
            <Bar dataKey="avgAttendance" fill="#666666" name="Avg Attendance" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* 🔥 RISK TABLE */}
      <div className="bg-white border rounded-lg p-6 shadow-sm">
        <h3 className="mb-4 font-medium">Student Risk Analysis</h3>
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left">Student ID</th>
              <th className="px-4 py-2 text-left">Avg Marks</th>
              <th className="px-4 py-2 text-left">Avg Attendance</th>
              <th className="px-4 py-2 text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {studentStats.map((s) => (
              <tr key={s.student_id} className="border-b">
                <td className="px-4 py-2">{s.student_id}</td>
                <td className="px-4 py-2">{s.avgMarks.toFixed(1)}%</td>
                <td className="px-4 py-2">{s.avgAttendance.toFixed(1)}%</td>
                <td className="px-4 py-2">
                  {s.atRisk ? (
                    <span className="text-red-600 font-medium">
                      At Risk
                    </span>
                  ) : (
                    <span className="text-green-600 font-medium">
                      Good
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function KPI({ title, value, icon: Icon }: any) {
  return (
    <div className="bg-white border rounded-lg p-4 shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm text-gray-500">{title}</p>
        <Icon className="w-4 h-4 text-gray-400" />
      </div>
      <h2 className="text-xl font-semibold">{value}</h2>
    </div>
  );
}