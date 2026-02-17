import { useEffect, useMemo, useState } from 'react';
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
} from 'recharts';
import { fetchAllPerformance } from '../../services/api';

type Performance = {
  student_id: string;
  subject: string;
  semester: string;
  marks: number;
  attendance: number;
  recorded_at: string;
};

export default function AnalyticsDashboard() {
  const [data, setData] = useState<Performance[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchAllPerformance()
      .then((res) => setData(res.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  /* ---------------- SUBJECT-WISE PERFORMANCE ---------------- */
  const subjectPerformanceData = useMemo(() => {
    const map: Record<string, { total: number; count: number }> = {};

    data.forEach((d) => {
      if (!map[d.subject]) map[d.subject] = { total: 0, count: 0 };
      map[d.subject].total += d.marks;
      map[d.subject].count += 1;
    });

    return Object.entries(map).map(([subject, v]) => ({
      name: subject,
      average: v.count ? Math.round(v.total / v.count) : 0,
    }));
  }, [data]);

  /* ---------------- SEMESTER-WISE PERFORMANCE TREND ---------------- */
  const semesterTrendData = useMemo(() => {
    const map: Record<string, { total: number; count: number }> = {};

    data.forEach((d) => {
      if (!map[d.semester]) map[d.semester] = { total: 0, count: 0 };
      map[d.semester].total += d.marks;
      map[d.semester].count += 1;
    });

    return Object.entries(map)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([semester, v]) => ({
        name: semester,
        marks: v.count ? Math.round(v.total / v.count) : 0,
      }));
  }, [data]);

  /* ---------------- ATTENDANCE TREND OVER TIME ---------------- */
  const attendanceTrendData = useMemo(() => {
    return [...data]
      .sort(
        (a, b) =>
          new Date(a.recorded_at).getTime() -
          new Date(b.recorded_at).getTime()
      )
      .map((d, i) => ({
        name: `Record ${i + 1}`,
        attendance: d.attendance,
      }));
  }, [data]);

  /* ---------------- STUDENT TABLE ---------------- */
  const filteredStudents = data.filter((s) =>
    s.student_id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <div className="p-8">Loading analytics...</div>;
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="mb-2">Analytics Dashboard</h1>
        <p className="text-muted-foreground">
          Detailed academic performance analysis and trends
        </p>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Subject-wise Performance */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <h3 className="mb-4">Subject-wise Performance</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={subjectPerformanceData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="average" fill="#000000" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Semester-wise Trend */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <h3 className="mb-4">Semester-wise Performance Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={semesterTrendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="name" />
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

        {/* Attendance Trend */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm lg:col-span-2">
          <h3 className="mb-4">Attendance Trend Over Time</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={attendanceTrendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="attendance"
                stroke="#000000"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Student Performance Table */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3>Student Performance Data</h3>
          <input
            type="text"
            placeholder="Search by student ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-sm"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left">Student ID</th>
                <th className="px-4 py-3 text-left">Subject</th>
                <th className="px-4 py-3 text-left">Semester</th>
                <th className="px-4 py-3 text-left">Marks</th>
                <th className="px-4 py-3 text-left">Attendance</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map((s, i) => (
                <tr key={i} className="border-b">
                  <td className="px-4 py-2">{s.student_id}</td>
                  <td className="px-4 py-2">{s.subject}</td>
                  <td className="px-4 py-2">{s.semester}</td>
                  <td className="px-4 py-2">{s.marks}</td>
                  <td className="px-4 py-2">{s.attendance}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
