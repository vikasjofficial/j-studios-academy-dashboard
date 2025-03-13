
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tables } from "@/integrations/supabase/types";
import { SemestersList } from "./semesters-list";
import { CreateSemesterForm } from "./create-semester-form";
import { Book, CalendarDays, GraduationCap, Info } from "lucide-react";
import { CalendarView } from "./calendar-view";

type Course = Tables<"courses">;

interface CourseDetailProps {
  courseId: string;
}

export function CourseDetail({ courseId }: CourseDetailProps) {
  const [activeTab, setActiveTab] = useState("overview");

  const { data: course, isLoading } = useQuery({
    queryKey: ["course", courseId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("courses")
        .select("*")
        .eq("id", courseId)
        .single();
        
      if (error) throw error;
      return data as Course;
    },
  });

  if (isLoading) {
    return (
      <div className="h-24 flex items-center justify-center">
        <p className="text-sm text-muted-foreground">Loading course details...</p>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="h-24 flex items-center justify-center">
        <p className="text-sm text-muted-foreground">Course not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-2">
                <Book className="h-5 w-5 text-primary" />
                <CardTitle>{course.name}</CardTitle>
              </div>
              <CardDescription className="mt-1">
                Course Code: {course.code} | Instructor: {course.instructor}
              </CardDescription>
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
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Duration</p>
              <p className="flex items-center gap-1">
                <CalendarDays className="h-4 w-4 text-muted-foreground" />
                {format(new Date(course.start_date), "MMMM d, yyyy")} - {format(new Date(course.end_date), "MMMM d, yyyy")}
              </p>
            </div>
            {course.description && (
              <div>
                <p className="text-sm text-muted-foreground mb-1">Description</p>
                <p>{course.description}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview" className="flex items-center gap-1">
            <Info className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="semesters" className="flex items-center gap-1">
            <CalendarDays className="h-4 w-4" />
            Semesters
          </TabsTrigger>
          <TabsTrigger value="calendar" className="flex items-center gap-1">
            <CalendarDays className="h-4 w-4" />
            Calendar
          </TabsTrigger>
          <TabsTrigger value="create-semester" className="flex items-center gap-1">
            <GraduationCap className="h-4 w-4" />
            Create Semester
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Course Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Course details and statistics will be displayed here.</p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="semesters" className="mt-6">
          <SemestersList courseId={courseId} courseName={course.name} />
        </TabsContent>
        
        <TabsContent value="calendar" className="mt-6">
          <CalendarView courseId={courseId} />
        </TabsContent>
        
        <TabsContent value="create-semester" className="mt-6">
          <CreateSemesterForm 
            courseId={courseId} 
            courseName={course.name} 
            onSuccess={() => setActiveTab("semesters")} 
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
