import { useEffect, useMemo, useState } from "react";
import {
  BarChart,
  Bar,
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
  student_id: number;
  roll_number: string;
  name: string;
  subject: string;
  semester: string;
  marks: number;
  attendance: number;
  recorded_at: string;
};

export default function AnalyticsDashboard() {
  const [data, setData] = useState<Performance[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchAllPerformance()
      .then((res) => setData(res.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const subjectPerformance = useMemo(() => {
    const map: Record<string, { total: number; count: number }> = {};
    data.forEach((d) => {
      if (!map[d.subject]) map[d.subject] = { total: 0, count: 0 };
      map[d.subject].total += d.marks;
      map[d.subject].count += 1;
    });

    return Object.entries(map).map(([subject, v]) => ({
      name: subject,
      average: Math.round(v.total / v.count),
    }));
  }, [data]);

  const semesterTrend = useMemo(() => {
    const map: Record<string, { total: number; count: number }> = {};
    data.forEach((d) => {
      if (!map[d.semester]) map[d.semester] = { total: 0, count: 0 };
      map[d.semester].total += d.marks;
      map[d.semester].count += 1;
    });

    return Object.entries(map).map(([semester, v]) => ({
      name: semester,
      marks: Math.round(v.total / v.count),
    }));
  }, [data]);

  const filtered = data.filter((d) =>
    d.roll_number.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="p-8">
      <h1 className="mb-6 text-xl font-semibold">Analytics Dashboard</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white border rounded-lg p-6 shadow-sm">
          <h3 className="mb-4">Subject-wise Performance</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={subjectPerformance}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="average" fill="#000000" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white border rounded-lg p-6 shadow-sm">
          <h3 className="mb-4">Semester Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={semesterTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="marks" stroke="#000000" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white border rounded-lg p-6 shadow-sm">
        <h3 className="mb-4">Student Records</h3>

        <input
          type="text"
          placeholder="Search by Roll Number..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="mb-4 px-4 py-2 border rounded"
        />

        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-2 text-left">Roll No</th>
              <th className="p-2 text-left">Subject</th>
              <th className="p-2 text-left">Semester</th>
              <th className="p-2 text-left">Marks</th>
              <th className="p-2 text-left">Attendance</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((d, i) => (
              <tr key={i} className="border-b">
                <td className="p-2">{d.roll_number}</td>
                <td className="p-2">{d.subject}</td>
                <td className="p-2">{d.semester}</td>
                <td className="p-2">{d.marks}</td>
                <td className="p-2">{d.attendance}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}