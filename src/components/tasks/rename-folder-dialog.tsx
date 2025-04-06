
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { TaskFolder } from "./task-folders";

interface RenameFolderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  folder: TaskFolder | null;
  onFolderRenamed: () => void;
}

export function RenameFolderDialog({
  open,
  onOpenChange,
  folder,
  onFolderRenamed
}: RenameFolderDialogProps) {
  const [folderName, setFolderName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (folder) {
      setFolderName(folder.name);
    }
  }, [folder]);

  const handleRenameFolder = async () => {
    if (!folder || !folderName.trim()) {
      toast.error("Please enter a folder name");
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Use the generic version to work around TypeScript issues
      const { error } = await supabase
        .from('task_folders')
        .update({ name: folderName.trim() })
        .eq("id", folder.id);
        
      if (error) {
        throw error;
      }
      
      toast.success("Folder renamed successfully");
      onOpenChange(false);
      onFolderRenamed();
    } catch (error: any) {
      console.error("Error renaming folder:", error);
      toast.error(error.message || "Failed to rename folder");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Rename Folder</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Folder Name</Label>
            <Input
              id="name"
              placeholder="Enter folder name"
              value={folderName}
              onChange={(e) => setFolderName(e.target.value)}
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleRenameFolder}
            disabled={isSubmitting || !folderName.trim()}
          >
            {isSubmitting ? (
              <>
                <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-1"></div>
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
