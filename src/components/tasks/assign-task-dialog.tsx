
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { format, addDays } from "date-fns";
import type { Task } from "./task-list";

interface Student {
  id: string;
  name: string;
  student_id: string;
}

interface AssignTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: Task;
  onTaskAssigned: () => void;
}

export function AssignTaskDialog({ open, onOpenChange, task, onTaskAssigned }: AssignTaskDialogProps) {
  const [studentId, setStudentId] = useState<string>("");
  const [dueDate, setDueDate] = useState<Date>(addDays(new Date(), 7));
  const [notes, setNotes] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Fetch students
  const { data: students, isLoading: isLoadingStudents } = useQuery({
    queryKey: ["students-for-tasks"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("students")
        .select("id, name, student_id")
        .order("name");
        
      if (error) throw error;
      return data as Student[];
    },
  });
  
  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      setStudentId("");
      setDueDate(addDays(new Date(), 7));
      setNotes("");
    }
  }, [open]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentId) {
      toast.error("Please select a student");
      return;
    }
    
    if (!dueDate) {
      toast.error("Please select a due date");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Use type assertion to fix TypeScript errors
      const { error } = await supabase
        .from("student_tasks" as any)
        .insert({
          task_id: task.id,
          student_id: studentId,
          due_date: format(dueDate, "yyyy-MM-dd"),
          notes: notes || null,
          status: "pending"
        });
        
      if (error) throw error;
      
      onTaskAssigned();
    } catch (error) {
      console.error("Error assigning task:", error);
      toast.error("Failed to assign task");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Assign Task: {task.title}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="student">Select Student</Label>
              {isLoadingStudents ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                  <span>Loading students...</span>
                </div>
              ) : (
                <Select value={studentId} onValueChange={setStudentId}>
                  <SelectTrigger id="student">
                    <SelectValue placeholder="Select a student" />
                  </SelectTrigger>
                  <SelectContent>
                    {students?.map((student) => (
                      <SelectItem key={student.id} value={student.id}>
                        {student.name} ({student.student_id})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="dueDate">Due Date</Label>
              <DatePicker date={dueDate} setDate={setDueDate} />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="notes">Additional Notes (Optional)</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any notes for this task assignment"
                rows={3}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-1"></div>
                  Assigning...
                </>
              ) : (
                "Assign Task"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
