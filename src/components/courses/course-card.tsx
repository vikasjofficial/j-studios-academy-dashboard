
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Book, Eye, Pencil, Trash2, Copy } from "lucide-react";
import { Tables } from "@/integrations/supabase/types";

type Course = Tables<"courses">;

interface CourseCardProps {
  course: Course;
  onSelect: (courseId: string) => void;
  onEdit: (course: Course) => void;
  onDelete: (course: Course, e: React.MouseEvent) => void;
  onDuplicate: (course: Course, e: React.MouseEvent) => void;
}

export function CourseCard({ course, onSelect, onEdit, onDelete, onDuplicate }: CourseCardProps) {
  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <CardTitle className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Book className="h-5 w-5 text-primary" />
            <span className="truncate">{course.name}</span>
          </div>
        </CardTitle>
        <CardDescription>Code: {course.code}</CardDescription>
      </CardHeader>
      <CardContent className="pb-2">
        <p className="line-clamp-2 text-sm text-muted-foreground">
          {course.description || "No description provided"}
        </p>
        <p className="mt-2 text-sm">Instructor: {course.instructor}</p>
      </CardContent>
      <CardFooter className="flex gap-2">
        <Button 
          variant="outline" 
          className="flex-1 flex items-center justify-center gap-2"
          onClick={() => onSelect(course.id)}
        >
          <Eye className="h-4 w-4" />
          View
        </Button>
        <Button 
          variant="secondary" 
          className="flex items-center justify-center gap-2"
          onClick={() => onEdit(course)}
        >
          <Pencil className="h-4 w-4" />
          Edit
        </Button>
        <Button 
          variant="outline"
          size="icon"
          onClick={(e) => onDuplicate(course, e)}
          title="Duplicate course"
        >
          <Copy className="h-4 w-4" />
        </Button>
        <Button 
          variant="destructive" 
          size="icon"
          onClick={(e) => onDelete(course, e)}
          title="Delete course"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
}
