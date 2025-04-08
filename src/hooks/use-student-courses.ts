
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function useStudentCourses(userId: string | undefined) {
  const { data: courses, isLoading, error } = useQuery({
    queryKey: ["student-courses", userId],
    queryFn: async () => {
      if (!userId) return [];
      
      const { data, error } = await supabase
        .from("enrollments")
        .select(`
          course_id,
          courses:course_id(id, name, code)
        `)
        .eq("student_id", userId)
        .eq("status", "active");
        
      if (error) throw error;
      
      return data.map(item => item.courses);
    },
    enabled: !!userId,
  });

  return { courses, isLoading, error };
}
