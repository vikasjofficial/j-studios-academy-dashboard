
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Course } from "../types";

export function useEnrolledCourses(studentId: string | undefined) {
  return useQuery({
    queryKey: ["enrolled-courses", studentId],
    queryFn: async () => {
      if (!studentId) return [];
      
      console.log("Fetching enrolled courses for student:", studentId);
      
      const { data, error } = await supabase
        .from("enrollments")
        .select(`
          course:course_id(id, name)
        `)
        .eq("student_id", studentId);
        
      if (error) {
        console.error("Error fetching enrolled courses:", error);
        throw error;
      }
      
      return data.map(item => item.course) as Course[];
    },
    enabled: !!studentId,
  });
}
