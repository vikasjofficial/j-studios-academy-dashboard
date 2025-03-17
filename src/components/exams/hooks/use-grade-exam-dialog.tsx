
import { useState } from "react";
import { ExamAssignment } from "../types";

export function useGradeExamDialog() {
  const [isGradeDialogOpen, setIsGradeDialogOpen] = useState(false);
  const [assignmentToGrade, setAssignmentToGrade] = useState<ExamAssignment | null>(null);

  const openGradeDialog = (assignment: ExamAssignment) => {
    setAssignmentToGrade(assignment);
    setIsGradeDialogOpen(true);
  };

  const closeGradeDialog = () => {
    setIsGradeDialogOpen(false);
    setAssignmentToGrade(null);
  };

  return { 
    isGradeDialogOpen, 
    setIsGradeDialogOpen, 
    assignmentToGrade,
    openGradeDialog,
    closeGradeDialog
  };
}
