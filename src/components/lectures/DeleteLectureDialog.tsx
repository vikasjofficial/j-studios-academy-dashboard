
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Lecture } from "./types";
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

interface DeleteLectureDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  lecture: Lecture | null;
  onLectureDeleted?: () => void;
}

export function DeleteLectureDialog({
  isOpen,
  onOpenChange,
  lecture,
  onLectureDeleted
}: DeleteLectureDialogProps) {
  // Delete lecture
  const deleteLecture = async () => {
    if (!lecture) return;

    try {
      // Delete any lecture topics first
      await supabase
        .from('classes_topics')
        .delete()
        .eq("lecture_id", lecture.id);
      
      // Delete any lecture assignments
      await supabase
        .from('classes_assignments')
        .delete()
        .eq("lecture_id", lecture.id);
      
      // Delete any lecture files and related storage files
      const { data: files } = await supabase
        .from('classes_files')
        .select("*")
        .eq("lecture_id", lecture.id);
      
      if (files && files.length > 0) {
        // Delete files from storage
        for (const file of files) {
          await supabase.storage
            .from("lecture-files")
            .remove([file.file_path]);
        }
        
        // Delete file records
        await supabase
          .from('classes_files')
          .delete()
          .eq("lecture_id", lecture.id);
      }
      
      // Finally delete the lecture
      const { error } = await supabase
        .from('classes')
        .delete()
        .eq("id", lecture.id);
      
      if (error) throw error;
      
      toast.success("Lecture deleted successfully");
      onOpenChange(false);
      if (onLectureDeleted) onLectureDeleted();
    } catch (error) {
      console.error("Error deleting lecture:", error);
      toast.error("Failed to delete lecture");
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete the lecture, all its topics, files, and assignments.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={deleteLecture} className="bg-destructive hover:bg-destructive/90">
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
