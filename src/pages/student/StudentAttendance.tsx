
import { useStudentAttendance } from "@/hooks/use-student-attendance";
import { AttendanceOverview } from "@/components/dashboard/attendance-overview";
import { CourseAttendanceSection } from "@/components/dashboard/course-attendance-section";
import { PerformanceSection } from "@/components/dashboard/performance-section";
import { SemesterProgressChart } from "@/components/dashboard/semester-progress-chart"; 
import { Table, TableLayout } from "lucide-react";
import { useState } from "react";

export default function StudentAttendance() {
  const { summary, isLoading } = useStudentAttendance();
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('grid');

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
        
        <div className="mt-8 w-full">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold tracking-tight">My Overall Performance</h2>
            <div className="flex items-center gap-2 bg-muted/20 p-1 rounded-md">
              <button 
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded ${viewMode === 'grid' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted/50'}`}
              >
                <TableLayout size={18} />
              </button>
              <button 
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded ${viewMode === 'table' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted/50'}`}
              >
                <Table size={18} />
              </button>
            </div>
          </div>
          <div className="w-full px-2.5">
            <PerformanceSection viewMode={viewMode} />
          </div>
        </div>
      </div>
    </div>
  );
}
