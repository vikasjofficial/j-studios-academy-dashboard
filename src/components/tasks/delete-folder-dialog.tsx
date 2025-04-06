
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
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
import type { TaskFolder } from "./task-folders";

interface DeleteFolderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  folder: TaskFolder | null;
  onFolderDeleted: () => void;
}

export function DeleteFolderDialog({
  open,
  onOpenChange,
  folder,
  onFolderDeleted
}: DeleteFolderDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleDeleteFolder = async () => {
    if (!folder) return;

    setIsSubmitting(true);
    
    try {
      // Use the generic version to work around TypeScript issues
      const { error } = await supabase
        .from('task_folders')
        .delete()
        .eq("id", folder.id);
        
      if (error) {
        throw error;
      }
      
      toast.success("Folder deleted successfully");
      onOpenChange(false);
      onFolderDeleted();
    } catch (error: any) {
      console.error("Error deleting folder:", error);
      toast.error(error.message || "Failed to delete folder");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Folder</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete the folder "{folder?.name}"?
            Tasks in this folder will not be deleted, but they will be moved to the root level.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDeleteFolder}
            disabled={isSubmitting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isSubmitting ? (
              <>
                <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-1"></div>
                Deleting...
              </>
            ) : (
              "Delete"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
