
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GradebookViewStandalone } from "@/components/gradebook/gradebook-view-standalone";
import { BookOpen } from "lucide-react";

export default function GradebookManagement() {
  return (
    <div className="space-y-6">
      <Card className="bg-muted/50">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-xl">
            <BookOpen className="h-5 w-5 text-primary" />
            Gradebook Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-6">
            View and manage student grades for all courses. As an admin, you can edit and save grades directly.
          </p>
          
          <GradebookViewStandalone />
        </CardContent>
      </Card>
    </div>
  );
}
