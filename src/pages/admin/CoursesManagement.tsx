
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CoursesList } from "@/components/courses/courses-list";
import { CreateCourseForm } from "@/components/courses/create-course-form";

export default function CoursesManagement() {
  const [activeTab, setActiveTab] = useState("list");
  
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Courses Management</h1>
        <p className="text-muted-foreground">
          Create, view and manage course information
        </p>
      </div>

      <Tabs defaultValue="list" value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="list">View Courses</TabsTrigger>
          <TabsTrigger value="create">Create Course</TabsTrigger>
        </TabsList>
        <TabsContent value="list" className="mt-6">
          <CoursesList courses={courses || []} isLoading={isLoading} />
        </TabsContent>
        <TabsContent value="create" className="mt-6">
          <CreateCourseForm onSuccess={() => setActiveTab("list")} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
