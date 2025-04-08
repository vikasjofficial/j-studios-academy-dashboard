
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function useStudentDetails(userId: string | undefined) {
  const { data: studentDetails, isLoading, error } = useQuery({
    queryKey: ["student-details", userId],
    queryFn: async () => {
      if (!userId) return null;
      
      const { data, error } = await supabase
        .from("students")
        .select("*")
        .eq("id", userId)
        .single();
        
      if (error) throw error;
      
      return data;
    },
    enabled: !!userId,
  });

  return { studentDetails, isLoading, error };
}
