
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/context/auth-context";
import ProtectedRoute from "@/components/protected-route";
import DashboardLayout from "@/components/dashboard-layout";
import StudentsManagement from "./pages/admin/StudentsManagement";
import { PlaceholderPage } from "@/components/placeholder-page";
import Login from "@/pages/Login";
import NotFound from "@/pages/NotFound";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import StudentDashboard from "@/pages/student/StudentDashboard";
import CoursesManagement from "./pages/admin/CoursesManagement";
import GradebookManagement from "./pages/admin/GradebookManagement";
import StudentMessages from "./pages/student/StudentMessages";
import StudentCourses from "./pages/student/StudentCourses";
import AdminMessages from "./pages/admin/AdminMessages";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<Login />} />
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
            <Route path="/admin/calendar" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <DashboardLayout>
                  <PlaceholderPage title="Admin Calendar" />
                </DashboardLayout>
              </ProtectedRoute>
            } />
            <Route path="/admin/attendance" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <DashboardLayout>
                  <PlaceholderPage title="Attendance Management" />
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
            <Route path="/student/calendar" element={
              <ProtectedRoute allowedRoles={['student']}>
                <DashboardLayout>
                  <PlaceholderPage title="My Schedule" />
                </DashboardLayout>
              </ProtectedRoute>
            } />
            <Route path="/student/attendance" element={
              <ProtectedRoute allowedRoles={['student']}>
                <DashboardLayout>
                  <PlaceholderPage title="My Attendance" />
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
            <Route path="/settings" element={
              <ProtectedRoute>
                <DashboardLayout>
                  <PlaceholderPage title="Settings" />
                </DashboardLayout>
              </ProtectedRoute>
            } />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
