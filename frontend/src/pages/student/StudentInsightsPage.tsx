import { useEffect, useState } from "react";
import { fetchStudentInsight } from "../../services/api";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadialBarChart,
  RadialBar,
  Legend,
} from "recharts";

export default function StudentInsightsPage() {
  const [insight, setInsight] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
  const studentId = localStorage.getItem("student_id") || "1";

  fetchStudentInsight(studentId)
    .then((data) => {
      setInsight(data);
      setLoading(false);
    })
    .catch((err) => {
      console.error(err);
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

  const predictedMarks = insight.predicted_next_marks;
  const riskScore = insight.risk_score;
  const passProbability = 100 - riskScore;

  const predictionData = [
    {
      name: "Current",
      predicted: predictedMarks - 2,
      actual: insight.features?.average_marks || 0,
    },
    { name: "Next Month", predicted: predictedMarks, actual: null },
    { name: "Sem End", predicted: predictedMarks + 2, actual: null },
  ];

  const riskData = [
    {
      name: "Risk Score",
      value: Math.round(riskScore),
      fill:
        riskScore < 30
          ? "#10b981"
          : riskScore < 60
          ? "#f59e0b"
          : "#ef4444",
    },
  ];

  return (
    <div className="p-8">
      <h1 className="mb-6">ML Prediction & Insights</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card
          title="Predicted Next Semester Marks"
          value={`${Math.round(predictedMarks)}%`}
        />
        <Card
          title="Pass Probability"
          value={`${Math.round(passProbability)}%`}
        />
        <Card
          title="Your Risk Score"
          value={`${Math.round(riskScore)}/100`}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <ChartCard title="Performance Prediction Trend">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={predictionData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Line dataKey="actual" stroke="#000000" strokeWidth={2} />
              <Line
                dataKey="predicted"
                stroke="#666666"
                strokeWidth={2}
                strokeDasharray="5 5"
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Risk Score Visualization">
          <ResponsiveContainer width="100%" height={300}>
            <RadialBarChart
              innerRadius="60%"
              outerRadius="90%"
              data={riskData}
              startAngle={180}
              endAngle={0}
            >
              <RadialBar dataKey="value" />
              <Legend />
            </RadialBarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div className="bg-white border rounded-lg p-6 shadow-sm">
        <h3 className="mb-4">Recommendations</h3>
        <ul className="space-y-2 text-sm">
          {insight.suggestions.map((s: string, i: number) => (
            <li key={i}>• {s}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function Card({ title, value }: any) {
  return (
    <div className="bg-white border rounded-lg p-6 shadow-sm">
      <p className="text-sm text-muted-foreground mb-1">{title}</p>
      <h2>{value}</h2>
    </div>
  );
}

function ChartCard({ title, children }: any) {
  return (
    <div className="bg-white border rounded-lg p-6 shadow-sm">
      <h3 className="mb-4">{title}</h3>
      {children}
    </div>
  );
}