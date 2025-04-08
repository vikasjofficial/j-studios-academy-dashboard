
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/auth-context";

export interface AttendanceSummary {
  totalPresent: number;
  totalAbsent: number;
  totalDays: number;
  percentage: number;
  courseCount: number;
}

export function useStudentAttendance() {
  const { user } = useAuth();
  const [summary, setSummary] = useState<AttendanceSummary>({
    totalPresent: 0,
    totalAbsent: 0,
    totalDays: 0,
    percentage: 0,
    courseCount: 0
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
      
      // First get enrolled courses
      const { data: enrollments, error: enrollmentsError } = await supabase
        .from('enrollments')
        .select('course_id')
        .eq('student_id', user.id);
        
      if (enrollmentsError) {
        console.error('Error fetching enrollments:', enrollmentsError);
        throw enrollmentsError;
      }
      
      if (!enrollments || !enrollments.length) {
        console.log('No enrollments found');
        setIsLoading(false);
        return;
      }
      
      const courseIds = enrollments.map(e => e.course_id);
      console.log('Courses enrolled:', courseIds.length);
      
      // Get attendance records directly
      const { data: attendanceRecords, error: attendanceError } = await supabase
        .from('attendance')
        .select('status, course_id')
        .eq('student_id', user.id)
        .in('course_id', courseIds);
        
      if (attendanceError) {
        console.error('Error fetching attendance records:', attendanceError);
        throw attendanceError;
      }
      
      console.log('Attendance records found:', attendanceRecords?.length || 0);
      
      // Calculate totals
      const totalPresent = attendanceRecords?.filter(record => record.status === 'present').length || 0;
      const totalAbsent = attendanceRecords?.filter(record => record.status === 'absent').length || 0;
      const totalDays = totalPresent + totalAbsent;
      const percentage = totalDays > 0 ? Math.round((totalPresent / totalDays) * 100) : 0;
      
      // Count unique courses with attendance records
      const coursesWithRecords = new Set(attendanceRecords?.map(record => record.course_id));
      
      console.log(`Calculated attendance: present=${totalPresent}, absent=${totalAbsent}, total=${totalDays}, percentage=${percentage}%, courses=${coursesWithRecords.size}`);
      
      setSummary({
        totalPresent,
        totalAbsent,
        totalDays,
        percentage,
        courseCount: coursesWithRecords.size
      });
    } catch (error) {
      console.error('Error fetching attendance summary:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return { summary, isLoading };
}
