
import { UserCheck } from "lucide-react";
import StudentAttendanceDashboard from "@/components/dashboard/student-attendance-dashboard";
import { StudentGradebookView } from "@/components/gradebook/student-gradebook-view";
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from "@/components/ui/accordion";

export default function StudentAttendance() {
  return (
    <div className="space-y-6 w-full">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Attendance</h1>
        <p className="text-muted-foreground">View your attendance records for all courses</p>
      </div>
      
      <div className="glass-morphism rounded-xl p-6 border border-white/10 w-full">
        <div className="flex items-center gap-2 mb-4">
          <UserCheck className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold">Attendance by Course</h2>
        </div>
        
        <div className="w-full">
          <StudentAttendanceDashboard />
        </div>
      </div>
      
      <div className="mt-8 w-full">
        <Accordion type="multiple" defaultValue={["item-0"]} className="w-full">
          <AccordionItem value="item-0" className="border-b">
            <AccordionTrigger className="text-xl font-semibold">Semester Performance</AccordionTrigger>
            <AccordionContent>
              <StudentGradebookView />
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  );
}
