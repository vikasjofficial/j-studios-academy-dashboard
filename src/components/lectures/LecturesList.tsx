
import { useState } from "react";
import { Lecture } from "./types";
import { LectureCard } from "./LectureCard";
import { DeleteLectureDialog } from "./DeleteLectureDialog";
import { Progress } from "@/components/ui/progress";
import { calculateAverageProgress } from "./utils/lectureUtils";

interface LecturesListProps {
  lectures: Lecture[];
  isLoading: boolean;
  onSelectLecture: (lecture: Lecture) => void;
  onLectureDeleted?: () => void;
  viewOnly?: boolean;
  showProgress?: boolean;
  folderName?: string;
}

export function LecturesList({
  lectures,
  isLoading,
  onSelectLecture,
  onLectureDeleted,
  viewOnly = false,
  showProgress = false,
  folderName
}: LecturesListProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [lectureToDelete, setLectureToDelete] = useState<Lecture | null>(null);

  // Handle lecture delete click
  const handleDeleteClick = (lecture: Lecture, e: React.MouseEvent) => {
    e.stopPropagation();
    setLectureToDelete(lecture);
    setIsDeleteDialogOpen(true);
  };

  // Calculate average progress
  const averageProgress = calculateAverageProgress(lectures);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-32">
        <p className="text-muted-foreground">Loading lectures...</p>
      </div>
    );
  }

  if (lectures.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-32 space-y-2">
        <p className="text-muted-foreground">No lectures found</p>
        {!viewOnly && (
          <p className="text-sm">Click "New Lecture" to create one</p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {folderName && lectures.length > 0 && (
        <div className="mb-4">
          <div className="flex justify-between text-sm text-muted-foreground mb-1">
            <span>Overall Progress: {folderName}</span>
            <span>{averageProgress}%</span>
          </div>
          <Progress 
            value={averageProgress} 
            className="h-2" 
            indicatorClassName={averageProgress === 100 ? "bg-green-500" : undefined}
          />
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {lectures.map((lecture, index) => (
          <LectureCard
            key={lecture.id}
            lecture={lecture}
            index={index}
            viewOnly={viewOnly}
            onSelect={onSelectLecture}
            onDeleteClick={handleDeleteClick}
          />
        ))}
  
        {/* Delete Confirmation Dialog */}
        <DeleteLectureDialog
          isOpen={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
          lecture={lectureToDelete}
          onLectureDeleted={onLectureDeleted}
        />
      </div>
    </div>
  );
}
