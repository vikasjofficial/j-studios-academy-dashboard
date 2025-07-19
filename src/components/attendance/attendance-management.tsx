
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Form, FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Check, X, UserCheck, Calendar, Loader2, ChevronDown, ChevronUp, 
  CalendarDays, Users, BookCheck 
} from 'lucide-react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from 'date-fns';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface Student {
  id: string;
  name: string;
  student_id: string;
  email: string;
}

interface AttendanceCount {
  id: string;
  student_id: string;
  present_count: number;
  absent_count: number;
  last_updated: string;
  note?: string;
  created_at?: string;
}

interface StudentAttendanceSummary {
  studentId: string;
  studentName: string;
  studentCode: string;
  presentCount: number;
  absentCount: number;
  percentage: number;
  note?: string;
  lastUpdated?: string;
}

const attendanceSchema = z.object({
  presentCount: z.number().min(0, "Present count must be 0 or greater"),
  absentCount: z.number().min(0, "Absent count must be 0 or greater"),
  note: z.string().optional(),
});

export default function AttendanceManagement() {
  const [students, setStudents] = useState<Student[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<Record<string, AttendanceCount>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [summaries, setSummaries] = useState<StudentAttendanceSummary[]>([]);
  const [expandedStudents, setExpandedStudents] = useState<Record<string, boolean>>({});
  const [courses, setCourses] = useState<any[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string>('');
  const { toast } = useToast();

  const fetchStudents = async () => {
    try {
      const { data, error } = await supabase
        .from('students')
        .select('id, name, student_id, email')
        .order('name');
        
      if (error) throw error;
      setStudents(data || []);
    } catch (error) {
      console.error('Error fetching students:', error);
      toast({
        title: "Error",
        description: "Failed to load students",
        variant: "destructive"
      });
    }
  };

  const fetchCourses = async () => {
    try {
      const { data, error } = await supabase
        .from('courses')
        .select('id, name, code')
        .eq('status', 'active')
        .order('name');
        
      if (error) throw error;
      setCourses(data || []);
      
      // Set the first course as default if no course is selected
      if (data && data.length > 0 && !selectedCourseId) {
        setSelectedCourseId(data[0].id);
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
      toast({
        title: "Error",
        description: "Failed to load courses",
        variant: "destructive"
      });
    }
  };

  // Fetch initial data
  useEffect(() => {
    fetchStudents();
    fetchCourses();
    fetchAttendance();
  }, []);
  
  // Fetch attendance summaries
  useEffect(() => {
    fetchAttendanceSummaries();
  }, [students]);

  const fetchAttendance = async () => {
    setIsLoading(true);
    try {
      console.log('Fetching global attendance');
      // Use explicit type casting to handle the Supabase client not recognizing the table
      const { data, error } = await supabase
        .from('attendance_counts' as any)
        .select('*');
        
      if (error) throw error;
      
      console.log('Attendance data:', data);
      
      // Convert to a record for easier lookup
      const records: Record<string, AttendanceCount> = {};
      if (data) {
        data.forEach((record: any) => {
          records[record.student_id] = {
            id: record.id,
            student_id: record.student_id,
            present_count: record.present_count || 0,
            absent_count: record.absent_count || 0,
            note: record.note,
            last_updated: record.last_updated,
            created_at: record.created_at
          };
        });
      }
      
      setAttendanceRecords(records);
    } catch (error) {
      console.error('Error fetching attendance:', error);
      toast({
        title: "Error",
        description: "Failed to load attendance records",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAttendanceSummaries = async () => {
    try {
      // Get all attendance records
      // Use explicit type casting to handle the Supabase client not recognizing the table
      const { data: attendanceData, error: attendanceError } = await supabase
        .from('attendance_counts' as any)
        .select('*');
        
      if (attendanceError) throw attendanceError;
      
      // Process data to create student summaries
      const studentRecords: Record<string, StudentAttendanceSummary> = {};
      
      // Initialize with all students
      students.forEach(student => {
        studentRecords[student.id] = {
          studentId: student.id,
          studentName: student.name,
          studentCode: student.student_id,
          presentCount: 0,
          absentCount: 0,
          percentage: 0
        };
      });
      
      // Add attendance records
      if (attendanceData) {
        attendanceData.forEach((record: any) => {
          if (studentRecords[record.student_id]) {
            studentRecords[record.student_id].presentCount = record.present_count || 0;
            studentRecords[record.student_id].absentCount = record.absent_count || 0;
            studentRecords[record.student_id].note = record.note;
            studentRecords[record.student_id].lastUpdated = record.last_updated;
          }
        });
      }
      
      // Calculate percentages
      Object.values(studentRecords).forEach(summary => {
        const total = summary.presentCount + summary.absentCount;
        summary.percentage = total > 0 ? Math.round((summary.presentCount / total) * 100) : 0;
      });
      
      setSummaries(Object.values(studentRecords));
    } catch (error) {
      console.error('Error fetching attendance summaries:', error);
      toast({
        title: "Error",
        description: "Failed to load attendance summaries",
        variant: "destructive"
      });
    }
  };

  const saveAttendance = async (
    studentId: string, 
    presentCount: number, 
    absentCount: number, 
    note?: string
  ) => {
    if (!selectedCourseId) {
      toast({
        title: "Error",
        description: "Please select a course before saving attendance",
        variant: "destructive"
      });
      return;
    }

    setIsSaving(true);
    
    try {
      const existingRecord = attendanceRecords[studentId];
      const timestamp = new Date().toISOString();
      
      console.log('Saving attendance:', {
        studentId,
        presentCount,
        absentCount,
        note,
        existingRecord
      });
      
      if (existingRecord) {
        // Update existing record
        // Use explicit type casting to handle the Supabase client not recognizing the table
        const { data, error } = await supabase
          .from('attendance_counts' as any)
          .update({ 
            present_count: presentCount,
            absent_count: absentCount,
            note: note || null,
            last_updated: timestamp
          })
          .eq('id', existingRecord.id);
          
        if (error) throw error;
        
        console.log('Updated attendance record:', data);
      } else {
        // Create new record
        // Use explicit type casting to handle the Supabase client not recognizing the table
        const { data, error } = await supabase
          .from('attendance_counts' as any)
          .insert({
            student_id: studentId,
            course_id: selectedCourseId,
            present_count: presentCount,
            absent_count: absentCount,
            note: note || null,
            last_updated: timestamp
          });
          
        if (error) throw error;
        
        console.log('Created new attendance record:', data);
      }
      
      // Update local state
      fetchAttendance();
      fetchAttendanceSummaries();
      
      toast({
        title: "Success",
        description: "Attendance saved successfully",
      });
    } catch (error) {
      console.error('Error saving attendance:', error);
      toast({
        title: "Error",
        description: "Failed to save attendance",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  const toggleStudentExpand = (studentId: string) => {
    setExpandedStudents(prev => ({
      ...prev,
      [studentId]: !prev[studentId]
    }));
  };

  const AttendanceForm = ({ studentId }: { studentId: string }) => {
    const record = attendanceRecords[studentId];
    const form = useForm<z.infer<typeof attendanceSchema>>({
      resolver: zodResolver(attendanceSchema),
      defaultValues: {
        presentCount: record?.present_count || 0,
        absentCount: record?.absent_count || 0,
        note: record?.note || '',
      },
    });

    const onSubmit = async (data: z.infer<typeof attendanceSchema>) => {
      await saveAttendance(studentId, data.presentCount, data.absentCount, data.note);
    };

    return (
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between mb-1">
              <FormLabel className="text-sm">Present: {form.watch('presentCount')}</FormLabel>
              <span className="text-xs text-muted-foreground">
                {form.watch('presentCount') + form.watch('absentCount')} total days
              </span>
            </div>
            <FormField
              control={form.control}
              name="presentCount"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Slider
                      min={0}
                      max={100}
                      step={1}
                      value={[field.value]}
                      onValueChange={(vals) => field.onChange(vals[0])}
                      className="mb-4"
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between mb-1">
              <FormLabel className="text-sm">Absent: {form.watch('absentCount')}</FormLabel>
            </div>
            <FormField
              control={form.control}
              name="absentCount"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Slider
                      min={0}
                      max={100}
                      step={1}
                      value={[field.value]}
                      onValueChange={(vals) => field.onChange(vals[0])}
                      className="mb-4"
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
          
          <FormField
            control={form.control}
            name="note"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input 
                    placeholder="Note (optional)" 
                    {...field} 
                  />
                </FormControl>
              </FormItem>
            )}
          />
          
          <Button type="submit" variant="outline" size="sm" className="w-full">
            {form.formState.isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Save"
            )}
          </Button>
        </form>
      </Form>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Attendance Management</h1>
        <p className="text-muted-foreground">Manage global student attendance records</p>
      </div>
      
      {courses.length > 0 && (
        <Card className="mb-4">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Course Selection</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <label className="text-sm font-medium">Select Course for Attendance</label>
              <Select value={selectedCourseId} onValueChange={setSelectedCourseId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a course" />
                </SelectTrigger>
                <SelectContent>
                  {courses.map((course) => (
                    <SelectItem key={course.id} value={course.id}>
                      {course.name} ({course.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      )}
      
      <div className="flex flex-col md:flex-row gap-4">
        <Card className="flex-1">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              <span>Global Attendance Records</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Card className="bg-card/50 backdrop-blur-sm border border-white/10 mb-6">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <UserCheck className="h-5 w-5 text-primary" />
                  <span>Student Attendance Counts</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex justify-center items-center py-8">
                    <div className="animate-spin h-8 w-8 border-2 border-current border-t-transparent rounded-full"></div>
                  </div>
                ) : students.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No students found
                  </div>
                ) : (
                  <ScrollArea className="h-[500px] pr-4">
                    <div className="space-y-4">
                      {students.map((student) => (
                        <Card key={student.id} className="bg-background/50">
                          <CardContent className="p-4">
                            <div className="flex flex-col gap-4">
                              <div>
                                <h3 className="font-medium">{student.name}</h3>
                                <p className="text-sm text-muted-foreground">{student.student_id} • {student.email}</p>
                              </div>
                              <div>
                                <AttendanceForm studentId={student.id} />
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <BookCheck className="h-5 w-5 text-primary" />
            <span>Attendance Summary</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {summaries.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No attendance records found
            </div>
          ) : (
            <div className="space-y-4">
              {summaries.map(summary => (
                <Collapsible key={summary.studentId}>
                  <Card>
                    <CardHeader className="py-3 px-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="font-medium">{summary.studentName}</h3>
                          <p className="text-sm text-muted-foreground">{summary.studentCode}</p>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="text-sm">Present: <span className="font-medium text-green-500">{summary.presentCount}</span></p>
                            <p className="text-sm">Absent: <span className="font-medium text-red-500">{summary.absentCount}</span></p>
                          </div>
                          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-background border border-white/10">
                            <span className={`font-bold ${summary.percentage > 70 ? 'text-green-500' : summary.percentage > 50 ? 'text-yellow-500' : 'text-red-500'}`}>
                              {summary.percentage}%
                            </span>
                          </div>
                          <CollapsibleTrigger onClick={() => toggleStudentExpand(summary.studentId)} className="ml-2">
                            {expandedStudents[summary.studentId] ? (
                              <ChevronUp className="h-5 w-5" />
                            ) : (
                              <ChevronDown className="h-5 w-5" />
                            )}
                          </CollapsibleTrigger>
                        </div>
                      </div>
                    </CardHeader>
                    <CollapsibleContent>
                      <CardContent className="pt-0 px-4 pb-4">
                        <div className="bg-background/50 p-3 rounded-md">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm font-medium">Attendance Rate</p>
                              <p className="text-2xl font-bold">{summary.percentage}%</p>
                              <p className="text-xs text-muted-foreground mt-1">
                                {summary.presentCount + summary.absentCount} total days recorded
                              </p>
                            </div>
                            <div>
                              <p className="text-sm font-medium">Details</p>
                              <div className="flex gap-4">
                                <div>
                                  <p className="text-xs text-muted-foreground">Present</p>
                                  <p className="text-lg font-semibold text-green-500">{summary.presentCount}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-muted-foreground">Absent</p>
                                  <p className="text-lg font-semibold text-red-500">{summary.absentCount}</p>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          {summary.note && (
                            <div className="mt-4 p-3 border border-white/10 rounded-md bg-background/30">
                              <p className="text-sm font-medium">Notes</p>
                              <p className="text-sm mt-1">{summary.note}</p>
                            </div>
                          )}
                          
                          {summary.lastUpdated && (
                            <p className="text-xs text-muted-foreground mt-4">
                              Last updated: {format(new Date(summary.lastUpdated), 'MMMM d, yyyy')}
                            </p>
                          )}
                        </div>
                      </CardContent>
                    </CollapsibleContent>
                  </Card>
                </Collapsible>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
