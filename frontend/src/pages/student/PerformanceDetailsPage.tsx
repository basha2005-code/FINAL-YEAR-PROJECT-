import { useEffect, useState } from "react";
import { fetchStudentPerformance } from "../../services/api";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function PerformanceDetailsPage() {
  const [data, setData] = useState<any[]>([]);
  const [semesterFilter, setSemesterFilter] = useState("All");

  useEffect(() => {
    fetchStudentPerformance()
      .then((res) => setData(res))
      .catch((err) => console.error(err));
  }, []);

  const filteredData =
    semesterFilter === "All"
      ? data
      : data.filter((d) => d.semester === semesterFilter);

  if (!filteredData.length)
    return <div className="p-8">Loading student performance...</div>;

  // 🔥 Calculations
  const avgMarks =
    filteredData.reduce((sum, r) => sum + r.marks, 0) /
    filteredData.length;

  const avgAttendance =
    filteredData.reduce((sum, r) => sum + r.attendance, 0) /
    filteredData.length;

  const bestSubject = filteredData.reduce((prev, curr) =>
    curr.marks > prev.marks ? curr : prev
  );

  const weakSubjects = filteredData.filter((d) => d.marks < 60);

  const getStatus = (marks: number) => {
    if (marks >= 75) return "Good";
    if (marks >= 60) return "Average";
    return "Needs Improvement";
  };

  return (
    <div className="p-8 space-y-8">
      
      <h1 className="text-xl font-semibold">Performance Details</h1>

      {/* 🔥 FILTER */}
      <select
        className="border p-2"
        value={semesterFilter}
        onChange={(e) => setSemesterFilter(e.target.value)}
      >
        <option>All</option>
        {[...new Set(data.map((d) => d.semester))].map((s) => (
          <option key={s}>{s}</option>
        ))}
      </select>

      {/* 🔥 SUMMARY CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card title="Avg Marks" value={`${avgMarks.toFixed(1)}%`} />
        <Card
          title="Attendance"
          value={`${avgAttendance.toFixed(1)}%`}
        />
        <Card title="Subjects" value={filteredData.length} />
        <Card title="Best Subject" value={bestSubject.subject} />
      </div>

      {/* 📊 CHART */}
      <div className="bg-white border p-6 rounded-lg shadow-sm">
        <h3 className="mb-4">Subject Performance</h3>

        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={filteredData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="subject" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="marks" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* 📋 TABLE */}
      <div className="bg-white border p-6 rounded-lg shadow-sm">
        <h3 className="mb-4">Detailed Table</h3>

        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-2">Subject</th>
              <th className="p-2">Marks</th>
              <th className="p-2">Attendance</th>
              <th className="p-2">Status</th>
            </tr>
          </thead>

          <tbody>
            {filteredData.map((row, i) => {
              const status = getStatus(row.marks);

              return (
                <tr key={i} className="border-b text-center">
                  <td className="p-2">{row.subject}</td>
                  <td className="p-2">{row.marks}</td>
                  <td className="p-2">{row.attendance}%</td>

                  <td className="p-2">
                    <span
                      className={
                        status === "Good"
                          ? "text-green-600"
                          : status === "Average"
                          ? "text-yellow-500"
                          : "text-red-600"
                      }
                    >
                      {status}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ⚠️ WEAK SUBJECT ALERT */}
      <div className="bg-gray-50 border p-6 rounded-lg">
        <h3 className="mb-4">Focus Areas</h3>

        {weakSubjects.length === 0 ? (
          <p className="text-green-600">
            You are doing great in all subjects 👍
          </p>
        ) : (
          weakSubjects.map((s, i) => (
            <p key={i} className="text-red-500">
              Improve {s.subject} (Marks: {s.marks})
            </p>
          ))
        )}
      </div>
    </div>
  );
}

function Card({ title, value }: any) {
  return (
    <div className="bg-white border p-4 rounded-lg shadow-sm">
      <p className="text-sm text-gray-500">{title}</p>
      <h2 className="text-lg font-semibold">{value}</h2>
    </div>
  );
}