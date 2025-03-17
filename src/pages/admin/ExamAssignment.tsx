
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Exam, ExamAssignment as ExamAssignmentType } from "@/components/exams/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Save, Calendar, Users, Check } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import DashboardLayout from "@/components/dashboard-layout";
import { Checkbox } from "@/components/ui/checkbox";
import { DatePicker } from "@/components/ui/date-picker";

interface Student {
  id: string;
  name: string;
  student_id: string;
  email: string;
}

export default function ExamAssignment() {
  const { examId } = useParams<{ examId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined);
  const [isSaving, setIsSaving] = useState(false);

  // Fetch exam details
  const { data: exam, isLoading: examLoading } = useQuery({
    queryKey: ["exam", examId],
    queryFn: async () => {
      if (!examId) return null;
      
      const { data, error } = await supabase
        .from("exams")
        .select("*")
        .eq("id", examId)
        .single();
        
      if (error) throw error;
      return data as Exam;
    },
    enabled: !!examId,
  });

  // Fetch students
  const { data: students, isLoading: studentsLoading } = useQuery({
    queryKey: ["students"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("students")
        .select("id, name, student_id, email")
        .order("name");
        
      if (error) throw error;
      return data as Student[];
    },
  });

  // Fetch existing assignments for this exam
  const { data: existingAssignments, isLoading: assignmentsLoading } = useQuery({
    queryKey: ["exam-assignments", examId],
    queryFn: async () => {
      if (!examId) return [];
      
      const { data, error } = await supabase
        .from("exam_assignments")
        .select("*")
        .eq("exam_id", examId);
        
      if (error) throw error;
      return data as ExamAssignmentType[];
    },
    enabled: !!examId,
  });

  // Initialize selected students based on existing assignments
  useEffect(() => {
    if (existingAssignments && existingAssignments.length > 0) {
      setSelectedStudents(existingAssignments.map(assignment => assignment.student_id));
      
      // If all assignments have the same due date, set it
      const firstDueDate = existingAssignments[0].due_date;
      const allSameDueDate = existingAssignments.every(a => a.due_date === firstDueDate);
      
      if (allSameDueDate && firstDueDate) {
        setDueDate(new Date(firstDueDate));
      }
    }
  }, [existingAssignments]);

  const handleStudentToggle = (studentId: string) => {
    setSelectedStudents(prev => 
      prev.includes(studentId)
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  const handleSelectAll = () => {
    if (students) {
      if (selectedStudents.length === students.length) {
        setSelectedStudents([]);
      } else {
        setSelectedStudents(students.map(student => student.id));
      }
    }
  };

  const handleSaveAssignments = async () => {
    if (!examId || !students) return;
    
    setIsSaving(true);
    try {
      // Get existing student assignments for this exam
      const existingStudentIds = existingAssignments?.map(a => a.student_id) || [];
      
      // Determine which students to add and which to remove
      const studentsToAdd = selectedStudents.filter(id => !existingStudentIds.includes(id));
      const studentsToRemove = existingStudentIds.filter(id => !selectedStudents.includes(id));
      
      // Add new assignments
      if (studentsToAdd.length > 0) {
        const newAssignments = studentsToAdd.map(studentId => ({
          exam_id: examId,
          student_id: studentId,
          due_date: dueDate ? format(dueDate, 'yyyy-MM-dd') : null,
          status: 'assigned'
        }));
        
        const { error: addError } = await supabase
          .from("exam_assignments")
          .insert(newAssignments);
          
        if (addError) throw addError;
      }
      
      // Remove unselected assignments
      if (studentsToRemove.length > 0) {
        const { error: removeError } = await supabase
          .from("exam_assignments")
          .delete()
          .eq("exam_id", examId)
          .in("student_id", studentsToRemove);
          
        if (removeError) throw removeError;
      }
      
      // Update due dates for existing assignments
      if (dueDate && existingStudentIds.length > 0) {
        const studentsToUpdate = selectedStudents.filter(id => existingStudentIds.includes(id));
        
        if (studentsToUpdate.length > 0) {
          const { error: updateError } = await supabase
            .from("exam_assignments")
            .update({ due_date: format(dueDate, 'yyyy-MM-dd') })
            .eq("exam_id", examId)
            .in("student_id", studentsToUpdate);
            
          if (updateError) throw updateError;
        }
      }
      
      queryClient.invalidateQueries({ queryKey: ["exam-assignments", examId] });
      toast.success("Exam assignments updated successfully");
      navigate(`/admin/exams`);
    } catch (error) {
      console.error("Error saving assignments:", error);
      toast.error("Failed to save assignments");
    } finally {
      setIsSaving(false);
    }
  };

  if (examLoading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center py-12">
          <div className="animate-spin h-8 w-8 border-2 border-current border-t-transparent rounded-full"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-in-subtle px-4 md:px-3 max-w-full">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => navigate("/admin/exams")}>
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back
            </Button>
            <h1 className="text-2xl font-bold">Assign Exam to Students</h1>
          </div>
          <Button onClick={handleSaveAssignments} disabled={isSaving}>
            <Save className="mr-2 h-4 w-4" />
            {isSaving ? "Saving..." : "Save Assignments"}
          </Button>
        </div>

        {exam && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span>{exam.name}</span>
                <span className="text-base font-normal bg-muted px-2 py-0.5 rounded-full ml-2">
                  {exam.exam_type.charAt(0).toUpperCase() + exam.exam_type.slice(1)} Exam
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4 flex-wrap">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    Students Selected: {selectedStudents.length}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Due Date:</span>
                  <DatePicker date={dueDate} setDate={setDueDate} />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Select Students
              </CardTitle>
              <Button variant="outline" size="sm" onClick={handleSelectAll}>
                {students && selectedStudents.length === students.length 
                  ? "Deselect All" 
                  : "Select All"}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {studentsLoading || assignmentsLoading ? (
              <div className="flex justify-center py-6">
                <div className="animate-spin h-6 w-6 border-2 border-current border-t-transparent rounded-full"></div>
              </div>
            ) : students && students.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {students.map(student => (
                  <div 
                    key={student.id}
                    className={`border rounded-lg p-3 flex items-center gap-3 
                      ${selectedStudents.includes(student.id) 
                        ? "bg-primary/10 border-primary/30" 
                        : "bg-card hover:bg-muted/50"}`}
                  >
                    <Checkbox
                      checked={selectedStudents.includes(student.id)}
                      onCheckedChange={() => handleStudentToggle(student.id)}
                      id={`student-${student.id}`}
                    />
                    <label 
                      htmlFor={`student-${student.id}`}
                      className="flex-grow cursor-pointer"
                    >
                      <div className="font-medium">{student.name}</div>
                      <div className="text-xs text-muted-foreground">{student.student_id}</div>
                    </label>
                    {selectedStudents.includes(student.id) && (
                      <Check className="h-4 w-4 text-primary" />
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-muted-foreground">No students found.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
