
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import type { Task } from "./task-list";
import type { TaskFolder } from "./task-folders";

interface MoveTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: Task;
  onTaskMoved: () => void;
}

export function MoveTaskDialog({
  open,
  onOpenChange,
  task,
  onTaskMoved
}: MoveTaskDialogProps) {
  const [folderId, setFolderId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch all folders for selection
  const { data: folders } = useQuery({
    queryKey: ["task-folders"],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('task_folders')
          .select("*")
          .order("name");
          
        if (error) {
          console.error("Error fetching folders:", error);
          throw error;
        }
        
        return data as TaskFolder[];
      } catch (error) {
        console.error("Error in query function:", error);
        throw error;
      }
    },
  });

  // Set the initial folder value when the task prop changes
  useEffect(() => {
    if (task) {
      setFolderId(task.folder_id || null);
    }
  }, [task]);

  const handleMoveTask = async () => {
    setIsSubmitting(true);
    
    try {
      const { error } = await supabase
        .from("tasks")
        .update({ folder_id: folderId || null })
        .eq("id", task.id);
        
      if (error) {
        throw error;
      }
      
      toast.success("Task moved successfully");
      onOpenChange(false);
      onTaskMoved();
    } catch (error: any) {
      console.error("Error moving task:", error);
      toast.error(error.message || "Failed to move task");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Move Task to Folder</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="folder">Select Folder</Label>
            <Select
              value={folderId || ""}
              onValueChange={(value) => setFolderId(value || null)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a folder" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">None (Remove from folder)</SelectItem>
                {folders?.map((folder) => (
                  <SelectItem key={folder.id} value={folder.id}>
                    {folder.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleMoveTask}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-1"></div>
                Moving...
              </>
            ) : (
              "Move Task"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
