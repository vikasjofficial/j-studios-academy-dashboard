
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/auth-context';
import { useToast } from '@/hooks/use-toast';
import { AttendanceCard } from '@/components/dashboard/attendance-card';

interface Course {
  id: string;
  name: string;
  code: string;
}

interface AttendanceStats {
  courseId: string;
  courseName: string;
  courseCode: string;
  present: number;
  total: number;
  percentage: number;
}

export default function StudentAttendanceDashboard() {
  const [attendanceStats, setAttendanceStats] = useState<AttendanceStats[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user?.id) {
      fetchAttendanceStats();
    }
  }, [user?.id]);

  const fetchAttendanceStats = async () => {
    if (!user?.id) return;
    
    setIsLoading(true);
    try {
      // First get enrolled courses
      const { data: enrollments, error: enrollmentsError } = await supabase
        .from('enrollments')
        .select('course_id')
        .eq('student_id', user.id);
        
      if (enrollmentsError) throw enrollmentsError;
      
      if (!enrollments.length) {
        setAttendanceStats([]);
        setIsLoading(false);
        return;
      }
      
      const courseIds = enrollments.map(e => e.course_id);
      
      // Get course details
      const { data: courses, error: coursesError } = await supabase
        .from('courses')
        .select('id, name, code')
        .in('id', courseIds);
        
      if (coursesError) throw coursesError;
      
      // For each course, get attendance stats
      const stats: AttendanceStats[] = [];
      
      for (const course of courses) {
        // Get total attendance records for this course/student
        const { data: records, error: recordsError } = await supabase
          .from('attendance')
          .select('status')
          .eq('student_id', user.id)
          .eq('course_id', course.id);
          
        if (recordsError) throw recordsError;
        
        const total = records.length;
        const present = records.filter(r => r.status === 'present').length;
        const percentage = total > 0 ? Math.round((present / total) * 100) : 0;
        
        stats.push({
          courseId: course.id,
          courseName: course.name,
          courseCode: course.code,
          present,
          total,
          percentage
        });
      }
      
      setAttendanceStats(stats);
    } catch (error) {
      console.error('Error fetching attendance stats:', error);
      toast({
        title: "Error",
        description: "Failed to load attendance statistics",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin h-8 w-8 border-2 border-current border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (attendanceStats.length === 0) {
    return (
      <div className="text-center py-4 text-muted-foreground">
        No attendance records found
      </div>
    );
  }

  return (
    <div className="w-full grid grid-cols-1 gap-6">
      {attendanceStats.map((stat) => (
        <AttendanceCard
          key={stat.courseId}
          title={`${stat.courseName} (${stat.courseCode})`}
          percentage={stat.percentage}
          present={stat.present}
          total={stat.total}
        />
      ))}
    </div>
  );
}
