
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/auth-context";

export interface AttendanceSummary {
  totalPresent: number;
  totalAbsent: number;
  totalDays: number;
  percentage: number;
}

export function useStudentAttendance() {
  const { user } = useAuth();
  const [summary, setSummary] = useState<AttendanceSummary>({
    totalPresent: 0,
    totalAbsent: 0,
    totalDays: 0,
    percentage: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      fetchAttendanceSummary();
    }
  }, [user?.id]);

  const fetchAttendanceSummary = async () => {
    if (!user?.id) return;
    
    try {
      console.log('Fetching attendance summary for student ID:', user.id);
      
      // Get attendance record directly from attendance_counts
      const { data, error } = await supabase
        .from('attendance_counts')
        .select('*')
        .eq('student_id', user.id)
        .single();
        
      if (error) {
        console.error('Error fetching attendance record:', error);
        // If no record exists yet, set zeros
        if (error.code === 'PGRST116') {
          setSummary({
            totalPresent: 0,
            totalAbsent: 0,
            totalDays: 0,
            percentage: 0
          });
          setIsLoading(false);
          return;
        }
        throw error;
      }
      
      console.log('Attendance record found:', data);
      
      // Calculate totals
      const totalPresent = data?.present_count || 0;
      const totalAbsent = data?.absent_count || 0;
      const totalDays = totalPresent + totalAbsent;
      const percentage = totalDays > 0 ? Math.round((totalPresent / totalDays) * 100) : 0;
      
      console.log(`Calculated attendance: present=${totalPresent}, absent=${totalAbsent}, total=${totalDays}, percentage=${percentage}%`);
      
      setSummary({
        totalPresent,
        totalAbsent,
        totalDays,
        percentage
      });
    } catch (error) {
      console.error('Error fetching attendance summary:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return { summary, isLoading };
}
