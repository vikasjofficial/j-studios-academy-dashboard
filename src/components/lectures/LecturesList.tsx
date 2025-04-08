
import { useState } from "react";
import { Lecture } from "./types";
import { LectureCard } from "./LectureCard";
import { DeleteLectureDialog } from "./DeleteLectureDialog";

interface LecturesListProps {
  lectures: Lecture[];
  isLoading: boolean;
  onSelectLecture: (lecture: Lecture) => void;
  onLectureDeleted?: () => void;
  viewOnly?: boolean;
  showProgress?: boolean;
}

export function LecturesList({
  lectures,
  isLoading,
  onSelectLecture,
  onLectureDeleted,
  viewOnly = false,
  showProgress = false
}: LecturesListProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [lectureToDelete, setLectureToDelete] = useState<Lecture | null>(null);

  // Handle lecture delete click
  const handleDeleteClick = (lecture: Lecture, e: React.MouseEvent) => {
    e.stopPropagation();
    setLectureToDelete(lecture);
    setIsDeleteDialogOpen(true);
  };

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
  );
}
