
import { UserCheck, Check, X, CalendarDays, BarChart4, BookOpen } from "lucide-react";
import StudentAttendanceDashboard from "@/components/dashboard/student-attendance-dashboard";
import { StudentGradebookView } from "@/components/gradebook/student-gradebook-view";
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/context/auth-context";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

interface AttendanceSummary {
  totalPresent: number;
  totalAbsent: number;
  totalDays: number;
  percentage: number;
  courseCount: number;
}

export default function StudentAttendance() {
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
        .from('attendance_counts')
        .select('*')
        .eq('student_id', user.id)
        .in('course_id', courseIds);
        
      if (recordsError) throw recordsError;
      
      // Calculate totals
      let totalPresent = 0;
      let totalAbsent = 0;
      
      if (records && records.length > 0) {
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

  // Determine status and color based on attendance percentage
  const getStatusText = () => {
    if (summary.percentage >= 90) return "Excellent";
    if (summary.percentage >= 75) return "Good";
    if (summary.percentage >= 60) return "Average";
    return "Poor";
  };

  const getStatusColor = () => {
    if (summary.percentage >= 90) return "text-green-500";
    if (summary.percentage >= 75) return "text-blue-500";
    if (summary.percentage >= 60) return "text-yellow-500";
    return "text-red-500";
  };

  return (
    <div className="flex w-full">
      {/* Empty div on the left side */}
      <div className="hidden md:block w-16 md:w-24 lg:w-28 flex-shrink-0"></div>
      
      <div className="space-y-6 w-full">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Attendance</h1>
          <p className="text-muted-foreground">View your attendance records for all courses</p>
        </div>
        
        {/* Overall attendance summary card */}
        <Card className="glass-morphism rounded-xl border border-white/10 w-full">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <BarChart4 className="h-5 w-5 text-primary" />
              <span>Attendance Overview</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center items-center py-4">
                <div className="animate-spin h-8 w-8 border-2 border-current border-t-transparent rounded-full"></div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col items-center justify-center">
                  <div className="relative w-40 h-40 flex items-center justify-center">
                    <div className="absolute inset-0 rounded-full bg-black/20 border border-white/10"></div>
                    <div className="absolute top-0 left-0 w-full h-full">
                      <svg width="100%" height="100%" viewBox="0 0 100 100">
                        <circle 
                          cx="50" cy="50" r="45" 
                          fill="none" 
                          stroke="rgba(255,255,255,0.1)" 
                          strokeWidth="8" 
                        />
                        <circle 
                          cx="50" cy="50" r="45" 
                          fill="none" 
                          stroke="currentColor" 
                          strokeWidth="8"
                          strokeDasharray={`${summary.percentage * 2.83} 283`}
                          strokeDashoffset="0"
                          strokeLinecap="round"
                          className={cn("transition-all duration-1000", getStatusColor())}
                          transform="rotate(-90 50 50)"
                        />
                      </svg>
                    </div>
                    <div className="z-10 text-center">
                      <span className={cn("text-4xl font-bold", getStatusColor())}>{summary.percentage}%</span>
                      <p className="text-sm text-muted-foreground mt-1">{getStatusText()}</p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Attendance Statistics</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-black/20 p-4 rounded-lg border border-white/10">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm text-muted-foreground">Present Days</span>
                        <div className="flex items-center justify-center h-6 w-6 rounded-full bg-green-500/20">
                          <Check className="h-3 w-3 text-green-500" />
                        </div>
                      </div>
                      <div className="text-2xl font-bold">{summary.totalPresent}</div>
                    </div>
                    
                    <div className="bg-black/20 p-4 rounded-lg border border-white/10">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm text-muted-foreground">Absent Days</span>
                        <div className="flex items-center justify-center h-6 w-6 rounded-full bg-red-500/20">
                          <X className="h-3 w-3 text-red-500" />
                        </div>
                      </div>
                      <div className="text-2xl font-bold">{summary.totalAbsent}</div>
                    </div>
                    
                    <div className="bg-black/20 p-4 rounded-lg border border-white/10">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm text-muted-foreground">Total Days</span>
                        <div className="flex items-center justify-center h-6 w-6 rounded-full bg-primary/20">
                          <CalendarDays className="h-3 w-3 text-primary" />
                        </div>
                      </div>
                      <div className="text-2xl font-bold">{summary.totalDays}</div>
                    </div>
                    
                    <div className="bg-black/20 p-4 rounded-lg border border-white/10">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm text-muted-foreground">Courses</span>
                        <div className="flex items-center justify-center h-6 w-6 rounded-full bg-blue-500/20">
                          <BookOpen className="h-3 w-3 text-blue-500" />
                        </div>
                      </div>
                      <div className="text-2xl font-bold">{summary.courseCount}</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Course-specific attendance cards */}
        <div className="glass-morphism rounded-xl p-6 border border-white/10 w-full">
          <div className="flex items-center gap-2 mb-4">
            <UserCheck className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold">Attendance by Course</h2>
          </div>
          
          <div className="w-full">
            <StudentAttendanceDashboard />
          </div>
        </div>
        
        <div className="mt-8 w-full">
          <Accordion type="multiple" defaultValue={["item-0"]} className="w-full">
            <AccordionItem value="item-0" className="border-b">
              <AccordionTrigger className="text-xl font-semibold">Semester Performance</AccordionTrigger>
              <AccordionContent>
                <StudentGradebookView />
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>
    </div>
  );
}
