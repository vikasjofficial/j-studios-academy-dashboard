
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { X, Check } from "lucide-react";

interface Student {
  id: string;
  name: string;
  email: string;
  student_id: string;
  grade?: string;
  phone?: string;
  created_at: string;
}

interface Course {
  id: string;
  name: string;
  code: string;
}

interface StudentEnrollment {
  course_id: string;
  student_id: string;
}

interface EditStudentFormProps {
  student: Student;
  onSuccess: () => void;
}

const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  student_id: z.string().min(1, { message: "Student ID is required." }),
  phone: z.string().optional(),
  grade: z.string().optional(),
  selectedCourses: z.array(z.string()).optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function EditStudentForm({ student, onSuccess }: EditStudentFormProps) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [studentEnrollments, setStudentEnrollments] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: student.name,
      email: student.email,
      student_id: student.student_id,
      phone: student.phone || '',
      grade: student.grade || '',
      selectedCourses: [],
    },
  });

  useEffect(() => {
    fetchCourses();
    fetchStudentEnrollments();
  }, [student.id]);

  async function fetchCourses() {
    try {
      const { data, error } = await supabase
        .from('courses')
        .select('id, name, code')
        .order('name', { ascending: true });

      if (error) throw error;
      setCourses(data || []);
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  }

  async function fetchStudentEnrollments() {
    try {
      const { data, error } = await supabase
        .from('enrollments')
        .select('course_id')
        .eq('student_id', student.id);

      if (error) throw error;
      
      const enrolledCourseIds = (data || []).map(enrollment => enrollment.course_id);
      setStudentEnrollments(enrolledCourseIds);
      form.setValue('selectedCourses', enrolledCourseIds);
    } catch (error) {
      console.error('Error fetching student enrollments:', error);
    }
  }

  async function onSubmit(values: FormValues) {
    setIsSubmitting(true);
    
    try {
      // Update student information
      const { error: updateError } = await supabase
        .from('students')
        .update({
          name: values.name,
          email: values.email,
          student_id: values.student_id,
          phone: values.phone,
          grade: values.grade,
          updated_at: new Date().toISOString(),
        })
        .eq('id', student.id);

      if (updateError) throw updateError;

      // Handle course enrollments
      const selectedCourses = values.selectedCourses || [];
      
      // Delete enrollments that are no longer selected
      for (const existingCourseId of studentEnrollments) {
        if (!selectedCourses.includes(existingCourseId)) {
          const { error: deleteError } = await supabase
            .from('enrollments')
            .delete()
            .eq('student_id', student.id)
            .eq('course_id', existingCourseId);
            
          if (deleteError) throw deleteError;
        }
      }
      
      // Add new enrollments
      for (const courseId of selectedCourses) {
        if (!studentEnrollments.includes(courseId)) {
          const { error: insertError } = await supabase
            .from('enrollments')
            .insert({
              student_id: student.id,
              course_id: courseId,
              enrollment_date: new Date().toISOString().split('T')[0],
              status: 'active'
            });
            
          if (insertError) throw insertError;
        }
      }

      onSuccess();
    } catch (error) {
      console.error('Error updating student:', error);
      toast({
        title: "Error",
        description: "Failed to update student information. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  const toggleCourseSelection = (courseId: string) => {
    const currentSelections = form.getValues('selectedCourses') || [];
    
    if (currentSelections.includes(courseId)) {
      form.setValue('selectedCourses', currentSelections.filter(id => id !== courseId));
    } else {
      form.setValue('selectedCourses', [...currentSelections, courseId]);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full Name</FormLabel>
                <FormControl>
                  <Input placeholder="Student's full name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="Email address" type="email" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="student_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Student ID</FormLabel>
                <FormControl>
                  <Input placeholder="Student ID" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone Number</FormLabel>
                <FormControl>
                  <Input placeholder="Phone number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="grade"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Grade</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a grade" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Elementary 1">Elementary 1</SelectItem>
                    <SelectItem value="Elementary 2">Elementary 2</SelectItem>
                    <SelectItem value="Elementary 3">Elementary 3</SelectItem>
                    <SelectItem value="Middle School 1">Middle School 1</SelectItem>
                    <SelectItem value="Middle School 2">Middle School 2</SelectItem>
                    <SelectItem value="High School 1">High School 1</SelectItem>
                    <SelectItem value="High School 2">High School 2</SelectItem>
                    <SelectItem value="High School 3">High School 3</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Enrolled Courses</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {courses.map((course) => {
              const selectedCourses = form.getValues('selectedCourses') || [];
              const isSelected = selectedCourses.includes(course.id);
              
              return (
                <div key={course.id} className="flex items-start space-x-2">
                  <Button
                    type="button"
                    variant={isSelected ? "default" : "outline"}
                    size="sm"
                    className="h-8 px-2 gap-1"
                    onClick={() => toggleCourseSelection(course.id)}
                  >
                    {isSelected ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <X className="h-4 w-4" />
                    )}
                    <span className="text-xs">{isSelected ? "Enrolled" : "Not Enrolled"}</span>
                  </Button>
                  <div className="text-sm">
                    <div className="font-medium">{course.name}</div>
                    <div className="text-xs text-muted-foreground">{course.code}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        
        <div className="flex justify-end space-x-2">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
