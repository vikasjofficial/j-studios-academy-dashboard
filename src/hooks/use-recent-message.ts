
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function useRecentMessage(userId: string | undefined) {
  const { data: recentMessage, isLoading, error } = useQuery({
    queryKey: ["recent-message", userId],
    queryFn: async () => {
      if (!userId) return null;
      
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("student_id", userId)
        .eq("sender_role", "admin")
        .order("created_at", { ascending: false })
        .limit(1);
        
      if (error) throw error;
      
      return data.length > 0 ? data[0] : null;
    },
    enabled: !!userId,
  });

  return { recentMessage, isLoading, error };
}
