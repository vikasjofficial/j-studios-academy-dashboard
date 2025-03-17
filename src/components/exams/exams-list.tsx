
import { useState } from "react";
import { Exam, ExamType, ExamFolder } from "./types";
import { FolderItem } from "./folders/folder-item";
import { ExamCard } from "./folders/exam-card";
import { DeleteExamDialog } from "./dialogs/delete-exam-dialog";
import { FolderAssignDialog } from "./dialogs/folder-assign-dialog";
import { useExamDialogsStore } from "./stores/exam-dialogs-store";

interface ExamsListProps {
  exams: (Exam & { exam_folders?: { id: string; name: string } | null })[];
  examType: ExamType;
  folders: ExamFolder[];
}

export function ExamsList({ exams, examType, folders }: ExamsListProps) {
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({});

  // Group exams by folder
  const ungroupedExams = exams.filter(exam => !exam.folder_id);
  const groupedExams: Record<string, Exam[]> = {};
  
  exams.forEach(exam => {
    if (exam.folder_id) {
      if (!groupedExams[exam.folder_id]) {
        groupedExams[exam.folder_id] = [];
      }
      groupedExams[exam.folder_id].push(exam);
    }
  });

  const toggleFolder = (folderId: string) => {
    setExpandedFolders(prev => ({
      ...prev,
      [folderId]: !prev[folderId]
    }));
  };

  if (exams.length === 0 && folders.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No {examType} exams found.</p>
        <p className="text-sm text-muted-foreground mt-2">
          Create a new {examType} exam or folder to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Folders */}
      {folders.map(folder => (
        <FolderItem 
          key={folder.id}
          folder={folder}
          exams={groupedExams[folder.id] || []}
          isExpanded={!!expandedFolders[folder.id]}
          onToggleFolder={toggleFolder}
        />
      ))}

      {/* Ungrouped Exams */}
      {ungroupedExams.length > 0 && (
        <div className="mt-4">
          <h3 className="text-lg font-medium mb-3">Uncategorized Exams</h3>
          {ungroupedExams.map(exam => (
            <ExamCard key={exam.id} exam={exam} />
          ))}
        </div>
      )}

      {/* Dialogs */}
      <DeleteExamDialog />
      <FolderAssignDialog folders={folders} />
    </div>
  );
}
