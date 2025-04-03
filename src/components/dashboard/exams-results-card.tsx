
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/auth-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { Award, BarChart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { 
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell 
} from "@/components/ui/table";

export function ExamsResultsCard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  
  // First, fetch enrolled courses
  const { data: courses, isLoading: coursesLoading } = useQuery({
    queryKey: ["enrolled-courses", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from("enrollments")
        .select(`
          course:course_id(id, name)
        `)
        .eq("student_id", user.id);
        
      if (error) throw error;
      
      return data.map(item => item.course);
    },
    enabled: !!user?.id,
  });
  
  // Set first course as default when courses load
  useState(() => {
    if (courses?.length > 0 && !selectedCourseId) {
      setSelectedCourseId(courses[0].id);
    }
  });
  
  // Fetch student grades
  const { data: grades, isLoading: gradesLoading } = useQuery({
    queryKey: ["student-grades-overview", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from("grades")
        .select(`
          id,
          score,
          comment,
          topic_id,
          course_id,
          topics:topic_id(name)
        `)
        .eq("student_id", user.id)
        .order("created_at", { ascending: false });
        
      if (error) throw error;
      
      return data;
    },
    enabled: !!user?.id,
  });
  
  // Calculate average score
  const calculateAverageScore = () => {
    if (!grades || grades.length === 0) return "-";
    
    const sum = grades.reduce((acc, grade) => acc + Number(grade.score), 0);
    return (sum / grades.length).toFixed(1);
  };
  
  // Get color based on score
  const getScoreColor = (score: number) => {
    if (score >= 9) return "text-green-500";
    if (score >= 7) return "text-blue-500";
    if (score >= 5) return "text-yellow-500";
    return "text-red-500";
  };
  
  // Navigate to full grades view
  const navigateToGrades = () => {
    navigate("/student/courses");
  };
  
  // Get the 5 most recent grades
  const recentGrades = grades?.slice(0, 5) || [];

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-medium flex items-center">
          <BarChart className="mr-2 h-4 w-4 text-primary" />
          My Grades & Performance
        </CardTitle>
      </CardHeader>
      <CardContent>
        {gradesLoading ? (
          <div className="flex justify-center items-center py-6">
            <div className="h-5 w-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : grades && grades.length > 0 ? (
          <>
            <div className="flex justify-between mb-4">
              <div className="flex items-center gap-2">
                <Award className="h-5 w-5 text-amber-500" />
                <span className="font-medium">Average Score:</span>
                <motion.span 
                  className={`font-bold text-lg ${getScoreColor(parseFloat(calculateAverageScore()))}`}
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  {calculateAverageScore()}
                </motion.span>
              </div>
            </div>
            
            <div className="rounded-md overflow-hidden mb-3">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50 hover:bg-muted/50">
                    <TableHead className="w-[180px]">Topic</TableHead>
                    <TableHead className="text-right">Score</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentGrades.map((grade) => (
                    <TableRow key={grade.id} className="hover:bg-muted/10">
                      <TableCell className="font-medium">{grade.topics?.name || "Unnamed Topic"}</TableCell>
                      <TableCell className="text-right">
                        <span className={`font-medium ${getScoreColor(Number(grade.score))}`}>
                          {grade.score}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            
            <div className="flex justify-end">
              <Button size="sm" onClick={navigateToGrades}>
                View All Grades
              </Button>
            </div>
          </>
        ) : (
          <div className="text-center py-6 text-muted-foreground">
            No grades available yet.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
