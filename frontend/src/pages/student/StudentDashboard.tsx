import { useEffect, useState } from "react";
import { fetchStudentPerformance, fetchStudentInsight } from "../../services/api";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";

export default function StudentDashboard() {
  const [data, setData] = useState<any[]>([]);
  const [insight, setInsight] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetchStudentPerformance(),
      fetchStudentInsight(),
    ])
      .then(([performance, insightData]) => {
        setData(performance);
        setInsight(insightData);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="p-8">Loading...</div>;
  if (!data.length) return <div className="p-8">No data</div>;

  const avgMarks =
    data.reduce((sum, r) => sum + r.marks, 0) / data.length;

  const avgAttendance =
    data.reduce((sum, r) => sum + r.attendance, 0) / data.length;

  const subjectData = data.map((d) => ({
    subject: d.subject,
    marks: d.marks,
  }));

  const weakSubjects = data.filter((d) => d.marks < 60);

  const riskColor =
    insight?.risk_score < 30
      ? "text-green-600"
      : insight?.risk_score < 60
      ? "text-yellow-500"
      : "text-red-600";

  return (
    <div className="p-8 space-y-8">
      
      {/* 🔥 KPI CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card title="Avg Marks" value={`${avgMarks.toFixed(1)}%`} />
        <Card title="Attendance" value={`${avgAttendance.toFixed(1)}%`} />
        <Card
          title="Risk Score"
          value={`${insight?.risk_score || 0}/100`}
          className={riskColor}
        />
        <Card
          title="Predicted Marks"
          value={`${Math.round(insight?.predicted_next_marks || 0)}%`}
        />
      </div>

      {/* 📈 PERFORMANCE TREND */}
      <div className="bg-white border p-6 rounded-lg shadow-sm">
        <h3 className="mb-4">Performance Trend</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="semester" />
            <YAxis />
            <Tooltip />
            <Line dataKey="marks" stroke="#000" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* 📊 SUBJECT ANALYSIS */}
      <div className="bg-white border p-6 rounded-lg shadow-sm">
        <h3 className="mb-4">Subject Performance</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={subjectData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="subject" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="marks" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* ⚠️ WEAK SUBJECTS */}
      <div className="bg-white border p-6 rounded-lg shadow-sm">
        <h3 className="mb-4">Weak Subjects</h3>

        {weakSubjects.length === 0 ? (
          <p className="text-green-600">All subjects are good 👍</p>
        ) : (
          weakSubjects.map((s, i) => (
            <p key={i} className="text-red-500">
              {s.subject} ({s.marks}%)
            </p>
          ))
        )}
      </div>

      {/* 💡 ML SUGGESTIONS */}
      <div className="bg-gray-50 border p-6 rounded-lg">
        <h3 className="mb-4">AI Suggestions</h3>

        {insight?.suggestions?.map((s: string, i: number) => (
          <p key={i}>• {s}</p>
        ))}
      </div>
    </div>
  );
}

function Card({ title, value, className }: any) {
  return (
    <div className={`bg-white border p-4 rounded-lg shadow-sm ${className}`}>
      <p className="text-sm text-gray-500">{title}</p>
      <h2 className="text-xl font-semibold">{value}</h2>
    </div>
  );
}