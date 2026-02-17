import { useEffect, useMemo, useState } from "react";
import { KPICard } from "../../components/dashboard/KPICard";
import {
  TrendingUp,
  Calendar,
  Award,
  AlertTriangle,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { fetchAllPerformance } from "../../services/api";

type Performance = {
  student_id: string;
  subject: string;
  semester: string;
  marks: number;
  attendance: number;
  recorded_at: string;
};

export default function StudentDashboard() {
  const [data, setData] = useState<Performance[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllPerformance()
      .then((res) => setData(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // 🔥 Pick first available student
  const studentId = useMemo(() => {
    if (!data.length) return null;
    return data[0].student_id;
  }, [data]);

  const studentRecords = useMemo(() => {
    if (!studentId) return [];
    return data.filter((d) => d.student_id === studentId);
  }, [data, studentId]);

  // Overall marks average
  const overallMarks = useMemo(() => {
    if (!studentRecords.length) return 0;
    const total = studentRecords.reduce((sum, r) => sum + r.marks, 0);
    return Math.round(total / studentRecords.length);
  }, [studentRecords]);

  const overallAttendance = useMemo(() => {
    if (!studentRecords.length) return 0;
    const total = studentRecords.reduce((sum, r) => sum + r.attendance, 0);
    return Math.round(total / studentRecords.length);
  }, [studentRecords]);

  const grade =
    overallMarks >= 75
      ? "A"
      : overallMarks >= 60
      ? "B"
      : overallMarks >= 50
      ? "C"
      : overallMarks >= 40
      ? "D"
      : "F";

  const isAtRisk = overallMarks < 40 || overallAttendance < 75;

  if (loading) return <div className="p-8">Loading student data...</div>;
  if (!studentId) return <div className="p-8">No student data available.</div>;

  return (
    <div className="p-8">
      <h1 className="mb-6">Student Dashboard</h1>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <KPICard
          title="Overall Marks"
          value={`${overallMarks}%`}
          icon={TrendingUp}
        />
        <KPICard
          title="Attendance"
          value={`${overallAttendance}%`}
          icon={Calendar}
        />
        <KPICard title="Grade" value={grade} icon={Award} />
        <KPICard
          title="Risk Status"
          value={isAtRisk ? "At Risk" : "On Track"}
          icon={AlertTriangle}
        />
      </div>

      {/* Marks Trend */}
      <div className="bg-white border rounded-lg p-6 shadow-sm mb-8">
        <h3 className="mb-4">Marks Trend</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={studentRecords}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="semester" />
            <YAxis />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="marks"
              stroke="#000000"
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Subject Table */}
      <div className="bg-white border rounded-lg p-6 shadow-sm">
        <h3 className="mb-4">Subject Performance</h3>
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-4 py-3 text-left">Subject</th>
              <th className="px-4 py-3 text-left">Semester</th>
              <th className="px-4 py-3 text-left">Marks</th>
              <th className="px-4 py-3 text-left">Attendance</th>
            </tr>
          </thead>
          <tbody>
            {studentRecords.map((r, i) => (
              <tr key={i} className="border-b">
                <td className="px-4 py-2">{r.subject}</td>
                <td className="px-4 py-2">{r.semester}</td>
                <td className="px-4 py-2">{r.marks}</td>
                <td className="px-4 py-2">{r.attendance}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}