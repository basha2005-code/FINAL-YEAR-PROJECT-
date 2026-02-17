import { useState } from "react";
import type { UserRole } from "../types";

// Auth
import LoginPage from "../pages/auth/LoginPage";

// Layout
import Sidebar from "../components/layout/Sidebar";

// Teacher pages
import TeacherDashboard from "../pages/teacher/TeacherDashboard";
import AnalyticsDashboard from "../pages/teacher/AnalyticsDashboard";
import AtRiskStudentsPage from "../pages/teacher/AtRiskStudentsPage";
import ReportsPage from "../pages/teacher/ReportsPage";
import TeacherInsightsPage from "../pages/teacher/TeacherInsightsPage";

// Student pages
import StudentDashboard from "../pages/student/StudentDashboard";
import PerformanceDetailsPage from "../pages/student/PerformanceDetailsPage";
import StudentInsightsPage from "../pages/student/StudentInsightsPage";

// Admin pages
import AdminDashboard from "../pages/admin/AdminDashboard";

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(
    !!localStorage.getItem("token")
  );
  const [userRole, setUserRole] = useState<UserRole>(
    (localStorage.getItem("role") as UserRole) || "teacher"
  );
  const [currentPage, setCurrentPage] = useState("dashboard");

  const handleLogin = (role: UserRole) => {
    setUserRole(role);
    setIsLoggedIn(true);
    setCurrentPage("dashboard");
  };

  const handleLogout = () => {
    localStorage.clear();
    setIsLoggedIn(false);
    setCurrentPage("dashboard");
  };

  const handleNavigate = (page: string) => {
    setCurrentPage(page);
  };

  if (!isLoggedIn) {
    return <LoginPage onLogin={handleLogin} />;
  }

  const renderPage = () => {
    // Teacher
    if (userRole === "teacher") {
      switch (currentPage) {
        case "dashboard":
          return <TeacherDashboard />;
        case "analytics":
          return <AnalyticsDashboard />;
        case "at-risk":
          return <AtRiskStudentsPage />;
        case "reports":
          return <ReportsPage />;
        case "insights":
          return <TeacherInsightsPage />;
        default:
          return <TeacherDashboard />;
      }
    }

    // Student
    if (userRole === "student") {
      switch (currentPage) {
        case "dashboard":
          return <StudentDashboard />;
        case "performance":
          return <PerformanceDetailsPage />;
        case "insights":
          return <StudentInsightsPage />;
        default:
          return <StudentDashboard />;
      }
    }

    // Admin
    if (userRole === "admin") {
      switch (currentPage) {
        case "dashboard":
          return <AdminDashboard />;
        case "analytics":
          return <AnalyticsDashboard />;
        case "reports":
          return <ReportsPage />;
        default:
          return <AdminDashboard />;
      }
    }

    return <TeacherDashboard />;
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar
        role={userRole}
        currentPage={currentPage}
        onNavigate={handleNavigate}
        onLogout={handleLogout}
      />
      <main className="flex-1 overflow-y-auto">{renderPage()}</main>
    </div>
  );
}