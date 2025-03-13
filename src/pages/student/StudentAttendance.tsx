
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserCheck } from "lucide-react";
import StudentAttendanceDashboard from "@/components/dashboard/student-attendance-dashboard";

export default function StudentAttendance() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Attendance</h1>
        <p className="text-muted-foreground">View your attendance records for all courses</p>
      </div>
      
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <UserCheck className="h-5 w-5 text-primary" />
            <span>Attendance by Course</span>
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          <StudentAttendanceDashboard />
        </CardContent>
      </Card>
    </div>
  );
}
