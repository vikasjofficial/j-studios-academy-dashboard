
import { useState } from "react";
import { Exam } from "../types";
import { useExamDialogsStore } from "../stores/exam-dialogs-store";

export function useFolderAssignDialog() {
  const { setExamToAssignFolder, setFolderAssignDialogOpen } = useExamDialogsStore();

  const openFolderAssignDialog = (exam: Exam) => {
    setExamToAssignFolder(exam);
    setFolderAssignDialogOpen(true);
  };

  return { openFolderAssignDialog };
}
