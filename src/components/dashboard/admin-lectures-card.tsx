
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, CircleCheck } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Progress } from "@/components/ui/progress";
import { calculateAverageProgress } from "@/components/lectures/utils/lectureUtils";

export function AdminLecturesCard() {
  const navigate = useNavigate();
  const [showAll, setShowAll] = useState(false);
  
  // Fetch lectures
  const { data: lectureData, isLoading } = useQuery({
    queryKey: ["admin-dashboard-lectures"],
    queryFn: async () => {
      // First fetch folders
      const { data: folders, error: foldersError } = await supabase
        .from('classes_folders')
        .select('id, name')
        .order('name');
      
      if (foldersError) throw foldersError;
      
      if (!folders || folders.length === 0) return { folders: [], lectures: [] };
      
      // Then fetch lectures for each folder with their topics
      const folderPromises = folders.map(async (folder) => {
        const { data: lectures, error: lecturesError } = await supabase
          .from('classes')
          .select(`
            id, 
            title, 
            created_at,
            classes_topics (
              id,
              completed
            )
          `)
          .eq('folder_id', folder.id)
          .order('created_at', { ascending: false });
        
        if (lecturesError) throw lecturesError;
        
        return {
          ...folder,
          lectures: lectures || []
        };
      });
      
      const foldersWithLectures = await Promise.all(folderPromises);
      
      // Get all lectures for calculating overall progress
      const allLectures = foldersWithLectures.flatMap(folder => 
        folder.lectures.map(lecture => ({
          ...lecture,
          folder_name: folder.name
        }))
      );
      
      return { 
        folders: foldersWithLectures,
        lectures: allLectures
      };
    }
  });

  const folders = lectureData?.folders || [];
  const lectures = lectureData?.lectures || [];
  const displayedFolders = showAll ? folders : folders.slice(0, 3);
  
  const navigateToLectures = () => {
    navigate("/admin/lectures");
  };

  // Calculate overall average progress
  const overallProgress = calculateAverageProgress(lectures);

  // Calculate progress for a folder
  const calculateFolderProgress = (folderLectures: any[]) => {
    if (!folderLectures || folderLectures.length === 0) return 0;
    
    return calculateAverageProgress(folderLectures);
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <CardTitle className="text-base font-medium flex items-center">
            <BookOpen className="mr-2 h-4 w-4 text-primary" />
            Lectures Overview
          </CardTitle>
          {!isLoading && lectures.length > 0 && (
            <div className="flex items-center text-sm text-muted-foreground">
              <CircleCheck className={`mr-1 h-4 w-4 ${overallProgress === 100 ? "text-green-500" : "text-primary"}`} />
              <span>{overallProgress}% average completion</span>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center py-6">
            <div className="h-5 w-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : lectures.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            No lectures created yet.
          </div>
        ) : (
          <>
            {/* Add overall progress bar at the top */}
            <div className="mb-4">
              <Progress 
                value={overallProgress} 
                className="h-2" 
                indicatorClassName={overallProgress === 100 ? "bg-green-500" : undefined}
              />
            </div>
            
            <div className="space-y-4">
              {displayedFolders.map((folder) => (
                <div key={folder.id} className="border-b pb-3 last:border-0 last:pb-0">
                  <div className="flex justify-between items-center mb-2">
                    <div className="font-medium">{folder.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {folder.lectures.length} lectures
                    </div>
                  </div>
                  
                  {folder.lectures.length > 0 && (
                    <div className="mb-2">
                      <div className="flex justify-between text-xs text-muted-foreground mb-1">
                        <span>Folder Progress</span>
                        <span>{calculateFolderProgress(folder.lectures)}%</span>
                      </div>
                      <Progress 
                        value={calculateFolderProgress(folder.lectures)} 
                        className="h-2" 
                        indicatorClassName={calculateFolderProgress(folder.lectures) === 100 ? "bg-green-500" : undefined}
                      />
                    </div>
                  )}
                  
                  {folder.lectures.slice(0, 2).map((lecture: any) => (
                    <div key={lecture.id} className="text-sm ml-2 mt-2 text-muted-foreground">
                      {lecture.title} ({format(new Date(lecture.created_at), "MMM d")})
                    </div>
                  ))}
                  
                  {folder.lectures.length > 2 && (
                    <div className="text-xs mt-1 ml-2 text-primary">
                      +{folder.lectures.length - 2} more lectures
                    </div>
                  )}
                </div>
              ))}
            </div>
            
            <div className="flex justify-between items-center mt-4">
              {folders.length > 3 && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setShowAll(!showAll)}
                >
                  {showAll ? "Show Less" : `Show All Folders (${folders.length})`}
                </Button>
              )}
              <Button size="sm" onClick={navigateToLectures}>
                Manage Lectures
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
