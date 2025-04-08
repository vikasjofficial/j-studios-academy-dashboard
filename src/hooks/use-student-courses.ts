
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function useStudentCourses(userId: string | undefined) {
  const { data: courses, isLoading, error } = useQuery({
    queryKey: ["student-courses", userId],
    queryFn: async () => {
      if (!userId) return [];
      
      console.log("Fetching enrolled courses for student:", userId);
      
      const { data, error } = await supabase
        .from("enrollments")
        .select(`
          course_id,
          courses:course_id(id, name, code)
        `)
        .eq("student_id", userId)
        .eq("status", "active");
        
      if (error) {
        console.error("Error fetching enrolled courses:", error);
        throw error;
      }
      
      console.log("Fetched enrolled courses:", data.length);
      
      return data.map(item => item.courses);
    },
    enabled: !!userId,
  });

  return { courses, isLoading, error };
}
