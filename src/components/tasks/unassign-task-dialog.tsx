
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import type { Task } from "./task-list";

interface UnassignTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: Task;
  studentTaskId: string;
  studentName: string;
  onTaskUnassigned: () => void;
}

export function UnassignTaskDialog({
  open,
  onOpenChange,
  task,
  studentTaskId,
  studentName,
  onTaskUnassigned
}: UnassignTaskDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleUnassign = async () => {
    setIsSubmitting(true);
    
    try {
      const { error } = await supabase
        .from("student_tasks")
        .delete()
        .eq("id", studentTaskId);
        
      if (error) {
        throw error;
      }
      
      toast.success(`Task unassigned from ${studentName}`);
      onOpenChange(false);
      onTaskUnassigned();
    } catch (error: any) {
      console.error("Error unassigning task:", error);
      toast.error(error.message || "Failed to unassign task");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Unassign Task</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to unassign "{task.title}" from {studentName}?
            This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleUnassign}
            disabled={isSubmitting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isSubmitting ? (
              <>
                <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-1"></div>
                Unassigning...
              </>
            ) : (
              "Unassign"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
