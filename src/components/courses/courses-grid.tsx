
import { CourseCard } from "./course-card";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { Tables } from "@/integrations/supabase/types";
import { Book, Search, SlidersHorizontal } from "lucide-react";

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
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Filter courses based on search query and status filter
  const filteredCourses = courses?.filter(course => {
    const matchesSearch = 
      course.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      course.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.instructor.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || course.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

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
    <div className="space-y-6">
      <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search courses by name, code or instructor..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="w-full md:w-48">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="h-4 w-4" />
                <SelectValue placeholder="Filter by status" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {filteredCourses && filteredCourses.length > 0 ? (
        <>
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Showing {filteredCourses.length} of {courses.length} courses
            </p>
            {filteredCourses.length !== courses.length && (
              <Button variant="outline" size="sm" onClick={() => {
                setSearchQuery("");
                setStatusFilter("all");
              }}>
                Clear Filters
              </Button>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course) => (
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
        </>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-8">
            <Book className="h-12 w-12 text-muted-foreground mb-2" />
            <p className="text-muted-foreground mb-4">No courses match your filters</p>
            <Button variant="outline" onClick={() => {
              setSearchQuery("");
              setStatusFilter("all");
            }}>
              Clear Filters
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
