import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CoursesList } from "@/components/courses/courses-list";
import { CreateCourseForm } from "@/components/courses/create-course-form";
import { CourseDetail } from "@/components/courses/course-detail";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Book, Plus } from "lucide-react";

export default function CoursesManagement() {
  const [activeTab, setActiveTab] = useState("list");
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  
  const { data: courses, isLoading } = useQuery({
    queryKey: ["courses"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("courses")
        .select("*")
        .order("name");
        
      if (error) throw error;
      return data;
    },
  });

  const handleCourseSelect = (courseId: string) => {
    setSelectedCourseId(courseId);
    setActiveTab("details");
  };

  const handleBackToList = () => {
    setSelectedCourseId(null);
    setActiveTab("list");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Courses Management</h1>
        <p className="text-muted-foreground">
          Create, view and manage course information
        </p>
      </div>

      {selectedCourseId ? (
        <div className="space-y-6">
          <Button 
            variant="outline" 
            className="flex items-center gap-2" 
            onClick={handleBackToList}
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Courses
          </Button>
          <CourseDetail courseId={selectedCourseId} />
        </div>
      ) : (
        <Tabs defaultValue="list" value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="list" className="flex items-center gap-1">
              <Book className="h-4 w-4" />
              View Courses
            </TabsTrigger>
            <TabsTrigger value="create" className="flex items-center gap-1">
              <Plus className="h-4 w-4" />
              Create Course
            </TabsTrigger>
          </TabsList>
          <TabsContent value="list" className="mt-6">
            <CoursesList 
              courses={courses || []} 
              isLoading={isLoading} 
              onSelectCourse={handleCourseSelect}
            />
          </TabsContent>
          <TabsContent value="create" className="mt-6">
            <CreateCourseForm onSuccess={() => setActiveTab("list")} />
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
