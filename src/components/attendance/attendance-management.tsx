
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
import { Check, X, UserCheck, Calendar, Loader2 } from 'lucide-react';
import { format } from 'date-fns';

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
  const [selectedDate, setSelectedDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
  const [attendanceRecords, setAttendanceRecords] = useState<Record<string, Attendance>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchStudents();
    fetchCourses();
  }, []);
  
  useEffect(() => {
    if (selectedCourse && selectedDate) {
      fetchAttendance();
    }
  }, [selectedCourse, selectedDate]);

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
    if (!selectedCourse || !selectedDate) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('attendance')
        .select('*')
        .eq('course_id', selectedCourse)
        .eq('date', selectedDate);
        
      if (error) throw error;
      
      // Convert to a record for easier lookup
      const records: Record<string, Attendance> = {};
      data.forEach(record => {
        records[record.student_id] = record;
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

  const saveAttendance = async (studentId: string, status: 'present' | 'absent' | 'none', note?: string) => {
    if (!selectedCourse || !selectedDate) return;
    
    setIsSaving(true);
    
    try {
      const existingRecord = attendanceRecords[studentId];
      
      if (existingRecord) {
        // Update existing record
        const { error } = await supabase
          .from('attendance')
          .update({ 
            status, 
            note: note || null
          })
          .eq('id', existingRecord.id);
          
        if (error) throw error;
      } else {
        // Create new record
        const { error } = await supabase
          .from('attendance')
          .insert({
            student_id: studentId,
            course_id: selectedCourse,
            date: selectedDate,
            status,
            note: note || null
          });
          
        if (error) throw error;
      }
      
      // Update local state
      fetchAttendance();
      
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
                    onChange={(e) => {
                      field.onChange(e);
                      // Auto-save after typing stops
                      const timer = setTimeout(() => {
                        form.handleSubmit(onSubmit)();
                      }, 1000);
                      return () => clearTimeout(timer);
                    }}
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
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
        
        <div>
          <label htmlFor="date" className="block text-sm font-medium mb-1">Date</label>
          <Input
            id="date"
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
        </div>
      </div>
      
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <UserCheck className="h-5 w-5 text-primary" />
            <span>Student Attendance</span>
            <span className="text-sm font-normal text-muted-foreground ml-2">
              {selectedDate && format(new Date(selectedDate), 'MMMM d, yyyy')}
            </span>
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
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead className="text-center">Attendance</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {students.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell className="font-medium">{student.student_id}</TableCell>
                    <TableCell>{student.name}</TableCell>
                    <TableCell>{student.email}</TableCell>
                    <TableCell>
                      <AttendanceForm studentId={student.id} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
