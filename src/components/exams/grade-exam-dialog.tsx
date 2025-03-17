
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ExamAssignment } from "./types";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";

interface GradeExamDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  assignment: ExamAssignment | null;
}

export function GradeExamDialog({ open, onOpenChange, assignment }: GradeExamDialogProps) {
  const queryClient = useQueryClient();
  const [score, setScore] = useState<string>("");
  const [teacherNotes, setTeacherNotes] = useState<string>("");
  const [showResultsToStudent, setShowResultsToStudent] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Fetch existing grade data if available
  useEffect(() => {
    const fetchExistingGrade = async () => {
      if (!assignment) return;

      try {
        const { data, error } = await supabase
          .from("exam_results")
          .select("*")
          .eq("assignment_id", assignment.id)
          .single();

        if (error && error.code !== "PGRST116") {
          // PGRST116 is "no rows returned" error
          console.error("Error fetching grade:", error);
          return;
        }

        if (data) {
          setScore(data.total_score?.toString() || "");
          setTeacherNotes(data.teacher_notes || "");
          setShowResultsToStudent(data.view_results);
        } else {
          // Reset form if no data
          setScore("");
          setTeacherNotes("");
          setShowResultsToStudent(false);
        }
      } catch (error) {
        console.error("Error in fetching grade:", error);
      }
    };

    if (open && assignment) {
      fetchExistingGrade();
    }
  }, [open, assignment]);

  const handleSaveGrade = async () => {
    if (!assignment) return;

    setIsSaving(true);
    try {
      // Check if a result record already exists
      const { data: existingResult, error: checkError } = await supabase
        .from("exam_results")
        .select("id")
        .eq("assignment_id", assignment.id)
        .single();

      const numericScore = score.trim() ? parseFloat(score) : null;

      if (existingResult) {
        // Update existing result
        const { error: updateError } = await supabase
          .from("exam_results")
          .update({
            total_score: numericScore,
            teacher_notes: teacherNotes,
            view_results: showResultsToStudent,
          })
          .eq("id", existingResult.id);

        if (updateError) throw updateError;
      } else {
        // Create new result
        const { error: insertError } = await supabase
          .from("exam_results")
          .insert({
            assignment_id: assignment.id,
            total_score: numericScore,
            teacher_notes: teacherNotes,
            view_results: showResultsToStudent,
            completed_at: new Date().toISOString(),
          });

        if (insertError) throw insertError;

        // Update assignment status if not already completed
        if (assignment.status !== "completed") {
          const { error: statusError } = await supabase
            .from("exam_assignments")
            .update({ status: "completed" })
            .eq("id", assignment.id);

          if (statusError) throw statusError;
        }
      }

      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ["assigned-exams"] });
      queryClient.invalidateQueries({ queryKey: ["student-exam-results"] });
      queryClient.invalidateQueries({ queryKey: ["student-recent-exam-results"] });

      toast.success("Exam grade saved successfully");
      onOpenChange(false);
    } catch (error) {
      console.error("Error saving grade:", error);
      toast.error("Failed to save grade");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {assignment?.result ? "Edit Exam Grade" : "Grade Exam"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div>
            <Label htmlFor="studentName">Student</Label>
            <div id="studentName" className="font-medium pt-1">
              {assignment?.student_name || "Student"}
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="score">Score</Label>
            <Input
              id="score"
              type="number"
              min="0"
              value={score}
              onChange={(e) => setScore(e.target.value)}
              placeholder="Enter score"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="notes">Teacher Notes</Label>
            <Textarea
              id="notes"
              value={teacherNotes}
              onChange={(e) => setTeacherNotes(e.target.value)}
              placeholder="Add feedback or notes for this exam"
              rows={4}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="showResults" className="cursor-pointer">
              Show results to student
            </Label>
            <Switch
              id="showResults"
              checked={showResultsToStudent}
              onCheckedChange={setShowResultsToStudent}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSaveGrade} disabled={isSaving}>
            {isSaving ? "Saving..." : "Save Grade"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
