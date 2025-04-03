
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/auth-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

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
      
      // Then fetch the lectures
      const { data, error } = await supabase
        .from('classes')
        .select(`
          id,
          title,
          folder_id,
          created_at,
          classes_folders!inner (
            name
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

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-medium flex items-center">
          <BookOpen className="mr-2 h-4 w-4 text-primary" />
          My Lectures
        </CardTitle>
      </CardHeader>
      <CardContent>
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
            <div className="space-y-3">
              {displayedLectures?.map((lecture: any) => (
                <div key={lecture.id} className="flex justify-between items-center border-b pb-2 last:border-0 last:pb-0">
                  <div>
                    <div className="font-medium">{lecture.title}</div>
                    <div className="text-sm text-muted-foreground">
                      Folder: {lecture.classes_folders.name}
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {format(new Date(lecture.created_at), "MMM d, yyyy")}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="flex justify-between items-center mt-4">
              {lectures && lectures.length > 3 && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setShowAll(!showAll)}
                >
                  {showAll ? "Show Less" : `Show All (${lectures.length})`}
                </Button>
              )}
              <Button size="sm" onClick={navigateToLectures}>
                View All Lectures
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
