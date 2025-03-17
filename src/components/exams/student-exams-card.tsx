
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ExamAssignment, Exam } from "./types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Clock, Calendar, GraduationCap, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { useAuth } from "@/context/auth-context";

export function StudentExamsCard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Fetch assigned exams for the student
  const { data: assignedExams, isLoading } = useQuery({
    queryKey: ["student-exams", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from("exam_assignments")
        .select(`
          id,
          exam_id,
          assigned_at,
          due_date,
          status,
          exams:exam_id (
            id,
            name,
            description,
            exam_type,
            total_time_minutes,
            is_active
          ),
          exam_results (
            id,
            total_score,
            teacher_notes,
            view_results
          )
        `)
        .eq("student_id", user.id)
        .order("assigned_at", { ascending: false });
        
      if (error) throw error;
      
      // Transform data to include exam details
      return data.map((assignment) => ({
        ...assignment,
        exam: assignment.exams as Exam,
        result: assignment.exam_results && assignment.exam_results.length > 0 
          ? assignment.exam_results[0] 
          : null
      }));
    },
    enabled: !!user?.id,
  });

  const handleStartExam = (assignmentId: string, examId: string) => {
    navigate(`/student/exams/${assignmentId}`);
  };

  const getStatusBadge = (status: string, dueDate?: string) => {
    if (status === "completed") {
      return <Badge variant="success">Completed</Badge>;
    }
    
    if (status === "in_progress") {
      return <Badge variant="warning">In Progress</Badge>;
    }
    
    if (dueDate && new Date(dueDate) < new Date()) {
      return <Badge variant="destructive">Expired</Badge>;
    }
    
    return <Badge variant="outline">Assigned</Badge>;
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>My Exams</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center py-6">
            <div className="animate-pulse h-6 w-6 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-primary" />
          My Exams
        </CardTitle>
      </CardHeader>
      <CardContent>
        {assignedExams && assignedExams.length > 0 ? (
          <div className="space-y-4">
            {assignedExams.map((assignment) => (
              <div key={assignment.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{assignment.exam.name}</h3>
                      {getStatusBadge(assignment.status, assignment.due_date)}
                      
                      {/* Show score if exam is completed and results are visible */}
                      {assignment.result && assignment.result.view_results && (
                        <div className="ml-2 flex items-center gap-1 bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                          <Star className="h-3 w-3" />
                          <span className="font-medium">{assignment.result.total_score || "-"}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>{assignment.exam.total_time_minutes} minutes</span>
                      </div>
                      {assignment.due_date && (
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>Due: {format(new Date(assignment.due_date), "PPP")}</span>
                        </div>
                      )}
                      <Badge variant="outline" className="capitalize">
                        {assignment.exam.exam_type}
                      </Badge>
                    </div>
                    {assignment.exam.description && (
                      <p className="text-sm text-muted-foreground">{assignment.exam.description}</p>
                    )}
                    
                    {/* Show teacher notes if available */}
                    {assignment.result && assignment.result.view_results && assignment.result.teacher_notes && (
                      <div className="mt-2 text-sm border-l-2 border-primary pl-3 py-1 bg-primary/5 rounded-sm">
                        <div className="flex items-center gap-1 text-primary font-medium mb-1">
                          <GraduationCap className="h-3 w-3" />
                          Teacher Notes:
                        </div>
                        <p className="text-muted-foreground">{assignment.result.teacher_notes}</p>
                      </div>
                    )}
                  </div>
                  <div>
                    <Button
                      onClick={() => handleStartExam(assignment.id, assignment.exam_id)}
                      variant={
                        assignment.status === "completed" 
                          ? "outline" 
                          : assignment.status === "assigned" 
                            ? "default" 
                            : "secondary"
                      }
                      disabled={
                        !assignment.exam.is_active || 
                        (assignment.due_date && new Date(assignment.due_date) < new Date() && assignment.status !== "completed")
                      }
                    >
                      {assignment.status === "completed" 
                        ? "Review Results" 
                        : assignment.status === "in_progress" 
                          ? "Continue Exam" 
                          : "Start Exam"}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6">
            <p className="text-muted-foreground">No exams assigned.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
