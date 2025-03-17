
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, GraduationCap, BookOpen } from "lucide-react";
import { StudentProfileCard } from "@/components/dashboard/student-profile-card";
import { useAuth } from "@/context/auth-context";
import { TasksCard } from "@/components/dashboard/tasks-card";
import { CalendarCard } from "@/components/dashboard/calendar-card";
import { format } from "date-fns";
import { ExamsResultsCard } from "@/components/dashboard/exams-results-card";

export default function StudentDashboard() {
  const { user } = useAuth();

  // Fetch student data
  const { data: student, isLoading } = useQuery({
    queryKey: ["student", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .from("students")
        .select("*")
        .eq("id", user.id)
        .single();
        
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  // Fetch upcoming classes/exams
  const { data: upcomingEvents } = useQuery({
    queryKey: ["student-upcoming-events", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const today = new Date();
      const { data, error } = await supabase
        .from("calendar_events")
        .select("*")
        .gte("date", format(today, "yyyy-MM-dd"))
        .order("date", { ascending: true })
        .limit(5);
        
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  return (
    <DashboardLayout>
      <div className="flex flex-col w-full">
        <div className="space-y-8 p-4 md:p-6 flex-1">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {isLoading 
                ? "Loading..." 
                : `Welcome, ${student?.name.split(' ')[0] || 'Student'}`
              }
            </h1>
            <p className="text-muted-foreground">
              Here's an overview of your academic progress and upcoming activities.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="col-span-1 space-y-6">
              <StudentProfileCard />
              <ExamsResultsCard />
            </div>
            
            <div className="md:col-span-2 space-y-6">
              <TasksCard />
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base font-medium flex items-center">
                      <Calendar className="mr-2 h-4 w-4 text-primary" />
                      Upcoming
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {upcomingEvents && upcomingEvents.length > 0 ? (
                      <div className="space-y-3">
                        {upcomingEvents.map((event) => (
                          <div key={event.id} className="flex justify-between items-center border-b pb-2 last:border-0 last:pb-0">
                            <div>
                              <div className="font-medium">{event.title}</div>
                              <div className="text-sm text-muted-foreground">
                                {format(new Date(event.date), "EEEE, MMM d")} at {event.time || "N/A"}
                              </div>
                            </div>
                            <div className="capitalize text-xs px-2 py-1 bg-muted rounded-full">
                              {event.type}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-3 text-sm text-muted-foreground">
                        No upcoming events.
                      </div>
                    )}
                  </CardContent>
                </Card>
                
                <CalendarCard />
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
