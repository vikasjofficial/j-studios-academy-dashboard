
import { UserCheck } from "lucide-react";
import StudentAttendanceDashboard from "@/components/dashboard/student-attendance-dashboard";

export function CourseAttendanceSection() {
  return (
    <div className="glass-morphism rounded-xl p-6 border border-white/10 w-full">
      <div className="flex items-center gap-2 mb-4">
        <UserCheck className="h-5 w-5 text-primary" />
        <h2 className="text-xl font-semibold">Attendance by Course</h2>
      </div>
      
      <div className="w-full">
        <StudentAttendanceDashboard />
      </div>
    </div>
  );
}
