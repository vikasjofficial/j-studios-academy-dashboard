
import { StudentExamsCard } from "@/components/exams/student-exams-card";
import DashboardLayout from "@/components/dashboard-layout";

export default function StudentExams() {
  return (
    <DashboardLayout>
      <div className="flex">
        {/* Responsive spacing div */}
        <div className="w-16 md:w-24 lg:w-28 shrink-0"></div>
        
        <div className="space-y-8 max-w-full overflow-x-hidden px-4 flex-1">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">My Exams</h1>
            <p className="text-muted-foreground">View and take your assigned exams.</p>
          </div>

          <StudentExamsCard />
        </div>
      </div>
    </DashboardLayout>
  );
}
