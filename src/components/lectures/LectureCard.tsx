
import { FileText, Pencil, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Lecture } from "./types";
import { LectureProgress } from "./LectureProgress";

interface LectureCardProps {
  lecture: Lecture;
  index: number;
  viewOnly?: boolean;
  onSelect: (lecture: Lecture) => void;
  onDeleteClick: (lecture: Lecture, e: React.MouseEvent) => void;
}

export function LectureCard({ 
  lecture, 
  index, 
  viewOnly = false,
  onSelect,
  onDeleteClick
}: LectureCardProps) {
  return (
    <motion.div
      key={lecture.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      className="w-full"
    >
      <Card 
        className="h-full cursor-pointer hover:shadow-md transition-shadow"
        onClick={() => onSelect(lecture)}
      >
        <CardContent className="p-4">
          {/* Progress bar */}
          {lecture.classes_topics && lecture.classes_topics.length > 0 && (
            <LectureProgress lecture={lecture} />
          )}
          
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center space-x-3">
              <FileText className="h-5 w-5 text-primary" />
              <div>
                <h3 className="font-medium">{lecture.title}</h3>
                {lecture.classes_folders && (
                  <p className="text-sm text-muted-foreground">
                    Folder: {lecture.classes_folders.name}
                  </p>
                )}
              </div>
            </div>
            
            {!viewOnly && (
              <div className="flex space-x-1">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 w-8 p-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelect(lecture);
                  }}
                >
                  <Pencil className="h-4 w-4" />
                  <span className="sr-only">Edit</span>
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 w-8 p-0 text-destructive"
                  onClick={(e) => onDeleteClick(lecture, e)}
                >
                  <Trash2 className="h-4 w-4" />
                  <span className="sr-only">Delete</span>
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
