
import { Progress } from "@/components/ui/progress";
import { Lecture } from "./types";
import { calculateProgress } from "./utils/lectureUtils";

interface LectureProgressProps {
  lecture: Lecture | Partial<Lecture>;
}

export function LectureProgress({ lecture }: LectureProgressProps) {
  const progressValue = calculateProgress(lecture);
  
  if (!lecture.classes_topics || lecture.classes_topics.length === 0) {
    return null;
  }
  
  return (
    <div className="mb-2">
      <div className="flex justify-between text-xs text-muted-foreground mb-1">
        <span>Progress</span>
        <span>{progressValue}%</span>
      </div>
      <Progress 
        value={progressValue} 
        className="h-2" 
        indicatorClassName={progressValue === 100 ? "bg-green-500" : undefined}
      />
    </div>
  );
}
