import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GraduationCap, BookOpen, MessageSquare } from "lucide-react";
import { StudentProfileCard } from "@/components/dashboard/student-profile-card";
import { useAuth } from "@/context/auth-context";
import { TasksCard } from "@/components/dashboard/tasks-card";
import { format } from "date-fns";
import { ExamsResultsCard } from "@/components/dashboard/exams-results-card";
import { LecturesCard } from "@/components/dashboard/lectures-card";
import { SemesterProgressChart } from "@/components/dashboard/semester-progress-chart";
import { AttendanceSummaryWidget } from "@/components/dashboard/attendance-summary-widget";
import { SocialProfilesCard } from "@/components/dashboard/social-profiles-card";
import { Button } from "@/components/ui/button";
// Remove Piano import
// import { Piano } from "@/components/piano/Piano";

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
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <h1 className="text-3xl font-bold tracking-tight">
              {isLoading 
                ? "Loading..." 
                : `Welcome, ${student?.name.split(' ')[0] || 'Student'}`
              }
            </h1>
            
            <div className="flex gap-3">
              {/* Discord Button */}
              <a href="https://discord.com/channels/693970373540315228" target="_blank" rel="noopener noreferrer">
                <Button variant="outline" className="bg-[#5865F2] hover:bg-[#4752C4] text-white border-[#5865F2]">
                  <svg 
                    className="w-5 h-5 mr-2" 
                    fill="currentColor" 
                    role="img" 
                    viewBox="0 0 24 24" 
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z" />
                  </svg>
                  Discord
                </Button>
              </a>
              
              {/* WhatsApp Button */}
              <a href="https://wa.me/8390775227" target="_blank" rel="noopener noreferrer">
                <Button variant="outline" className="bg-[#25D366] hover:bg-[#128C7E] text-white border-[#25D366]">
                  <svg 
                    className="w-5 h-5 mr-2" 
                    fill="currentColor" 
                    role="img" 
                    viewBox="0 0 24 24" 
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                  </svg>
                  WhatsApp
                </Button>
              </a>
            </div>
          </div>
          
          <p className="text-muted-foreground">
            Here's an overview of your academic progress and upcoming activities.
          </p>
          
          <div className="space-y-6">
            {/* Profile card now spans full width */}
            <div className="w-full">
              <StudentProfileCard />
            </div>
            
            {/* Add Social Profiles Card above Tasks Card */}
            <div className="w-full">
              <SocialProfilesCard />
            </div>
            
            {/* Tasks Card */}
            <div className="w-full">
              <TasksCard />
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
                {/* Remove the TasksCard from here as we moved it above */}
              </div>
            </div>
            
            {/* Remove Piano section */}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
