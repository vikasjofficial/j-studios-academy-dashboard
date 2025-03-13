
import { BookOpen } from "lucide-react";
import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { GradebookStyled } from "@/components/gradebook/gradebook-styled";

export default function GradebookManagement() {
  const queryClient = useQueryClient();

  // Refetch courses and data when component mounts
  useEffect(() => {
    queryClient.invalidateQueries({ queryKey: ["all-courses"] });
    queryClient.invalidateQueries({ queryKey: ["semesters"] });
    queryClient.invalidateQueries({ queryKey: ["topics"] });
  }, [queryClient]);

  return (
    <div className="space-y-6 max-w-full overflow-x-auto animate-in-subtle">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <BookOpen className="h-7 w-7 text-primary" />
          Gradebook Management
        </h1>
        <p className="text-muted-foreground mt-1">
          View and manage student grades for all courses. As an admin, you can edit and save grades directly.
        </p>
      </div>
      
      <div className="w-full overflow-x-auto">
        <GradebookStyled />
      </div>
    </div>
  );
}
