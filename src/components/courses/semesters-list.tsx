
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Calendar, ChevronDown, ChevronRight, Pencil, Plus } from "lucide-react";
import { TopicsList } from "./topics-list";
import { ScheduleLectureForm } from "./schedule-lecture-form";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Tables } from "@/integrations/supabase/types";

type Semester = {
  id: string;
  name: string;
  start_date: string;
  end_date: string;
  course_id: string;
  status: string;
};

interface SemestersListProps {
  courseId: string;
  courseName: string;
}

export function SemestersList({ courseId, courseName }: SemestersListProps) {
  const [expandedSemester, setExpandedSemester] = useState<string | null>(null);
  const [activeSemester, setActiveSemester] = useState<Semester | null>(null);
  const [isSchedulingLecture, setIsSchedulingLecture] = useState(false);

  const { data: semesters, isLoading } = useQuery({
    queryKey: ["semesters", courseId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("semesters")
        .select("*")
        .eq("course_id", courseId)
        .order("start_date");
        
      if (error) {
        toast.error("Failed to load semesters: " + error.message);
        throw error;
      }
      return data as Semester[];
    },
  });

  const toggleExpand = (semesterId: string) => {
    setExpandedSemester(expandedSemester === semesterId ? null : semesterId);
  };

  const handleScheduleLecture = (semester: Semester) => {
    setActiveSemester(semester);
    setIsSchedulingLecture(true);
  };

  const closeScheduleForm = () => {
    setIsSchedulingLecture(false);
    setActiveSemester(null);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Semesters for {courseName}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-24 flex items-center justify-center">
            <p className="text-sm text-muted-foreground">Loading semesters...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Semesters for {courseName}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {semesters && semesters.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-sm text-muted-foreground">No semesters found. Create a new semester to get started.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-10"></TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {semesters?.map((semester) => (
                    <Collapsible key={semester.id} open={expandedSemester === semester.id}>
                      <TableRow className="cursor-pointer hover:bg-muted/40">
                        <TableCell>
                          <CollapsibleTrigger asChild onClick={() => toggleExpand(semester.id)}>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              {expandedSemester === semester.id ? (
                                <ChevronDown className="h-4 w-4" />
                              ) : (
                                <ChevronRight className="h-4 w-4" />
                              )}
                              <span className="sr-only">Toggle</span>
                            </Button>
                          </CollapsibleTrigger>
                        </TableCell>
                        <TableCell className="font-medium" onClick={() => toggleExpand(semester.id)}>
                          {semester.name}
                        </TableCell>
                        <TableCell onClick={() => toggleExpand(semester.id)}>
                          {format(new Date(semester.start_date), "MMM d, yyyy")} - {format(new Date(semester.end_date), "MMM d, yyyy")}
                        </TableCell>
                        <TableCell onClick={() => toggleExpand(semester.id)}>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            semester.status === "active" 
                              ? "bg-green-100 text-green-800" 
                              : "bg-yellow-100 text-yellow-800"
                          }`}>
                            {semester.status}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="ml-2"
                            onClick={() => handleScheduleLecture(semester)}
                          >
                            <Plus className="h-4 w-4 mr-1" />
                            Schedule Lecture
                          </Button>
                        </TableCell>
                      </TableRow>
                      <CollapsibleContent asChild>
                        <TableRow>
                          <TableCell colSpan={5} className="p-0">
                            <div className="px-6 py-3 bg-muted/30">
                              <TopicsList semesterId={semester.id} courseId={courseId} />
                            </div>
                          </TableCell>
                        </TableRow>
                      </CollapsibleContent>
                    </Collapsible>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {isSchedulingLecture && activeSemester && (
        <div className="mt-6">
          <ScheduleLectureForm 
            courseId={courseId} 
            semesterId={activeSemester.id} 
            semesterName={activeSemester.name}
            onCancel={closeScheduleForm}
            onSuccess={closeScheduleForm}
          />
        </div>
      )}
    </>
  );
}
