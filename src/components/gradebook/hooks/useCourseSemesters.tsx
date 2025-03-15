
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Semester } from "../types";

export function useCourseSemesters(courseId: string | null) {
  return useQuery({
    queryKey: ["course-semesters", courseId],
    queryFn: async () => {
      if (!courseId) return [];
      
      console.log("Fetching semesters for course:", courseId);
      
      const { data: semestersData, error: semestersError } = await supabase
        .from("semesters")
        .select("id, name")
        .eq("course_id", courseId)
        .order("start_date");
        
      if (semestersError) {
        console.error("Error fetching semesters:", semestersError);
        throw semestersError;
      }
      
      const semestersWithTopics = await Promise.all(
        semestersData.map(async (semester) => {
          const { data: topicsData, error: topicsError } = await supabase
            .from("topics")
            .select("id, name, order_id, semester_id")
            .eq("semester_id", semester.id)
            .order("order_id");
            
          if (topicsError) {
            console.error(`Error fetching topics for semester ${semester.id}:`, topicsError);
            return { ...semester, topics: [] };
          }
          
          return { ...semester, topics: topicsData || [] };
        })
      );
      
      return semestersWithTopics as Semester[];
    },
    enabled: !!courseId,
  });
}
