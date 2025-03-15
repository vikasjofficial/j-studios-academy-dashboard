
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Lecture, Student, LectureAssignment } from "./types";
import { Check, X, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";

interface StudentAssignmentManagerProps {
  lecture: Lecture;
}

export function StudentAssignmentManager({ lecture }: StudentAssignmentManagerProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStudents, setSelectedStudents] = useState<Set<string>>(new Set());
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch all students
  const { data: students, isLoading: studentsLoading } = useQuery({
    queryKey: ["students"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("students")
        .select("id, name, student_id, email")
        .order("name");
      
      if (error) {
        throw error;
      }
      
      return data as Student[];
    },
  });

  // Fetch existing assignments for this lecture
  const { data: assignments, isLoading: assignmentsLoading, refetch } = useQuery({
    queryKey: ["lectureAssignments", lecture.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("lecture_assignments")
        .select("*")
        .eq("lecture_id", lecture.id);
      
      if (error) {
        throw error;
      }
      
      // Initialize selectedStudents with existing assignments
      const assignedStudentIds = new Set(data.map(a => a.student_id));
      setSelectedStudents(assignedStudentIds);
      
      return data as LectureAssignment[];
    },
  });

  // Filter students based on search term
  const filteredStudents = students?.filter(student => 
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.student_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Toggle student selection
  const toggleStudent = (studentId: string) => {
    const newSelected = new Set(selectedStudents);
    if (newSelected.has(studentId)) {
      newSelected.delete(studentId);
    } else {
      newSelected.add(studentId);
    }
    setSelectedStudents(newSelected);
  };

  // Select all students
  const selectAllStudents = () => {
    if (students) {
      const allStudentIds = students.map(s => s.id);
      setSelectedStudents(new Set(allStudentIds));
    }
  };

  // Deselect all students
  const deselectAllStudents = () => {
    setSelectedStudents(new Set());
  };

  // Save assignments
  const saveAssignments = async () => {
    if (!students) return;
    
    setIsSubmitting(true);
    
    try {
      // Get current assignments to determine what to add/remove
      const currentAssignments = assignments || [];
      const currentAssignedStudentIds = new Set(currentAssignments.map(a => a.student_id));
      
      // Students to add (in selected but not in current)
      const studentsToAdd = Array.from(selectedStudents)
        .filter(id => !currentAssignedStudentIds.has(id))
        .map(studentId => ({
          lecture_id: lecture.id,
          student_id: studentId
        }));
      
      // Students to remove (in current but not in selected)
      const studentsToRemove = Array.from(currentAssignedStudentIds)
        .filter(id => !selectedStudents.has(id));
      
      // Perform the database operations
      if (studentsToAdd.length > 0) {
        const { error: addError } = await supabase
          .from("lecture_assignments")
          .insert(studentsToAdd);
        
        if (addError) throw addError;
      }
      
      for (const studentId of studentsToRemove) {
        const { error: removeError } = await supabase
          .from("lecture_assignments")
          .delete()
          .eq("lecture_id", lecture.id)
          .eq("student_id", studentId);
        
        if (removeError) throw removeError;
      }
      
      toast.success("Student assignments updated");
      refetch();
    } catch (error) {
      console.error("Error updating assignments:", error);
      toast.error("Failed to update assignments");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isLoading = studentsLoading || assignmentsLoading;

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>Assign to Students</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search students..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <Button variant="outline" onClick={selectAllStudents}>
              Select All
            </Button>
            <Button variant="outline" onClick={deselectAllStudents}>
              Deselect All
            </Button>
          </div>
          
          {isLoading ? (
            <div className="text-center py-4">Loading students...</div>
          ) : (
            <>
              <ScrollArea className="h-[300px] border rounded-md">
                <div className="p-4 space-y-2">
                  {filteredStudents && filteredStudents.length > 0 ? (
                    filteredStudents.map(student => (
                      <div
                        key={student.id}
                        className="flex items-center p-2 hover:bg-muted/50 rounded-md"
                      >
                        <Checkbox
                          checked={selectedStudents.has(student.id)}
                          onCheckedChange={() => toggleStudent(student.id)}
                          id={`student-${student.id}`}
                          className="mr-3"
                        />
                        <label 
                          htmlFor={`student-${student.id}`}
                          className="flex-1 cursor-pointer"
                        >
                          <div className="font-medium">{student.name}</div>
                          <div className="text-sm text-muted-foreground">
                            ID: {student.student_id} | {student.email}
                          </div>
                        </label>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4 text-muted-foreground">
                      {searchTerm ? "No students match your search" : "No students available"}
                    </div>
                  )}
                </div>
              </ScrollArea>
              
              <div className="flex justify-end gap-2">
                <Button
                  variant="default"
                  onClick={saveAssignments}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Saving..." : "Save Assignments"}
                </Button>
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
