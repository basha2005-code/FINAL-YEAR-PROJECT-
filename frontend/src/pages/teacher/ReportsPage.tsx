import { useEffect, useState } from "react";
import { FileText, Download } from "lucide-react";
import { Button } from "../../components/ui/button";
import { fetchAllPerformance } from "../../services/api";
import * as XLSX from "xlsx";

type Performance = {
  student_id: string;
  subject: string;
  semester: string;
  marks: number;
  attendance: number;
};

export default function ReportsPage() {
  const [data, setData] = useState<Performance[]>([]);

  useEffect(() => {
    fetchAllPerformance()
      .then((res) => setData(res.data))
      .catch(console.error);
  }, []);

  /* ---------------- STUDENT-WISE REPORT ---------------- */
  const generateStudentReport = () => {
    const map: Record<
      string,
      { totalMarks: number; totalAttendance: number; count: number }
    > = {};

    data.forEach((d) => {
      if (!map[d.student_id])
        map[d.student_id] = { totalMarks: 0, totalAttendance: 0, count: 0 };

      map[d.student_id].totalMarks += d.marks;
      map[d.student_id].totalAttendance += d.attendance;
      map[d.student_id].count += 1;
    });

    return Object.entries(map).map(([id, v]) => ({
      Student_ID: id,
      Subjects: v.count,
      Average_Marks: (v.totalMarks / v.count).toFixed(2),
      Average_Attendance: (v.totalAttendance / v.count).toFixed(2),
      Risk_Level:
        v.totalMarks / v.count < 40 || v.totalAttendance / v.count < 75
          ? "At Risk"
          : "On Track",
    }));
  };

  /* ---------------- SUBJECT-WISE REPORT ---------------- */
  const generateSubjectReport = () => {
    const map: Record<string, { total: number; count: number }> = {};

    data.forEach((d) => {
      if (!map[d.subject]) map[d.subject] = { total: 0, count: 0 };
      map[d.subject].total += d.marks;
      map[d.subject].count += 1;
    });

    return Object.entries(map).map(([subject, v]) => ({
      Subject: subject,
      Students: v.count,
      Average_Marks: (v.total / v.count).toFixed(2),
    }));
  };

  /* ---------------- CLASS REPORT ---------------- */
  const generateClassReport = () => {
    if (data.length === 0) return [];

    const totalStudents = new Set(data.map((d) => d.student_id)).size;
    const avgMarks =
      data.reduce((sum, d) => sum + d.marks, 0) / data.length;
    const avgAttendance =
      data.reduce((sum, d) => sum + d.attendance, 0) / data.length;

    const passed = data.filter((d) => d.marks >= 40).length;
    const failed = data.filter((d) => d.marks < 40).length;

    return [
      {
        Total_Students: totalStudents,
        Average_Marks: avgMarks.toFixed(2),
        Average_Attendance: avgAttendance.toFixed(2),
        Pass_Percentage: ((passed / data.length) * 100).toFixed(2),
        Fail_Percentage: ((failed / data.length) * 100).toFixed(2),
      },
    ];
  };

  /* ---------------- EXPORT FUNCTION ---------------- */
  const exportExcel = (reportData: any[], fileName: string) => {
    const worksheet = XLSX.utils.json_to_sheet(reportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Report");
    XLSX.writeFile(workbook, `${fileName}.xlsx`);
  };

  const exportCSV = (reportData: any[], fileName: string) => {
    const worksheet = XLSX.utils.json_to_sheet(reportData);
    const csv = XLSX.utils.sheet_to_csv(worksheet);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${fileName}.csv`;
    link.click();
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="mb-2">Reports</h1>
        <p className="text-muted-foreground">
          Generate and download academic performance reports
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Student Report */}
        <div className="bg-white border rounded-lg p-6 shadow-sm">
          <FileText className="mb-4" />
          <h3 className="mb-4">Student-wise Report</h3>
          <div className="flex gap-2">
            <Button
              className="flex-1 bg-black text-white"
              onClick={() =>
                exportExcel(generateStudentReport(), "Student_Report")
              }
            >
              <Download className="w-4 h-4 mr-2" />
              Excel
            </Button>
            <Button
              variant="outline"
              className="flex-1"
              onClick={() =>
                exportCSV(generateStudentReport(), "Student_Report")
              }
            >
              CSV
            </Button>
          </div>
        </div>

        {/* Subject Report */}
        <div className="bg-white border rounded-lg p-6 shadow-sm">
          <FileText className="mb-4" />
          <h3 className="mb-4">Subject-wise Report</h3>
          <div className="flex gap-2">
            <Button
              className="flex-1 bg-black text-white"
              onClick={() =>
                exportExcel(generateSubjectReport(), "Subject_Report")
              }
            >
              <Download className="w-4 h-4 mr-2" />
              Excel
            </Button>
            <Button
              variant="outline"
              className="flex-1"
              onClick={() =>
                exportCSV(generateSubjectReport(), "Subject_Report")
              }
            >
              CSV
            </Button>
          </div>
        </div>

        {/* Class Report */}
        <div className="bg-white border rounded-lg p-6 shadow-sm">
          <FileText className="mb-4" />
          <h3 className="mb-4">Class-wise Report</h3>
          <div className="flex gap-2">
            <Button
              className="flex-1 bg-black text-white"
              onClick={() =>
                exportExcel(generateClassReport(), "Class_Report")
              }
            >
              <Download className="w-4 h-4 mr-2" />
              Excel
            </Button>
            <Button
              variant="outline"
              className="flex-1"
              onClick={() =>
                exportCSV(generateClassReport(), "Class_Report")
              }
            >
              CSV
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}