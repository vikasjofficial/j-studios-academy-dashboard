
import { Button } from "@/components/ui/button";

interface Course {
  id: string;
  name: string;
}

interface CourseSelectorProps {
  courses: Course[];
  selectedCourse: string | null;
  onSelectCourse: (courseId: string) => void;
}

export function CourseSelector({ courses, selectedCourse, onSelectCourse }: CourseSelectorProps) {
  return (
    <div className="flex flex-wrap gap-2 mb-4">
      {courses.map(course => (
        <Button
          key={course.id}
          variant={selectedCourse === course.id ? "default" : "outline"}
          onClick={() => onSelectCourse(course.id)}
          size="sm"
        >
          {course.name}
        </Button>
      ))}
    </div>
  );
}
