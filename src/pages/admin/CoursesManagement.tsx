
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Book, Eye, Pencil } from "lucide-react";
import { CreateCourseForm } from "@/components/courses/create-course-form";
import { CourseDetail } from "@/components/courses/course-detail";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { EditCourseForm } from "@/components/courses/edit-course-form";

export default function CoursesManagement() {
  const [activeTab, setActiveTab] = useState("courses");
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [courseToEdit, setCourseToEdit] = useState<any>(null);
  
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
  };

  const handleEditCourse = (course: any) => {
    setCourseToEdit(course);
    setIsEditDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Course Management</h1>
        <p className="text-muted-foreground">Create and manage courses, semesters, and topics</p>
      </div>

      {!selectedCourseId ? (
        <Tabs defaultValue="courses" value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="courses">View Courses</TabsTrigger>
            <TabsTrigger value="create">Create Course</TabsTrigger>
          </TabsList>
          
          <TabsContent value="courses" className="mt-6">
            {isLoading ? (
              <div className="flex justify-center items-center h-40">
                <p className="text-muted-foreground">Loading courses...</p>
              </div>
            ) : courses && courses.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {courses.map((course) => (
                  <Card key={course.id} className="overflow-hidden hover:shadow-md transition-shadow">
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
                        onClick={() => handleCourseSelect(course.id)}
                      >
                        <Eye className="h-4 w-4" />
                        View
                      </Button>
                      <Button 
                        variant="secondary" 
                        className="flex items-center justify-center gap-2"
                        onClick={() => handleEditCourse(course)}
                      >
                        <Pencil className="h-4 w-4" />
                        Edit
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-8">
                  <p className="text-muted-foreground mb-4">No courses found</p>
                  <Button onClick={() => setActiveTab("create")}>
                    Create Your First Course
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>
          
          <TabsContent value="create" className="mt-6">
            <CreateCourseForm onSuccess={() => setActiveTab("courses")} />
          </TabsContent>
        </Tabs>
      ) : (
        <div className="space-y-6">
          <Button 
            variant="outline" 
            onClick={() => setSelectedCourseId(null)}
          >
            Back to Courses
          </Button>
          <CourseDetail courseId={selectedCourseId} />
        </div>
      )}

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Pencil className="h-5 w-5" />
              Edit Course
            </DialogTitle>
          </DialogHeader>
          {courseToEdit && (
            <EditCourseForm 
              course={courseToEdit} 
              onSuccess={() => {
                setIsEditDialogOpen(false);
                setCourseToEdit(null);
              }} 
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
