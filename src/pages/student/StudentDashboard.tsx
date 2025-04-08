
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
import { AttendanceSummaryWidget } from "@/components/dashboard/attendance-summary-widget";

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
            
            {/* Top row with attendance summary and semester progress */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-1">
                <AttendanceSummaryWidget />
              </div>
              <div className="md:col-span-1">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg font-medium flex items-center">
                      <GraduationCap className="mr-2 h-5 w-5 text-primary" />
                      Academic Progress
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pb-4">
                    <div className="space-y-4">
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Current Semester</span>
                          <span className="text-sm font-medium">Spring 2025</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Courses Enrolled</span>
                          <span className="text-sm font-medium">4</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
            
            {/* Move LecturesCard to the top section for better visibility */}
            <div className="w-full">
              <LecturesCard />
            </div>
            
            {/* Semester Progress Charts */}
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
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
