
import { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/auth-context";
import { TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import cardStyles from '@/styles/card.module.css';

export function SemesterProgressChart() {
  const { user } = useAuth();
  const [chartData, setChartData] = useState<any[]>([]);
  
  // Fetch grades grouped by semester
  const { data: gradesData, isLoading } = useQuery({
    queryKey: ["student-semester-grades", user?.id],
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
      
      // Get all grades for this student in this course
      const { data: grades } = await supabase
        .from("grades")
        .select(`
          score,
          topic_id,
          topics:topic_id (
            name,
            semester_id,
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
      
      // Group grades by semester and calculate averages
      const semesterGrades: Record<string, { 
        name: string, 
        scores: number[], 
        startDate: string,
        id: string
      }> = {};
      
      grades.forEach(grade => {
        if (!grade.topics?.semesters) return;
        
        const semesterId = grade.topics.semesters.id;
        const semesterName = grade.topics.semesters.name;
        const startDate = grade.topics.semesters.start_date;
        
        if (!semesterGrades[semesterId]) {
          semesterGrades[semesterId] = {
            name: semesterName,
            scores: [],
            startDate,
            id: semesterId
          };
        }
        
        semesterGrades[semesterId].scores.push(Number(grade.score));
      });
      
      // Calculate average per semester
      return Object.values(semesterGrades)
        .map(semester => {
          const sum = semester.scores.reduce((a, b) => a + b, 0);
          const avg = semester.scores.length ? (sum / semester.scores.length) : 0;
          
          return {
            name: semester.name,
            average: parseFloat(avg.toFixed(1)),
            startDate: semester.startDate,
            id: semester.id
          };
        })
        .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
    },
    enabled: !!user?.id,
  });
  
  useEffect(() => {
    if (gradesData && gradesData.length > 0) {
      setChartData(gradesData);
    }
  }, [gradesData]);
  
  if (isLoading) {
    return (
      <Card className={cn("overflow-hidden backdrop-blur-md bg-card/80", cardStyles.card)}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            <span>Semester Progress</span>
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
  
  if (!chartData || chartData.length < 2) {
    return (
      <Card className={cn("overflow-hidden backdrop-blur-md bg-card/80", cardStyles.card)}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            <span>Semester Progress</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex flex-col items-center justify-center h-48 text-center">
            <p className="text-muted-foreground">
              {chartData && chartData.length === 1 
                ? "At least two semesters are needed to show progress" 
                : "No semester data available"}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Calculate if the latest semester average has improved
  const trend = chartData.length >= 2 
    ? chartData[chartData.length - 1].average > chartData[chartData.length - 2].average
    : null;
  
  return (
    <Card className={cn("overflow-hidden backdrop-blur-md bg-card/80", cardStyles.card)}>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          <span>Semester Progress</span>
          {trend !== null && (
            <span className={`text-xs px-2 py-1 rounded-full ${trend ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
              {trend ? 'Improving' : 'Declining'}
            </span>
          )}
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
                formatter={(value) => [`${value} / 10`, 'Average Score']}
                labelFormatter={(label) => `Semester: ${label}`}
              />
              <Legend verticalAlign="bottom" />
              <Line
                type="monotone"
                dataKey="average"
                name="Semester Average"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={{ r: 4, fill: "#1e3a8a", strokeWidth: 2, stroke: "#3b82f6" }}
                activeDot={{ r: 6, fill: "#3b82f6" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
