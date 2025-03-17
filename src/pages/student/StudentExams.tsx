
import { StudentExamsCard } from "@/components/exams/student-exams-card";
import DashboardLayout from "@/components/dashboard-layout";

export default function StudentExams() {
  return (
    <DashboardLayout>
      <div className="space-y-8 max-w-full overflow-x-hidden px-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Exams</h1>
          <p className="text-muted-foreground">View and take your assigned exams.</p>
        </div>

        <StudentExamsCard />
      </div>
    </DashboardLayout>
  );
}
