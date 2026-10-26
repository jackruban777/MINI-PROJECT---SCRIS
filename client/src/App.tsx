import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './contexts/AuthContext';

// Route Guards & Layouts
import { RequireAuth, RequireRole } from './components/common/RouteGuards';
import { StudentLayout } from './components/layout/StudentLayout';
import { TeacherLayout } from './components/layout/TeacherLayout';

// Public Pages
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterStudentPage } from './pages/auth/RegisterStudentPage';
import { RegisterTeacherPage } from './pages/auth/RegisterTeacherPage';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage';

// Student Portal Pages
import { StudentDashboard } from './pages/student/StudentDashboard';
import { StudentPerformance } from './pages/student/StudentPerformance';
import { StudentPassingCalculator } from './pages/student/StudentPassingCalculator';
import { StudentCgpaSimulator } from './pages/student/StudentCgpaSimulator';
import { StudentResults } from './pages/student/StudentResults';
import { StudentCompletion } from './pages/student/StudentCompletion';
import { StudentAttendance } from './pages/student/StudentAttendance';
import { StudentArrears } from './pages/student/StudentArrears';
import { StudentSubjectFocus } from './pages/student/StudentSubjectFocus';
import { StudentTimetable } from './pages/student/StudentTimetable';
import { StudentReports } from './pages/student/StudentReports';
import { StudentNotifications } from './pages/student/StudentNotifications';
import { StudentProfile } from './pages/student/StudentProfile';

// Teacher Portal Pages
import { TeacherDashboard } from './pages/teacher/TeacherDashboard';
import { TeacherStudents } from './pages/teacher/TeacherStudents';
import { TeacherAtRisk } from './pages/teacher/TeacherAtRisk';
import { TeacherAdvisors } from './pages/teacher/TeacherAdvisors';
import { TeacherAnalytics } from './pages/teacher/TeacherAnalytics';
import { TeacherSubjects } from './pages/teacher/TeacherSubjects';
import { TeacherInterventions } from './pages/teacher/TeacherInterventions';
import { TeacherImport } from './pages/teacher/TeacherImport';
import { TeacherIntegrations } from './pages/teacher/TeacherIntegrations';
import { TeacherTimetable } from './pages/teacher/TeacherTimetable';
import { TeacherReports } from './pages/teacher/TeacherReports';
import { TeacherAuditLogs } from './pages/teacher/TeacherAuditLogs';
import { TeacherNotifications } from './pages/teacher/TeacherNotifications';
import { TeacherProfile } from './pages/teacher/TeacherProfile';
import { TeacherSettings } from './pages/teacher/TeacherSettings';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register-student" element={<RegisterStudentPage />} />
            <Route path="/register-teacher" element={<RegisterTeacherPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />

            {/* Student Protected Portal Routes */}
            <Route
              path="/student"
              element={
                <RequireAuth>
                  <RequireRole roles={['STUDENT']}>
                    <StudentLayout />
                  </RequireRole>
                </RequireAuth>
              }
            >
              <Route index element={<Navigate to="/student/dashboard" replace />} />
              <Route path="dashboard" element={<StudentDashboard />} />
              <Route path="performance" element={<StudentPerformance />} />
              <Route path="passing-marks" element={<StudentPassingCalculator />} />
              <Route path="cgpa-simulator" element={<StudentCgpaSimulator />} />
              <Route path="results" element={<StudentResults />} />
              <Route path="course-completion" element={<StudentCompletion />} />
              <Route path="attendance" element={<StudentAttendance />} />
              <Route path="arrears" element={<StudentArrears />} />
              <Route path="subject-focus" element={<StudentSubjectFocus />} />
              <Route path="timetable" element={<StudentTimetable />} />
              <Route path="reports" element={<StudentReports />} />
              <Route path="notifications" element={<StudentNotifications />} />
              <Route path="profile" element={<StudentProfile />} />
            </Route>

            {/* Teacher Protected Portal Routes */}
            <Route
              path="/teacher"
              element={
                <RequireAuth>
                  <RequireRole roles={['TEACHER', 'ADMIN']}>
                    <TeacherLayout />
                  </RequireRole>
                </RequireAuth>
              }
            >
              <Route index element={<Navigate to="/teacher/dashboard" replace />} />
              <Route path="dashboard" element={<TeacherDashboard />} />
              <Route path="students" element={<TeacherStudents />} />
              <Route path="at-risk" element={<TeacherAtRisk />} />
              <Route path="advisors" element={<TeacherAdvisors />} />
              <Route path="analytics" element={<TeacherAnalytics />} />
              <Route path="subjects" element={<TeacherSubjects />} />
              <Route path="interventions" element={<TeacherInterventions />} />
              <Route path="import" element={<TeacherImport />} />
              <Route path="integrations" element={<TeacherIntegrations />} />
              <Route path="timetable" element={<TeacherTimetable />} />
              <Route path="reports" element={<TeacherReports />} />
              <Route path="audit-logs" element={<TeacherAuditLogs />} />
              <Route path="notifications" element={<TeacherNotifications />} />
              <Route path="profile" element={<TeacherProfile />} />
              <Route path="settings" element={<TeacherSettings />} />
            </Route>

            {/* Fallback to Home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
