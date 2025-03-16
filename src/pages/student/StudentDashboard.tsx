
import { AttendanceCard } from '@/components/dashboard/attendance-card';
import { useAuth } from '@/context/auth-context';
import StudentAttendanceDashboard from '@/components/dashboard/student-attendance-dashboard';
import { StudentGradebookView } from '@/components/gradebook/student-gradebook-view';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Award, TrendingDown, GraduationCap } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { StudentProfileCard } from '@/components/dashboard/student-profile-card';
import styles from "@/styles/layout.module.css";

export default function StudentDashboard() {
  const { user } = useAuth();

  // Fetch student grades
  const { data: grades, isLoading: gradesLoading } = useQuery({
    queryKey: ["student-dashboard-grades", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from("grades")
        .select(`
          id,
          score,
          comment,
          topics:topic_id(id, name, semester_id),
          courses:course_id(id, name)
        `)
        .eq('student_id', user.id);
        
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });

  // Get high performing topics (score >= 8)
  const highPerformingTopics = () => {
    if (!grades) return [];
    
    // Filter for high scores (>= 8)
    const highScores = grades.filter(grade => {
      const score = Number(grade.score);
      // Ensure score is within bounds (1-10)
      const boundedScore = Math.min(Math.max(score, 1), 10);
      return boundedScore >= 8;
    });
    
    return highScores;
  };

  // Get low performing topics (score <= 7)
  const lowPerformingTopics = () => {
    if (!grades) return [];
    
    // Filter for low scores (<= 7)
    const lowScores = grades.filter(grade => {
      const score = Number(grade.score);
      // Ensure score is within bounds (1-10)
      const boundedScore = Math.min(Math.max(score, 1), 10);
      return boundedScore <= 7;
    });
    
    return lowScores;
  };

  return (
    <>
      <div className="hidden md:block w-[var(--sidebar-width)] flex-shrink-0"></div>
      <div className="hidden md:block w-[calc(var(--sidebar-width)*0.9)] flex-shrink-0"></div>
      <div className="hidden md:block w-[calc(var(--sidebar-width)*0.5)] flex-shrink-0"></div>
      
      <div className={`space-y-8 ${styles.contentContainer} max-w-full overflow-x-hidden px-1`}>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Student Dashboard</h1>
          <p className="text-muted-foreground">Welcome to J-Studios Academy.</p>
        </div>

        {/* Student Profile Card */}
        <StudentProfileCard />

        {/* Performance Overview Cards */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5 text-yellow-500" />
                My Strong Topics (Score 8-10)
              </CardTitle>
            </CardHeader>
            <CardContent>
              {gradesLoading ? (
                <p className="text-muted-foreground">Loading grade data...</p>
              ) : highPerformingTopics().length > 0 ? (
                <div className="space-y-4">
                  {highPerformingTopics().map(grade => (
                    <div key={grade.id} className="flex flex-col border-b pb-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{grade.topics?.name}</p>
                          <p className="text-xs text-muted-foreground">{grade.courses?.name}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-bold text-green-600">
                            {Number(grade.score).toFixed(1)}
                          </span>
                          <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">Strong</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No strong topics found yet.</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingDown className="h-5 w-5 text-orange-500" />
                Topics I Need to Work On (Score 1-7)
              </CardTitle>
            </CardHeader>
            <CardContent>
              {gradesLoading ? (
                <p className="text-muted-foreground">Loading grade data...</p>
              ) : lowPerformingTopics().length > 0 ? (
                <div className="space-y-4">
                  {lowPerformingTopics().map(grade => (
                    <div key={grade.id} className="flex flex-col border-b pb-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{grade.topics?.name}</p>
                          <p className="text-xs text-muted-foreground">{grade.courses?.name}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-bold text-orange-600">
                            {Number(grade.score).toFixed(1)}
                          </span>
                          <span className="text-xs bg-orange-100 text-orange-800 px-2 py-0.5 rounded-full">Needs Work</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No struggling topics found.</p>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="bg-white/5 backdrop-blur-md rounded-xl p-6 border border-white/10">
          <h2 className="text-xl font-semibold mb-4">Attendance by Course</h2>
          <StudentAttendanceDashboard />
        </div>

        <Card className="glass-morphism rounded-xl border border-white/10">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-primary" />
              My Recent Grades & Notes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <StudentGradebookView />
          </CardContent>
        </Card>
      </div>
    </>
  );
}
