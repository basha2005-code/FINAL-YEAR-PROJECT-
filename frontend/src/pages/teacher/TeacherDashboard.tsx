import { useEffect, useRef, useState } from "react";
import {
  Users,
  TrendingUp,
  Calendar,
  AlertTriangle,
  Upload,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import { KPICard } from "../../components/dashboard/KPICard";

import {
  fetchAllPerformance,
  fetchAverageMarks,
  fetchAverageAttendance,
  fetchPassFail,
  fetchAtRiskStudents,
  uploadCSV,
} from "../../services/api";

type AtRiskStudent = {
  name: string;
  risk_score: number;
};

export default function TeacherDashboard() {
  const COLORS = ["#000000", "#666666"];

  const [totalRecords, setTotalRecords] = useState(0);
  const [averageMarks, setAverageMarks] = useState(0);
  const [averageAttendance, setAverageAttendance] = useState(0);
  const [passFail, setPassFail] = useState({ pass: 0, fail: 0 });
  const [atRiskStudents, setAtRiskStudents] = useState<AtRiskStudent[]>([]);

  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const refreshDashboard = () => {
    fetchAllPerformance()
      .then((res) => setTotalRecords(res.count))
      .catch(console.error);

    fetchAverageMarks()
      .then((res) => setAverageMarks(res.average_marks))
      .catch(console.error);

    fetchAverageAttendance()
      .then((res) => setAverageAttendance(res.average_attendance))
      .catch(console.error);

    fetchPassFail()
      .then((res) => setPassFail(res))
      .catch(console.error);

    fetchAtRiskStudents()
      .then((res) => setAtRiskStudents(res))
      .catch(console.error);
  };

  useEffect(() => {
    refreshDashboard();
  }, []);

  const handleFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const input = e.target;
    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];

    setUploading(true);
    setUploadError(null);
    setUploadSuccess(false);

    try {
      // 🔥 Hardcoded semester = 1 (MVP)
      await uploadCSV(file, 1);
      setUploadSuccess(true);
      refreshDashboard();
    } catch (err: any) {
      setUploadError(err.message || "Upload failed");
    } finally {
      setUploading(false);
      input.value = "";
    }
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="mb-2 text-2xl font-bold">Teacher Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of class performance and analytics
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <KPICard title="Total Records" value={totalRecords} icon={Users} />
        <KPICard title="Average Marks" value={`${averageMarks}%`} icon={TrendingUp} />
        <KPICard title="Average Attendance" value={`${averageAttendance}%`} icon={Calendar} />
        <KPICard title="At-Risk Students" value={atRiskStudents.length} icon={AlertTriangle} />
      </div>

      {/* Upload Section */}
      {uploading && <p>Uploading...</p>}
      {uploadSuccess && <p className="text-green-600">Upload Successful ✅</p>}
      {uploadError && <p className="text-red-600">{uploadError}</p>}

      <button
        onClick={() => fileInputRef.current?.click()}
        disabled={uploading}
        className="bg-white border rounded-lg p-6 shadow-sm text-left mb-8"
      >
        <Upload className="w-5 h-5 mb-2" />
        <h4>Upload Performance CSV</h4>
      </button>

      <input
        ref={fileInputRef}
        type="file"
        accept=".csv"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Pass/Fail Chart */}
      <div className="bg-white border rounded-lg p-6 shadow-sm">
        <h3 className="mb-4 font-semibold">Pass vs Fail</h3>
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              data={[
                { name: "Pass", value: passFail.pass },
                { name: "Fail", value: passFail.fail },
              ]}
              dataKey="value"
              outerRadius={80}
              label
            >
              {[0, 1].map((i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}