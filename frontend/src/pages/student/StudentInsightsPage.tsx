import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { fetchStudentInsight } from "../../services/api";

export default function StudentInsightsPage() {
  const [insight, setInsight] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStudentInsight()
      .then((data) => {
        setInsight(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("ML Insight Error:", err);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="p-8">Loading ML Insights...</div>;

  if (!insight || insight.error)
    return (
      <div className="p-8">
        <h1>ML Insights</h1>
        <p className="text-red-500 mt-4">
          No ML data available for this student.
        </p>
      </div>
    );

  const predicted = Math.round(insight.predicted_next_marks || 0);
  const risk = Math.round(insight.risk_score || 0);
  const riskLevel = insight.risk_level || "Low";

  const avgMarks = insight.features?.average_marks || 0;
  const avgAttendance = insight.features?.average_attendance || 0;

  const chartData = [
    { name: "Current", value: avgMarks },
    { name: "Predicted", value: predicted },
  ];

  return (
    <div className="p-8 space-y-8">
      <h1 className="text-xl font-semibold">ML Prediction & Insights</h1>

      {/* 🔹 CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card title="Predicted Marks" value={`${predicted}%`} />
        <Card title="Risk Score" value={`${risk}/100`} />
        <Card title="Risk Level" value={riskLevel} />
        <Card title="Attendance" value={`${avgAttendance}%`} />
      </div>

      {/* 🔹 CHARTS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* 📈 Trend */}
        <div className="bg-white border p-6 rounded-lg shadow-sm">
          <h3 className="mb-4">Performance Trend</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Line dataKey="value" stroke="#000" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* 🔥 Risk Level UI (FIXED CLEAN VERSION) */}
        <div className="bg-white border p-6 rounded-lg shadow-sm flex flex-col items-center justify-center">
          <h3 className="mb-4 w-full text-left">Risk Level</h3>

          <div className="flex flex-col items-center justify-center h-[200px]">

            <p
              className={`text-3xl font-bold ${
                risk >= 60
                  ? "text-red-600"
                  : risk >= 30
                  ? "text-yellow-500"
                  : "text-green-600"
              }`}
            >
              {riskLevel}
            </p>

            <p className="text-sm text-gray-500 mt-2">
              Based on marks & attendance
            </p>
          </div>
        </div>

      </div>

      {/* 🔹 SUGGESTIONS */}
      <div className="bg-gray-50 border p-6 rounded-lg">
        <h3 className="mb-4">Suggestions</h3>

        {insight.suggestions?.length ? (
          insight.suggestions.map((s: string, i: number) => (
            <p key={i} className="text-sm mb-2">
              • {s}
            </p>
          ))
        ) : (
          <p>No suggestions available</p>
        )}
      </div>
    </div>
  );
}

/* 🔹 CARD COMPONENT */
function Card({ title, value }: any) {
  return (
    <div className="bg-white border p-4 rounded-lg shadow-sm">
      <p className="text-sm text-gray-500">{title}</p>
      <h2 className="text-lg font-semibold">{value}</h2>
    </div>
  );
}