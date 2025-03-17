
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ExamAssignment, ExamStatus } from "./types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { CheckCircle, Clock, XCircle, GraduationCap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { GradeExamDialog } from "./grade-exam-dialog";
import { useGradeExamDialog } from "./hooks/use-grade-exam-dialog";

// Define a more specific type for the assignments with additional fields
interface AssignmentWithExtras extends ExamAssignment {
  student_name?: string;
  student_id_number?: string;
  result?: {
    id: string;
    assignment_id: string;
    started_at?: string;
    completed_at?: string;
    total_score?: number;
    teacher_notes?: string;
    created_at: string;
    view_results: boolean;
  };
  students?: {
    name: string;
    student_id: string;
  };
}

export function AssignedExamsList({ examId }: { examId: string }) {
  const { isGradeDialogOpen, setIsGradeDialogOpen, assignmentToGrade, openGradeDialog } = useGradeExamDialog();
  
  // Fetch assigned exams for this particular exam
  const { data: assignments, isLoading } = useQuery({
    queryKey: ["assigned-exams", examId],
    queryFn: async () => {
      // Get the exam assignments
      const { data: assignmentsData, error: assignmentsError } = await supabase
        .from("exam_assignments")
        .select(`
          id,
          exam_id,
          student_id,
          assigned_at,
          due_date,
          status,
          students:student_id (name, student_id)
        `)
        .eq("exam_id", examId)
        .order("assigned_at", { ascending: false });
        
      if (assignmentsError) throw assignmentsError;
      
      // Get exam results for these assignments
      const assignmentIds = assignmentsData.map(a => a.id);
      
      const { data: resultsData, error: resultsError } = await supabase
        .from("exam_results")
        .select("*")
        .in("assignment_id", assignmentIds);
        
      if (resultsError) throw resultsError;
      
      // Map results to assignments
      const assignmentsWithResults = assignmentsData.map((assignment) => {
        const result = resultsData.find(r => r.assignment_id === assignment.id);
        
        return {
          ...assignment,
          student_name: assignment.students?.name,
          student_id_number: assignment.students?.student_id,
          result
        };
      });
      
      return assignmentsWithResults as AssignmentWithExtras[];
    },
    enabled: !!examId,
  });

  const getStatusBadge = (status: ExamStatus) => {
    switch (status) {
      case "assigned":
        return <Badge variant="outline" className="flex items-center"><Clock className="mr-1 h-3 w-3" /> Assigned</Badge>;
      case "in_progress":
        return <Badge variant="warning" className="flex items-center"><Clock className="mr-1 h-3 w-3" /> In Progress</Badge>;
      case "completed":
        return <Badge variant="success" className="flex items-center"><CheckCircle className="mr-1 h-3 w-3" /> Completed</Badge>;
      case "expired":
        return <Badge variant="destructive" className="flex items-center"><XCircle className="mr-1 h-3 w-3" /> Expired</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin h-8 w-8 border-2 border-current border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!assignments || assignments.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No students have been assigned this exam yet.</p>
      </div>
    );
  }

  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Student</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Assigned Date</TableHead>
            <TableHead>Due Date</TableHead>
            <TableHead>Grade</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {assignments.map((assignment) => (
            <TableRow key={assignment.id}>
              <TableCell className="font-medium">
                <div>
                  <div>{assignment.student_name}</div>
                  <div className="text-xs text-muted-foreground">{assignment.student_id_number}</div>
                </div>
              </TableCell>
              <TableCell>{getStatusBadge(assignment.status)}</TableCell>
              <TableCell>{format(new Date(assignment.assigned_at), "MMM d, yyyy")}</TableCell>
              <TableCell>
                {assignment.due_date ? format(new Date(assignment.due_date), "MMM d, yyyy") : "-"}
              </TableCell>
              <TableCell>
                {assignment.result ? (
                  <div className="flex flex-col">
                    <span className="font-medium">{assignment.result.total_score || "-"}</span>
                    <span className="text-xs text-muted-foreground">
                      {assignment.result.view_results ? "Visible to student" : "Hidden from student"}
                    </span>
                  </div>
                ) : (
                  <span className="text-muted-foreground">Not graded</span>
                )}
              </TableCell>
              <TableCell>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-1"
                  onClick={() => openGradeDialog(assignment)}
                >
                  <GraduationCap className="h-4 w-4" />
                  {assignment.result ? "Edit Grade" : "Grade"}
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <GradeExamDialog 
        open={isGradeDialogOpen} 
        onOpenChange={setIsGradeDialogOpen}
        assignment={assignmentToGrade}
      />
    </div>
  );
}
