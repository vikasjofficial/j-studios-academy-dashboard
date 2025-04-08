
import { UserCheck } from "lucide-react";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/auth-context";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface AttendanceRecord {
  courseId: string;
  courseName: string;
  courseCode: string;
  present: number;
  absent: number;
  percentage: number;
}

export function CourseAttendanceSection() {
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user?.id) {
      fetchAttendanceData();
    }
  }, [user?.id]);

  const fetchAttendanceData = async () => {
    if (!user?.id) return;
    
    setIsLoading(true);
    try {
      // First get enrolled courses
      const { data: enrollments, error: enrollmentsError } = await supabase
        .from('enrollments')
        .select('course_id')
        .eq('student_id', user.id);
        
      if (enrollmentsError) throw enrollmentsError;
      
      if (!enrollments?.length) {
        setAttendanceRecords([]);
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
      const records: AttendanceRecord[] = [];
      
      for (const course of courses || []) {
        // Get attendance records for this course/student
        const { data: attendanceData, error: attendanceError } = await supabase
          .from('attendance')
          .select('status')
          .eq('student_id', user.id)
          .eq('course_id', course.id);
          
        if (attendanceError) {
          console.error('Error fetching attendance for course', course.id, attendanceError);
          continue; // Skip this course but continue with others
        }
        
        // Count present and absent based on status
        const present = attendanceData?.filter(record => record.status === 'present').length || 0;
        const absent = attendanceData?.filter(record => record.status === 'absent').length || 0;
        const total = present + absent;
        const percentage = total > 0 ? Math.round((present / total) * 100) : 0;
        
        records.push({
          courseId: course.id,
          courseName: course.name,
          courseCode: course.code,
          present,
          absent,
          percentage
        });
      }
      
      setAttendanceRecords(records);
    } catch (error) {
      console.error('Error fetching attendance records:', error);
      toast({
        title: "Error",
        description: "Failed to load attendance records",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="glass-morphism rounded-xl p-6 border border-white/10 w-full">
      <div className="flex items-center gap-2 mb-4">
        <UserCheck className="h-5 w-5 text-primary" />
        <h2 className="text-xl font-semibold">Attendance by Course</h2>
      </div>
      
      <div className="w-full">
        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin h-8 w-8 border-2 border-current border-t-transparent rounded-full"></div>
          </div>
        ) : attendanceRecords.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            No attendance records found
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Course</TableHead>
                  <TableHead className="text-center">Present</TableHead>
                  <TableHead className="text-center">Absent</TableHead>
                  <TableHead className="text-center">Attendance %</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {attendanceRecords.map((record) => (
                  <TableRow key={record.courseId}>
                    <TableCell className="font-medium">
                      <div>
                        <div>{record.courseName}</div>
                        <div className="text-xs text-muted-foreground">{record.courseCode}</div>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="inline-block px-2.5 py-1 rounded-full bg-green-500/20 text-green-500 font-medium">
                        {record.present}
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="inline-block px-2.5 py-1 rounded-full bg-red-500/20 text-red-500 font-medium">
                        {record.absent}
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center">
                        <span className={`font-bold ${
                          record.percentage >= 75 ? 'text-green-500' : 
                          record.percentage >= 60 ? 'text-yellow-500' : 
                          'text-red-500'
                        }`}>
                          {record.percentage}%
                        </span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
}
