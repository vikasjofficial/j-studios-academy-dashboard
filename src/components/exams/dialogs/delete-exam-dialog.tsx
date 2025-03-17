
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useExamDialogsStore } from "../stores/exam-dialogs-store";

export function DeleteExamDialog() {
  const { deleteDialogOpen, setDeleteDialogOpen, examToDelete, setExamToDelete } = useExamDialogsStore();
  const [isDeleting, setIsDeleting] = useState(false);
  const queryClient = useQueryClient();

  const handleDeleteExam = async () => {
    if (!examToDelete) return;
    
    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from("exams")
        .delete()
        .eq("id", examToDelete.id);

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ["exams"] });
      toast.success(`${examToDelete.name} deleted successfully`);
      setDeleteDialogOpen(false);
    } catch (error) {
      console.error("Error deleting exam:", error);
      toast.error("Failed to delete exam");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleClose = () => {
    setDeleteDialogOpen(false);
    setExamToDelete(null);
  };

  return (
    <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Exam</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <p>
            Are you sure you want to delete{" "}
            <span className="font-semibold">{examToDelete?.name}</span>?
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            This will permanently delete the exam and all associated questions, assignments, and results.
            This action cannot be undone.
          </p>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button 
            variant="destructive" 
            onClick={handleDeleteExam}
            disabled={isDeleting}
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
