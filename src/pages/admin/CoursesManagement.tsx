
import DashboardLayout from '@/components/dashboard-layout';
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Book, Plus } from "lucide-react";
import { CreateCourseForm } from "@/components/courses/create-course-form";
import { CourseDetail } from "@/components/courses/course-detail";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { EditCourseForm } from "@/components/courses/edit-course-form";
import { CoursesGrid } from "@/components/courses/courses-grid";
import { DeleteCourseDialog } from "@/components/courses/delete-course-dialog";
import { useCourseMutations } from "@/hooks/use-course-mutations";
import { Tables } from "@/integrations/supabase/types";

type Course = Tables<"courses">;

export default function CoursesManagement() {
  const [activeTab, setActiveTab] = useState("courses");
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [courseToEdit, setCourseToEdit] = useState<Course | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState<Course | null>(null);
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);
  const [coursesToBulkDelete, setCoursesToBulkDelete] = useState<string[]>([]);
  
  const { 
    deleteCourse, 
    duplicateCourse, 
    bulkDeleteCourses, 
    updateCoursesStatus 
  } = useCourseMutations();
  
  const { data: courses, isLoading } = useQuery({
    queryKey: ["courses"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("courses")
        .select("*")
        .order("name");
        
      if (error) throw error;
      return data as Course[];
    },
  });

  const handleCourseSelect = (courseId: string) => {
    setSelectedCourseId(courseId);
  };

  const handleEditCourse = (course: Course) => {
    setCourseToEdit(course);
    setIsEditDialogOpen(true);
  };

  const handleDeleteCourse = (course: Course, e: React.MouseEvent) => {
    e.stopPropagation();
    setCourseToDelete(course);
    setIsDeleteDialogOpen(true);
  };

  const handleDuplicateCourse = (course: Course, e: React.MouseEvent) => {
    e.stopPropagation();
    duplicateCourse.mutate(course);
  };

  const confirmDelete = () => {
    if (courseToDelete) {
      deleteCourse.mutate(courseToDelete.id);
      setIsDeleteDialogOpen(false);
      setCourseToDelete(null);
    }
  };

  const handleBulkDelete = (courseIds: string[]) => {
    setCoursesToBulkDelete(courseIds);
    setBulkDeleteDialogOpen(true);
  };

  const confirmBulkDelete = () => {
    if (coursesToBulkDelete.length > 0) {
      bulkDeleteCourses.mutate(coursesToBulkDelete);
      setBulkDeleteDialogOpen(false);
      setCoursesToBulkDelete([]);
    }
  };

  const handleBulkUpdateStatus = (courseIds: string[], status: string) => {
    updateCoursesStatus.mutate({ courseIds, status });
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
              <CoursesGrid
                courses={courses}
                isLoading={isLoading}
                onSelectCourse={handleCourseSelect}
                onEditCourse={handleEditCourse}
                onDeleteCourse={handleDeleteCourse}
                onDuplicateCourse={handleDuplicateCourse}
                onCreateCourse={() => setActiveTab("create")}
                onBulkDelete={handleBulkDelete}
                onBulkUpdateStatus={handleBulkUpdateStatus}
              />
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
                <Book className="h-5 w-5" />
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
        <DeleteCourseDialog
          course={courseToDelete}
          isOpen={isDeleteDialogOpen}
          isDeleting={deleteCourse.isPending}
          onClose={() => setIsDeleteDialogOpen(false)}
          onConfirm={confirmDelete}
        />

        {/* Bulk Delete Confirmation Dialog */}
        <Dialog open={bulkDeleteDialogOpen} onOpenChange={setBulkDeleteDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-destructive">
                <Book className="h-5 w-5" />
                Delete Multiple Courses
              </DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <p>Are you sure you want to delete {coursesToBulkDelete.length} selected courses? This action cannot be undone.</p>
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setBulkDeleteDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={confirmBulkDelete}
                disabled={bulkDeleteCourses.isPending}
              >
                {bulkDeleteCourses.isPending ? "Deleting..." : "Delete Courses"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
