
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Index from "./pages/Index";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import { Toaster } from "sonner";
import { AuthProvider } from "./context/auth-provider";
import ProtectedRoute from "./components/protected-route";
import WebGLShowcase from "./components/webgl/WebGLShowcase";

// Admin Pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import StudentsManagement from "./pages/admin/StudentsManagement";
import CoursesManagement from "./pages/admin/CoursesManagement";
import GradebookManagement from "./pages/admin/GradebookManagement";
import AttendanceManagement from "./pages/admin/AttendanceManagement";
import LecturesManagement from "./pages/admin/LecturesManagement";
import ExamsManagement from "./pages/admin/ExamsManagement";
import ExamDetail from "./pages/admin/ExamDetail";
import ExamAssignment from "./pages/admin/ExamAssignment";
import AdminMessages from "./pages/admin/AdminMessages";
import Settings from "./pages/admin/Settings";
import TasksManagement from "./pages/admin/TasksManagement";

// Student Pages
import StudentDashboard from "./pages/student/StudentDashboard";
import StudentCourses from "./pages/student/StudentCourses";
import StudentLectures from "./pages/student/StudentLectures";
import StudentAttendance from "./pages/student/StudentAttendance";
import StudentExams from "./pages/student/StudentExams";
import ExamSession from "./pages/student/ExamSession";
import StudentMessages from "./pages/student/StudentMessages";

// Video Classroom
import VideoClassroom from "./pages/video-classroom";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/webgl" element={<WebGLShowcase />} />
          
          {/* Admin routes */}
          <Route path="/admin" element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminDashboard />
            </ProtectedRoute>
          } />
          <Route path="/admin/students" element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <StudentsManagement />
            </ProtectedRoute>
          } />
          <Route path="/admin/courses" element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <CoursesManagement />
            </ProtectedRoute>
          } />
          <Route path="/admin/gradebook" element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <GradebookManagement />
            </ProtectedRoute>
          } />
          <Route path="/admin/attendance" element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AttendanceManagement />
            </ProtectedRoute>
          } />
          <Route path="/admin/lectures" element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <LecturesManagement />
            </ProtectedRoute>
          } />
          <Route path="/admin/exams" element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <ExamsManagement />
            </ProtectedRoute>
          } />
          <Route path="/admin/exams/:examId" element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <ExamDetail />
            </ProtectedRoute>
          } />
          <Route path="/admin/exams/assign/:examId" element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <ExamAssignment />
            </ProtectedRoute>
          } />
          <Route path="/admin/tasks" element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <TasksManagement />
            </ProtectedRoute>
          } />
          <Route path="/admin/messages" element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminMessages />
            </ProtectedRoute>
          } />
          <Route path="/admin/settings" element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <Settings />
            </ProtectedRoute>
          } />
          <Route path="/admin/video-classroom" element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <VideoClassroom />
            </ProtectedRoute>
          } />
          
          {/* Student routes */}
          <Route path="/student" element={
            <ProtectedRoute allowedRoles={["student"]}>
              <StudentDashboard />
            </ProtectedRoute>
          } />
          <Route path="/student/courses" element={
            <ProtectedRoute allowedRoles={["student"]}>
              <StudentCourses />
            </ProtectedRoute>
          } />
          <Route path="/student/lectures" element={
            <ProtectedRoute allowedRoles={["student"]}>
              <StudentLectures />
            </ProtectedRoute>
          } />
          <Route path="/student/attendance" element={
            <ProtectedRoute allowedRoles={["student"]}>
              <StudentAttendance />
            </ProtectedRoute>
          } />
          <Route path="/student/exams" element={
            <ProtectedRoute allowedRoles={["student"]}>
              <StudentExams />
            </ProtectedRoute>
          } />
          <Route path="/student/exams/session/:examId" element={
            <ProtectedRoute allowedRoles={["student"]}>
              <ExamSession />
            </ProtectedRoute>
          } />
          <Route path="/student/messages" element={
            <ProtectedRoute allowedRoles={["student"]}>
              <StudentMessages />
            </ProtectedRoute>
          } />
          <Route path="/student/video-classroom" element={
            <ProtectedRoute allowedRoles={["student"]}>
              <VideoClassroom />
            </ProtectedRoute>
          } />
          
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Toaster position="top-right" />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
