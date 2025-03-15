
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Topic } from "../types";

export function useTopicsWithoutSemester(courseId: string | null) {
  return useQuery({
    queryKey: ["course-topics-no-semester", courseId],
    queryFn: async () => {
      if (!courseId) return [];
      
      console.log("Fetching topics without semester for course:", courseId);
      
      const { data, error } = await supabase
        .from("topics")
        .select("id, name, order_id, semester_id")
        .eq("course_id", courseId)
        .is("semester_id", null)
        .order("order_id");
        
      if (error) {
        console.error("Error fetching topics without semester:", error);
        throw error;
      }
      
      return data as Topic[];
    },
    enabled: !!courseId,
  });
}
