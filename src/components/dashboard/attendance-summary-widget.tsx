
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/auth-context';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CalendarCheck, Calendar, CalendarX } from "lucide-react";
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';
import animationStyles from '@/styles/animations.module.css';

interface AttendanceSummary {
  totalPresent: number;
  totalAbsent: number;
  totalDays: number;
  percentage: number;
  courseCount: number;
}

export function AttendanceSummaryWidget() {
  const [summary, setSummary] = useState<AttendanceSummary>({
    totalPresent: 0,
    totalAbsent: 0,
    totalDays: 0,
    percentage: 0,
    courseCount: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user?.id) {
      fetchAttendanceSummary();
    }
  }, [user?.id]);

  const fetchAttendanceSummary = async () => {
    if (!user?.id) return;
    
    try {
      // First get enrolled courses
      const { data: enrollments, error: enrollmentsError } = await supabase
        .from('enrollments')
        .select('course_id')
        .eq('student_id', user.id);
        
      if (enrollmentsError) throw enrollmentsError;
      
      if (!enrollments.length) {
        setIsLoading(false);
        return;
      }
      
      const courseIds = enrollments.map(e => e.course_id);
      
      // Get attendance counts for all courses
      const { data: records, error: recordsError } = await supabase
        .from('attendance_counts' as any)
        .select('*')
        .eq('student_id', user.id)
        .in('course_id', courseIds);
        
      if (recordsError) throw recordsError;
      
      // Calculate totals
      let totalPresent = 0;
      let totalAbsent = 0;
      
      if (records) {
        records.forEach((record: any) => {
          totalPresent += record.present_count || 0;
          totalAbsent += record.absent_count || 0;
        });
      }
      
      const totalDays = totalPresent + totalAbsent;
      const percentage = totalDays > 0 ? Math.round((totalPresent / totalDays) * 100) : 0;
      
      setSummary({
        totalPresent,
        totalAbsent,
        totalDays,
        percentage,
        courseCount: records?.length || 0
      });
    } catch (error) {
      console.error('Error fetching attendance summary:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-medium flex items-center">
            <Calendar className="mr-2 h-5 w-5 text-primary" />
            Attendance Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center items-center py-4">
            <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (summary.totalDays === 0) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-medium flex items-center">
            <Calendar className="mr-2 h-5 w-5 text-primary" />
            Attendance Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-3 text-muted-foreground text-sm">
            No attendance records found
          </div>
          <Link 
            to="/student/attendance" 
            className="block w-full text-center text-xs text-primary hover:underline mt-2"
          >
            View details
          </Link>
        </CardContent>
      </Card>
    );
  }

  // Determine status color based on percentage
  const getStatusColor = () => {
    if (summary.percentage >= 90) return "text-green-500";
    if (summary.percentage >= 75) return "text-yellow-500";
    return "text-red-500";
  };

  return (
    <Card className="hover:shadow-md transition-shadow duration-300">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium flex items-center justify-between">
          <div className="flex items-center">
            <Calendar className="mr-2 h-5 w-5 text-primary" />
            Attendance Overview
          </div>
          <span className={cn("text-xl font-bold", getStatusColor(), animationStyles.animateFloat)}>
            {summary.percentage}%
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Progress 
          value={summary.percentage} 
          className="h-2" 
        />
        
        <div className="grid grid-cols-3 gap-4 mt-4">
          <div className="flex flex-col items-center">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400 mb-1">
              <CalendarCheck className="h-4 w-4" />
            </div>
            <span className="text-xs text-muted-foreground">Present</span>
            <span className="text-lg font-semibold">{summary.totalPresent}</span>
          </div>
          
          <div className="flex flex-col items-center">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 mb-1">
              <CalendarX className="h-4 w-4" />
            </div>
            <span className="text-xs text-muted-foreground">Absent</span>
            <span className="text-lg font-semibold">{summary.totalAbsent}</span>
          </div>
          
          <div className="flex flex-col items-center">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 mb-1">
              <Calendar className="h-4 w-4" />
            </div>
            <span className="text-xs text-muted-foreground">Total</span>
            <span className="text-lg font-semibold">{summary.totalDays}</span>
          </div>
        </div>
        
        <Link 
          to="/student/attendance" 
          className="block w-full text-center text-sm text-primary hover:underline mt-4"
        >
          View detailed attendance
        </Link>
      </CardContent>
    </Card>
  );
}
