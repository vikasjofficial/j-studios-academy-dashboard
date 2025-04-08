
import { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/auth-context";
import { TrendingUp, ArrowUp, ArrowDown } from "lucide-react";
import { cn } from "@/lib/utils";
import cardStyles from '@/styles/card.module.css';
import { useStudentCourses } from "@/hooks/use-student-courses";

interface SemesterTopicData {
  semesterId: string;
  semesterName: string;
  startDate: string;
  topics: Record<string, {
    topicId: string;
    topicName: string;
    score: number;
    order: number;
  }>
}

export function SemesterProgressChart() {
  const { user } = useAuth();
  const [semesterData, setSemesterData] = useState<SemesterTopicData[]>([]);
  const { courses, isLoading: coursesLoading } = useStudentCourses(user?.id);
  
  // Fetch grades grouped by topic within semesters
  const { data: gradesData, isLoading } = useQuery({
    queryKey: ["student-topic-grades", user?.id, courses],
    queryFn: async () => {
      if (!user?.id || !courses || courses.length === 0) return [];
      
      console.log("Fetching semester progress for student:", user.id);
      console.log("Enrolled courses:", courses);
      
      // Get all course IDs
      const courseIds = courses.map(course => course.id);
      
      // Get all grades for this student across all enrolled courses
      const { data: grades, error } = await supabase
        .from("grades")
        .select(`
          score,
          topic_id,
          course_id,
          topics:topic_id (
            name,
            semester_id,
            order_id,
            semesters:semester_id (
              id,
              name,
              start_date,
              course_id
            )
          )
        `)
        .eq("student_id", user.id)
        .in("course_id", courseIds)
        .order("created_at", { ascending: true });
      
      if (error) {
        console.error("Error fetching grades for semester progress:", error);
        return [];
      }
      
      if (!grades || grades.length === 0) {
        console.log("No grades found for student:", user.id);
        return [];
      }
      
      console.log("Fetched grades for semester progress:", grades.length);
      
      // Group grades by semester and topic
      const semesterTopics: Record<string, SemesterTopicData> = {};
      
      grades.forEach(grade => {
        if (!grade.topics?.semesters) return;
        
        const semesterId = grade.topics.semesters.id;
        const semesterName = grade.topics.semesters.name;
        const startDate = grade.topics.semesters.start_date;
        const topicId = grade.topic_id;
        const topicName = grade.topics.name;
        const order = grade.topics.order_id || 0;
        
        if (!semesterTopics[semesterId]) {
          semesterTopics[semesterId] = {
            semesterId,
            semesterName,
            startDate,
            topics: {}
          };
        }
        
        semesterTopics[semesterId].topics[topicId] = {
          topicId,
          topicName,
          score: Number(grade.score),
          order
        };
      });
      
      // Convert to array and sort by start_date
      return Object.values(semesterTopics)
        .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
    },
    enabled: !!user?.id && !!courses && courses.length > 0,
  });
  
  useEffect(() => {
    if (gradesData && gradesData.length > 0) {
      setSemesterData(gradesData);
      console.log("Set semester data:", gradesData);
    }
  }, [gradesData]);
  
  const isLoading1 = isLoading || coursesLoading;
  
  if (isLoading1) {
    return (
      <Card className={cn("overflow-hidden backdrop-blur-md bg-card/80", cardStyles.card)}>
        <CardHeader className="p-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary" />
            <span>Semester Topics Progress</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin h-5 w-5 border-2 border-current border-t-transparent rounded-full" />
          </div>
        </CardContent>
      </Card>
    );
  }
  
  if (!semesterData || semesterData.length === 0) {
    return (
      <Card className={cn("overflow-hidden backdrop-blur-md bg-card/80", cardStyles.card)}>
        <CardHeader className="p-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary" />
            <span>Semester Topics Progress</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="flex flex-col items-center justify-center h-32 text-center">
            <p className="text-muted-foreground text-sm">No topic data available</p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold tracking-tight">Semester Topic Progress</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {semesterData.map((semester) => {
          // Guard against null/undefined topics
          if (!semester || !semester.topics) {
            return null;
          }
          
          const topicEntries = Object.values(semester.topics)
            .filter(topic => topic !== null && topic !== undefined) // Ensure no null/undefined values
            .sort((a, b) => a.order - b.order);
            
          if (topicEntries.length === 0) {
            return null;
          }
            
          // Create a data point for each topic in this semester
          const chartData = topicEntries.map((topic) => ({
            name: topic.topicName,
            score: topic.score,
            topicId: topic.topicId
          }));
          
          // Calculate semester average
          const semesterAvg = topicEntries.reduce((acc, topic) => acc + topic.score, 0) / topicEntries.length;
          
          return (
            <Card key={semester.semesterId} className={cn("overflow-hidden backdrop-blur-md bg-card/80", cardStyles.card, "p-3")}>
              <CardHeader className="p-2 pb-0">
                <CardTitle className="text-sm flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <TrendingUp className="h-3 w-3 text-primary" />
                    <span className="truncate">{semester.semesterName}</span>
                  </div>
                  <span className="text-xs font-normal flex items-center gap-1">
                    Avg: {semesterAvg.toFixed(1)}
                    {semesterAvg >= 7 ? (
                      <ArrowUp className="h-3 w-3 text-green-500" />
                    ) : (
                      <ArrowDown className="h-3 w-3 text-red-500" />
                    )}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-2">
                <div className="h-32 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={chartData}
                      margin={{ top: 5, right: 10, left: 0, bottom: 15 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                      <XAxis 
                        dataKey="name" 
                        tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 8 }}
                        angle={-45}
                        textAnchor="end"
                        height={40}
                      />
                      <YAxis 
                        domain={[0, 10]} 
                        tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 8 }}
                      />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: 'rgba(30, 30, 30, 0.9)',
                          border: '1px solid rgba(255, 255, 255, 0.2)',
                          borderRadius: '6px',
                          color: 'white',
                          padding: '4px 8px',
                          fontSize: '11px'
                        }}
                        formatter={(value) => [`${value} / 10`, 'Score']}
                      />
                      <Line
                        type="monotone"
                        dataKey="score"
                        stroke="#3b82f6"
                        strokeWidth={2}
                        dot={{ r: 3, fill: "#3b82f6", strokeWidth: 1, stroke: "#fff" }}
                        activeDot={{ r: 4, fill: "#3b82f6" }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
