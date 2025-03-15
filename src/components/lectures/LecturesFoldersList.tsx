
import { useState } from "react";
import { motion } from "framer-motion";
import { Pencil, Trash2, Folder } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { LectureFolder } from "./types";
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
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

interface LecturesFoldersListProps {
  folders: LectureFolder[];
  isLoading: boolean;
  onSelectFolder: (folder: LectureFolder) => void;
  onFolderDeleted?: () => void;
  viewOnly?: boolean;
}

export function LecturesFoldersList({
  folders,
  isLoading,
  onSelectFolder,
  onFolderDeleted,
  viewOnly = false
}: LecturesFoldersListProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [folderToEdit, setFolderToEdit] = useState<LectureFolder | null>(null);
  const [newFolderName, setNewFolderName] = useState("");

  // Handle folder edit
  const handleEditClick = (folder: LectureFolder, e: React.MouseEvent) => {
    e.stopPropagation();
    setFolderToEdit(folder);
    setNewFolderName(folder.name);
    setIsEditDialogOpen(true);
  };

  // Handle folder delete
  const handleDeleteClick = (folder: LectureFolder, e: React.MouseEvent) => {
    e.stopPropagation();
    setFolderToEdit(folder);
    setIsDeleteDialogOpen(true);
  };

  // Save folder edit using classes_folders table
  const saveEditedFolder = async () => {
    if (!folderToEdit || !newFolderName.trim()) return;

    try {
      const { error } = await supabase
        .from("classes_folders")
        .update({ name: newFolderName, updated_at: new Date().toISOString() })
        .eq("id", folderToEdit.id);
      
      if (error) throw error;
      
      toast.success("Folder updated successfully");
      setIsEditDialogOpen(false);
      setFolderToEdit(null);
      if (onFolderDeleted) onFolderDeleted();
    } catch (error) {
      console.error("Error updating folder:", error);
      toast.error("Failed to update folder");
    }
  };

  // Delete folder using classes_folders table
  const deleteFolder = async () => {
    if (!folderToEdit) return;

    try {
      // Check if there are any lectures in this folder
      const { data: lecturesInFolder, error: checkError } = await supabase
        .from("classes")
        .select("id")
        .eq("folder_id", folderToEdit.id);
      
      if (checkError) throw checkError;
      
      if (lecturesInFolder && lecturesInFolder.length > 0) {
        toast.error("Cannot delete folder that contains lectures");
        setIsDeleteDialogOpen(false);
        return;
      }
      
      const { error } = await supabase
        .from("classes_folders")
        .delete()
        .eq("id", folderToEdit.id);
      
      if (error) throw error;
      
      toast.success("Folder deleted successfully");
      setIsDeleteDialogOpen(false);
      setFolderToEdit(null);
      if (onFolderDeleted) onFolderDeleted();
    } catch (error) {
      console.error("Error deleting folder:", error);
      toast.error("Failed to delete folder");
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-32">
        <p className="text-muted-foreground">Loading folders...</p>
      </div>
    );
  }

  if (folders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-32 space-y-2">
        <p className="text-muted-foreground">No lecture folders found</p>
        {!viewOnly && (
          <p className="text-sm">Create a folder to get started</p>
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {folders.map((folder, index) => (
        <motion.div
          key={folder.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
          className="w-full"
        >
          <Card 
            className="h-full cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => onSelectFolder(folder)}
          >
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Folder className="h-5 w-5 text-primary" />
                <div>
                  <h3 className="font-medium">{folder.name}</h3>
                </div>
              </div>
              
              {!viewOnly && (
                <div className="flex space-x-1">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 w-8 p-0"
                    onClick={(e) => handleEditClick(folder, e)}
                  >
                    <Pencil className="h-4 w-4" />
                    <span className="sr-only">Edit</span>
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 w-8 p-0 text-destructive"
                    onClick={(e) => handleDeleteClick(folder, e)}
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">Delete</span>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      ))}

      {/* Edit Folder Dialog */}
      <AlertDialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Edit Folder</AlertDialogTitle>
            <AlertDialogDescription>
              Enter a new name for the folder.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <Input
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              placeholder="Folder name"
              className="w-full"
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={saveEditedFolder}>Save</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the folder. You cannot delete a folder that contains lectures.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={deleteFolder} className="bg-destructive hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
