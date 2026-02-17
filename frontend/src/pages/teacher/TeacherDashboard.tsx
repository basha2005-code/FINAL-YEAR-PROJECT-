import { useEffect, useRef, useState } from "react";
import {
  Users,
  TrendingUp,
  Calendar,
  AlertTriangle,
  Upload,
  Download,
  FileText,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import { KPICard } from "../../components/dashboard/KPICard";
import { Button } from "../../components/ui/button";

import {
  fetchAllPerformance,
  fetchAverageMarks,
  fetchAverageAttendance,
  fetchPassFail,
  fetchAtRiskStudents,
  uploadCSV,
} from "../../services/api";

type AtRiskStudent = {
  student_id: string;
  subject: string;
  marks: number;
  attendance: number;
};

export default function TeacherDashboard() {
  const COLORS = ["#000000", "#666666"];

  // 📊 Dashboard data
  const [totalStudents, setTotalStudents] = useState(0);
  const [averageMarks, setAverageMarks] = useState(0);
  const [averageAttendance, setAverageAttendance] = useState(0);
  const [passFail, setPassFail] = useState({ passed: 0, failed: 0 });
  const [atRiskStudents, setAtRiskStudents] = useState<AtRiskStudent[]>([]);

  // 📤 Upload states
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // 🔁 Fetch all dashboard data
  const refreshDashboard = () => {
    fetchAllPerformance()
      .then((res) => setTotalStudents(res.count))
      .catch(console.error);

    fetchAverageMarks()
      .then((res) => setAverageMarks(res.average_marks))
      .catch(console.error);

    fetchAverageAttendance()
      .then((res) => setAverageAttendance(res.average_attendance))
      .catch(console.error);

    fetchPassFail()
      .then(setPassFail)
      .catch(console.error);

    fetchAtRiskStudents()
      .then((res) => setAtRiskStudents(res.students))
      .catch(console.error);
  };

  useEffect(() => {
    refreshDashboard();
  }, []);

const handleFileChange = async (
  e: React.ChangeEvent<HTMLInputElement>
) => {
  const input = e.target;

  if (!input.files || input.files.length === 0) {
    console.error("No file selected");
    return;
  }

  const file = input.files[0];

  setUploading(true);
  setUploadError(null);
  setUploadSuccess(false);

  try {
    await uploadCSV(file);
    setUploadSuccess(true);
    refreshDashboard();
  } catch (err: any) {
    setUploadError(err.message || "Upload failed");
  } finally {
    setUploading(false);
    input.value = ""; // 🔥 THIS IS THE KEY LINE
  }
};



  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="mb-2">Teacher Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of class performance and student analytics
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <KPICard title="Total Students" value={totalStudents} icon={Users} />
        <KPICard
          title="Average Marks"
          value={`${averageMarks}%`}
          icon={TrendingUp}
        />
        <KPICard
          title="Average Attendance"
          value={`${averageAttendance}%`}
          icon={Calendar}
        />
        <KPICard
          title="At-Risk Students"
          value={atRiskStudents.length}
          icon={AlertTriangle}
        />
      </div>

      {/* Alerts */}
      <div className="bg-white border rounded-lg p-6 shadow-sm mb-8">
        <div className="flex items-start gap-4">
          <div className="bg-red-50 p-3 rounded-lg">
            <AlertTriangle className="w-5 h-5 text-red-600" />
          </div>
          <div className="flex-1">
            <h3 className="mb-1">Academic Risk Alert</h3>
            <p className="text-muted-foreground mb-4">
              {atRiskStudents.length} students are currently at academic risk
            </p>
            <div className="flex gap-3">
              <Button className="bg-black text-white hover:bg-gray-800">
                View At-Risk Students
              </Button>
              <Button variant="outline">Send Alerts</Button>
            </div>
          </div>
        </div>
      </div>

      {/* At-Risk Table */}
      <div className="bg-white border rounded-lg p-6 shadow-sm mb-8">
        <h3 className="mb-4">At-Risk Students</h3>

        {atRiskStudents.length === 0 ? (
          <p className="text-muted-foreground">No at-risk students found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="py-2 px-3 text-left">Student ID</th>
                  <th className="py-2 px-3 text-left">Subject</th>
                  <th className="py-2 px-3 text-left">Marks</th>
                  <th className="py-2 px-3 text-left">Attendance</th>
                </tr>
              </thead>
              <tbody>
                {atRiskStudents.map((s, i) => (
                  <tr key={i} className="border-b">
                    <td className="py-2 px-3">{s.student_id}</td>
                    <td className="py-2 px-3">{s.subject}</td>
                    <td className="py-2 px-3 text-red-600">{s.marks}</td>
                    <td className="py-2 px-3 text-red-600">
                      {s.attendance}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Upload Status */}
      {uploading && (
        <p className="text-sm text-muted-foreground mb-2">
          Uploading CSV file...
        </p>
      )}
      {uploadSuccess && (
        <p className="text-sm text-green-600 mb-2">
          CSV uploaded successfully ✅
        </p>
      )}
      {uploadError && (
        <p className="text-sm text-red-600 mb-2">{uploadError}</p>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="bg-white border rounded-lg p-6 shadow-sm text-left"
        >
          <div className="bg-gray-100 p-3 rounded-lg w-fit mb-4">
            <Upload className="w-5 h-5" />
          </div>
          <h4 className="mb-1">Upload Data</h4>
          <p className="text-sm text-muted-foreground">
            Upload student marks and attendance records
          </p>
        </button>

        {/* 🔑 Hidden input (also usable from Sidebar) */}
        <input
          id="csv-upload"
          ref={fileInputRef}
          type="file"
          accept=".csv"
          className="hidden"
          onChange={handleFileChange}
        />

        <button className="bg-white border rounded-lg p-6 shadow-sm text-left">
          <div className="bg-gray-100 p-3 rounded-lg w-fit mb-4">
            <FileText className="w-5 h-5" />
          </div>
          <h4 className="mb-1">View Reports</h4>
          <p className="text-sm text-muted-foreground">
            Generate and download reports
          </p>
        </button>

        <button className="bg-white border rounded-lg p-6 shadow-sm text-left">
          <div className="bg-gray-100 p-3 rounded-lg w-fit mb-4">
            <Download className="w-5 h-5" />
          </div>
          <h4 className="mb-1">Export Data</h4>
          <p className="text-sm text-muted-foreground">
            Download data in Excel or PDF
          </p>
        </button>
      </div>

      {/* Chart */}
      <div className="bg-white border rounded-lg p-6 shadow-sm">
        <h3 className="mb-4">Pass vs Fail Distribution</h3>
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              data={[
                { name: "Passed", value: passFail.passed },
                { name: "Failed", value: passFail.failed },
              ]}
              dataKey="value"
              outerRadius={80}
              label
            >
              {[0, 1].map((i) => (
                <Cell
                  key={i}
                  fill={COLORS[i % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
