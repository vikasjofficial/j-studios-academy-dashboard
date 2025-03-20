
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Tables } from "@/integrations/supabase/types";

type Course = Tables<"courses">;

export function useCourseMutations() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

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

  const duplicateCourse = useMutation({
    mutationFn: async (course: Course) => {
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

  const bulkDeleteCourses = useMutation({
    mutationFn: async (courseIds: string[]) => {
      const { error } = await supabase
        .from("courses")
        .delete()
        .in("id", courseIds);

      if (error) throw error;
      return courseIds;
    },
    onSuccess: (courseIds) => {
      queryClient.invalidateQueries({ queryKey: ["courses"] });
      toast({
        title: "Courses deleted",
        description: `${courseIds.length} courses have been successfully deleted`,
      });
    },
    onError: (error) => {
      console.error("Error deleting courses:", error);
      toast({
        title: "Error",
        description: "There was an error deleting the courses. Some courses may have related records.",
        variant: "destructive",
      });
    },
  });

  const updateCoursesStatus = useMutation({
    mutationFn: async ({ courseIds, status }: { courseIds: string[], status: string }) => {
      const { error } = await supabase
        .from("courses")
        .update({ status })
        .in("id", courseIds);

      if (error) throw error;
      return { courseIds, status };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["courses"] });
      toast({
        title: "Status updated",
        description: `${data.courseIds.length} courses have been updated to ${data.status}`,
      });
    },
    onError: (error) => {
      console.error("Error updating course status:", error);
      toast({
        title: "Error",
        description: "There was an error updating the course status",
        variant: "destructive",
      });
    },
  });

  return {
    deleteCourse,
    duplicateCourse,
    bulkDeleteCourses,
    updateCoursesStatus
  };
}
