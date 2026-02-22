import { useEffect, useMemo, useState } from "react";
import { fetchAllPerformance } from "../../services/api";
import * as XLSX from "xlsx";

type Performance = {
  roll_number: string;
  subject: string;
  semester: string;
  marks: number;
  attendance: number;
};

export default function ReportsPage() {
  const [data, setData] = useState<Performance[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchAllPerformance()
      .then((res) => setData(res.data || []))
      .catch(console.error);
  }, []);

  /* 🔥 STUDENT SUMMARY */
  const studentReport = useMemo(() => {
    const map: Record<
      string,
      { totalMarks: number; totalAttendance: number; count: number }
    > = {};

    data.forEach((d) => {
      if (!map[d.roll_number]) {
        map[d.roll_number] = {
          totalMarks: 0,
          totalAttendance: 0,
          count: 0,
        };
      }

      map[d.roll_number].totalMarks += d.marks;
      map[d.roll_number].totalAttendance += d.attendance;
      map[d.roll_number].count += 1;
    });

    return Object.entries(map).map(([roll, v]) => ({
      roll_number: roll,
      subjects: v.count,
      avg_marks: (v.totalMarks / v.count).toFixed(1),
      avg_attendance: (v.totalAttendance / v.count).toFixed(1),
    }));
  }, [data]);

  /* 🔍 FILTER */
  const filtered = studentReport.filter((s) =>
    s.roll_number.toLowerCase().includes(search.toLowerCase())
  );

  /* 📊 SUMMARY */
  const totalStudents = studentReport.length;

  /* 📁 EXPORT */
  const exportExcel = (reportData: any[], fileName: string) => {
    const worksheet = XLSX.utils.json_to_sheet(reportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Report");
    XLSX.writeFile(workbook, `${fileName}.xlsx`);
  };

  return (
    <div className="p-8">
      <h1 className="mb-6 text-xl font-semibold">Reports</h1>

      {/* 🔥 SUMMARY CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card title="Total Students" value={totalStudents} />
        <Card title="Total Records" value={data.length} />
      </div>

      {/* 🔥 ACTIONS */}
      <div className="flex flex-wrap gap-4 mb-6">
        <button
          className="bg-black text-white px-4 py-2 rounded"
          onClick={() =>
            exportExcel(studentReport, "Student_Report")
          }
        >
          Download Student Report
        </button>

        <button
          className="border px-4 py-2 rounded"
          onClick={() =>
            exportExcel(data, "Raw_Performance_Data")
          }
        >
          Download Raw Data
        </button>
      </div>

      {/* 🔍 SEARCH */}
      <input
        type="text"
        placeholder="Search by Roll Number..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mb-4 px-4 py-2 border rounded"
      />

      {/* 🔥 TABLE PREVIEW */}
      <div className="bg-white border rounded-lg p-6 shadow-sm">
        <h3 className="mb-4">Student Summary Preview</h3>

        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-2 text-left">Roll</th>
              <th className="p-2 text-left">Subjects</th>
              <th className="p-2 text-left">Avg Marks</th>
              <th className="p-2 text-left">Avg Attendance</th>
            </tr>
          </thead>

          <tbody>
            {filtered.map((s, i) => (
              <tr key={i} className="border-b hover:bg-gray-50">
                <td className="p-2">{s.roll_number}</td>
                <td className="p-2">{s.subjects}</td>
                <td className="p-2">{s.avg_marks}</td>
                <td className="p-2">{s.avg_attendance}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* 🔹 CARD */
function Card({ title, value }: any) {
  return (
    <div className="bg-white border p-6 rounded shadow-sm">
      <p className="text-sm text-gray-500">{title}</p>
      <h2 className="text-xl font-semibold">{value}</h2>
    </div>
  );
}