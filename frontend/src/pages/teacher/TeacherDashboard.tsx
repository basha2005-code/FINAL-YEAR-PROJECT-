import { useEffect, useState } from "react";
import {
  fetchAverageMarks,
  fetchAverageAttendance,
  fetchPassFail,
  fetchAtRiskStudents,
  fetchSubjectDifficulty,
} from "../../services/api";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

export default function TeacherDashboard() {
  const [avgMarks, setAvgMarks] = useState(0);
  const [avgAttendance, setAvgAttendance] = useState(0);
  const [passFail, setPassFail] = useState({ pass: 0, fail: 0 });
  const [riskStudents, setRiskStudents] = useState<any[]>([]);
  const [subjectDifficulty, setSubjectDifficulty] = useState<any[]>([]);

  useEffect(() => {
    async function loadData() {
      try {
        const marks = await fetchAverageMarks();
        const attendance = await fetchAverageAttendance();
        const pf = await fetchPassFail();
        const risk = await fetchAtRiskStudents();
        const subjects = await fetchSubjectDifficulty();

        setAvgMarks(marks.average_marks || 0);
        setAvgAttendance(attendance.average_attendance || 0);
        setPassFail(pf);
        setRiskStudents(risk);
        setSubjectDifficulty(subjects);
      } catch (err) {
        console.error("Teacher Dashboard Error:", err);
      }
    }

    loadData();
  }, []);

  const passFailData = [
    { name: "Pass", value: passFail.pass },
    { name: "Fail", value: passFail.fail },
  ];

  const COLORS = ["#10b981", "#ef4444"];

  return (
    <div className="p-8">
      <h1 className="text-xl font-semibold mb-6">
        Teacher Dashboard
      </h1>

      {/* 🔹 CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card title="Average Marks" value={`${avgMarks}%`} color="green" />
        <Card title="Attendance" value={`${avgAttendance}%`} color="blue" />
        <Card title="At-Risk Students" value={riskStudents.length} color="red" />
        <Card title="Pass Rate" value={`${passFail.pass}`} color="purple" />
      </div>

      {/* 🔹 CHARTS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">

        {/* PASS FAIL */}
        <div className="bg-white p-6 rounded border shadow-sm">
          <h3 className="mb-4 font-medium">Pass vs Fail</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={passFailData} dataKey="value" outerRadius={100}>
                {passFailData.map((entry, index) => (
                  <Cell key={index} fill={COLORS[index]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* RISK STUDENTS */}
        <div className="bg-white p-6 rounded border shadow-sm">
          <h3 className="mb-4 font-medium">Top Risk Students</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={riskStudents.slice(0, 5)}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="roll_number" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="risk_score" fill="#ef4444" />
            </BarChart>
          </ResponsiveContainer>
        </div>

      </div>

      {/* 🔹 SUBJECT DIFFICULTY (NEW 🔥) */}
      <div className="bg-white p-6 rounded border shadow-sm mb-8">
        <h3 className="mb-4 font-medium">Subject Difficulty Analysis</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={subjectDifficulty}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="subject" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="average_marks" fill="#000000" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* 🔹 TABLE */}
      <div className="bg-white p-6 rounded border shadow-sm">
        <h3 className="mb-4 font-medium">At-Risk Students</h3>

        <table className="w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 text-left">Roll</th>
              <th className="p-2 text-left">Marks</th>
              <th className="p-2 text-left">Attendance</th>
              <th className="p-2 text-left">Risk</th>
            </tr>
          </thead>

          <tbody>
            {riskStudents.map((s, i) => (
              <tr key={i} className="border-b">
                <td className="p-2">{s.roll_number}</td>
                <td className="p-2">{s.average_marks}</td>
                <td className="p-2">{s.average_attendance}</td>
                <td className="p-2 text-red-600 font-semibold">
                  {s.risk_score}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* 🔹 CARD */
function Card({ title, value, color }: any) {
  const colors: any = {
    green: "text-green-600",
    blue: "text-blue-600",
    red: "text-red-600",
    purple: "text-purple-600",
  };

  return (
    <div className="bg-white border p-6 rounded shadow-sm">
      <p className="text-sm text-gray-500">{title}</p>
      <h2 className={`text-xl font-semibold ${colors[color]}`}>
        {value}
      </h2>
    </div>
  );
}