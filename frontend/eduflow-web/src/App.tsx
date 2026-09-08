import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { DashboardLayout, AuthLayout, ProtectedRoleRoute } from './layouts/Layouts';

// Pages
import { LoginPage, RegisterPage } from './pages/auth/AuthPages';
import { DashboardPage } from './pages/dashboard/DashboardPage';
import { StudentsPage } from './pages/students/StudentsPage';
import { StudentDetailPage } from './pages/students/StudentDetailPage';
import { TeachersPage } from './pages/teachers/TeachersPage';
import { GroupsPage } from './pages/groups/GroupsPage';
import { GroupDetailPage } from './pages/groups/GroupDetailPage';
import { SubjectsPage } from './pages/subjects/SubjectsPage';
import { AttendancePage, LessonsPage } from './pages/attendance/AttendancePage';
import { GradesPage } from './pages/grades/GradesPage';
import { PaymentsPage } from './pages/payments/PaymentsPage';
import { ReportsPage } from './pages/reports/ReportsPage';
import { SettingsPage } from './pages/settings/SettingsPage';
import { SuperAdminPage } from './pages/admin/SuperAdminPage';

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Auth Routes */}
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
          </Route>

          {/* Protected Dashboard Routes */}
          <Route element={<DashboardLayout />}>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<DashboardPage />} />

            {/* Students */}
            <Route path="/students" element={<StudentsPage />} />
            <Route path="/students/:id" element={<StudentDetailPage />} />

            {/* Teachers */}
            <Route path="/teachers" element={<TeachersPage />} />

            {/* Groups */}
            <Route path="/groups" element={<GroupsPage />} />
            <Route path="/groups/:id" element={<GroupDetailPage />} />

            {/* Subjects */}
            <Route path="/subjects" element={<SubjectsPage />} />

            {/* Lessons & Attendance */}
            <Route path="/lessons" element={<LessonsPage />} />
            <Route path="/attendance" element={<AttendancePage />} />
            <Route path="/attendance/:lessonId" element={<AttendancePage />} />

            {/* Grades */}
            <Route path="/grades" element={<GradesPage />} />

            {/* Payments */}
            <Route path="/payments" element={<PaymentsPage />} />

            {/* Reports */}
            <Route path="/reports" element={<ReportsPage />} />

            {/* Settings */}
            <Route path="/settings" element={<SettingsPage />} />

            {/* SuperAdmin */}
            <Route
              path="/admin"
              element={
                <ProtectedRoleRoute allowedRoles={[1]}>
                  <SuperAdminPage />
                </ProtectedRoleRoute>
              }
            />
          </Route>

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
