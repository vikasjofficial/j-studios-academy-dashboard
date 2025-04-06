
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface CreateFolderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onFolderCreated: () => void;
}

export function CreateFolderDialog({
  open,
  onOpenChange,
  onFolderCreated
}: CreateFolderDialogProps) {
  const [folderName, setFolderName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreateFolder = async () => {
    if (!folderName.trim()) {
      toast.error("Please enter a folder name");
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Use the generic version to work around TypeScript issues
      const { error } = await supabase
        .from('task_folders')
        .insert([{ name: folderName.trim() }]);
        
      if (error) {
        throw error;
      }
      
      toast.success("Folder created successfully");
      setFolderName("");
      onOpenChange(false);
      onFolderCreated();
    } catch (error: any) {
      console.error("Error creating folder:", error);
      toast.error(error.message || "Failed to create folder");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Folder</DialogTitle>
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
            onClick={handleCreateFolder}
            disabled={isSubmitting || !folderName.trim()}
          >
            {isSubmitting ? (
              <>
                <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-1"></div>
                Creating...
              </>
            ) : (
              "Create Folder"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
