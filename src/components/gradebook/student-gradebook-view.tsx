
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare, GraduationCap, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { useAuth } from "@/context/auth-context";

interface Topic {
  id: string;
  name: string;
  order_id: number;
}

interface Grade {
  id: string;
  topic_id: string;
  score: number;
  comment?: string;
}

interface Course {
  id: string;
  name: string;
}

export function StudentGradebookView() {
  const { user } = useAuth();
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
  const [selectedNotesCourse, setSelectedNotesCourse] = useState<string | null>(null);
  const studentId = user?.id;

  const { data: enrolledCourses, isLoading: isLoadingCourses } = useQuery({
    queryKey: ["enrolled-courses", studentId],
    queryFn: async () => {
      if (!studentId) return [];
      
      console.log("Fetching enrolled courses for student:", studentId);
      
      const { data, error } = await supabase
        .from("enrollments")
        .select(`
          course:course_id(id, name)
        `)
        .eq("student_id", studentId);
        
      if (error) {
        console.error("Error fetching enrolled courses:", error);
        throw error;
      }
      
      return data.map(item => item.course) as Course[];
    },
    enabled: !!studentId,
  });

  useEffect(() => {
    if (enrolledCourses && enrolledCourses.length > 0 && !selectedCourse) {
      setSelectedCourse(enrolledCourses[0].id);
      setSelectedNotesCourse(enrolledCourses[0].id);
    }
  }, [enrolledCourses, selectedCourse]);

  const { data: topics } = useQuery({
    queryKey: ["course-topics", selectedCourse],
    queryFn: async () => {
      if (!selectedCourse) return [];
      
      console.log("Fetching topics for course:", selectedCourse);
      
      const { data, error } = await supabase
        .from("topics")
        .select("id, name, order_id")
        .eq("course_id", selectedCourse)
        .order("order_id");
        
      if (error) {
        console.error("Error fetching topics:", error);
        throw error;
      }
      
      return data as Topic[];
    },
    enabled: !!selectedCourse,
  });

  const { data: grades, isLoading: isLoadingGrades } = useQuery({
    queryKey: ["student-grades", studentId, selectedCourse],
    queryFn: async () => {
      if (!studentId || !selectedCourse || !topics || topics.length === 0) return [];
      
      console.log("Fetching grades for student:", studentId, "course:", selectedCourse);
      
      const { data, error } = await supabase
        .from("grades")
        .select("id, topic_id, score, comment")
        .eq("student_id", studentId)
        .eq("course_id", selectedCourse);
        
      if (error) {
        console.error("Error fetching grades:", error);
        throw error;
      }
      
      console.log("Fetched grades with comments:", data);
      
      return data as Grade[];
    },
    enabled: !!studentId && !!selectedCourse && !!topics && topics.length > 0,
  });

  const getGrade = (topicId: string) => {
    if (!grades) return null;
    return grades.find(grade => grade.topic_id === topicId);
  };

  const getScoreColor = (score: number) => {
    if (score >= 9) return "bg-[#4ade80] text-black font-medium";
    if (score >= 6) return "bg-[#86efac] text-black font-medium";
    if (score >= 3) return "bg-[#fdba74] text-black font-medium";
    return "bg-[#f87171] text-black font-medium";
  };

  const calculateAverage = () => {
    if (!grades || grades.length === 0) return "-";
    
    const sum = grades.reduce((acc, grade) => acc + grade.score, 0);
    const avg = Math.round((sum / grades.length) * 10) / 10;
    return avg.toString();
  };

  const getCommentsByTopic = () => {
    if (!grades || !topics) return [];
    
    const commentsWithTopics = grades
      .filter(grade => grade.comment && grade.comment.trim() !== "")
      .map(grade => {
        const topic = topics.find(t => t.id === grade.topic_id);
        return {
          topicId: grade.topic_id,
          topicName: topic ? topic.name : "Unknown Topic",
          comment: grade.comment || ""
        };
      });
      
    return commentsWithTopics;
  };

  const { data: allCourseComments } = useQuery({
    queryKey: ["student-all-comments", studentId, selectedNotesCourse],
    queryFn: async () => {
      if (!studentId || !selectedNotesCourse) return [];
      
      console.log("Fetching all comments for student:", studentId, "course:", selectedNotesCourse);
      
      const { data, error } = await supabase
        .from("grades")
        .select(`
          id, 
          topic_id,
          comment,
          topics:topic_id(name)
        `)
        .eq("student_id", studentId)
        .eq("course_id", selectedNotesCourse)
        .not("comment", "is", null)
        .not("comment", "eq", "");
        
      if (error) {
        console.error("Error fetching comments:", error);
        throw error;
      }
      
      console.log("Fetched all comments:", data);
      
      return data.map(item => ({
        topicId: item.topic_id,
        topicName: item.topics?.name || "Unknown Topic",
        comment: item.comment || ""
      }));
    },
    enabled: !!studentId && !!selectedNotesCourse,
  });

  if (isLoadingCourses) {
    return (
      <div className="flex justify-center p-8">
        <div className="animate-spin h-8 w-8 border-2 border-current border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!enrolledCourses || enrolledCourses.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>My Grades</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">You are not enrolled in any courses.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-primary" />
            My Grades & Notes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2 mb-4">
            {enrolledCourses.map(course => (
              <Button
                key={course.id}
                variant={selectedCourse === course.id ? "default" : "outline"}
                onClick={() => setSelectedCourse(course.id)}
                size="sm"
              >
                {course.name}
              </Button>
            ))}
          </div>

          {isLoadingGrades ? (
            <div className="flex justify-center p-4">
              <div className="animate-spin h-6 w-6 border-2 border-current border-t-transparent rounded-full"></div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Topic</TableHead>
                  <TableHead className="text-center">Score</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topics && topics.map(topic => {
                  const grade = getGrade(topic.id);
                  return (
                    <TableRow key={topic.id}>
                      <TableCell>{topic.name}</TableCell>
                      <TableCell className="text-center">
                        {grade ? (
                          <HoverCard>
                            <HoverCardTrigger>
                              <span 
                                className={`inline-block py-1 px-3 rounded ${getScoreColor(grade.score)}`}
                              >
                                {grade.score}
                              </span>
                            </HoverCardTrigger>
                            {grade.comment && (
                              <HoverCardContent className="w-64 p-3">
                                <div className="flex flex-col space-y-1">
                                  <div className="flex items-center">
                                    <Info className="h-3 w-3 mr-1 text-muted-foreground" />
                                    <h4 className="text-sm font-medium">Teacher's Note:</h4>
                                  </div>
                                  <p className="text-sm text-muted-foreground">{grade.comment}</p>
                                </div>
                              </HoverCardContent>
                            )}
                          </HoverCard>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
                <TableRow>
                  <TableCell className="font-bold">Average</TableCell>
                  <TableCell className="text-center font-bold">{calculateAverage()}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-md flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-primary" />
            Teacher Notes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2 mb-2">
              {enrolledCourses.map(course => (
                <Button
                  key={course.id}
                  variant={selectedNotesCourse === course.id ? "default" : "outline"}
                  onClick={() => setSelectedNotesCourse(course.id)}
                  size="sm"
                >
                  {course.name}
                </Button>
              ))}
            </div>

            <div className="rounded-lg border p-4 space-y-3">
              {allCourseComments && allCourseComments.length > 0 ? (
                allCourseComments.map((item, index) => (
                  <div key={index} className="p-3 rounded-md bg-card/50 border">
                    <h4 className="font-medium mb-1">{item.topicName}</h4>
                    <p className="text-sm text-muted-foreground">{item.comment}</p>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground text-center py-4">No notes available for this course.</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
