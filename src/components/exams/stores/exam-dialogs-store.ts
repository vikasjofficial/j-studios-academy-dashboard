
import { create } from "zustand";
import { Exam } from "../types";

interface ExamDialogsState {
  deleteDialogOpen: boolean;
  examToDelete: Exam | null;
  folderAssignDialogOpen: boolean;
  examToAssignFolder: Exam | null;
  selectedFolderId: string | null;
  
  setDeleteDialogOpen: (open: boolean) => void;
  setExamToDelete: (exam: Exam | null) => void;
  setFolderAssignDialogOpen: (open: boolean) => void;
  setExamToAssignFolder: (exam: Exam | null) => void;
  setSelectedFolderId: (id: string | null) => void;
}

export const useExamDialogsStore = create<ExamDialogsState>((set) => ({
  deleteDialogOpen: false,
  examToDelete: null,
  folderAssignDialogOpen: false,
  examToAssignFolder: null,
  selectedFolderId: null,
  
  setDeleteDialogOpen: (open) => set({ deleteDialogOpen: open }),
  setExamToDelete: (exam) => set({ examToDelete: exam }),
  setFolderAssignDialogOpen: (open) => set({ folderAssignDialogOpen: open }),
  setExamToAssignFolder: (exam) => set({ 
    examToAssignFolder: exam, 
    selectedFolderId: exam?.folder_id || "none" 
  }),
  setSelectedFolderId: (id) => set({ selectedFolderId: id }),
}));
