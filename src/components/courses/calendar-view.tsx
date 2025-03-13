
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { CalendarCard } from "@/components/dashboard/calendar-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "lucide-react";

interface CalendarViewProps {
  courseId: string;
}

export function CalendarView({ courseId }: CalendarViewProps) {
  const { data: events, isLoading } = useQuery({
    queryKey: ["calendar-events", courseId],
    queryFn: async () => {
      // We need to explicitly type the response to avoid TypeScript errors
      const { data, error } = await supabase
        .from("calendar_events")
        .select("*")
        .eq("course_id", courseId)
        .order("date", { ascending: true });
        
      if (error) throw error;
      
      return data.map(event => ({
        id: event.id,
        title: event.title,
        date: event.date,
        time: event.time,
        // Ensure the type is correctly mapped to one of the expected values
        type: mapEventType(event.type)
      }));
    },
  });

  // Function to map database event types to the expected enum values
  const mapEventType = (typeFromDb: string): "lecture" | "assignment" | "exam" => {
    const normalizedType = typeFromDb.toLowerCase();
    
    if (normalizedType.includes("lecture")) return "lecture";
    if (normalizedType.includes("assignment")) return "assignment";
    if (normalizedType.includes("exam")) return "exam";
    
    // Default to "lecture" if the type doesn't match any expected values
    return "lecture";
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Course Calendar
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-24 flex items-center justify-center">
            <p className="text-sm text-muted-foreground">Loading calendar events...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6">
      <CalendarCard 
        title="Course Schedule" 
        events={events || []} 
      />
    </div>
  );
}
