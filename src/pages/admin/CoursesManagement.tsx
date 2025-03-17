
import DashboardLayout from '@/components/dashboard-layout';
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Book, Eye, Pencil, Trash2, Copy } from "lucide-react";
import { CreateCourseForm } from "@/components/courses/create-course-form";
import { CourseDetail } from "@/components/courses/course-detail";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { EditCourseForm } from "@/components/courses/edit-course-form";
import { useToast } from "@/hooks/use-toast";

export default function CoursesManagement() {
  const [activeTab, setActiveTab] = useState("courses");
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [courseToEdit, setCourseToEdit] = useState<any>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState<any>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
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

  // Delete course mutation
  const deleteCourse = useMutation({
    mutationFn: async (courseId: string) => {
      const { error } = await supabase
        .from("courses")
        .delete()
        .eq("id", courseId);

      if (error) throw error;
      return courseId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courses"] });
      toast({
        title: "Course deleted",
        description: "The course has been successfully deleted",
      });
      setIsDeleteDialogOpen(false);
      setCourseToDelete(null);
    },
    onError: (error) => {
      console.error("Error deleting course:", error);
      toast({
        title: "Error",
        description: "There was an error deleting the course. It may have related records.",
        variant: "destructive",
      });
    },
  });

  // Duplicate course mutation
  const duplicateCourse = useMutation({
    mutationFn: async (course: any) => {
      // Create a new course with the same details but a modified name
      const newCourseName = `${course.name} (Copy)`;
      const newCourseCode = `${course.code}-COPY`;
      
      const { data, error } = await supabase
        .from("courses")
        .insert({
          name: newCourseName,
          code: newCourseCode,
          description: course.description,
          instructor: course.instructor,
          start_date: course.start_date,
          end_date: course.end_date,
          status: course.status
        })
        .select();
        
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courses"] });
      toast({
        title: "Course duplicated",
        description: "The course has been successfully duplicated",
      });
    },
    onError: (error) => {
      console.error("Error duplicating course:", error);
      toast({
        title: "Error",
        description: "There was an error duplicating the course",
        variant: "destructive",
      });
    },
  });

  const handleCourseSelect = (courseId: string) => {
    setSelectedCourseId(courseId);
  };

  const handleEditCourse = (course: any) => {
    setCourseToEdit(course);
    setIsEditDialogOpen(true);
  };

  const handleDeleteCourse = (course: any, e: React.MouseEvent) => {
    e.stopPropagation();
    setCourseToDelete(course);
    setIsDeleteDialogOpen(true);
  };

  const handleDuplicateCourse = (course: any, e: React.MouseEvent) => {
    e.stopPropagation();
    duplicateCourse.mutate(course);
  };

  const confirmDelete = () => {
    if (courseToDelete) {
      deleteCourse.mutate(courseToDelete.id);
    }
  };

  return (
    <DashboardLayout>
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
                        <Button 
                          variant="outline"
                          size="icon"
                          onClick={(e) => handleDuplicateCourse(course, e)}
                          title="Duplicate course"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="destructive" 
                          size="icon"
                          onClick={(e) => handleDeleteCourse(course, e)}
                          title="Delete course"
                        >
                          <Trash2 className="h-4 w-4" />
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

        {/* Edit Course Dialog */}
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

        {/* Delete Course Confirmation Dialog */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-destructive">
                <Trash2 className="h-5 w-5" />
                Delete Course
              </DialogTitle>
              <DialogDescription>
                Are you sure you want to delete "{courseToDelete?.name}"? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex gap-2 sm:justify-end">
              <Button
                variant="outline"
                onClick={() => setIsDeleteDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={confirmDelete}
                disabled={deleteCourse.isPending}
              >
                {deleteCourse.isPending ? "Deleting..." : "Delete Course"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
