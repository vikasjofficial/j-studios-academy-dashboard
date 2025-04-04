
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GraduationCap, BookOpen } from "lucide-react";
import { StudentProfileCard } from "@/components/dashboard/student-profile-card";
import { useAuth } from "@/context/auth-context";
import { TasksCard } from "@/components/dashboard/tasks-card";
import { format } from "date-fns";
import { ExamsResultsCard } from "@/components/dashboard/exams-results-card";
import { LecturesCard } from "@/components/dashboard/lectures-card";
import { SemesterProgressChart } from "@/components/dashboard/semester-progress-chart";

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
          
          <div className="space-y-6">
            {/* Profile card now spans full width */}
            <div className="w-full">
              <StudentProfileCard />
            </div>
            
            {/* Semester Progress Chart */}
            <div className="w-full">
              <SemesterProgressChart />
            </div>
            
            {/* Other cards stacked below in a grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-1">
                <ExamsResultsCard />
              </div>
              <div className="md:col-span-2">
                <TasksCard />
              </div>
              <div className="md:col-span-3">
                <LecturesCard />
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
