
import React from 'react';
import { Badge } from "@/components/ui/badge";

interface EnrolledCoursesProps {
  courses: any[] | null;
}

export function EnrolledCourses({ courses }: EnrolledCoursesProps) {
  if (!courses || courses.length === 0) {
    return null;
  }

  return (
    <div className="mt-2">
      <div className="text-sm font-medium mb-1">Enrolled Courses:</div>
      <div className="flex flex-wrap gap-1.5">
        {courses.map((course: any) => (
          <Badge key={course.id} variant="secondary" className="text-xs">
            {course.name}
          </Badge>
        ))}
      </div>
    </div>
  );
}
