import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  BarChart3,
  Users,
  AlertOctagon,
  LineChart,
  BookMarked,
  ShieldAlert,
  Calendar,
  FileSpreadsheet,
  Bell,
  User as UserIcon,
  Settings,
  LogOut,
  Menu,
  X,
  GraduationCap,
  UserCheck,
  UploadCloud,
  Server,
  Database,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export const TeacherLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { name: 'Dashboard', path: '/teacher/dashboard', icon: BarChart3 },
    { name: 'Students', path: '/teacher/students', icon: Users },
    { name: 'At-Risk Students', path: '/teacher/at-risk', icon: AlertOctagon },
    { name: 'Advisor Mapping', path: '/teacher/advisors', icon: UserCheck },
    { name: 'Academic Analytics', path: '/teacher/analytics', icon: LineChart },
    { name: 'Subject Analysis', path: '/teacher/subjects', icon: BookMarked },
    { name: 'Interventions', path: '/teacher/interventions', icon: ShieldAlert },
    { name: 'Academic Ingestion', path: '/teacher/import', icon: UploadCloud },
    { name: 'SIS Integration', path: '/teacher/integrations', icon: Server },
    { name: 'Timetable', path: '/teacher/timetable', icon: Calendar },
    { name: 'Reports', path: '/teacher/reports', icon: FileSpreadsheet },
    { name: 'Audit Trail', path: '/teacher/audit-logs', icon: Database },
    { name: 'Notifications', path: '/teacher/notifications', icon: Bell },
    { name: 'Profile', path: '/teacher/profile', icon: UserIcon },
    { name: 'Settings & Rules', path: '/teacher/settings', icon: Settings },
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-page flex flex-col md:flex-row">
      {/* Mobile Header */}
      <div className="md:hidden bg-navy text-white px-4 py-3 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded bg-blue-500 flex items-center justify-center text-white">
            <GraduationCap className="w-5 h-5" />
          </div>
          <span className="font-bold text-sm tracking-tight">SCRIS Faculty Portal</span>
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-1.5 text-slate-300 hover:text-white rounded"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Sidebar for Desktop & Mobile Drawer */}
      <aside
        className={`${
          mobileMenuOpen ? 'block' : 'hidden'
        } md:block w-full md:w-64 bg-white border-r border-slate-200 flex-shrink-0 z-30 md:sticky md:top-0 md:h-screen md:overflow-y-auto`}
      >
        <div className="p-5 border-b border-slate-100 hidden md:flex items-center gap-2.5">
          <div className="w-8 h-8 rounded bg-navy flex items-center justify-center text-white">
            <GraduationCap className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h1 className="font-bold text-navy text-base leading-none">SCRIS</h1>
            <p className="text-[10px] text-blue-700 font-semibold tracking-wider mt-1">FACULTY & ADVISORY</p>
          </div>
        </div>

        {/* Teacher Profile Card */}
        <div className="p-4 mx-3 my-3 bg-slate-50 border border-slate-200 rounded-lg">
          <p className="text-xs font-semibold text-navy truncate">{user?.name}</p>
          <p className="text-[11px] text-slate-500 truncate mt-0.5">
            ID: {user?.teacherProfile?.staffId || 'Faculty'}
          </p>
          <div className="mt-2 text-[10px] font-medium text-slate-600 bg-white border border-slate-200 p-1.5 rounded">
            {user?.department}
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="px-3 py-2 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-md text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 font-semibold border-l-2 border-blue-600'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-navy'
                  }`
                }
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Sign Out Button */}
        <div className="p-4 mt-auto border-t border-slate-100">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-xs font-medium text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-100 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0">
        <div className="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
