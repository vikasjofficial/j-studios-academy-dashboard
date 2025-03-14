
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Form, FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { 
  Check, X, UserCheck, Calendar, Loader2, ChevronDown, ChevronUp, 
  CalendarDays, Users, BookCheck 
} from 'lucide-react';
import { format } from 'date-fns';
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Dialog, DialogContent, DialogTitle, DialogHeader } from "@/components/ui/dialog";

interface Student {
  id: string;
  name: string;
  student_id: string;
  email: string;
}

interface Attendance {
  id: string;
  student_id: string;
  course_id: string;
  date: string;
  status: 'present' | 'absent' | 'none';
  note?: string;
}

interface Course {
  id: string;
  name: string;
  code: string;
}

interface AttendanceRecord {
  id: string;
  date: string;
  status: 'present' | 'absent' | 'none';
  note?: string;
}

interface StudentAttendanceSummary {
  studentId: string;
  studentName: string;
  studentCode: string;
  records: AttendanceRecord[];
  present: number;
  absent: number;
  percentage: number;
}

const attendanceSchema = z.object({
  status: z.enum(['present', 'absent', 'none'], {
    required_error: "Please select an attendance status",
  }),
  note: z.string().optional(),
});

export default function AttendanceManagement() {
  const [students, setStudents] = useState<Student[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [formattedDate, setFormattedDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
  const [attendanceRecords, setAttendanceRecords] = useState<Record<string, Attendance>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [summaries, setSummaries] = useState<StudentAttendanceSummary[]>([]);
  const [expandedStudents, setExpandedStudents] = useState<Record<string, boolean>>({});
  const { toast } = useToast();

  // Fetch initial data
  useEffect(() => {
    fetchStudents();
    fetchCourses();
  }, []);
  
  // Update attendance records when date or course changes
  useEffect(() => {
    if (selectedCourse && formattedDate) {
      fetchAttendance();
    }
  }, [selectedCourse, formattedDate]);

  // Update formatted date when selected date changes
  useEffect(() => {
    if (selectedDate) {
      const formatted = format(selectedDate, 'yyyy-MM-dd');
      setFormattedDate(formatted);
    }
  }, [selectedDate]);

  // Fetch attendance summaries when course changes
  useEffect(() => {
    if (selectedCourse) {
      fetchAttendanceSummaries();
    }
  }, [selectedCourse]);

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
        .order('name');
        
      if (error) throw error;
      setCourses(data || []);
      if (data.length > 0 && !selectedCourse) {
        setSelectedCourse(data[0].id);
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

  const fetchAttendance = async () => {
    if (!selectedCourse || !formattedDate) return;
    
    setIsLoading(true);
    try {
      console.log(`Fetching attendance for course ${selectedCourse} on date ${formattedDate}`);
      const { data, error } = await supabase
        .from('attendance')
        .select('*')
        .eq('course_id', selectedCourse)
        .eq('date', formattedDate);
        
      if (error) throw error;
      
      console.log('Attendance data:', data);
      
      // Convert to a record for easier lookup
      const records: Record<string, Attendance> = {};
      data.forEach(record => {
        // Ensure status is one of the allowed values
        const status = ['present', 'absent', 'none'].includes(record.status) 
          ? record.status as 'present' | 'absent' | 'none'
          : 'none';
          
        records[record.student_id] = {
          ...record,
          status
        };
      });
      
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
    if (!selectedCourse) return;
    
    try {
      // Get all attendance records for this course
      const { data: attendanceData, error: attendanceError } = await supabase
        .from('attendance')
        .select('*')
        .eq('course_id', selectedCourse);
        
      if (attendanceError) throw attendanceError;
      
      // Process data to create student summaries
      const studentRecords: Record<string, StudentAttendanceSummary> = {};
      
      // Initialize with all students
      students.forEach(student => {
        studentRecords[student.id] = {
          studentId: student.id,
          studentName: student.name,
          studentCode: student.student_id,
          records: [],
          present: 0,
          absent: 0,
          percentage: 0
        };
      });
      
      // Add attendance records
      attendanceData.forEach(record => {
        if (studentRecords[record.student_id]) {
          studentRecords[record.student_id].records.push({
            id: record.id,
            date: record.date,
            status: record.status as 'present' | 'absent' | 'none',
            note: record.note
          });
          
          if (record.status === 'present') {
            studentRecords[record.student_id].present += 1;
          } else if (record.status === 'absent') {
            studentRecords[record.student_id].absent += 1;
          }
        }
      });
      
      // Calculate percentages
      Object.values(studentRecords).forEach(summary => {
        const total = summary.present + summary.absent;
        summary.percentage = total > 0 ? Math.round((summary.present / total) * 100) : 0;
        
        // Sort records by date (newest first)
        summary.records.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
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

  const saveAttendance = async (studentId: string, status: 'present' | 'absent' | 'none', note?: string) => {
    if (!selectedCourse || !formattedDate) return;
    
    setIsSaving(true);
    
    try {
      const existingRecord = attendanceRecords[studentId];
      
      console.log('Saving attendance:', {
        studentId,
        courseId: selectedCourse,
        date: formattedDate,
        status,
        note,
        existingRecord
      });
      
      if (existingRecord) {
        // Update existing record
        const { data, error } = await supabase
          .from('attendance')
          .update({ 
            status, 
            note: note || null
          })
          .eq('id', existingRecord.id);
          
        if (error) throw error;
        
        console.log('Updated attendance record:', data);
      } else {
        // Create new record
        const { data, error } = await supabase
          .from('attendance')
          .insert({
            student_id: studentId,
            course_id: selectedCourse,
            date: formattedDate,
            status,
            note: note || null
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
        status: record?.status || 'none',
        note: record?.note || '',
      },
    });

    const onSubmit = async (data: z.infer<typeof attendanceSchema>) => {
      await saveAttendance(studentId, data.status, data.note);
    };

    return (
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem className="space-y-1">
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className="flex space-x-2"
                  >
                    <FormItem className="flex items-center space-x-1 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="present" id={`present-${studentId}`} />
                      </FormControl>
                      <FormLabel htmlFor={`present-${studentId}`} className="cursor-pointer">
                        <Check className="h-4 w-4 text-green-500" />
                      </FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center space-x-1 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="absent" id={`absent-${studentId}`} />
                      </FormControl>
                      <FormLabel htmlFor={`absent-${studentId}`} className="cursor-pointer">
                        <X className="h-4 w-4 text-red-500" />
                      </FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center space-x-1 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="none" id={`none-${studentId}`} />
                      </FormControl>
                      <FormLabel htmlFor={`none-${studentId}`} className="cursor-pointer">
                        --
                      </FormLabel>
                    </FormItem>
                  </RadioGroup>
                </FormControl>
              </FormItem>
            )}
          />
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
        <p className="text-muted-foreground">Mark student attendance for courses</p>
      </div>
      
      <div className="flex flex-col md:flex-row gap-4">
        <Card className="flex-1">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <CalendarDays className="h-5 w-5 text-primary" />
              <span>Attendance Calendar</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label htmlFor="course" className="block text-sm font-medium mb-1">Course</label>
                <select
                  id="course"
                  className="w-full rounded-md border border-input bg-background px-3 py-2"
                  value={selectedCourse}
                  onChange={(e) => setSelectedCourse(e.target.value)}
                >
                  {courses.map((course) => (
                    <option key={course.id} value={course.id}>
                      {course.name} ({course.code})
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="flex items-end">
                <Button onClick={() => setDialogOpen(true)} className="w-full">
                  <Calendar className="mr-2 h-4 w-4" />
                  {formattedDate ? format(new Date(formattedDate), 'MMMM d, yyyy') : 'Select Date'}
                </Button>
              </div>
            </div>
            
            <Card className="bg-card/50 backdrop-blur-sm border border-white/10 mb-6">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  <span>Students for {formattedDate && format(new Date(formattedDate), 'MMMM d, yyyy')}</span>
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
                  <div className="space-y-4">
                    {students.map((student) => (
                      <Card key={student.id} className="bg-background/50">
                        <CardContent className="p-4">
                          <div className="flex flex-col sm:flex-row justify-between gap-4">
                            <div>
                              <h3 className="font-medium">{student.name}</h3>
                              <p className="text-sm text-muted-foreground">{student.student_id} • {student.email}</p>
                            </div>
                            <div className="min-w-[200px]">
                              <AttendanceForm studentId={student.id} />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
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
            <span>Attendance Records</span>
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
                            <p className="text-sm">Present: <span className="font-medium text-green-500">{summary.present}</span></p>
                            <p className="text-sm">Absent: <span className="font-medium text-red-500">{summary.absent}</span></p>
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
                        {summary.records.length === 0 ? (
                          <p className="text-sm text-muted-foreground">No records found</p>
                        ) : (
                          <div className="space-y-2">
                            {summary.records.map(record => (
                              <div key={record.id} className="flex justify-between items-center p-2 rounded-md bg-background/50">
                                <div className="flex items-center gap-2">
                                  {record.status === 'present' ? (
                                    <Check className="h-4 w-4 text-green-500" />
                                  ) : record.status === 'absent' ? (
                                    <X className="h-4 w-4 text-red-500" />
                                  ) : (
                                    <span className="h-4 w-4">--</span>
                                  )}
                                  <span>{format(new Date(record.date), 'MMMM d, yyyy')}</span>
                                </div>
                                {record.note && (
                                  <span className="text-sm text-muted-foreground">{record.note}</span>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </CollapsibleContent>
                  </Card>
                </Collapsible>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Calendar Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Select a date</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <CalendarComponent
              mode="single"
              selected={selectedDate}
              onSelect={(date) => {
                if (date) {
                  setSelectedDate(date);
                  setDialogOpen(false);
                }
              }}
              className="rounded-md border"
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
