
import { UserCheck } from "lucide-react";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/auth-context";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface AttendanceRecord {
  present: number;
  absent: number;
  percentage: number;
}

export function CourseAttendanceSection() {
  const [attendance, setAttendance] = useState<AttendanceRecord | null>(null);
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
      // Get global attendance record for this student
      const { data, error } = await supabase
        .from('attendance_counts')
        .select('*')
        .eq('student_id', user.id)
        .single();
        
      if (error) {
        // If no record exists yet, show empty state
        if (error.code === 'PGRST116') {
          setAttendance(null);
          setIsLoading(false);
          return;
        }
        throw error;
      }
      
      // Calculate attendance percentage
      const present = data.present_count || 0;
      const absent = data.absent_count || 0;
      const total = present + absent;
      const percentage = total > 0 ? Math.round((present / total) * 100) : 0;
      
      setAttendance({
        present,
        absent,
        percentage
      });
    } catch (error) {
      console.error('Error fetching attendance record:', error);
      toast({
        title: "Error",
        description: "Failed to load attendance record",
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
        <h2 className="text-xl font-semibold">Global Attendance</h2>
      </div>
      
      <div className="w-full">
        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin h-8 w-8 border-2 border-current border-t-transparent rounded-full"></div>
          </div>
        ) : !attendance ? (
          <div className="text-center py-6 text-muted-foreground">
            No attendance records found
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-center">Present</TableHead>
                  <TableHead className="text-center">Absent</TableHead>
                  <TableHead className="text-center">Attendance %</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="text-center">
                    <span className="inline-block px-2.5 py-1 rounded-full bg-green-500/20 text-green-500 font-medium">
                      {attendance.present}
                    </span>
                  </TableCell>
                  <TableCell className="text-center">
                    <span className="inline-block px-2.5 py-1 rounded-full bg-red-500/20 text-red-500 font-medium">
                      {attendance.absent}
                    </span>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center">
                      <span className={`font-bold ${
                        attendance.percentage >= 75 ? 'text-green-500' : 
                        attendance.percentage >= 60 ? 'text-yellow-500' : 
                        'text-red-500'
                      }`}>
                        {attendance.percentage}%
                      </span>
                    </div>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
}
