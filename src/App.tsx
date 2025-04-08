
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
          <Route path="/admin" element={<ProtectedRoute allowedRoles={["admin"]} />}>
            <Route index element={<AdminDashboard />} />
            <Route path="students" element={<StudentsManagement />} />
            <Route path="courses" element={<CoursesManagement />} />
            <Route path="gradebook" element={<GradebookManagement />} />
            <Route path="attendance" element={<AttendanceManagement />} />
            <Route path="lectures" element={<LecturesManagement />} />
            <Route path="exams" element={<ExamsManagement />} />
            <Route path="exams/:examId" element={<ExamDetail />} />
            <Route path="exams/assign/:examId" element={<ExamAssignment />} />
            <Route path="tasks" element={<TasksManagement />} />
            <Route path="messages" element={<AdminMessages />} />
            <Route path="settings" element={<Settings />} />
            <Route path="video-classroom" element={<VideoClassroom />} />
          </Route>
          
          {/* Student routes */}
          <Route path="/student" element={<ProtectedRoute allowedRoles={["student"]} />}>
            <Route index element={<StudentDashboard />} />
            <Route path="courses" element={<StudentCourses />} />
            <Route path="lectures" element={<StudentLectures />} />
            <Route path="attendance" element={<StudentAttendance />} />
            <Route path="exams" element={<StudentExams />} />
            <Route path="exams/session/:examId" element={<ExamSession />} />
            <Route path="messages" element={<StudentMessages />} />
            <Route path="video-classroom" element={<VideoClassroom />} />
          </Route>
          
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Toaster position="top-right" />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
