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
import { Check, X, Save, Upload, Trash2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import StudentCredentialsForm from './student-credentials-form';
import StudentCredentialsView from './student-credentials-view';
import { StudentMessagesTab } from './student-messages-tab';
import { StudentFeesTab } from './student-fees-tab';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";

interface Student {
  id: string;
  name: string;
  email: string;
  student_id: string;
  grade?: string;
  phone?: string;
  avatar_url?: string;
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
  selectedCourses: z.array(z.string()).default([]),
});

type FormValues = z.infer<typeof formSchema>;

export default function EditStudentForm({ student, onSuccess }: EditStudentFormProps) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [studentEnrollments, setStudentEnrollments] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(student.avatar_url || null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
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

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "Error",
          description: "File size too large. Maximum size is 5MB.",
          variant: "destructive"
        });
        return;
      }
      
      setAvatarFile(file);
      const imageUrl = URL.createObjectURL(file);
      setAvatarUrl(imageUrl);
    }
  };

  const removeAvatar = async () => {
    if (confirm("Are you sure you want to remove the profile picture?")) {
      try {
        setIsUploading(true);
        if (student.avatar_url) {
          const path = student.avatar_url.split('/').slice(-1)[0];
          const { error } = await supabase.storage.from('student_avatars').remove([path]);
          if (error) throw error;
        }
        
        const { error: updateError } = await supabase
          .from('students')
          .update({ avatar_url: null })
          .eq('id', student.id);
          
        if (updateError) throw updateError;
        
        setAvatarUrl(null);
        setAvatarFile(null);
        
        toast({
          title: "Success",
          description: "Profile picture removed successfully",
        });
      } catch (error) {
        console.error('Error removing avatar:', error);
        toast({
          title: "Error",
          description: "Failed to remove profile picture",
          variant: "destructive"
        });
      } finally {
        setIsUploading(false);
      }
    }
  };

  async function uploadAvatar() {
    if (!avatarFile) return null;
    
    try {
      setIsUploading(true);
      
      const fileExt = avatarFile.name.split('.').pop();
      const fileName = `${student.id}_${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      
      const { data, error } = await supabase.storage
        .from('student_avatars')
        .upload(fileName, avatarFile, {
          cacheControl: '3600',
          upsert: false
        });
        
      if (error) throw error;
      
      const { data: { publicUrl } } = supabase.storage
        .from('student_avatars')
        .getPublicUrl(fileName);
        
      return publicUrl;
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast({
        title: "Error",
        description: "Failed to upload profile picture",
        variant: "destructive"
      });
      return null;
    } finally {
      setIsUploading(false);
    }
  }

  async function onSubmit(values: FormValues) {
    setIsSubmitting(true);
    console.log("Form values on submit:", values);
    
    try {
      let avatarPublicUrl = student.avatar_url;
      if (avatarFile) {
        avatarPublicUrl = await uploadAvatar();
      }
      
      const { error: updateError } = await supabase
        .from('students')
        .update({
          name: values.name,
          email: values.email,
          student_id: values.student_id,
          phone: values.phone,
          grade: values.grade,
          avatar_url: avatarPublicUrl,
          updated_at: new Date().toISOString(),
        })
        .eq('id', student.id);

      if (updateError) throw updateError;

      const selectedCourses = values.selectedCourses || [];
      console.log("Selected courses:", selectedCourses);
      console.log("Existing enrollments:", studentEnrollments);
      
      for (const existingCourseId of studentEnrollments) {
        if (!selectedCourses.includes(existingCourseId)) {
          console.log("Removing enrollment for course:", existingCourseId);
          const { error: deleteError } = await supabase
            .from('enrollments')
            .delete()
            .eq('student_id', student.id)
            .eq('course_id', existingCourseId);
            
          if (deleteError) {
            console.error("Error removing enrollment:", deleteError);
            throw deleteError;
          }
        }
      }
      
      for (const courseId of selectedCourses) {
        if (!studentEnrollments.includes(courseId)) {
          console.log("Adding enrollment for course:", courseId);
          const { error: insertError } = await supabase
            .from('enrollments')
            .insert({
              student_id: student.id,
              course_id: courseId,
              enrollment_date: new Date().toISOString().split('T')[0],
              status: 'active'
            });
            
          if (insertError) {
            console.error("Error adding enrollment:", insertError);
            throw insertError;
          }
        }
      }

      fetchStudentEnrollments();

      onSuccess();
      toast({
        title: "Success",
        description: "Student information updated successfully",
      });
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
    const currentValues = form.getValues('selectedCourses') || [];
    console.log("Current selected courses:", currentValues);
    
    let updatedValues: string[];
    if (currentValues.includes(courseId)) {
      updatedValues = currentValues.filter(id => id !== courseId);
    } else {
      updatedValues = [...currentValues, courseId];
    }
    
    console.log("Updated selected courses:", updatedValues);
    form.setValue('selectedCourses', updatedValues, { shouldDirty: true, shouldTouch: true });
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase();
  };

  return (
    <Tabs defaultValue="details" className="w-full">
      <TabsList className="mb-4 w-full md:w-auto">
        <TabsTrigger value="details">Student Details</TabsTrigger>
        <TabsTrigger value="fees">Fees & Payments</TabsTrigger>
        <TabsTrigger value="credentials">Login Credentials</TabsTrigger>
        <TabsTrigger value="messages">Messages</TabsTrigger>
      </TabsList>
      
      <TabsContent value="details">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="flex flex-col items-center mb-6">
              <div className="mb-4">
                <Avatar className="w-24 h-24 border-4 border-background">
                  <AvatarImage src={avatarUrl || undefined} alt={student.name} />
                  <AvatarFallback className="text-xl bg-primary/20">
                    {getInitials(student.name)}
                  </AvatarFallback>
                </Avatar>
              </div>
              
              <div className="flex flex-wrap gap-2 justify-center">
                <label htmlFor="avatar-upload" className="cursor-pointer">
                  <div className="flex items-center gap-1 bg-secondary text-secondary-foreground hover:bg-secondary/80 px-4 py-2 rounded-md text-sm">
                    <Upload className="h-4 w-4" />
                    Upload Photo
                  </div>
                  <input 
                    id="avatar-upload" 
                    type="file" 
                    className="hidden" 
                    accept="image/*"
                    onChange={handleAvatarChange}
                    disabled={isUploading}
                  />
                </label>
                
                {avatarUrl && (
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm"
                    onClick={removeAvatar}
                    disabled={isUploading}
                    className="flex items-center gap-1"
                  >
                    <Trash2 className="h-4 w-4" />
                    Remove
                  </Button>
                )}
              </div>
            </div>
            
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
                        <SelectItem value="Intermediate Level">Intermediate Level</SelectItem>
                        <SelectItem value="Progressive Level">Progressive Level</SelectItem>
                        <SelectItem value="Advance Level">Advance Level</SelectItem>
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
                    <div key={course.id} className="flex items-center space-x-2 border p-3 rounded-md">
                      <Checkbox 
                        id={`course-${course.id}`}
                        checked={isSelected}
                        onCheckedChange={() => toggleCourseSelection(course.id)}
                      />
                      <label
                        htmlFor={`course-${course.id}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                      >
                        <div className="font-medium">{course.name}</div>
                        <div className="text-xs text-muted-foreground">{course.code}</div>
                      </label>
                    </div>
                  );
                })}
              </div>
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button 
                type="submit" 
                disabled={isSubmitting || isUploading} 
                className="flex items-center gap-2"
              >
                {isSubmitting || isUploading ? (
                  <>
                    <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </TabsContent>
      
      <TabsContent value="fees">
        <StudentFeesTab studentId={student.id} studentName={student.name} />
      </TabsContent>
      
      <TabsContent value="credentials">
        <div className="space-y-6">
          <StudentCredentialsView studentId={student.id} />
          <StudentCredentialsForm student={student} />
        </div>
      </TabsContent>
      
      <TabsContent value="messages">
        <StudentMessagesTab studentId={student.id} studentName={student.name} />
      </TabsContent>
    </Tabs>
  );
}
