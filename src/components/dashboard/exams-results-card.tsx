
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/auth-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Star, Calendar } from "lucide-react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export function ExamsResultsCard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Fetch recent exam results for the student
  const { data: examResults, isLoading } = useQuery({
    queryKey: ["student-recent-exam-results", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from("exam_assignments")
        .select(`
          id,
          status,
          assigned_at,
          exams:exam_id (
            id,
            name,
            exam_type
          ),
          exam_results (
            id,
            total_score,
            completed_at,
            view_results
          )
        `)
        .eq("student_id", user.id)
        .eq("status", "completed")
        .order("assigned_at", { ascending: false })
        .limit(3);
        
      if (error) throw error;
      
      // Filter to only include results that are visible to students
      return data.filter(item => 
        item.exam_results && 
        item.exam_results.length > 0 && 
        item.exam_results[0].view_results
      );
    },
    enabled: !!user?.id,
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-medium flex items-center">
            <BookOpen className="mr-2 h-4 w-4 text-primary" />
            Recent Exam Results
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center py-4">
            <div className="animate-pulse h-5 w-5 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-medium flex items-center">
          <BookOpen className="mr-2 h-4 w-4 text-primary" />
          Recent Exam Results
        </CardTitle>
      </CardHeader>
      <CardContent>
        {examResults && examResults.length > 0 ? (
          <div className="space-y-3">
            {examResults.map((result) => (
              <div key={result.id} className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0">
                <div>
                  <div className="font-medium">{result.exams?.name}</div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Badge variant="outline" className="capitalize text-xs">
                      {result.exams?.exam_type}
                    </Badge>
                    {result.exam_results?.[0]?.completed_at && (
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {format(new Date(result.exam_results[0].completed_at), "MMM d")}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1 bg-primary/10 text-primary px-2 py-1 rounded-full">
                    <Star className="h-3 w-3" />
                    <span className="font-medium">{result.exam_results?.[0]?.total_score || "-"}</span>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => navigate(`/student/exams/${result.id}`)}
                  >
                    View
                  </Button>
                </div>
              </div>
            ))}
            
            <div className="pt-2">
              <Button 
                variant="ghost" 
                className="text-primary w-full justify-center"
                onClick={() => navigate("/student/exams")}
              >
                View All Results
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center py-3 text-sm text-muted-foreground">
            No exam results available yet.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
