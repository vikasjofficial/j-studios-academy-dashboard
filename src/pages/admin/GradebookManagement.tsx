
import DashboardLayout from '@/components/dashboard-layout';
import { BookOpen } from "lucide-react";
import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { GradebookStyled } from "@/components/gradebook/gradebook-styled";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";

interface Course {
  id: string;
  name: string;
  code: string;
}

export default function GradebookManagement() {
  const queryClient = useQueryClient();
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);

  // Fetch all courses
  const { data: courses, isLoading: coursesLoading } = useQuery({
    queryKey: ["all-courses"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("courses")
        .select("id, name, code")
        .order("name");
        
      if (error) throw error;
      return data as Course[];
    },
  });

  // Set first course as selected when courses are loaded
  useEffect(() => {
    if (courses && courses.length > 0 && !selectedCourse) {
      setSelectedCourse(courses[0].id);
    }
  }, [courses, selectedCourse]);

  // Refetch courses and data when component mounts
  useEffect(() => {
    queryClient.invalidateQueries({ queryKey: ["all-courses"] });
    queryClient.invalidateQueries({ queryKey: ["semesters"] });
    queryClient.invalidateQueries({ queryKey: ["topics"] });
  }, [queryClient]);

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-full overflow-x-auto animate-in-subtle px-4 md:px-3">
        <div className="w-full">
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <BookOpen className="h-7 w-7 text-primary" />
            Gradebook Management
          </h1>
          <p className="text-muted-foreground mt-1">
            View and manage student grades for all courses. As an admin, you can edit and save grades directly.
          </p>
        </div>
        
        {courses && courses.length > 0 ? (
          <Card className="bg-card/50 backdrop-blur-sm border border-white/10 w-full mx-auto glass-morphism">
            <CardContent className="pt-6 w-full mx-auto px-3">
              <div className="flex items-center gap-3 mb-6">
                <label htmlFor="course-select" className="text-sm font-medium">
                  Select Course:
                </label>
                <Select
                  value={selectedCourse || ""}
                  onValueChange={(value) => setSelectedCourse(value)}
                >
                  <SelectTrigger className="w-[300px] bg-background/50 border-white/10">
                    <SelectValue placeholder="Select a course" />
                  </SelectTrigger>
                  <SelectContent>
                    {courses.map((course) => (
                      <SelectItem key={course.id} value={course.id}>
                        {course.name} ({course.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {selectedCourse && (
                <div className="w-full flex justify-center">
                  <GradebookStyled selectedCourseId={selectedCourse} />
                </div>
              )}
            </CardContent>
          </Card>
        ) : coursesLoading ? (
          <div className="flex justify-center py-12">
            <p className="text-muted-foreground">Loading courses...</p>
          </div>
        ) : (
          <div className="flex justify-center py-12">
            <p className="text-muted-foreground">No courses available.</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
