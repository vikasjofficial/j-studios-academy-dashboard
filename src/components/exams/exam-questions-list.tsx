
import { useState } from "react";
import { ExamQuestion } from "./types";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

interface ExamQuestionsListProps {
  questions: ExamQuestion[];
  onDeleteQuestion: (questionId: string) => Promise<void>;
}

export function ExamQuestionsList({ questions, onDeleteQuestion }: ExamQuestionsListProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [questionToDelete, setQuestionToDelete] = useState<ExamQuestion | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteClick = (question: ExamQuestion) => {
    setQuestionToDelete(question);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!questionToDelete) return;
    
    setIsDeleting(true);
    try {
      await onDeleteQuestion(questionToDelete.id);
      setDeleteDialogOpen(false);
    } catch (error) {
      console.error("Error deleting question:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  if (questions.length === 0) {
    return (
      <div className="text-center py-6">
        <p className="text-muted-foreground">No questions added yet.</p>
        <p className="text-sm text-muted-foreground mt-1">
          Add questions to create your exam.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {questions.map((question, index) => (
        <div 
          key={question.id} 
          className="border rounded-lg p-4 bg-card relative group"
        >
          <div className="flex items-start justify-between">
            <div className="space-y-2 w-full pr-10">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium bg-muted px-2 py-1 rounded">
                  Question {index + 1}
                </span>
                <span className="text-sm text-muted-foreground">
                  {question.points} points
                </span>
              </div>
              <p className="text-base whitespace-pre-wrap">{question.question_text}</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="text-destructive opacity-0 group-hover:opacity-100 transition-opacity absolute top-3 right-3"
              onClick={() => handleDeleteClick(question)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ))}

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Question</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="mb-2">Are you sure you want to delete this question?</p>
            {questionToDelete && (
              <div className="bg-muted p-3 rounded-md text-sm">
                {questionToDelete.question_text}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleConfirmDelete}
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
