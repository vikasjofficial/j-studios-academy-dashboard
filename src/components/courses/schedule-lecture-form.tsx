
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
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
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, CheckCircle2, Clock, X } from "lucide-react";

const lectureSchema = z.object({
  title: z.string().min(3, "Lecture title must be at least 3 characters"),
  topic_id: z.string().min(1, "Topic is required"),
  date: z.string().min(1, "Date is required"),
  time: z.string().min(1, "Time is required"),
  duration: z.string().min(1, "Duration is required"),
  location: z.string().optional(),
  notes: z.string().optional(),
});

type LectureFormValues = z.infer<typeof lectureSchema>;

interface ScheduleLectureFormProps {
  courseId: string;
  semesterId: string;
  semesterName: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export function ScheduleLectureForm({ 
  courseId, 
  semesterId, 
  semesterName, 
  onSuccess, 
  onCancel 
}: ScheduleLectureFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();
  
  // Fetch topics for the semester
  const { data: topics } = useQuery({
    queryKey: ["topics", semesterId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("topics")
        .select("*")
        .eq("semester_id", semesterId)
        .order("order_id"); // Changed from order to order_id
        
      if (error) throw error;
      return data;
    },
  });
  
  const form = useForm<LectureFormValues>({
    resolver: zodResolver(lectureSchema),
    defaultValues: {
      title: "",
      topic_id: "",
      date: format(new Date(), "yyyy-MM-dd"),
      time: "09:00",
      duration: "01:00",
      location: "",
      notes: "",
    }
  });

  const scheduleLectureMutation = useMutation({
    mutationFn: async (data: LectureFormValues) => {
      // Find the topic to get its name for the event title
      const topic = topics?.find(t => t.id === data.topic_id);
      
      // First, create the lecture
      const { data: lecture, error } = await supabase
        .from("lectures")
        .insert({
          title: data.title,
          topic_id: data.topic_id,
          course_id: courseId,
          semester_id: semesterId,
          date: data.date,
          time: data.time,
          duration: data.duration,
          location: data.location || null,
          notes: data.notes || null,
        })
        .select();
        
      if (error) throw error;
      
      // Then create a calendar event for this lecture
      const eventDate = new Date(`${data.date}T${data.time}`);
      
      const { error: eventError } = await supabase
        .from("calendar_events")
        .insert({
          title: data.title,
          date: data.date,
          time: data.time,
          type: "lecture",
          course_id: courseId,
          related_id: lecture?.[0]?.id,
          description: `Topic: ${topic?.name || 'N/A'}\nLocation: ${data.location || 'TBD'}`
        });
        
      if (eventError) throw eventError;
      
      return lecture;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["topics", semesterId] });
      queryClient.invalidateQueries({ queryKey: ["lectures"] });
      queryClient.invalidateQueries({ queryKey: ["lecture-count"] });
      queryClient.invalidateQueries({ queryKey: ["calendar-events"] });
      toast.success("Lecture scheduled successfully");
      form.reset();
      onSuccess();
    },
    onError: (error) => {
      toast.error("Failed to schedule lecture: " + error.message);
    },
    onSettled: () => {
      setIsSubmitting(false);
    }
  });

  const onSubmit = (data: LectureFormValues) => {
    setIsSubmitting(true);
    scheduleLectureMutation.mutate(data);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Schedule Lecture for {semesterName}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Lecture Title</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Introduction to Key Concepts" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="topic_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Topic</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a topic" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {topics?.map(topic => (
                          <SelectItem key={topic.id} value={topic.id}>
                            {topic.order_id}. {topic.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Time</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="duration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Duration (HH:MM)</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Room 101, Building A" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes (Optional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Any additional information about this lecture" 
                      className="resize-none" 
                      rows={3}
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button 
          variant="outline" 
          onClick={onCancel}
          className="flex items-center gap-2"
        >
          <X className="h-4 w-4" />
          Cancel
        </Button>
        <Button 
          onClick={form.handleSubmit(onSubmit)}
          disabled={isSubmitting}
          className="flex items-center gap-2"
        >
          <Clock className="h-4 w-4" />
          Schedule Lecture
        </Button>
      </CardFooter>
    </Card>
  );
}
