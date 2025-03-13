
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/auth-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ListChecks, BookOpen } from "lucide-react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";

interface StudentGradebookViewProps {
  courseId?: string; // Optional to allow viewing all courses or a specific course
}

interface Course {
  id: string;
  name: string;
  code: string;
}

interface Topic {
  id: string;
  name: string;
  course_id: string;
  course_name: string;
}

interface Grade {
  id: string;
  score: number;
  topic_id: string;
  topic_name: string;
  course_id: string;
  course_name: string;
}

export function StudentGradebookView({ courseId }: StudentGradebookViewProps) {
  const { user } = useAuth();
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(courseId || null);

  // Get color based on score
  const getScoreColor = (score: number) => {
    if (score >= 9) return "bg-[#4ade80]"; // Neon Green
    if (score >= 6) return "bg-[#86efac]"; // Faint Green
    if (score >= 3) return "bg-[#fdba74]"; // Orange
    return "bg-[#f87171]"; // Red
  };

  // Fetch student's courses
  const { data: courses } = useQuery({
    queryKey: ["student-courses", user?.id],
    queryFn: async () => {
      if (!user?.studentId) return [];
      
      const { data, error } = await supabase
        .from("enrollments")
        .select(`
          course_id,
          courses:course_id(id, name, code)
        `)
        .eq("student_id", user.id);
        
      if (error) throw error;
      
      return data.map(item => item.courses) as Course[];
    },
    enabled: !!user?.id,
  });

  // Set the first course as selected when data is loaded and no courseId is provided
  useEffect(() => {
    if (!selectedCourseId && courses && courses.length > 0) {
      setSelectedCourseId(courses[0].id);
    }
  }, [courses, selectedCourseId]);

  // Fetch topics and grades for the selected course or all courses
  const { data: gradesWithTopics, isLoading } = useQuery({
    queryKey: ["student-grades", user?.id, selectedCourseId],
    queryFn: async () => {
      if (!user?.studentId) return [];
      
      const query = supabase
        .from("grades")
        .select(`
          id,
          score,
          topic_id,
          topics:topic_id(name, course_id, courses:course_id(name)),
          course_id,
          courses:course_id(name)
        `)
        .eq("student_id", user.id);
        
      // Filter by course if a course is selected
      if (selectedCourseId) {
        query.eq("course_id", selectedCourseId);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      // Transform the data to a more usable format
      return data.map(grade => ({
        id: grade.id,
        score: grade.score,
        topic_id: grade.topic_id,
        topic_name: grade.topics?.name || 'Unknown Topic',
        course_id: grade.course_id,
        course_name: grade.courses?.name || 'Unknown Course'
      })) as Grade[];
    },
    enabled: !!user?.id,
  });

  // Group grades by course and calculate averages
  const groupedGrades = gradesWithTopics?.reduce((acc, grade) => {
    if (!acc[grade.course_id]) {
      acc[grade.course_id] = {
        courseName: grade.course_name,
        topics: {},
        grades: [],
        average: 0
      };
    }
    acc[grade.course_id].grades.push(grade);
    if (!acc[grade.course_id].topics[grade.topic_id]) {
      acc[grade.course_id].topics[grade.topic_id] = {
        topicName: grade.topic_name,
        score: grade.score
      };
    }
    return acc;
  }, {} as Record<string, { courseName: string, topics: Record<string, { topicName: string, score: number }>, grades: Grade[], average: number }>);

  // Calculate course averages
  if (groupedGrades) {
    Object.keys(groupedGrades).forEach(courseId => {
      const courseGrades = groupedGrades[courseId];
      if (courseGrades.grades.length > 0) {
        const sum = courseGrades.grades.reduce((acc, grade) => acc + grade.score, 0);
        courseGrades.average = Math.round((sum / courseGrades.grades.length) * 10) / 10;
      }
    });
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ListChecks className="h-5 w-5" />
            My Grades {selectedCourseId && courses?.find(c => c.id === selectedCourseId)?.name ? 
              `for ${courses.find(c => c.id === selectedCourseId)?.name}` : ''}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin h-6 w-6 border-2 border-current border-t-transparent rounded-full"></div>
            </div>
          ) : groupedGrades && Object.keys(groupedGrades).length > 0 ? (
            <div className="space-y-8">
              {Object.entries(groupedGrades).map(([courseId, courseData]) => (
                <div key={courseId} className="space-y-3">
                  {!selectedCourseId && (
                    <div className="flex items-center gap-2 mb-3">
                      <BookOpen className="h-5 w-5 text-primary" />
                      <h3 className="text-lg font-medium">{courseData.courseName}</h3>
                    </div>
                  )}
                  <div>
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/50">
                          <TableHead className="font-bold">Topic</TableHead>
                          <TableHead className="text-center w-24 font-medium">Score</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {Object.entries(courseData.topics).map(([topicId, topic]) => (
                          <TableRow key={topicId} className="hover:bg-muted/20">
                            <TableCell className="font-medium">{topic.topicName}</TableCell>
                            <TableCell className="text-center">
                              <div 
                                className={`rounded-md p-1 w-12 mx-auto ${getScoreColor(topic.score)}`}
                              >
                                {topic.score}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                        <TableRow className="bg-muted/10 font-medium">
                          <TableCell>Course Average</TableCell>
                          <TableCell className="text-center">
                            <div className="font-bold">{courseData.average}</div>
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <ListChecks className="h-12 w-12 mx-auto mb-3 opacity-20" />
              <p>No grades available yet.</p>
              <p className="text-sm">Your grades will appear here once they've been entered.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
