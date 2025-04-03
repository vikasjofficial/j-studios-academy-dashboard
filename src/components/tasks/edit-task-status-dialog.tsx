
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Clock, CircleAlert } from "lucide-react";
import type { Task } from "./task-list";

interface Student {
  id: string;
  name: string;
  student_id: string;
}

interface StudentTask {
  id: string;
  student_id: string;
  status: string;
  due_date: string;
  assigned_at: string;
  completed_at: string | null;
  notes: string | null;
  students: {
    name: string;
    student_id: string;
  };
}

interface EditTaskStatusDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: Task;
  onStatusUpdated: () => void;
}

export function EditTaskStatusDialog({ open, onOpenChange, task, onStatusUpdated }: EditTaskStatusDialogProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [newStatus, setNewStatus] = useState<string>("pending");
  
  // Fetch task assignments for this task
  const { data: studentTasks, isLoading, refetch } = useQuery({
    queryKey: ["student-tasks", task.id],
    queryFn: async () => {
      // Use type assertion to fix TypeScript errors
      const { data, error } = await supabase
        .from("student_tasks" as any)
        .select(`
          id,
          student_id,
          status,
          due_date,
          assigned_at,
          completed_at,
          notes,
          students:student_id(name, student_id)
        `)
        .eq("task_id", task.id)
        .order("assigned_at", { ascending: false });
        
      if (error) throw error;
      return data as StudentTask[];
    },
    enabled: open,
  });
  
  const handleUpdateStatus = async () => {
    if (!selectedTaskId || !newStatus) {
      toast.error("Please select an assignment and status");
      return;
    }
    
    setIsUpdating(true);
    
    try {
      const updateData: any = {
        status: newStatus
      };
      
      // Set completed_at timestamp if status is 'completed'
      if (newStatus === 'completed') {
        updateData.completed_at = new Date().toISOString();
      } else {
        updateData.completed_at = null;
      }
      
      // Use type assertion to fix TypeScript errors
      const { error } = await supabase
        .from("student_tasks" as any)
        .update(updateData)
        .eq("id", selectedTaskId);
        
      if (error) throw error;
      
      await refetch();
      setSelectedTaskId(null);
      setNewStatus("pending");
      toast.success("Task status updated successfully");
    } catch (error) {
      console.error("Error updating task status:", error);
      toast.error("Failed to update task status");
    } finally {
      setIsUpdating(false);
    }
  };
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 flex items-center gap-1">
            <CheckCircle className="h-3 w-3" />
            Completed
          </Badge>
        );
      case 'pending':
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 flex items-center gap-1">
            <Clock className="h-3 w-3" />
            Pending
          </Badge>
        );
      case 'overdue':
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 flex items-center gap-1">
            <CircleAlert className="h-3 w-3" />
            Overdue
          </Badge>
        );
      default:
        return (
          <Badge variant="outline">{status}</Badge>
        );
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Manage Task Status: {task.title}</DialogTitle>
        </DialogHeader>
        
        <div className="py-4">
          {isLoading ? (
            <div className="flex justify-center p-4">
              <div className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : !studentTasks || studentTasks.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground">
              This task has not been assigned to any students yet.
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {studentTasks.map((assignment) => (
                    <TableRow key={assignment.id}>
                      <TableCell className="font-medium">
                        {assignment.students.name} ({assignment.students.student_id})
                      </TableCell>
                      <TableCell>
                        {format(new Date(assignment.due_date), "MMM d, yyyy")}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(assignment.status)}
                      </TableCell>
                      <TableCell>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            setSelectedTaskId(assignment.id);
                            setNewStatus(assignment.status);
                          }}
                        >
                          Update Status
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              
              {selectedTaskId && (
                <div className="mt-4 border p-4 rounded-md">
                  <div className="grid gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="status">Update Status</Label>
                      <Select value={newStatus} onValueChange={setNewStatus}>
                        <SelectTrigger id="status">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="overdue">Overdue</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="flex justify-end">
                      <Button 
                        onClick={handleUpdateStatus} 
                        disabled={isUpdating}
                      >
                        {isUpdating ? (
                          <>
                            <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-1"></div>
                            Updating...
                          </>
                        ) : (
                          "Update Status"
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
