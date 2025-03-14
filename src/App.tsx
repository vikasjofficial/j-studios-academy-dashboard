
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
import Settings from '@/pages/admin/Settings';
import StudentDashboard from '@/pages/student/StudentDashboard';
import StudentCourses from '@/pages/student/StudentCourses';
import StudentAttendance from '@/pages/student/StudentAttendance';
import StudentMessages from '@/pages/student/StudentMessages';
import ProtectedRoute from '@/components/protected-route';
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
                <AdminDashboard />
              </ProtectedRoute>
            } />
            <Route path="/admin/students" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <StudentsManagement />
              </ProtectedRoute>
            } />
            <Route path="/admin/courses" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <CoursesManagement />
              </ProtectedRoute>
            } />
            <Route path="/admin/gradebook" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <GradebookManagement />
              </ProtectedRoute>
            } />
            <Route path="/admin/attendance" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AttendanceManagement />
              </ProtectedRoute>
            } />
            <Route path="/admin/messages" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminMessages />
              </ProtectedRoute>
            } />
            <Route path="/admin/settings" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <Settings />
              </ProtectedRoute>
            } />

            {/* Student Routes */}
            <Route path="/student" element={
              <ProtectedRoute allowedRoles={['student']}>
                <StudentDashboard />
              </ProtectedRoute>
            } />
            <Route path="/student/courses" element={
              <ProtectedRoute allowedRoles={['student']}>
                <StudentCourses />
              </ProtectedRoute>
            } />
            <Route path="/student/attendance" element={
              <ProtectedRoute allowedRoles={['student']}>
                <StudentAttendance />
              </ProtectedRoute>
            } />
            <Route path="/student/messages" element={
              <ProtectedRoute allowedRoles={['student']}>
                <StudentMessages />
              </ProtectedRoute>
            } />
            
            {/* Common Settings Route */}
            <Route path="/settings" element={
              <ProtectedRoute allowedRoles={['admin', 'student']}>
                <Settings />
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
