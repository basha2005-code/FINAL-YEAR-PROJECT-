import { useEffect, useState } from 'react';
import { AlertTriangle, Download, Send, FileText } from 'lucide-react';
import { Button } from '../../components/ui/button';
import {
  fetchAtRiskStudents,
  fetchAllPerformance,
} from '../../services/api';

type AtRiskStudent = {
  student_id: string;
  subject: string;
  marks: number;
  attendance: number;
};

export default function AtRiskStudentsPage() {
  const [students, setStudents] = useState<AtRiskStudent[]>([]);
  const [totalStudents, setTotalStudents] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([fetchAtRiskStudents(), fetchAllPerformance()])
      .then(([riskRes, allRes]) => {
        setStudents(riskRes.students || []);
        setTotalStudents(allRes.count || 0);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const getRiskLevel = (s: AtRiskStudent) => {
    if (s.marks < 35 || s.attendance < 70) return 'High';
    if (s.marks < 40 || s.attendance < 75) return 'Medium';
    return 'Low';
  };

  const getGrade = (marks: number) => {
    if (marks >= 75) return 'A';
    if (marks >= 60) return 'B';
    if (marks >= 50) return 'C';
    if (marks >= 40) return 'D';
    return 'F';
  };

  const highRisk = students.filter((s) => getRiskLevel(s) === 'High').length;
  const mediumRisk = students.filter((s) => getRiskLevel(s) === 'Medium').length;

  if (loading) {
    return <div className="p-8">Loading at-risk students...</div>;
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="mb-2">At-Risk Students</h1>
        <p className="text-muted-foreground">
          Students with marks below 40% or attendance below 75%
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* High Risk */}
        <div className="bg-white border border-red-200 rounded-lg p-6 shadow-sm">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">High Risk</p>
              <h2 className="text-red-600">{highRisk}</h2>
            </div>
            <div className="bg-red-50 p-3 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            Marks &lt; 35% or Attendance &lt; 70%
          </p>
        </div>

        {/* Medium Risk */}
        <div className="bg-white border border-orange-200 rounded-lg p-6 shadow-sm">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Medium Risk</p>
              <h2 className="text-orange-600">{mediumRisk}</h2>
            </div>
            <div className="bg-orange-50 p-3 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-orange-600" />
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            Marks 35–40% or Attendance 70–75%
          </p>
        </div>

        {/* Total */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Total At-Risk</p>
              <h2>{students.length}</h2>
            </div>
            <div className="bg-gray-100 p-3 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-gray-700" />
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            Out of {totalStudents} total students
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm mb-8">
        <h3 className="mb-4">Quick Actions</h3>
        <div className="flex flex-wrap gap-3">
          <Button className="bg-black text-white hover:bg-gray-800">
            <Send className="w-4 h-4 mr-2" />
            Send Alert Emails
          </Button>
          <Button variant="outline" className="border-gray-300">
            <Download className="w-4 h-4 mr-2" />
            Download List
          </Button>
          <Button variant="outline" className="border-gray-300">
            <FileText className="w-4 h-4 mr-2" />
            Generate Report
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <h3 className="mb-4">At-Risk Student Details</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left">Student ID</th>
                <th className="px-4 py-3 text-left">Email</th>
                <th className="px-4 py-3 text-left">Marks</th>
                <th className="px-4 py-3 text-left">Attendance</th>
                <th className="px-4 py-3 text-left">Grade</th>
                <th className="px-4 py-3 text-left">Risk Level</th>
                <th className="px-4 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {students.map((s, i) => {
                const risk = getRiskLevel(s);
                return (
                  <tr key={i} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3">{s.student_id}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {s.student_id.toLowerCase()}@university.edu
                    </td>
                    <td className="px-4 py-3 text-red-600">{s.marks}%</td>
                    <td className="px-4 py-3 text-red-600">{s.attendance}%</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 rounded text-xs bg-red-100 text-red-800">
                        {getGrade(s.marks)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <AlertTriangle
                          className={`w-4 h-4 ${
                            risk === 'High'
                              ? 'text-red-600'
                              : 'text-orange-600'
                          }`}
                        />
                        <span
                          className={
                            risk === 'High'
                              ? 'text-red-600 font-medium'
                              : 'text-orange-600 font-medium'
                          }
                        >
                          {risk}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Button variant="link" className="px-0 h-auto text-sm">
                        Add Remarks
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recommendations */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mt-8">
        <h3 className="mb-4">Recommended Actions</h3>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li>• Schedule individual counseling sessions for high-risk students</li>
          <li>• Send automated alerts to students and parents/guardians</li>
          <li>• Arrange peer tutoring or mentorship programs</li>
          <li>• Monitor attendance closely and follow up on absences</li>
          <li>• Provide additional study materials and practice sessions</li>
        </ul>
      </div>
    </div>
  );
}
