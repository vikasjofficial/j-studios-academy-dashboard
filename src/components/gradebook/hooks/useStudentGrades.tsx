
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Grade } from "../types";

export function useStudentGrades(studentId: string | undefined, courseId: string | null) {
  return useQuery({
    queryKey: ["student-grades", studentId, courseId],
    queryFn: async () => {
      if (!studentId || !courseId) return [];
      
      console.log("Fetching grades for student:", studentId, "course:", courseId);
      
      const { data, error } = await supabase
        .from("grades")
        .select("id, topic_id, score, comment")
        .eq("student_id", studentId)
        .eq("course_id", courseId);
        
      if (error) {
        console.error("Error fetching grades:", error);
        throw error;
      }
      
      console.log("Fetched grades with comments:", data);
      
      return data as Grade[];
    },
    enabled: !!studentId && !!courseId,
  });
}
