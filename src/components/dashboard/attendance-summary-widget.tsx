
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/context/auth-context";
import { supabase } from "@/integrations/supabase/client"; 
import { UserCheck } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";

export function AttendanceSummaryWidget() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [attendanceData, setAttendanceData] = useState({
    present: 0,
    absent: 0,
    total: 0,
    percentage: 0
  });

  useEffect(() => {
    if (user?.id) {
      fetchAttendanceSummary();
    }
  }, [user?.id]);

  const fetchAttendanceSummary = async () => {
    if (!user?.id) return;
    
    try {
      console.log('Fetching attendance for student ID:', user.id);
      
      // First get enrolled courses
      const { data: enrollments, error: enrollmentsError } = await supabase
        .from('enrollments')
        .select('course_id')
        .eq('student_id', user.id);
        
      if (enrollmentsError) {
        console.error('Error fetching enrollments:', enrollmentsError);
        throw enrollmentsError;
      }
      
      if (!enrollments || enrollments.length === 0) {
        console.log('No enrollments found for student:', user.id);
        setIsLoading(false);
        return;
      }
      
      const courseIds = enrollments.map(e => e.course_id);
      console.log('Courses enrolled:', courseIds);
      
      // Get attendance records directly from attendance table
      const { data: attendanceRecords, error: attendanceError } = await supabase
        .from('attendance')
        .select('status, course_id')
        .eq('student_id', user.id)
        .in('course_id', courseIds);
        
      if (attendanceError) {
        console.error('Error fetching attendance records:', attendanceError);
        throw attendanceError;
      }
      
      console.log('Attendance records fetched:', attendanceRecords?.length || 0);
      
      // Calculate totals
      const totalPresent = attendanceRecords?.filter(record => record.status === 'present').length || 0;
      const totalAbsent = attendanceRecords?.filter(record => record.status === 'absent').length || 0;
      const totalDays = totalPresent + totalAbsent;
      const percentage = totalDays > 0 ? Math.round((totalPresent / totalDays) * 100) : 0;
      
      console.log(`Calculated attendance: present=${totalPresent}, absent=${totalAbsent}, total=${totalDays}, percentage=${percentage}%`);
      
      setAttendanceData({
        present: totalPresent,
        absent: totalAbsent,
        total: totalDays,
        percentage
      });
    } catch (error) {
      console.error('Error fetching attendance summary:', error);
      toast({
        title: "Error",
        description: "Failed to load attendance data",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to determine color based on percentage
  const getAttendanceColor = (percentage: number) => {
    if (percentage >= 90) return "text-green-500";
    if (percentage >= 75) return "text-blue-500";
    if (percentage >= 60) return "text-yellow-500";
    return "text-red-500";
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-medium">
          <div className="flex items-center gap-2">
            <UserCheck className="h-5 w-5 text-primary" />
            Attendance Summary
          </div>
        </CardTitle>
        <Link
          to="/student/attendance"
          className="text-xs text-primary hover:text-primary/80 transition-colors"
        >
          View Details
        </Link>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center h-24">
            <div className="animate-spin h-6 w-6 border-2 border-current border-t-transparent rounded-full"></div>
          </div>
        ) : attendanceData.total === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            No attendance records found
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-between items-center mb-2">
              <span className={`text-2xl font-bold ${getAttendanceColor(attendanceData.percentage)}`}>
                {attendanceData.percentage}%
              </span>
              <span className="text-sm text-muted-foreground">
                {attendanceData.present} of {attendanceData.total} days present
              </span>
            </div>
            
            <Progress 
              value={attendanceData.percentage} 
              className="h-2" 
            />
            
            <div className="grid grid-cols-3 gap-2 pt-2">
              <div className="flex flex-col items-center p-2 rounded-lg bg-black/10">
                <span className="text-xs text-muted-foreground mb-1">Present</span>
                <span className="text-sm font-medium text-green-500">{attendanceData.present}</span>
              </div>
              <div className="flex flex-col items-center p-2 rounded-lg bg-black/10">
                <span className="text-xs text-muted-foreground mb-1">Absent</span>
                <span className="text-sm font-medium text-red-500">{attendanceData.absent}</span>
              </div>
              <div className="flex flex-col items-center p-2 rounded-lg bg-black/10">
                <span className="text-xs text-muted-foreground mb-1">Total</span>
                <span className="text-sm font-medium">{attendanceData.total}</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
