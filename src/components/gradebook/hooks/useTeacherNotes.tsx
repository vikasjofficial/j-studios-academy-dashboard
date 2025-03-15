
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useTeacherNotes(studentId: string | undefined, courseId: string | null) {
  return useQuery({
    queryKey: ["student-all-comments", studentId, courseId],
    queryFn: async () => {
      if (!studentId || !courseId) return [];
      
      console.log("Fetching all comments for student:", studentId, "course:", courseId);
      
      const { data, error } = await supabase
        .from("grades")
        .select(`
          id, 
          topic_id,
          comment,
          topics:topic_id(name, semester_id),
          semesters:topics(semesters:semester_id(name))
        `)
        .eq("student_id", studentId)
        .eq("course_id", courseId)
        .not("comment", "is", null)
        .not("comment", "eq", "");
        
      if (error) {
        console.error("Error fetching comments:", error);
        throw error;
      }
      
      return data.map(item => ({
        topicId: item.topic_id,
        topicName: item.topics?.name || "Unknown Topic",
        semesterName: item.semesters?.semesters?.name || "Uncategorized",
        comment: item.comment || ""
      }));
    },
    enabled: !!studentId && !!courseId,
  });
}
