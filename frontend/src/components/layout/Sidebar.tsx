import { UserRole } from '../../types';
import {
  LayoutDashboard,
  Upload,
  BarChart3,
  AlertTriangle,
  FileText,
  User,
  Brain,
  LogOut,
} from 'lucide-react';

interface SidebarProps {
  role: UserRole;
  currentPage: string;
  onNavigate: (page: string) => void;
  onLogout: () => void;
}

export default function Sidebar({
  role,
  currentPage,
  onNavigate,
  onLogout,
}: SidebarProps) {
  const teacherMenuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'upload', label: 'Upload Data', icon: Upload }, // ✅ NEW
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'at-risk', label: 'At-Risk Students', icon: AlertTriangle },
    { id: 'reports', label: 'Reports', icon: FileText },
    { id: 'insights', label: 'ML Insights', icon: Brain },
  ];

  const studentMenuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'performance', label: 'Performance', icon: BarChart3 },
    { id: 'insights', label: 'Insights', icon: Brain },
  ];

  const adminMenuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'reports', label: 'Reports', icon: FileText },
  ];

  const menuItems =
    role === 'teacher'
      ? teacherMenuItems
      : role === 'student'
      ? studentMenuItems
      : adminMenuItems;

  // 🔑 Handle sidebar click
  const handleMenuClick = (id: string) => {
    if (id === 'upload') {
      // Trigger hidden CSV input in TeacherDashboard
      document.getElementById('csv-upload')?.click();
      return;
    }
    onNavigate(id);
  };

  return (
    <div className="w-64 bg-black text-white h-screen flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-gray-800">
        <div className="flex items-center gap-2">
          <div className="bg-white p-2 rounded">
            <BarChart3 className="w-5 h-5 text-black" />
          </div>
          <div>
            <h3 className="font-medium">Academic Portal</h3>
            <p className="text-xs text-gray-400 capitalize">{role}</p>
          </div>
        </div>
      </div>

      {/* Menu Items */}
      <nav className="flex-1 p-4 overflow-y-auto">
        <ul className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;

            return (
              <li key={item.id}>
                <button
                  onClick={() => handleMenuClick(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-white text-black'
                      : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User Section */}
      <div className="p-4 border-t border-gray-800">
        <div className="flex items-center gap-3 px-4 py-2 mb-2">
          <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center">
            <User className="w-4 h-4" />
          </div>
          <div className="flex-1">
            <p className="text-sm">
              {role === 'teacher'
                ? 'Dr. Sarah Miller'
                : role === 'student'
                ? 'Emily Johnson'
                : 'Admin User'}
            </p>
            <p className="text-xs text-gray-400">
              {role === 'teacher'
                ? 'Mathematics Dept.'
                : role === 'student'
                ? 'CS - Batch 2023'
                : 'HOD - Engineering'}
            </p>
          </div>
        </div>

        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
}
