import { useEffect, useState } from "react";
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

  useEffect(() => {
    fetchAllPerformance()
      .then((res) => setData(res.data || []))
      .catch(console.error);
  }, []);

  const generateStudentReport = () => {
    const map: Record<
      string,
      { totalMarks: number; totalAttendance: number; count: number }
    > = {};

    data.forEach((d) => {
      if (!map[d.roll_number])
        map[d.roll_number] = { totalMarks: 0, totalAttendance: 0, count: 0 };

      map[d.roll_number].totalMarks += d.marks;
      map[d.roll_number].totalAttendance += d.attendance;
      map[d.roll_number].count += 1;
    });

    return Object.entries(map).map(([roll, v]) => ({
      Roll_Number: roll,
      Subjects: v.count,
      Average_Marks: (v.totalMarks / v.count).toFixed(2),
      Average_Attendance: (v.totalAttendance / v.count).toFixed(2),
    }));
  };

  const exportExcel = (reportData: any[], fileName: string) => {
    const worksheet = XLSX.utils.json_to_sheet(reportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Report");
    XLSX.writeFile(workbook, `${fileName}.xlsx`);
  };

  return (
    <div className="p-8">
      <h1 className="mb-6 text-xl font-semibold">Reports</h1>

      <button
        className="bg-black text-white px-4 py-2 rounded"
        onClick={() =>
          exportExcel(generateStudentReport(), "Student_Report")
        }
      >
        Download Student Report
      </button>
    </div>
  );
}