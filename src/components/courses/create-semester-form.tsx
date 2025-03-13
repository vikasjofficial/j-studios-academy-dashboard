
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calendar, CheckCircle2 } from "lucide-react";
import { format } from "date-fns";

const semesterSchema = z.object({
  name: z.string().min(3, "Semester name must be at least 3 characters"),
  start_date: z.string().min(1, "Start date is required"),
  end_date: z.string().min(1, "End date is required"),
});

type SemesterFormValues = z.infer<typeof semesterSchema>;

interface CreateSemesterFormProps {
  courseId: string;
  courseName: string;
  onSuccess: () => void;
}

export function CreateSemesterForm({ courseId, courseName, onSuccess }: CreateSemesterFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();
  
  const form = useForm<SemesterFormValues>({
    resolver: zodResolver(semesterSchema),
    defaultValues: {
      name: "",
      start_date: format(new Date(), "yyyy-MM-dd"),
      end_date: format(new Date(new Date().setMonth(new Date().getMonth() + 4)), "yyyy-MM-dd"),
    }
  });

  // Helper function to create default topics for a semester
  const createDefaultTopics = async (semesterId: string) => {
    const topicNames = [
      "Introduction",
      "Fundamentals & Concepts",
      "Core Principles",
      "Applied Techniques",
      "Analysis & Methods",
      "Advanced Applications",
      "Case Studies",
      "Problem Solving",
      "Practical Workshop",
      "Final Project & Review"
    ];

    const topics = topicNames.map((name, index) => ({
      name,
      semester_id: semesterId,
      course_id: courseId,
      description: `Default topic ${index + 1} for the semester`,
      order: index + 1
    }));

    const { error } = await supabase.from("topics").insert(topics);
    if (error) throw error;
  };

  const createSemesterMutation = useMutation({
    mutationFn: async (semesterData: SemesterFormValues) => {
      // First, create the semester
      const { data: semester, error } = await supabase
        .from("semesters")
        .insert({
          name: semesterData.name,
          start_date: semesterData.start_date,
          end_date: semesterData.end_date,
          course_id: courseId,
          status: "active"
        })
        .select();
        
      if (error) throw error;
      
      // Then create default topics for this semester
      if (semester && semester.length > 0) {
        await createDefaultTopics(semester[0].id);
      }
      
      return semester;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["semesters", courseId] });
      queryClient.invalidateQueries({ queryKey: ["topics"] });
      toast.success("Semester created with 10 default topics");
      form.reset();
      onSuccess();
    },
    onError: (error) => {
      toast.error("Failed to create semester: " + error.message);
    },
    onSettled: () => {
      setIsSubmitting(false);
    }
  });

  const onSubmit = (data: SemesterFormValues) => {
    setIsSubmitting(true);
    createSemesterMutation.mutate(data);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Create New Semester for {courseName}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Semester Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Fall 2023" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="start_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="end_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="flex items-center gap-2"
            >
              <CheckCircle2 className="h-4 w-4" />
              Create Semester with Default Topics
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
