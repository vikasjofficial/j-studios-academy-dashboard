
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Exam, ExamType } from "./types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Users, Clock, PlayCircle } from "lucide-react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

interface ExamsListProps {
  exams: Exam[];
  examType: ExamType;
}

export function ExamsList({ exams, examType }: ExamsListProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [examToDelete, setExamToDelete] = useState<Exam | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const formatExamType = (type: ExamType) => {
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  const handleDeleteClick = (exam: Exam) => {
    setExamToDelete(exam);
    setDeleteDialogOpen(true);
  };

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

  const navigateToExamDetail = (examId: string) => {
    navigate(`/admin/exams/${examId}`);
  };

  const navigateToAssignExam = (examId: string) => {
    navigate(`/admin/exams/${examId}/assign`);
  };

  if (exams.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No {examType} exams found.</p>
        <p className="text-sm text-muted-foreground mt-2">
          Create a new {examType} exam to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {exams.map((exam) => (
        <Card key={exam.id} className="hover:bg-muted/50 transition-colors">
          <CardContent className="p-4">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <h3 className="text-lg font-semibold">{exam.name}</h3>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  {exam.total_time_minutes} minutes
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{formatExamType(exam.exam_type)}</Badge>
                  {exam.is_active ? (
                    <Badge variant="success">Active</Badge>
                  ) : (
                    <Badge variant="destructive">Inactive</Badge>
                  )}
                </div>
                {exam.description && (
                  <p className="text-sm text-muted-foreground max-w-2xl">
                    {exam.description}
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  Created on {format(new Date(exam.created_at), "MMM d, yyyy")}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline" onClick={() => navigateToExamDetail(exam.id)}>
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </Button>
                <Button size="sm" variant="outline" onClick={() => navigateToAssignExam(exam.id)}>
                  <Users className="h-4 w-4 mr-1" />
                  Assign
                </Button>
                <Button 
                  size="sm" 
                  variant="destructive" 
                  onClick={() => handleDeleteClick(exam)}
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Delete
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Delete Confirmation Dialog */}
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
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
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
    </div>
  );
}
