
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/auth-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, GraduationCap, ListChecks } from "lucide-react";
import { StudentGradebookView } from "@/components/gradebook/student-gradebook-view";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

interface Course {
  id: string;
  name: string;
  code: string;
  description: string;
  instructor: string;
  start_date: string;
  end_date: string;
  status: string;
}

export default function StudentCourses() {
  const { user } = useAuth();
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  
  // Fetch the student's enrolled courses
  const { data: courses, isLoading } = useQuery({
    queryKey: ["student-enrolled-courses", user?.id],
    queryFn: async () => {
      if (!user?.studentId) return [];
      
      const { data, error } = await supabase
        .from("enrollments")
        .select(`
          course_id,
          courses:course_id(*)
        `)
        .eq("student_id", user.id)
        .eq("status", "active");
        
      if (error) throw error;
      
      return data.map(item => item.courses) as Course[];
    },
    enabled: !!user?.id,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Courses</h1>
        <p className="text-muted-foreground">View your enrolled courses and grades</p>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin h-8 w-8 border-2 border-current border-t-transparent rounded-full"></div>
        </div>
      ) : courses && courses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {courses.map((course) => (
            <Card key={course.id} className="overflow-hidden">
              <CardHeader className="bg-muted/30">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-5 w-5 text-primary" />
                      <CardTitle className="text-xl">{course.name}</CardTitle>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">Code: {course.code}</p>
                  </div>
                  <Badge variant="outline" className={
                    course.status === "active" 
                      ? "bg-green-100 text-green-800 hover:bg-green-100" 
                      : "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
                  }>
                    {course.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <Tabs defaultValue="details" className="w-full">
                  <TabsList className="w-full rounded-none">
                    <TabsTrigger value="details" className="flex-1">Details</TabsTrigger>
                    <TabsTrigger value="grades" className="flex-1">Grades</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="details" className="p-4 space-y-4">
                    <div>
                      <h3 className="font-medium">Instructor</h3>
                      <p>{course.instructor}</p>
                    </div>
                    <div>
                      <h3 className="font-medium">Duration</h3>
                      <p>{format(new Date(course.start_date), "MMMM d, yyyy")} - {format(new Date(course.end_date), "MMMM d, yyyy")}</p>
                    </div>
                    {course.description && (
                      <div>
                        <h3 className="font-medium">Description</h3>
                        <p className="text-sm">{course.description}</p>
                      </div>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="grades" className="p-4">
                    <StudentGradebookView courseId={course.id} />
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <GraduationCap className="h-12 w-12 mb-4 text-muted-foreground/50" />
            <h3 className="text-xl font-medium mb-2">No Courses Enrolled</h3>
            <p className="text-muted-foreground">You are not currently enrolled in any courses.</p>
          </CardContent>
        </Card>
      )}
      
      <div className="mt-8">
        <h2 className="text-2xl font-bold tracking-tight mb-4">My Overall Performance</h2>
        <StudentGradebookView />
      </div>
    </div>
  );
}
