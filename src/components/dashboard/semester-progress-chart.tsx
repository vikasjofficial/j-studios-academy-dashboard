
import { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/auth-context";
import { TrendingUp, ArrowUp, ArrowDown } from "lucide-react";
import { cn } from "@/lib/utils";
import cardStyles from '@/styles/card.module.css';

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
  
  // Fetch grades grouped by topic within semesters
  const { data: gradesData, isLoading } = useQuery({
    queryKey: ["student-topic-grades", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      // First, get student's course
      const { data: enrollments } = await supabase
        .from("enrollments")
        .select("course_id")
        .eq("student_id", user.id)
        .single();
      
      if (!enrollments) return [];
      
      const courseId = enrollments.course_id;
      
      // Get all grades for this student in this course with topic info
      const { data: grades } = await supabase
        .from("grades")
        .select(`
          score,
          topic_id,
          topics:topic_id (
            name,
            semester_id,
            order_id,
            semesters:semester_id (
              id,
              name,
              start_date
            )
          )
        `)
        .eq("student_id", user.id)
        .eq("course_id", courseId)
        .order("created_at", { ascending: true });
      
      if (!grades || grades.length === 0) return [];
      
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
    enabled: !!user?.id,
  });
  
  useEffect(() => {
    if (gradesData && gradesData.length > 0) {
      setSemesterData(gradesData);
    }
  }, [gradesData]);
  
  if (isLoading) {
    return (
      <Card className={cn("overflow-hidden backdrop-blur-md bg-card/80", cardStyles.card)}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            <span>Semester Topics Progress</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-48">
            <div className="animate-spin h-6 w-6 border-2 border-current border-t-transparent rounded-full" />
          </div>
        </CardContent>
      </Card>
    );
  }
  
  if (!semesterData || semesterData.length === 0) {
    return (
      <Card className={cn("overflow-hidden backdrop-blur-md bg-card/80", cardStyles.card)}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            <span>Semester Topics Progress</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex flex-col items-center justify-center h-48 text-center">
            <p className="text-muted-foreground">No topic data available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Generate dynamic colors for topics
  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];
  
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold tracking-tight">Semester Topic Progress</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {semesterData.map((semester) => {
          const topicEntries = Object.values(semester.topics)
            .sort((a, b) => a.order - b.order);
            
          // Create a data point for each topic in this semester
          const chartData = topicEntries.map((topic) => ({
            name: topic.topicName,
            score: topic.score,
            topicId: topic.topicId
          }));
          
          // Calculate semester average
          const semesterAvg = topicEntries.reduce((acc, topic) => acc + topic.score, 0) / topicEntries.length;
          
          return (
            <Card key={semester.semesterId} className={cn("overflow-hidden backdrop-blur-md bg-card/80", cardStyles.card)}>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    <span>{semester.semesterName}</span>
                  </div>
                  <span className="text-sm font-normal flex items-center gap-1">
                    Avg: {semesterAvg.toFixed(1)}
                    {semesterAvg >= 7 ? (
                      <ArrowUp className="h-4 w-4 text-green-500" />
                    ) : (
                      <ArrowDown className="h-4 w-4 text-red-500" />
                    )}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="h-48 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={chartData}
                      margin={{ top: 5, right: 20, left: 0, bottom: 20 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                      <XAxis 
                        dataKey="name" 
                        tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 10 }}
                        angle={-45}
                        textAnchor="end"
                        height={50}
                      />
                      <YAxis 
                        domain={[0, 10]} 
                        tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 10 }}
                      />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: 'rgba(30, 30, 30, 0.9)',
                          border: '1px solid rgba(255, 255, 255, 0.2)',
                          borderRadius: '8px',
                          color: 'white',
                        }}
                        formatter={(value) => [`${value} / 10`, 'Score']}
                      />
                      <Line
                        type="monotone"
                        dataKey="score"
                        stroke="#3b82f6"
                        strokeWidth={2}
                        dot={{ r: 4, fill: "#3b82f6", strokeWidth: 1, stroke: "#fff" }}
                        activeDot={{ r: 6, fill: "#3b82f6" }}
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
