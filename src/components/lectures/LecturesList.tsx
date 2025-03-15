
import { useState } from "react";
import { motion } from "framer-motion";
import { FileText, Pencil, Trash2 } from "lucide-react";
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
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface LecturesListProps {
  lectures: Lecture[];
  isLoading: boolean;
  onSelectLecture: (lecture: Lecture) => void;
  onLectureDeleted?: () => void;
  viewOnly?: boolean;
}

export function LecturesList({
  lectures,
  isLoading,
  onSelectLecture,
  onLectureDeleted,
  viewOnly = false
}: LecturesListProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [lectureToDelete, setLectureToDelete] = useState<Lecture | null>(null);

  // Handle lecture delete click
  const handleDeleteClick = (lecture: Lecture, e: React.MouseEvent) => {
    e.stopPropagation();
    setLectureToDelete(lecture);
    setIsDeleteDialogOpen(true);
  };

  // Delete lecture
  const deleteLecture = async () => {
    if (!lectureToDelete) return;

    try {
      // Delete any lecture topics first
      await supabase
        .from('lecture_topics')
        .delete()
        .eq("lecture_id", lectureToDelete.id);
      
      // Delete any lecture assignments
      await supabase
        .from('lecture_assignments')
        .delete()
        .eq("lecture_id", lectureToDelete.id);
      
      // Delete any lecture files and related storage files
      const { data: files } = await supabase
        .from('lecture_files')
        .select("*")
        .eq("lecture_id", lectureToDelete.id);
      
      if (files && files.length > 0) {
        // Delete files from storage
        for (const file of files) {
          await supabase.storage
            .from("lecture-files")
            .remove([file.file_path]);
        }
        
        // Delete file records
        await supabase
          .from('lecture_files')
          .delete()
          .eq("lecture_id", lectureToDelete.id);
      }
      
      // Finally delete the lecture
      const { error } = await supabase
        .from('lectures')
        .delete()
        .eq("id", lectureToDelete.id);
      
      if (error) throw error;
      
      toast.success("Lecture deleted successfully");
      setIsDeleteDialogOpen(false);
      if (onLectureDeleted) onLectureDeleted();
    } catch (error) {
      console.error("Error deleting lecture:", error);
      toast.error("Failed to delete lecture");
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-32">
        <p className="text-muted-foreground">Loading lectures...</p>
      </div>
    );
  }

  if (lectures.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-32 space-y-2">
        <p className="text-muted-foreground">No lectures found in this folder</p>
        {!viewOnly && (
          <p className="text-sm">Click "New Lecture" to create one</p>
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {lectures.map((lecture, index) => (
        <motion.div
          key={lecture.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
          className="w-full"
        >
          <Card 
            className="h-full cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => onSelectLecture(lecture)}
          >
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <FileText className="h-5 w-5 text-primary" />
                <div>
                  <h3 className="font-medium">{lecture.title}</h3>
                </div>
              </div>
              
              {!viewOnly && (
                <div className="flex space-x-1">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 w-8 p-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectLecture(lecture);
                    }}
                  >
                    <Pencil className="h-4 w-4" />
                    <span className="sr-only">Edit</span>
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 w-8 p-0 text-destructive"
                    onClick={(e) => handleDeleteClick(lecture, e)}
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

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
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
    </div>
  );
}
