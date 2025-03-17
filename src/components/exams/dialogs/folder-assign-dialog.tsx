
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ExamFolder } from "../types";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useExamDialogsStore } from "../stores/exam-dialogs-store";

interface FolderAssignDialogProps {
  folders: ExamFolder[];
}

export function FolderAssignDialog({ folders }: FolderAssignDialogProps) {
  const { 
    folderAssignDialogOpen, 
    setFolderAssignDialogOpen, 
    examToAssignFolder, 
    selectedFolderId,
    setSelectedFolderId
  } = useExamDialogsStore();
  const queryClient = useQueryClient();

  const assignExamToFolder = async () => {
    if (!examToAssignFolder) return;

    try {
      // Handle the special "none" value to set folder_id to null
      const folderIdToAssign = selectedFolderId === "none" ? null : selectedFolderId;
      
      const { error } = await supabase
        .from("exams")
        .update({ folder_id: folderIdToAssign })
        .eq("id", examToAssignFolder.id);

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ["exams"] });
      toast.success("Exam moved to folder successfully");
      setFolderAssignDialogOpen(false);
    } catch (error) {
      console.error("Error assigning exam to folder:", error);
      toast.error("Failed to move exam to folder");
    }
  };

  return (
    <Dialog open={folderAssignDialogOpen} onOpenChange={setFolderAssignDialogOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Move Exam to Folder</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <p className="mb-4">
            Select a folder to move <span className="font-semibold">{examToAssignFolder?.name}</span> to:
          </p>
          <Select value={selectedFolderId || "none"} onValueChange={setSelectedFolderId}>
            <SelectTrigger>
              <SelectValue placeholder="Select a folder" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None (Remove from folder)</SelectItem>
              {folders.map(folder => (
                <SelectItem key={folder.id} value={folder.id}>
                  {folder.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setFolderAssignDialogOpen(false)}>
            Cancel
          </Button>
          <Button 
            onClick={assignExamToFolder}
          >
            Move Exam
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
