
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { ExamAssignment } from "./types";
import { useQueryClient } from "@tanstack/react-query";

interface GradeExamDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  assignment: ExamAssignment | null;
}

export function GradeExamDialog({ open, onOpenChange, assignment }: GradeExamDialogProps) {
  const queryClient = useQueryClient();
  const [score, setScore] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [viewResults, setViewResults] = useState(false);
  const [loading, setLoading] = useState(false);
  const [existingResult, setExistingResult] = useState<any>(null);

  useEffect(() => {
    // Reset form when dialog opens with new assignment
    if (open && assignment) {
      setScore("");
      setNotes("");
      setViewResults(false);
      fetchExistingResult();
    }
  }, [open, assignment]);

  const fetchExistingResult = async () => {
    if (!assignment) return;
    
    try {
      const { data, error } = await supabase
        .from("exam_results")
        .select("*")
        .eq("assignment_id", assignment.id)
        .single();
        
      if (error) {
        if (error.code !== "PGRST116") { // No rows returned
          console.error("Error fetching exam result:", error);
        }
        return;
      }
      
      if (data) {
        setExistingResult(data);
        setScore(data.total_score ? data.total_score.toString() : "");
        setNotes(data.teacher_notes || "");
        setViewResults(data.view_results);
      }
    } catch (error) {
      console.error("Error fetching exam result:", error);
    }
  };

  const handleSubmit = async () => {
    if (!assignment) return;
    
    setLoading(true);
    
    try {
      const scoreNum = parseFloat(score);
      
      if (isNaN(scoreNum)) {
        toast.error("Please enter a valid score");
        setLoading(false);
        return;
      }
      
      const resultData = {
        assignment_id: assignment.id,
        total_score: scoreNum,
        teacher_notes: notes || null,
        view_results: viewResults
      };
      
      let response;
      
      if (existingResult) {
        // Update existing result
        response = await supabase
          .from("exam_results")
          .update(resultData)
          .eq("id", existingResult.id);
      } else {
        // Create new result
        response = await supabase
          .from("exam_results")
          .insert(resultData);
      }
      
      if (response.error) throw response.error;
      
      // Set assignment status to completed if not already
      if (assignment.status !== "completed") {
        const { error: assignmentError } = await supabase
          .from("exam_assignments")
          .update({ status: "completed" })
          .eq("id", assignment.id);
          
        if (assignmentError) throw assignmentError;
      }
      
      // Invalidate queries to refresh the data
      queryClient.invalidateQueries({ queryKey: ["assigned-exams"] });
      queryClient.invalidateQueries({ queryKey: ["student-exam-results"] });
      
      toast.success("Exam graded successfully");
      onOpenChange(false);
    } catch (error) {
      console.error("Error grading exam:", error);
      toast.error("Failed to grade exam");
    } finally {
      setLoading(false);
    }
  };

  if (!assignment) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Grade Exam</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <div className="font-medium">{assignment.exam?.name}</div>
            <div className="text-sm text-muted-foreground">Student: {assignment.student_name}</div>
          </div>
          
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="score">Score</Label>
              <Input
                id="score"
                type="number"
                min="0"
                step="0.1"
                value={score}
                onChange={(e) => setScore(e.target.value)}
                placeholder="Enter score"
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="notes">Teacher Notes</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add notes about the exam performance"
                rows={4}
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="viewResults" 
                checked={viewResults}
                onCheckedChange={(checked) => setViewResults(checked as boolean)}
              />
              <Label htmlFor="viewResults" className="cursor-pointer">
                Make results visible to student
              </Label>
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? "Saving..." : existingResult ? "Update Grade" : "Save Grade"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
