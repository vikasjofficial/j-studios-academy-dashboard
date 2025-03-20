
import { CourseCard } from "./course-card";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tables } from "@/integrations/supabase/types";

type Course = Tables<"courses">;

interface CoursesGridProps {
  courses: Course[] | null;
  isLoading: boolean;
  onSelectCourse: (courseId: string) => void;
  onEditCourse: (course: Course) => void;
  onDeleteCourse: (course: Course, e: React.MouseEvent) => void;
  onDuplicateCourse: (course: Course, e: React.MouseEvent) => void;
  onCreateCourse: () => void;
}

export function CoursesGrid({ 
  courses, 
  isLoading, 
  onSelectCourse, 
  onEditCourse, 
  onDeleteCourse, 
  onDuplicateCourse,
  onCreateCourse 
}: CoursesGridProps) {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-40">
        <p className="text-muted-foreground">Loading courses...</p>
      </div>
    );
  }

  if (!courses || courses.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-8">
          <p className="text-muted-foreground mb-4">No courses found</p>
          <Button onClick={onCreateCourse}>
            Create Your First Course
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {courses.map((course) => (
        <CourseCard
          key={course.id}
          course={course}
          onSelect={onSelectCourse}
          onEdit={onEditCourse}
          onDelete={onDeleteCourse}
          onDuplicate={onDuplicateCourse}
        />
      ))}
    </div>
  );
}
