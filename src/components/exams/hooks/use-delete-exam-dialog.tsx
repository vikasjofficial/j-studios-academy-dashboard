
import { useState } from "react";
import { Exam } from "../types";
import { useExamDialogsStore } from "../stores/exam-dialogs-store";

export function useDeleteExamDialog() {
  const { setExamToDelete, setDeleteDialogOpen } = useExamDialogsStore();

  const openDeleteDialog = (exam: Exam) => {
    setExamToDelete(exam);
    setDeleteDialogOpen(true);
  };

  return { openDeleteDialog };
}
