
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GradebookViewStandalone } from "@/components/gradebook/gradebook-view-standalone";
import { BookOpen } from "lucide-react";
import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";

// Add global styles for the scrollbar
const scrollbarStyles = `
  .scrollbar-none {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
  
  .scrollbar-none::-webkit-scrollbar {
    display: none;
  }
`;

export default function GradebookManagement() {
  const queryClient = useQueryClient();

  // Refetch courses and data when component mounts
  useEffect(() => {
    queryClient.invalidateQueries({ queryKey: ["all-courses"] });
    queryClient.invalidateQueries({ queryKey: ["semesters"] });
    queryClient.invalidateQueries({ queryKey: ["topics"] });
  }, [queryClient]);

  return (
    <div className="space-y-6 max-w-full overflow-hidden">
      {/* Add styles for hiding scrollbars */}
      <style>{scrollbarStyles}</style>
      
      <Card className="bg-muted/50 overflow-hidden w-full">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-xl">
            <BookOpen className="h-5 w-5 text-primary" />
            Gradebook Management
          </CardTitle>
        </CardHeader>
        <CardContent className="w-full overflow-hidden">
          <p className="text-muted-foreground mb-6">
            View and manage student grades for all courses. As an admin, you can edit and save grades directly.
          </p>
          
          <div className="w-full overflow-hidden">
            <GradebookViewStandalone />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
