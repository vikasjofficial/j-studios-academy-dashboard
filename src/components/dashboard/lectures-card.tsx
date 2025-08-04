
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/auth-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, CircleCheck } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Progress } from "@/components/ui/progress";
import { calculateAverageProgress } from "@/components/lectures/utils/lectureUtils";

export function LecturesCard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showAll, setShowAll] = useState(false);
  
  // Fetch assigned lectures for the student
  const { data: lectures, isLoading } = useQuery({
    queryKey: ["student-lectures", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      // First get the lecture IDs assigned to the student
      const { data: assignments, error: assignmentsError } = await supabase
        .from('classes_assignments')
        .select("lecture_id")
        .eq("student_id", user.id);
      
      if (assignmentsError) throw assignmentsError;
      
      const lectureIds = assignments.map(a => a.lecture_id);
      if (lectureIds.length === 0) return [];
      
      // Then fetch the lectures with their topics for progress calculation
      const { data, error } = await supabase
        .from('classes')
        .select(`
          id,
          title,
          folder_id,
          created_at,
          classes_folders!inner (
            name
          ),
          classes_topics (
            id,
            completed
          )
        `)
        .in("id", lectureIds)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      
      return data;
    },
    enabled: !!user?.id,
  });

  const displayedLectures = showAll ? lectures : lectures?.slice(0, 3);
  
  const navigateToLectures = () => {
    navigate("/student/lectures");
  };

  // Calculate overall average progress
  const averageProgress = calculateAverageProgress(lectures || []);

  // Calculate progress percentage based on completed topics
  const calculateProgress = (lecture: any) => {
    if (!lecture.classes_topics || lecture.classes_topics.length === 0) {
      return 0;
    }
    
    const completedTopics = lecture.classes_topics.filter((topic: any) => topic.completed).length;
    return Math.round((completedTopics / lecture.classes_topics.length) * 100);
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3 flex-shrink-0">
        <div className="flex justify-between items-center">
          <CardTitle className="text-base font-medium flex items-center">
            <BookOpen className="mr-2 h-4 w-4 text-primary" />
            My Lectures
          </CardTitle>
          {!isLoading && lectures && lectures.length > 0 && (
            <div className="flex items-center text-sm text-muted-foreground">
              <CircleCheck className={`mr-1 h-4 w-4 ${averageProgress === 100 ? "text-green-500" : "text-primary"}`} />
              <span>{averageProgress}%</span>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center items-center py-6">
            <div className="h-5 w-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : !lectures || lectures.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            No lectures assigned yet.
          </div>
        ) : (
          <>
            {/* Overall progress bar */}
            <div className="mb-4 flex-shrink-0">
              <Progress 
                value={averageProgress} 
                className="h-2" 
                indicatorClassName={averageProgress === 100 ? "bg-green-500" : undefined}
              />
            </div>
            
            <div className="space-y-3 flex-1 overflow-y-auto">
              {displayedLectures?.slice(0, 4).map((lecture: any) => (
                <div key={lecture.id} className="border-b pb-2 last:border-0 last:pb-0">
                  <div className="flex justify-between items-center mb-1">
                    <div className="font-medium text-sm truncate">{lecture.title}</div>
                    <div className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                      {format(new Date(lecture.created_at), "MMM d")}
                    </div>
                  </div>
                  
                  <div className="text-xs text-muted-foreground mb-1 truncate">
                    {lecture.classes_folders.name}
                  </div>
                  
                  {lecture.classes_topics && lecture.classes_topics.length > 0 && (
                    <div className="mt-1">
                      <div className="flex justify-between text-xs text-muted-foreground mb-1">
                        <span>Progress</span>
                        <span>{calculateProgress(lecture)}%</span>
                      </div>
                      <Progress 
                        value={calculateProgress(lecture)} 
                        className="h-1" 
                        indicatorClassName={calculateProgress(lecture) === 100 ? "bg-green-500" : undefined}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
            
            <div className="flex-shrink-0 mt-4">
              <Button size="sm" onClick={navigateToLectures} className="w-full">
                View All
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
