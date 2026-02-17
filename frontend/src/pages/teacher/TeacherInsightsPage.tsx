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
} from "recharts";

const BASE_URL = "http://127.0.0.1:5000";

export default function TeacherInsightsPage() {
  const [topRisk, setTopRisk] = useState<any[]>([]);
  const [classHealth, setClassHealth] = useState<any>(null);
  const [predictionData, setPredictionData] = useState<any[]>([]);
  const [avgRiskScore, setAvgRiskScore] = useState(0);
  const [predictedMarks, setPredictedMarks] = useState(0);
  const [passProbability, setPassProbability] = useState(0);

  useEffect(() => {
    // Top Risk
    fetch(`${BASE_URL}/api/ml/top-risk`)
      .then((res) => res.json())
      .then((data) => {
        setTopRisk(data || []);
        if (data?.length) {
          const avg =
            data.reduce((sum: number, s: any) => sum + s.risk_score, 0) /
            data.length;
          setAvgRiskScore(Number(avg.toFixed(1)));
        }
      });

    // Class Health
    fetch(`${BASE_URL}/api/ml/class-health`)
      .then((res) => res.json())
      .then((data) => {
        setClassHealth(data);
        setPredictedMarks(data?.predicted_marks || 0);
        setPassProbability(data?.pass_probability || 0);

        setPredictionData([
          { name: "Current", actual: data?.current_avg || 0, predicted: data?.current_avg || 0 },
          { name: "Next Month", actual: null, predicted: data?.predicted_marks - 2 || 0 },
          { name: "Sem End", actual: null, predicted: data?.predicted_marks || 0 },
        ]);
      });
  }, []);

  const riskScoreData = [
    {
      name: "Risk Score",
      value: avgRiskScore,
      fill:
        avgRiskScore < 30
          ? "#10b981"
          : avgRiskScore < 60
          ? "#f59e0b"
          : "#ef4444",
    },
  ];

  return (
    <div className="p-8">
      <h1 className="mb-6">ML Prediction & Insights</h1>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Predicted Marks */}
        <div className="bg-white border rounded-lg p-6 shadow-sm">
          <div className="flex justify-between mb-4">
            <div>
              <p className="text-sm text-muted-foreground">
                Predicted Next Semester Marks
              </p>
              <h2>{predictedMarks}%</h2>
            </div>
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        {/* Pass Probability */}
        <div className="bg-white border rounded-lg p-6 shadow-sm">
          <div className="flex justify-between mb-4">
            <div>
              <p className="text-sm text-muted-foreground">
                Pass Probability
              </p>
              <h2>{passProbability}%</h2>
            </div>
            <Target className="w-5 h-5" />
          </div>
        </div>

        {/* Avg Risk */}
        <div className="bg-white border rounded-lg p-6 shadow-sm">
          <div className="flex justify-between mb-4">
            <div>
              <p className="text-sm text-muted-foreground">Avg Risk Score</p>
              <h2>{avgRiskScore}/100</h2>
            </div>
            <AlertCircle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Prediction Trend */}
        <div className="bg-white border rounded-lg p-6 shadow-sm">
          <h3 className="mb-4">Performance Prediction Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={predictionData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="actual"
                stroke="#000000"
                strokeWidth={2}
                dot={{ r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="predicted"
                stroke="#666666"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Risk Score Visualization */}
        <div className="bg-white border rounded-lg p-6 shadow-sm">
          <h3 className="mb-4">Risk Score Visualization</h3>
          <ResponsiveContainer width="100%" height={300}>
            <RadialBarChart
              cx="50%"
              cy="50%"
              innerRadius="60%"
              outerRadius="90%"
              data={riskScoreData}
              startAngle={180}
              endAngle={0}
            >
              <RadialBar minAngle={15} background clockWise dataKey="value" />
              <Legend iconSize={10} layout="vertical" verticalAlign="middle" />
            </RadialBarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Risk Students */}
      <div className="bg-white border rounded-lg p-6 shadow-sm">
        <h3 className="mb-4">Top Risk Students</h3>
        {topRisk.slice(0, 5).map((s, i) => (
          <p key={i}>
            Student {s.student_id} — {s.risk_score}% ({s.risk_level})
          </p>
        ))}
      </div>
    </div>
  );
}