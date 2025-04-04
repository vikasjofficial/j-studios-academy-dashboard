
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tables } from "@/integrations/supabase/types";
import { SemestersList } from "./semesters-list";
import { CreateSemesterForm } from "./create-semester-form";
import { Book, CalendarDays, GraduationCap, ListChecks, Pencil } from "lucide-react";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { GradebookView } from "./gradebook-view";
import { EditCourseForm } from "./edit-course-form";

type Course = Tables<"courses">;

interface CourseDetailProps {
  courseId: string;
}

export function CourseDetail({ courseId }: CourseDetailProps) {
  const [activeTab, setActiveTab] = useState("semesters");
  const [isCreateSemesterOpen, setIsCreateSemesterOpen] = useState(false);
  const [isEditCourseOpen, setIsEditCourseOpen] = useState(false);

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
              <p className="text-sm text-muted-foreground mt-1">
                Course Code: {course.code} | Instructor: {course.instructor}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className={
                course.status === "active" 
                  ? "bg-green-100 text-green-800 hover:bg-green-100" 
                  : "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
              }>
                {course.status}
              </Badge>
              <Button 
                variant="outline" 
                size="sm" 
                className="flex items-center gap-1"
                onClick={() => setIsEditCourseOpen(true)}
              >
                <Pencil className="h-3.5 w-3.5" />
                Edit Course
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
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

      <div className="flex justify-between items-center">
        <Tabs defaultValue={activeTab} value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList>
            <TabsTrigger value="semesters" className="flex items-center gap-1">
              <CalendarDays className="h-4 w-4" />
              Semesters
            </TabsTrigger>
            <TabsTrigger value="gradebook" className="flex items-center gap-1">
              <ListChecks className="h-4 w-4" />
              Gradebook
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="semesters" className="mt-6">
            <SemestersList courseId={courseId} courseName={course.name} />
          </TabsContent>
          
          <TabsContent value="gradebook" className="mt-6">
            <GradebookView courseId={courseId} courseName={course.name} />
          </TabsContent>
        </Tabs>
        
        {activeTab === "semesters" && (
          <Button 
            variant="outline" 
            onClick={() => setIsCreateSemesterOpen(true)} 
            className="ml-4 flex items-center gap-2"
          >
            <GraduationCap className="h-4 w-4" />
            New Semester
          </Button>
        )}
      </div>
      
      <Dialog open={isCreateSemesterOpen} onOpenChange={setIsCreateSemesterOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5" />
              Create New Semester
            </DialogTitle>
          </DialogHeader>
          <CreateSemesterForm 
            courseId={courseId} 
            courseName={course.name} 
            onSuccess={() => {
              setIsCreateSemesterOpen(false);
              setActiveTab("semesters");
            }} 
          />
        </DialogContent>
      </Dialog>

      <Dialog open={isEditCourseOpen} onOpenChange={setIsEditCourseOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Pencil className="h-5 w-5" />
              Edit Course
            </DialogTitle>
          </DialogHeader>
          <EditCourseForm 
            course={course} 
            onSuccess={() => setIsEditCourseOpen(false)} 
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
