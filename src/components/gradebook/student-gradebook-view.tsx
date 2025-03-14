
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare, GraduationCap, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { useAuth } from "@/context/auth-context";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Topic {
  id: string;
  name: string;
  order_id: number;
  semester_id: string;
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

interface Semester {
  id: string;
  name: string;
  topics: Topic[];
}

interface StudentGradebookViewProps {
  courseId?: string;
}

export function StudentGradebookView({ courseId }: StudentGradebookViewProps = {}) {
  const { user } = useAuth();
  const [selectedCourse, setSelectedCourse] = useState<string | null>(courseId || null);
  const [selectedNotesCourse, setSelectedNotesCourse] = useState<string | null>(courseId || null);
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
    if (courseId) {
      setSelectedCourse(courseId);
      setSelectedNotesCourse(courseId);
    } 
    else if (enrolledCourses && enrolledCourses.length > 0 && !selectedCourse) {
      setSelectedCourse(enrolledCourses[0].id);
      setSelectedNotesCourse(enrolledCourses[0].id);
    }
  }, [enrolledCourses, selectedCourse, courseId]);

  // Fetch semesters and topics for the selected course
  const { data: semesters, isLoading: isLoadingSemesters } = useQuery({
    queryKey: ["course-semesters", selectedCourse],
    queryFn: async () => {
      if (!selectedCourse) return [];
      
      console.log("Fetching semesters for course:", selectedCourse);
      
      const { data: semestersData, error: semestersError } = await supabase
        .from("semesters")
        .select("id, name")
        .eq("course_id", selectedCourse)
        .order("start_date");
        
      if (semestersError) {
        console.error("Error fetching semesters:", semestersError);
        throw semestersError;
      }
      
      // For each semester, fetch its topics
      const semestersWithTopics = await Promise.all(
        semestersData.map(async (semester) => {
          const { data: topicsData, error: topicsError } = await supabase
            .from("topics")
            .select("id, name, order_id, semester_id")
            .eq("semester_id", semester.id)
            .order("order_id");
            
          if (topicsError) {
            console.error(`Error fetching topics for semester ${semester.id}:`, topicsError);
            return { ...semester, topics: [] };
          }
          
          return { ...semester, topics: topicsData || [] };
        })
      );
      
      return semestersWithTopics as Semester[];
    },
    enabled: !!selectedCourse,
  });

  // Fetch all topics for the selected course (for topics without a semester)
  const { data: topicsWithoutSemester } = useQuery({
    queryKey: ["course-topics-no-semester", selectedCourse],
    queryFn: async () => {
      if (!selectedCourse) return [];
      
      console.log("Fetching topics without semester for course:", selectedCourse);
      
      const { data, error } = await supabase
        .from("topics")
        .select("id, name, order_id, semester_id")
        .eq("course_id", selectedCourse)
        .is("semester_id", null)
        .order("order_id");
        
      if (error) {
        console.error("Error fetching topics without semester:", error);
        throw error;
      }
      
      return data as Topic[];
    },
    enabled: !!selectedCourse,
  });

  const { data: grades, isLoading: isLoadingGrades } = useQuery({
    queryKey: ["student-grades", studentId, selectedCourse],
    queryFn: async () => {
      if (!studentId || !selectedCourse) return [];
      
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
    enabled: !!studentId && !!selectedCourse,
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

  const calculateSemesterAverage = (semesterId: string) => {
    if (!grades || !semesters) return "-";
    
    const semesterTopicIds = semesters
      .find(sem => sem.id === semesterId)
      ?.topics.map(topic => topic.id) || [];
    
    const semesterGrades = grades.filter(grade => 
      semesterTopicIds.includes(grade.topic_id)
    );
    
    if (semesterGrades.length === 0) return "-";
    
    const sum = semesterGrades.reduce((acc, grade) => acc + grade.score, 0);
    const avg = Math.round((sum / semesterGrades.length) * 10) / 10;
    return avg.toString();
  };

  const calculateOverallAverage = () => {
    if (!grades || grades.length === 0) return "-";
    
    const sum = grades.reduce((acc, grade) => acc + grade.score, 0);
    const avg = Math.round((sum / grades.length) * 10) / 10;
    return avg.toString();
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
          topics:topic_id(name, semester_id),
          semesters:topics(semesters:semester_id(name))
        `)
        .eq("student_id", studentId)
        .eq("course_id", selectedNotesCourse)
        .not("comment", "is", null)
        .not("comment", "eq", "");
        
      if (error) {
        console.error("Error fetching comments:", error);
        throw error;
      }
      
      return data.map(item => ({
        topicId: item.topic_id,
        topicName: item.topics?.name || "Unknown Topic",
        semesterName: item.semesters?.semesters?.name || "Uncategorized",
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

          {isLoadingGrades || isLoadingSemesters ? (
            <div className="flex justify-center p-4">
              <div className="animate-spin h-6 w-6 border-2 border-current border-t-transparent rounded-full"></div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Render topics grouped by semester */}
              {semesters && semesters.map(semester => (
                <div key={semester.id} className="border rounded-md overflow-hidden">
                  <div className="bg-muted/50 p-3 border-b">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold">{semester.name}</h3>
                      <span className="text-sm font-medium">
                        Average: {calculateSemesterAverage(semester.id)}
                      </span>
                    </div>
                  </div>
                  
                  {semester.topics.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Topic</TableHead>
                          <TableHead className="text-center">Score</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {semester.topics.map(topic => {
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
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="p-4 text-center text-muted-foreground">
                      No topics found for this semester
                    </div>
                  )}
                </div>
              ))}
              
              {/* Render topics without semester */}
              {topicsWithoutSemester && topicsWithoutSemester.length > 0 && (
                <div className="border rounded-md overflow-hidden">
                  <div className="bg-muted/50 p-3 border-b">
                    <h3 className="font-semibold">Uncategorized Topics</h3>
                  </div>
                  
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Topic</TableHead>
                        <TableHead className="text-center">Score</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {topicsWithoutSemester.map(topic => {
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
                    </TableBody>
                  </Table>
                </div>
              )}
              
              {/* Overall Average */}
              <div className="border rounded-md p-3 bg-muted/20">
                <div className="flex justify-between items-center">
                  <span className="font-bold">Overall Average</span>
                  <span className="font-bold text-lg">{calculateOverallAverage()}</span>
                </div>
              </div>
            </div>
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
                <Tabs defaultValue="all" className="w-full">
                  <TabsList className="w-full">
                    <TabsTrigger value="all" className="flex-1">All Notes</TabsTrigger>
                    <TabsTrigger value="bySemester" className="flex-1">By Semester</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="all" className="mt-4 space-y-3">
                    {allCourseComments.map((item, index) => (
                      <div key={index} className="p-3 rounded-md bg-card/50 border">
                        <div className="flex justify-between mb-1">
                          <h4 className="font-medium">{item.topicName}</h4>
                          <span className="text-xs text-muted-foreground">{item.semesterName}</span>
                        </div>
                        <p className="text-sm text-muted-foreground">{item.comment}</p>
                      </div>
                    ))}
                  </TabsContent>
                  
                  <TabsContent value="bySemester" className="mt-4 space-y-5">
                    {/* Group comments by semester */}
                    {Object.entries(
                      allCourseComments.reduce((acc: {[key: string]: any[]}, item) => {
                        if (!acc[item.semesterName]) {
                          acc[item.semesterName] = [];
                        }
                        acc[item.semesterName].push(item);
                        return acc;
                      }, {})
                    ).map(([semesterName, comments]) => (
                      <div key={semesterName} className="space-y-2">
                        <h3 className="font-medium text-sm border-b pb-1">{semesterName}</h3>
                        <div className="space-y-2 pl-2">
                          {comments.map((item, index) => (
                            <div key={index} className="p-3 rounded-md bg-card/50 border">
                              <h4 className="font-medium mb-1">{item.topicName}</h4>
                              <p className="text-sm text-muted-foreground">{item.comment}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </TabsContent>
                </Tabs>
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
