import { useEffect, useState } from "react";

import {
  fetchAverageMarks,
  fetchAverageAttendance,
  fetchPassFail,
  fetchAtRiskStudents,
  fetchSubjectDifficulty,
  fetchClassHealth
} from "../../services/api";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";

export default function TeacherDashboard() {

  const [avgMarks, setAvgMarks] = useState(0);
  const [avgAttendance, setAvgAttendance] = useState(0);
  const [passFail, setPassFail] = useState<any>({});
  const [riskStudents, setRiskStudents] = useState<any[]>([]);
  const [subjectDifficulty, setSubjectDifficulty] = useState<any[]>([]);
  const [classHealth, setClassHealth] = useState<any>(null);

  useEffect(() => {

    async function loadData() {

      try {

        const marks = await fetchAverageMarks();
        const attendance = await fetchAverageAttendance();
        const pf = await fetchPassFail();
        const risk = await fetchAtRiskStudents();
        const subjects = await fetchSubjectDifficulty();
        const health = await fetchClassHealth();

        setAvgMarks(marks.average_marks || 0);
        setAvgAttendance(attendance.average_attendance || 0);
        setPassFail(pf);
        setRiskStudents(risk);
        setSubjectDifficulty(subjects);
        setClassHealth(health);

      } catch (err) {

        console.error("Dashboard Error:", err);

      }

    }

    loadData();

  }, []);

  const passRate =
    passFail.pass + passFail.fail > 0
      ? Math.round((passFail.pass / (passFail.pass + passFail.fail)) * 100)
      : 0;

  const highRisk = riskStudents.filter(
    (s) => s.risk_level === "High"
  ).length;

  const riskChart = [
    { name: "High", value: riskStudents.filter(s => s.risk_level === "High").length },
    { name: "Medium", value: riskStudents.filter(s => s.risk_level === "Medium").length },
    { name: "Low", value: riskStudents.filter(s => s.risk_level === "Low").length }
  ];

  const COLORS = ["#ef4444", "#f59e0b", "#10b981"];

  const trendData = [
    { semester: "S1", health: 78 },
    { semester: "S2", health: 72 },
    { semester: "S3", health: classHealth?.health_score || 0 }
  ];

  return (

    <div className="bg-gray-50 min-h-screen">

      <div className="max-w-6xl mx-auto p-6 space-y-6">

        <h1 className="text-2xl font-semibold">
          Teacher Analytics Dashboard
        </h1>

        {/* TOP KPI */}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          <DashboardCard
            title="High Risk Students"
            value={highRisk}
          />

          <DashboardCard
            title="Class Health Score"
            value={classHealth?.health_score || 0}
          />

        </div>

        {/* SECOND KPI */}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          <DashboardCard
            title="Average Marks"
            value={`${avgMarks}%`}
          />

          <DashboardCard
            title="Attendance"
            value={`${avgAttendance}%`}
          />

          <DashboardCard
            title="Pass Rate"
            value={`${passRate}%`}
          />

          <DashboardCard
            title="Students Analysed"
            value={riskStudents.length}
          />

        </div>

        {/* PERFORMANCE TREND */}

        <div className="bg-white p-6 rounded-xl border shadow-sm">

          <h3 className="mb-4 font-medium">
            Performance Trend
          </h3>

          <ResponsiveContainer width="100%" height={300}>

            <LineChart data={trendData}>

              <CartesianGrid strokeDasharray="3 3" />

              <XAxis dataKey="semester" />

              <YAxis />

              <Tooltip />

              <Line
                type="monotone"
                dataKey="health"
                stroke="#111827"
                strokeWidth={3}
              />

            </LineChart>

          </ResponsiveContainer>

        </div>

        {/* CHART SECTION */}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* SUBJECT DIFFICULTY */}

          <div className="bg-white p-6 rounded-xl border shadow-sm">

            <h3 className="mb-4 font-medium">
              Subject Difficulty
            </h3>

            <ResponsiveContainer width="100%" height={250}>

              <BarChart data={subjectDifficulty}>

                <CartesianGrid strokeDasharray="3 3" />

                <XAxis dataKey="subject" />

                <YAxis />

                <Tooltip />

                <Bar dataKey="average_marks" fill="#6366f1" />

              </BarChart>

            </ResponsiveContainer>

          </div>

          {/* RISK DISTRIBUTION */}

          <div className="bg-white p-6 rounded-xl border shadow-sm">

            <h3 className="mb-4 font-medium">
              Risk Distribution
            </h3>

            <ResponsiveContainer width="100%" height={250}>

              <PieChart>

                <Pie
                  data={riskChart}
                  dataKey="value"
                  innerRadius={60}
                  outerRadius={90}
                  label
                >

                  {riskChart.map((entry, index) => (

                    <Cell
                      key={index}
                      fill={COLORS[index % COLORS.length]}
                    />

                  ))}

                </Pie>

                <Tooltip />

              </PieChart>

            </ResponsiveContainer>

          </div>

        </div>

        {/* TOP RISK STUDENTS */}

        <div className="bg-white p-6 rounded-xl border shadow-sm">

          <h3 className="mb-4 font-medium">
            Top Risk Students
          </h3>

          <table className="w-full text-sm">

            <thead className="border-b">

              <tr>

                <th className="text-left py-2">Roll</th>
                <th className="text-left">Marks</th>
                <th className="text-left">Attendance</th>
                <th className="text-left">Risk Score</th>

              </tr>

            </thead>

            <tbody>

              {riskStudents.slice(0,5).map((s,i)=> (

                <tr key={i} className="border-b">

                  <td className="py-2">{s.roll_number}</td>
                  <td>{s.average_marks}</td>
                  <td>{s.average_attendance}</td>
                  <td className="text-red-600 font-semibold">
                    {s.risk_score}
                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

      </div>

    </div>

  );

}

function DashboardCard({ title, value }: any) {

  return (

    <div className="bg-white border rounded-xl p-6 shadow-sm">

      <p className="text-sm text-gray-500">
        {title}
      </p>

      <h2 className="text-2xl font-semibold mt-2">
        {value}
      </h2>

    </div>

  );

}