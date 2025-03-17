
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AuthProvider } from '@/context/auth-context';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Index from '@/pages/Index';
import Login from '@/pages/Login';
import NotFound from '@/pages/NotFound';
import AdminDashboard from '@/pages/admin/AdminDashboard';
import StudentsManagement from '@/pages/admin/StudentsManagement';
import CoursesManagement from '@/pages/admin/CoursesManagement';
import GradebookManagement from '@/pages/admin/GradebookManagement';
import AttendanceManagement from '@/pages/admin/AttendanceManagement';
import AdminMessages from '@/pages/admin/AdminMessages';
import LecturesManagement from '@/pages/admin/LecturesManagement';
import Settings from '@/pages/admin/Settings';
import StudentDashboard from '@/pages/student/StudentDashboard';
import StudentCourses from '@/pages/student/StudentCourses';
import StudentAttendance from '@/pages/student/StudentAttendance';
import StudentMessages from '@/pages/student/StudentMessages';
import StudentLectures from '@/pages/student/StudentLectures';
import ExamsManagement from '@/pages/admin/ExamsManagement';
import ExamDetail from '@/pages/admin/ExamDetail';
import ExamAssignment from '@/pages/admin/ExamAssignment';
import StudentExams from '@/pages/student/StudentExams';
import ExamSession from '@/pages/student/ExamSession';
import ProtectedRoute from '@/components/protected-route';
import DashboardLayout from '@/components/dashboard-layout';
import './App.css';

// Create a new QueryClient instance
const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Navigate to="/login" />} />
            <Route path="/login" element={<Login />} />

            {/* Admin Routes */}
            <Route path="/admin" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <DashboardLayout>
                  <AdminDashboard />
                </DashboardLayout>
              </ProtectedRoute>
            } />
            <Route path="/admin/students" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <DashboardLayout>
                  <StudentsManagement />
                </DashboardLayout>
              </ProtectedRoute>
            } />
            <Route path="/admin/courses" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <DashboardLayout>
                  <CoursesManagement />
                </DashboardLayout>
              </ProtectedRoute>
            } />
            <Route path="/admin/gradebook" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <DashboardLayout>
                  <GradebookManagement />
                </DashboardLayout>
              </ProtectedRoute>
            } />
            <Route path="/admin/attendance" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <DashboardLayout>
                  <AttendanceManagement />
                </DashboardLayout>
              </ProtectedRoute>
            } />
            <Route path="/admin/messages" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <DashboardLayout>
                  <AdminMessages />
                </DashboardLayout>
              </ProtectedRoute>
            } />
            <Route path="/admin/lectures" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <DashboardLayout>
                  <LecturesManagement />
                </DashboardLayout>
              </ProtectedRoute>
            } />
            {/* New Exams Routes */}
            <Route path="/admin/exams" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <ExamsManagement />
              </ProtectedRoute>
            } />
            <Route path="/admin/exams/:examId" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <ExamDetail />
              </ProtectedRoute>
            } />
            <Route path="/admin/exams/:examId/assign" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <ExamAssignment />
              </ProtectedRoute>
            } />
            <Route path="/admin/settings" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <DashboardLayout>
                  <Settings />
                </DashboardLayout>
              </ProtectedRoute>
            } />

            {/* Student Routes - Making sure ALL are wrapped in DashboardLayout */}
            <Route path="/student" element={
              <ProtectedRoute allowedRoles={['student']}>
                <DashboardLayout>
                  <StudentDashboard />
                </DashboardLayout>
              </ProtectedRoute>
            } />
            <Route path="/student/courses" element={
              <ProtectedRoute allowedRoles={['student']}>
                <DashboardLayout>
                  <StudentCourses />
                </DashboardLayout>
              </ProtectedRoute>
            } />
            <Route path="/student/attendance" element={
              <ProtectedRoute allowedRoles={['student']}>
                <DashboardLayout>
                  <StudentAttendance />
                </DashboardLayout>
              </ProtectedRoute>
            } />
            <Route path="/student/messages" element={
              <ProtectedRoute allowedRoles={['student']}>
                <DashboardLayout>
                  <StudentMessages />
                </DashboardLayout>
              </ProtectedRoute>
            } />
            <Route path="/student/lectures" element={
              <ProtectedRoute allowedRoles={['student']}>
                <DashboardLayout>
                  <StudentLectures />
                </DashboardLayout>
              </ProtectedRoute>
            } />
            {/* New Student Exam Routes */}
            <Route path="/student/exams" element={
              <ProtectedRoute allowedRoles={['student']}>
                <StudentExams />
              </ProtectedRoute>
            } />
            <Route path="/student/exams/:assignmentId" element={
              <ProtectedRoute allowedRoles={['student']}>
                <ExamSession />
              </ProtectedRoute>
            } />
            
            {/* Common Settings Route */}
            <Route path="/settings" element={
              <ProtectedRoute allowedRoles={['admin', 'student']}>
                <DashboardLayout>
                  <Settings />
                </DashboardLayout>
              </ProtectedRoute>
            } />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </Router>
        <Toaster position="top-right" />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
