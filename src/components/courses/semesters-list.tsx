import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarDays, Clock, Plus } from "lucide-react";
import { ScheduleLectureForm } from "./schedule-lecture-form";

// Define Semester interface to match the database table
interface Semester {
  id: string;
  name: string;
  start_date: string;
  end_date: string;
  course_id: string;
  status: string;
  created_at?: string;
  updated_at?: string;
}

interface SemestersListProps {
  courseId: string;
  courseName: string;
}

export function SemestersList({ courseId, courseName }: SemestersListProps) {
  const [selectedSemesterId, setSelectedSemesterId] = useState<string | null>(null);
  const [isSchedulingLecture, setIsSchedulingLecture] = useState(false);
  
  const { data: semesters, isLoading } = useQuery({
    queryKey: ["semesters", courseId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("semesters")
        .select("*")
        .eq("course_id", courseId)
        .order("start_date", { ascending: false });
        
      if (error) throw error;
      return data as Semester[];
    },
  });

  const handleScheduleLecture = (semesterId: string) => {
    setSelectedSemesterId(semesterId);
    setIsSchedulingLecture(true);
  };

  const handleScheduleComplete = () => {
    setIsSchedulingLecture(false);
    setSelectedSemesterId(null);
  };

  if (isLoading) {
    return <div className="py-4 text-center text-sm text-muted-foreground">Loading semesters...</div>;
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium flex items-center gap-2">
        <CalendarDays className="h-4 w-4" />
        Semesters
      </h3>

      {isSchedulingLecture && selectedSemesterId ? (
        <ScheduleLectureForm 
          courseId={courseId}
          semesterId={selectedSemesterId}
          semesterName={semesters?.find(s => s.id === selectedSemesterId)?.name || "Selected Semester"}
          onSuccess={handleScheduleComplete}
          onCancel={handleScheduleComplete}
        />
      ) : (
        semesters && semesters.length > 0 ? (
          <div className="grid grid-cols-1 gap-4">
            {semesters.map((semester) => (
              <Card key={semester.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{semester.name}</CardTitle>
                      <CardDescription>
                        {format(new Date(semester.start_date), "MMMM d, yyyy")} - {format(new Date(semester.end_date), "MMMM d, yyyy")}
                      </CardDescription>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleScheduleLecture(semester.id)}
                      className="flex items-center gap-2"
                    >
                      <Clock className="h-4 w-4" />
                      Schedule Lecture
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">Status: {semester.status}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center text-sm text-muted-foreground">
            No semesters found for this course.
          </div>
        )
      )}
    </div>
  );
}
