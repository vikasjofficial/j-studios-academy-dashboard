
import { useState } from "react";
import { ExamFolder } from "../types";
import { Folder, Edit, Trash2, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Exam } from "../types";
import { ExamCard } from "./exam-card";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface FolderItemProps {
  folder: ExamFolder;
  exams: Exam[];
  isExpanded: boolean;
  onToggleFolder: (folderId: string) => void;
}

export function FolderItem({ folder, exams, isExpanded, onToggleFolder }: FolderItemProps) {
  const queryClient = useQueryClient();
  const [editFolderOpen, setEditFolderOpen] = useState<boolean>(false);
  const [editFolderName, setEditFolderName] = useState(folder.name);

  const handleFolderEdit = () => {
    setEditFolderName(folder.name);
    setEditFolderOpen(true);
  };

  const saveEditedFolder = async () => {
    try {
      const { error } = await supabase
        .from("exam_folders")
        .update({ name: editFolderName })
        .eq("id", folder.id);

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ["exam-folders"] });
      queryClient.invalidateQueries({ queryKey: ["exams"] });
      toast.success("Folder name updated successfully");
      setEditFolderOpen(false);
    } catch (error) {
      console.error("Error updating folder:", error);
      toast.error("Failed to update folder name");
    }
  };

  const deleteFolder = async () => {
    try {
      // First, update all exams in this folder to have null folder_id
      const { error: updateError } = await supabase
        .from("exams")
        .update({ folder_id: null })
        .eq("folder_id", folder.id);

      if (updateError) throw updateError;

      // Then delete the folder
      const { error: deleteError } = await supabase
        .from("exam_folders")
        .delete()
        .eq("id", folder.id);

      if (deleteError) throw deleteError;

      queryClient.invalidateQueries({ queryKey: ["exam-folders"] });
      queryClient.invalidateQueries({ queryKey: ["exams"] });
      toast.success("Folder deleted successfully");
    } catch (error) {
      console.error("Error deleting folder:", error);
      toast.error("Failed to delete folder");
    }
  };

  return (
    <div className="mb-4">
      <Collapsible 
        open={isExpanded} 
        onOpenChange={() => onToggleFolder(folder.id)}
        className="border rounded-lg"
      >
        <div className="p-3 flex items-center justify-between bg-muted/30 rounded-t-lg">
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2 p-0 h-auto">
              <Folder className="h-5 w-5 text-primary" />
              <span className="font-medium">{folder.name}</span>
              {exams.length > 0 && (
                <Badge variant="outline" className="ml-2">
                  {exams.length} exams
                </Badge>
              )}
            </Button>
          </CollapsibleTrigger>
          
          <div className="flex items-center gap-2">
            {editFolderOpen ? (
              <>
                <Input 
                  value={editFolderName} 
                  onChange={(e) => setEditFolderName(e.target.value)}
                  className="h-8 w-40"
                />
                <Button 
                  size="sm" 
                  onClick={saveEditedFolder}
                  variant="ghost"
                >
                  <CheckCircle className="h-4 w-4" />
                </Button>
                <Button 
                  size="sm" 
                  onClick={() => setEditFolderOpen(false)}
                  variant="ghost"
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </>
            ) : (
              <>
                <Button 
                  size="sm" 
                  variant="ghost"
                  onClick={handleFolderEdit}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button 
                  size="sm" 
                  variant="ghost"
                  className="text-destructive hover:text-destructive"
                  onClick={deleteFolder}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>
        </div>
        
        <CollapsibleContent className="p-4 pt-2">
          {exams?.length > 0 ? (
            exams.map(exam => <ExamCard key={exam.id} exam={exam} />)
          ) : (
            <div className="text-center py-4 text-muted-foreground">
              No exams in this folder yet.
            </div>
          )}
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
