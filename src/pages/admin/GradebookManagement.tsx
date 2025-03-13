
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GradebookViewStandalone } from "@/components/gradebook/gradebook-view-standalone";
import { BookOpen } from "lucide-react";
import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";

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
      <Card className="bg-card/50 border-border/40 shadow-sm overflow-hidden w-full">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-xl font-medium">
            <BookOpen className="h-5 w-5 text-primary" />
            Gradebook Management
          </CardTitle>
        </CardHeader>
        <CardContent className="w-full overflow-hidden">
          <p className="text-muted-foreground mb-6 text-sm">
            View and manage student grades for all courses. As an admin, you can edit and save grades directly.
          </p>
          
          <div className="w-full overflow-hidden rounded-md border border-border/40">
            <GradebookViewStandalone />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
