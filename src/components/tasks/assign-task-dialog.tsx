
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { DatePicker } from "@/components/ui/date-picker";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { format, addDays } from "date-fns";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import type { Task } from "./task-list";

interface Student {
  id: string;
  name: string;
  student_id: string;
  email: string;
}

interface AssignTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: Task;
  onTaskAssigned: () => void;
}

export function AssignTaskDialog({ open, onOpenChange, task, onTaskAssigned }: AssignTaskDialogProps) {
  const [selectedStudents, setSelectedStudents] = useState<Set<string>>(new Set());
  const [dueDate, setDueDate] = useState<Date>(addDays(new Date(), 7));
  const [notes, setNotes] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Fetch students
  const { data: students, isLoading: isLoadingStudents } = useQuery({
    queryKey: ["students-for-tasks"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("students")
        .select("id, name, student_id, email")
        .order("name");
        
      if (error) throw error;
      return data as Student[];
    },
  });
  
  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      setSelectedStudents(new Set());
      setDueDate(addDays(new Date(), 7));
      setNotes("");
      setSearchTerm("");
    }
  }, [open]);

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

  // Select/Deselect all filtered students
  const toggleAll = () => {
    if (filteredStudents) {
      if (selectedStudents.size === filteredStudents.length) {
        setSelectedStudents(new Set());
      } else {
        setSelectedStudents(new Set(filteredStudents.map(s => s.id)));
      }
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedStudents.size === 0) {
      toast.error("Please select at least one student");
      return;
    }
    
    if (!dueDate) {
      toast.error("Please select a due date");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const assignments = Array.from(selectedStudents).map(studentId => ({
        task_id: task.id,
        student_id: studentId,
        due_date: format(dueDate, "yyyy-MM-dd"),
        notes: notes || null,
        status: "pending"
      }));
      
      const { error } = await supabase
        .from("student_tasks")
        .insert(assignments)
        .select();
        
      if (error) {
        throw error;
      }
      
      toast.success(`Task assigned to ${selectedStudents.size} student${selectedStudents.size > 1 ? 's' : ''}`);
      onOpenChange(false);
      onTaskAssigned();
    } catch (error: any) {
      console.error("Error assigning task:", error);
      toast.error(error.message || "Failed to assign task. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Assign Task: {task.title}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-4">
            {/* Search and Select All */}
            <div className="flex gap-4 items-end">
              <div className="flex-1">
                <Label htmlFor="search">Search Students</Label>
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="search"
                    placeholder="Search by name, ID or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8"
                  />
                </div>
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={toggleAll}
              >
                {selectedStudents.size === (filteredStudents?.length || 0) ? "Deselect All" : "Select All"}
              </Button>
            </div>

            {/* Students List */}
            <div className="border rounded-md">
              <ScrollArea className="h-[200px]">
                <div className="p-4 space-y-2">
                  {isLoadingStudents ? (
                    <div className="text-center py-4">Loading students...</div>
                  ) : filteredStudents && filteredStudents.length > 0 ? (
                    filteredStudents.map(student => (
                      <div
                        key={student.id}
                        className="flex items-center space-x-3 p-2 hover:bg-muted/50 rounded-md"
                      >
                        <Checkbox
                          checked={selectedStudents.has(student.id)}
                          onCheckedChange={() => toggleStudent(student.id)}
                          id={`student-${student.id}`}
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
            </div>

            {/* Selected Count */}
            <div className="text-sm text-muted-foreground">
              {selectedStudents.size} student{selectedStudents.size !== 1 ? 's' : ''} selected
            </div>
            
            {/* Due Date */}
            <div className="grid gap-2">
              <Label htmlFor="dueDate">Due Date</Label>
              <DatePicker date={dueDate} setDate={setDueDate} />
            </div>
            
            {/* Notes */}
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
            <Button 
              type="submit" 
              disabled={isSubmitting || selectedStudents.size === 0}
            >
              {isSubmitting ? (
                <>
                  <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-1"></div>
                  Assigning...
                </>
              ) : (
                `Assign to ${selectedStudents.size} student${selectedStudents.size !== 1 ? 's' : ''}`
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
