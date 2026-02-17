import { useEffect, useState } from "react";
import { fetchAllPerformance } from "../../services/api";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface PerformanceRow {
  student_id: string;   // 🔥 string (matches backend)
  subject: string;
  marks: number;
  attendance: number;
  semester: string;
}

export default function PerformanceDetailsPage() {
  const [data, setData] = useState<PerformanceRow[]>([]);
  const studentId = "1"; // 🔥 must be string

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetchAllPerformance();

        const studentData = res.data.filter(
          (row: PerformanceRow) =>
            String(row.student_id) === studentId
        );

        setData(studentData);
      } catch (err) {
        console.error("Error loading performance:", err);
      }
    }

    loadData();
  }, []);

  if (!data.length) {
    return <div className="p-8">Loading student performance...</div>;
  }

  // 🔥 Calculations
  const totalMarks = data.reduce((sum, row) => sum + row.marks, 0);
  const overallPercentage = (totalMarks / data.length).toFixed(1);

  const overallAttendance = (
    data.reduce((sum, row) => sum + row.attendance, 0) / data.length
  ).toFixed(1);

  const subjectData = data.map((row) => ({
    name: row.subject,
    marks: row.marks,
  }));

  const calculateGrade = (percentage: number) => {
    if (percentage >= 85) return "A";
    if (percentage >= 70) return "B";
    if (percentage >= 60) return "C";
    return "D";
  };

  const grade = calculateGrade(Number(overallPercentage));

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="mb-2">Performance Details</h1>
        <p className="text-muted-foreground">
          Detailed subject-wise performance breakdown
        </p>
      </div>

      {/* Overall Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <p className="text-sm text-muted-foreground">Overall Average</p>
          <h2>{overallPercentage}%</h2>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <p className="text-sm text-muted-foreground">Current Grade</p>
          <h2>{grade}</h2>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <p className="text-sm text-muted-foreground">Subjects Enrolled</p>
          <h2>{data.length}</h2>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm mb-8">
        <h3 className="mb-4">Subject-wise Marks Distribution</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={subjectData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="marks" fill="#000000" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm mb-8">
        <h3 className="mb-4">Subject-wise Performance</h3>
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left">Subject</th>
              <th className="px-4 py-2 text-left">Marks</th>
              <th className="px-4 py-2 text-left">Attendance</th>
              <th className="px-4 py-2 text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row) => {
              const isLow = row.marks < 60 || row.attendance < 75;

              return (
                <tr key={row.subject} className="border-b">
                  <td className="px-4 py-2">{row.subject}</td>
                  <td className="px-4 py-2">{row.marks}</td>
                  <td className="px-4 py-2">{row.attendance}%</td>
                  <td className="px-4 py-2">
                    {isLow ? (
                      <span className="text-orange-600">
                        Needs Improvement
                      </span>
                    ) : (
                      <span className="text-green-600">Good</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Dynamic Suggestions */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
        <h3 className="mb-4">Improvement Suggestions</h3>

        <div className="space-y-3">
          {data
            .filter(
              (row) => row.marks < 60 || row.attendance < 75
            )
            .map((row) => (
              <div key={row.subject} className="bg-white p-4 rounded border">
                <strong>{row.subject}</strong>
                <p className="text-sm text-muted-foreground">
                  {row.marks < 60 &&
                    "Improve your subject understanding and practice more problems. "}
                  {row.attendance < 75 &&
                    "Increase class attendance to improve performance."}
                </p>
              </div>
            ))}

          {/* If no issues */}
          {data.every(
            (row) => row.marks >= 60 && row.attendance >= 75
          ) && (
            <div className="bg-white p-4 rounded border">
              <strong>Great Work!</strong>
              <p className="text-sm text-muted-foreground">
                You are performing well in all subjects. Keep it up!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}