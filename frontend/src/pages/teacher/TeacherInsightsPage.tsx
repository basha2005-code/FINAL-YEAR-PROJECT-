import { useEffect, useState } from "react";
import { TrendingUp, Target, AlertCircle } from "lucide-react";
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
  BarChart,
  Bar,
} from "recharts";

const BASE_URL = "http://127.0.0.1:5000";

export default function TeacherInsightsPage() {
  const [topRisk, setTopRisk] = useState<any[]>([]);
  const [classHealth, setClassHealth] = useState<any>(null);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [predictionData, setPredictionData] = useState<any[]>([]);
  const [avgRiskScore, setAvgRiskScore] = useState(0);
  const [predictedMarks, setPredictedMarks] = useState(0);
  const [passProbability, setPassProbability] = useState(0);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    /* 🔹 TOP RISK */
    fetch(`${BASE_URL}/api/ml/top-risk`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setTopRisk(data);

          const avg =
            data.reduce((sum: number, s: any) => sum + s.risk_score, 0) /
            (data.length || 1);

          setAvgRiskScore(Number(avg.toFixed(1)));
        }
      })
      .catch(console.error);

    /* 🔹 CLASS HEALTH */
    fetch(`${BASE_URL}/api/ml/class-health`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        setClassHealth(data);

        setPredictedMarks(data?.predicted_marks || 0);
        setPassProbability(data?.pass_probability || 0);

        setPredictionData([
          {
            name: "Current",
            actual: data?.current_avg || 0,
            predicted: data?.current_avg || 0,
          },
          {
            name: "Next Month",
            actual: null,
            predicted: (data?.predicted_marks || 0) - 2,
          },
          {
            name: "Sem End",
            actual: null,
            predicted: data?.predicted_marks || 0,
          },
        ]);
      })
      .catch(console.error);

    /* 🔥 SUBJECT DIFFICULTY */
    fetch(`${BASE_URL}/api/ml/subject-difficulty`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        setSubjects(data || []);
      })
      .catch(() => setSubjects([]));
  }, []);

  /* 🔥 AI SUGGESTIONS */
  const suggestions: string[] = [];

  if ((classHealth?.current_avg || 0) < 60) {
    suggestions.push("Improve overall class performance.");
  }

  if ((classHealth?.pass_probability || 0) < 75) {
    suggestions.push("Attendance or pass rate is low.");
  }

  if (topRisk.length > 0) {
    suggestions.push("Provide extra focus on high-risk students.");
  }

  if (subjects.length > 0) {
    const hardest = [...subjects].sort(
      (a, b) => a.average_marks - b.average_marks
    )[0];

    if (hardest) {
      suggestions.push(
        `${hardest.subject} is difficult. Plan revision sessions.`
      );
    }
  }

  const riskScoreData = [
    {
      name: "Risk",
      value: avgRiskScore,
      fill: "#000000",
    },
  ];

  return (
    <div className="p-8">
      <h1 className="mb-6 text-2xl font-semibold">
        ML Prediction & Insights
      </h1>

      {/* 🔹 KPI */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card title="Predicted Marks" value={`${predictedMarks}%`} icon={<TrendingUp />} />
        <Card title="Pass Probability" value={`${passProbability}%`} icon={<Target />} />
        <Card title="Avg Risk Score" value={`${avgRiskScore}/100`} icon={<AlertCircle />} />
      </div>

      {/* 🔹 CHARTS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">

        {/* Trend */}
        <div className="bg-white border rounded-lg p-6">
          <h3 className="mb-4">Performance Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={predictionData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Line dataKey="actual" stroke="#000000" />
              <Line dataKey="predicted" stroke="#666666" strokeDasharray="5 5" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Risk */}
        <div className="bg-white border rounded-lg p-6">
          <h3 className="mb-4">Risk Score</h3>
          <ResponsiveContainer width="100%" height={300}>
            <RadialBarChart
              innerRadius="60%"
              outerRadius="90%"
              data={riskScoreData}
              startAngle={180}
              endAngle={0}
            >
              <RadialBar dataKey="value" />
              <Legend />
            </RadialBarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 🔥 SUBJECT DIFFICULTY */}
      <div className="bg-white border rounded-lg p-6 mb-8">
        <h3 className="mb-4">Subject Difficulty</h3>

        {subjects.length === 0 ? (
          <p>No data available</p>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={subjects}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="subject" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="average_marks" fill="#000000" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* 🔹 TOP RISK TABLE */}
      <div className="bg-white border rounded-lg p-6 mb-8">
        <h3 className="mb-4">Top Risk Students</h3>

        {topRisk.length === 0 ? (
          <p>No data available</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-2 text-left">Roll</th>
                <th className="p-2 text-left">Risk</th>
                <th className="p-2 text-left">Level</th>
              </tr>
            </thead>
            <tbody>
              {topRisk.slice(0, 5).map((s, i) => (
                <tr key={i} className="border-b">
                  <td className="p-2">{s.roll_number}</td>
                  <td className="p-2 text-red-600">{s.risk_score}</td>
                  <td className="p-2">{s.risk_level}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* 🔥 AI SUGGESTIONS */}
      <div className="bg-white border rounded-lg p-6">
        <h3 className="mb-4">AI Recommendations</h3>

        {suggestions.length === 0 ? (
          <p>Everything looks good 👍</p>
        ) : (
          <ul className="space-y-2">
            {suggestions.map((s, i) => (
              <li key={i}>• {s}</li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

/* CARD */
function Card({ title, value, icon }: any) {
  return (
    <div className="bg-white border rounded-lg p-6 flex justify-between items-center">
      <div>
        <p className="text-sm text-gray-500">{title}</p>
        <h2 className="text-xl font-semibold">{value}</h2>
      </div>
      {icon}
    </div>
  );
}