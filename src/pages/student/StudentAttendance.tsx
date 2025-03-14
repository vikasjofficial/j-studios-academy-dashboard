
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserCheck } from "lucide-react";
import StudentAttendanceDashboard from "@/components/dashboard/student-attendance-dashboard";
import { StudentGradebookView } from "@/components/gradebook/student-gradebook-view";

export default function StudentAttendance() {
  return (
    <div className="space-y-6 w-[960px]">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Attendance</h1>
        <p className="text-muted-foreground">View your attendance records for all courses</p>
      </div>
      
      <div className="glass-morphism rounded-xl p-6 border border-white/10 w-full max-w-[960px]">
        <div className="flex items-center gap-2 mb-4">
          <UserCheck className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold">Attendance by Course</h2>
        </div>
        
        <StudentAttendanceDashboard />
      </div>
      
      <div className="mt-8 w-full max-w-[960px]">
        <StudentGradebookView />
      </div>
    </div>
  );
}
