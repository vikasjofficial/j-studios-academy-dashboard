
import { useStudentAttendance } from "@/hooks/use-student-attendance";
import { AttendanceOverview } from "@/components/dashboard/attendance-overview";
import { CourseAttendanceSection } from "@/components/dashboard/course-attendance-section";
import { PerformanceSection } from "@/components/dashboard/performance-section";

export default function StudentAttendance() {
  const { summary, isLoading } = useStudentAttendance();

  return (
    <div className="flex w-full">
      <div className="hidden md:block w-16 md:w-24 lg:w-28 flex-shrink-0"></div>
      
      <div className="space-y-6 w-full">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Attendance</h1>
          <p className="text-muted-foreground">View your attendance records for all courses</p>
        </div>
        
        <AttendanceOverview summary={summary} isLoading={isLoading} />
        
        <CourseAttendanceSection />
        
        <PerformanceSection />
      </div>
    </div>
  );
}
