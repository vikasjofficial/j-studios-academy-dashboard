
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { StudentExamsCard } from "@/components/exams/student-exams-card";
import DashboardLayout from "@/components/dashboard-layout";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/auth-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ExamStatus } from "@/components/exams/types";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { BookOpen, Clock, CheckCircle, X } from "lucide-react";

export default function StudentExams() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"upcoming" | "results">("upcoming");

  // Fetch completed exam results
  const { data: examResults, isLoading: resultsLoading } = useQuery({
    queryKey: ["student-exam-results", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from("exam_assignments")
        .select(`
          id,
          status,
          exam_id,
          assigned_at,
          due_date,
          exams:exam_id (
            id,
            name,
            description,
            exam_type,
            total_time_minutes
          ),
          exam_results (
            id,
            started_at,
            completed_at,
            total_score,
            teacher_notes,
            view_results
          )
        `)
        .eq("student_id", user.id)
        .eq("status", "completed")
        .order("assigned_at", { ascending: false });
        
      if (error) {
        console.error("Error fetching exam results:", error);
        return [];
      }
      
      return data;
    },
    enabled: !!user?.id && activeTab === "results",
  });

  const getStatusBadge = (status: ExamStatus) => {
    switch (status) {
      case "assigned":
        return <Badge variant="outline">Assigned</Badge>;
      case "in_progress":
        return <Badge variant="warning">In Progress</Badge>;
      case "completed":
        return <Badge variant="success">Completed</Badge>;
      case "expired":
        return <Badge variant="destructive">Expired</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getScoreDisplay = (result: any) => {
    if (!result.view_results) {
      return "Pending review";
    }
    
    return result.total_score !== null ? `${result.total_score}` : "Not scored yet";
  };

  return (
    <DashboardLayout>
      <div className="flex">
        {/* Responsive spacing div */}
        <div className="w-16 md:w-24 lg:w-28 shrink-0"></div>
        
        <div className="space-y-8 max-w-full overflow-x-hidden px-4 flex-1">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">My Exams</h1>
            <p className="text-muted-foreground">View and take your assigned exams.</p>
          </div>

          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "upcoming" | "results")}>
            <TabsList className="mb-6">
              <TabsTrigger value="upcoming">
                <BookOpen className="mr-2 h-4 w-4" />
                Upcoming Exams
              </TabsTrigger>
              <TabsTrigger value="results">
                <CheckCircle className="mr-2 h-4 w-4" />
                Exam Results
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="upcoming">
              <StudentExamsCard />
            </TabsContent>
            
            <TabsContent value="results">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <CheckCircle className="mr-2 h-5 w-5 text-primary" />
                    My Exam Results
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {resultsLoading ? (
                    <div className="flex justify-center py-8">
                      <div className="animate-spin h-8 w-8 border-2 border-current border-t-transparent rounded-full"></div>
                    </div>
                  ) : examResults && examResults.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Exam</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Completed On</TableHead>
                          <TableHead>Duration</TableHead>
                          <TableHead>Score</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {examResults.map((assignment) => {
                          const result = assignment.exam_results?.[0];
                          if (!result) return null;
                          
                          const startedAt = result.started_at ? new Date(result.started_at) : null;
                          const completedAt = result.completed_at ? new Date(result.completed_at) : null;
                          
                          let duration = "N/A";
                          if (startedAt && completedAt) {
                            const durationMs = completedAt.getTime() - startedAt.getTime();
                            const durationMin = Math.round(durationMs / 60000);
                            duration = `${durationMin} minutes`;
                          }
                          
                          return (
                            <TableRow key={assignment.id}>
                              <TableCell className="font-medium">
                                {assignment.exams?.name || "Unknown Exam"}
                              </TableCell>
                              <TableCell>
                                {assignment.exams?.exam_type.charAt(0).toUpperCase() + 
                                  assignment.exams?.exam_type.slice(1)}
                              </TableCell>
                              <TableCell>
                                {completedAt ? format(completedAt, "MMM d, yyyy h:mm a") : "N/A"}
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center">
                                  <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                                  {duration}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center">
                                  {result.view_results ? (
                                    result.total_score !== null ? (
                                      <CheckCircle className="mr-2 h-4 w-4 text-success" />
                                    ) : (
                                      <X className="mr-2 h-4 w-4 text-muted-foreground" />
                                    )
                                  ) : (
                                    <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                                  )}
                                  {getScoreDisplay(result)}
                                </div>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      You haven't completed any exams yet.
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </DashboardLayout>
  );
}
