import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  GraduationCap,
  FileSpreadsheet,
  CalendarCheck,
  AlertTriangle,
  Target,
  Calendar,
  FileText,
  Bell,
  User as UserIcon,
  LogOut,
  Menu,
  X,
  BookOpen,
  Calculator,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export const StudentLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { name: 'Dashboard', path: '/student/dashboard', icon: LayoutDashboard },
    { name: 'My Performance', path: '/student/performance', icon: GraduationCap },
    { name: 'Passing Calculator', path: '/student/passing-marks', icon: CheckCircle2 },
    { name: 'CGPA Simulator', path: '/student/cgpa-simulator', icon: Calculator },
    { name: 'Semester Results', path: '/student/results', icon: FileSpreadsheet },
    { name: 'Course Completion', path: '/student/course-completion', icon: Clock },
    { name: 'Attendance', path: '/student/attendance', icon: CalendarCheck },
    { name: 'Arrears', path: '/student/arrears', icon: AlertTriangle },
    { name: 'Subject Focus', path: '/student/subject-focus', icon: Target },
    { name: 'Timetable', path: '/student/timetable', icon: Calendar },
    { name: 'Reports', path: '/student/reports', icon: FileText },
    { name: 'Notifications', path: '/student/notifications', icon: Bell },
    { name: 'Profile', path: '/student/profile', icon: UserIcon },
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-page flex flex-col md:flex-row">
      {/* Mobile Header */}
      <div className="md:hidden bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded bg-blue-600 flex items-center justify-center text-white font-bold">
            <BookOpen className="w-4 h-4" />
          </div>
          <span className="font-bold text-navy text-sm tracking-tight">SCRIS Student</span>
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-1.5 text-slate-600 hover:bg-slate-100 rounded"
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
          <div className="w-8 h-8 rounded bg-blue-600 flex items-center justify-center text-white">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-bold text-navy text-base leading-none">SCRIS</h1>
            <p className="text-[10px] text-slate-500 font-medium mt-1">STUDENT ACADEMIC PORTAL</p>
          </div>
        </div>

        {/* User Card Mini */}
        <div className="p-4 mx-3 my-3 bg-slate-50 border border-slate-200 rounded-lg">
          <p className="text-xs font-semibold text-navy truncate">{user?.name}</p>
          <p className="text-[11px] text-slate-500 truncate mt-0.5">
            Reg: {user?.studentProfile?.registerNumber || 'Student'}
          </p>
          <div className="mt-2 flex items-center justify-between text-[11px]">
            <span className="text-blue-700 bg-blue-50 border border-blue-200 px-1.5 py-0.5 rounded font-medium">
              Sem {user?.studentProfile?.currentSemester} - Sec {user?.studentProfile?.section}
            </span>
            <span className="text-slate-500">{user?.department.split(' ')[0]}</span>
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
