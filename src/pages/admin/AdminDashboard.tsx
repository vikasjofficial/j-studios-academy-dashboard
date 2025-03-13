
import { StatsCard } from '@/components/dashboard/stats-card';
import { CalendarCard } from '@/components/dashboard/calendar-card';
import { AttendanceCard } from '@/components/dashboard/attendance-card';
import { ProgressChartCard } from '@/components/dashboard/progress-chart-card';
import { Users, BookOpen, GraduationCap, MessageSquare, Award, TrendingDown } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function AdminDashboard() {
  // Mock data for the stats cards
  const statsData = [
    { title: 'Total Students', value: 24, icon: <Users className="h-5 w-5" />, trend: { value: 12, isPositive: true } },
    { title: 'Active Courses', value: 5, icon: <BookOpen className="h-5 w-5" />, trend: { value: 0, isPositive: true } },
    { title: 'Graduation Rate', value: '87%', icon: <GraduationCap className="h-5 w-5" />, trend: { value: 3, isPositive: true } },
    { title: 'Messages', value: 18, icon: <MessageSquare className="h-5 w-5" />, trend: { value: 7, isPositive: true } },
  ];

  const calendarEvents = [
    { id: '1', title: 'Sound Design Basics', date: 'May 15, 2025', time: '10:00 AM', type: 'lecture' as const },
    { id: '2', title: 'Mixing Techniques', date: 'May 16, 2025', time: '02:00 PM', type: 'lecture' as const },
    { id: '3', title: 'Project Submission', date: 'May 20, 2025', time: '11:59 PM', type: 'assignment' as const },
    { id: '4', title: 'End of Semester Exam', date: 'June 10, 2025', time: '09:00 AM', type: 'exam' as const },
  ];

  const progressData = [
    { name: 'Composition', mark: 85, average: 78 },
    { name: 'Mixing', mark: 92, average: 75 },
    { name: 'Sound Design', mark: 88, average: 80 },
    { name: 'Arranging', mark: 78, average: 72 },
    { name: 'Theory', mark: 82, average: 74 },
  ];

  // Fetch all semesters with course information
  const { data: semesters, isLoading: semestersLoading } = useQuery({
    queryKey: ["admin-dashboard-semesters"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("semesters")
        .select(`
          id, 
          name, 
          courses:course_id(id, name)
        `)
        .order('name');
        
      if (error) throw error;
      return data;
    },
  });

  // Fetch all student grades for display
  const { data: grades, isLoading: gradesLoading } = useQuery({
    queryKey: ["admin-dashboard-grades"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("grades")
        .select(`
          id,
          score,
          comment,
          students:student_id(id, name, student_id),
          topics:topic_id(id, name, semester_id),
          courses:course_id(id, name)
        `);
        
      if (error) throw error;
      return data;
    },
  });

  // Process grades by semester
  const getGradesBySemester = (semesterId: string) => {
    if (!grades) return [];
    
    return grades.filter(grade => 
      grade.topics && grade.topics.semester_id === semesterId
    );
  };

  // Get high performing students (score > 7)
  const highPerformingStudents = () => {
    if (!grades) return [];
    
    // Group by student and calculate their average score
    const studentScores: Record<string, { student: any, scores: number[], avgScore: number }> = {};
    
    grades.forEach(grade => {
      if (!grade.students || !grade.score) return;
      
      const studentId = grade.students.id;
      if (!studentScores[studentId]) {
        studentScores[studentId] = {
          student: grade.students,
          scores: [],
          avgScore: 0
        };
      }
      
      studentScores[studentId].scores.push(Number(grade.score));
    });
    
    // Calculate average scores
    Object.values(studentScores).forEach(entry => {
      if (entry.scores.length > 0) {
        const sum = entry.scores.reduce((a, b) => a + b, 0);
        entry.avgScore = Math.round((sum / entry.scores.length) * 10) / 10;
      }
    });
    
    // Filter for high performers (> 7)
    return Object.values(studentScores)
      .filter(entry => entry.avgScore > 7)
      .sort((a, b) => b.avgScore - a.avgScore);
  };

  // Get low performing students (score <= 7)
  const lowPerformingStudents = () => {
    if (!grades) return [];
    
    // Group by student and calculate their average score
    const studentScores: Record<string, { student: any, scores: number[], avgScore: number }> = {};
    
    grades.forEach(grade => {
      if (!grade.students || !grade.score) return;
      
      const studentId = grade.students.id;
      if (!studentScores[studentId]) {
        studentScores[studentId] = {
          student: grade.students,
          scores: [],
          avgScore: 0
        };
      }
      
      studentScores[studentId].scores.push(Number(grade.score));
    });
    
    // Calculate average scores
    Object.values(studentScores).forEach(entry => {
      if (entry.scores.length > 0) {
        const sum = entry.scores.reduce((a, b) => a + b, 0);
        entry.avgScore = Math.round((sum / entry.scores.length) * 10) / 10;
      }
    });
    
    // Filter for low performers (<= 7)
    return Object.values(studentScores)
      .filter(entry => entry.avgScore <= 7)
      .sort((a, b) => a.avgScore - b.avgScore);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-muted-foreground">Overview of J-Studios Academy.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {statsData.map((stat, index) => (
          <StatsCard
            key={index}
            title={stat.title}
            value={stat.value}
            icon={stat.icon}
            trend={stat.trend}
          />
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <CalendarCard
          title="Upcoming Classes"
          events={calendarEvents}
          className="md:col-span-2 lg:col-span-3"
        />
      </div>

      {/* Performance Overview Cards */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-yellow-500" />
              Top Performing Students (Average > 7)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {gradesLoading ? (
              <p className="text-muted-foreground">Loading student data...</p>
            ) : highPerformingStudents().length > 0 ? (
              <div className="space-y-4">
                {highPerformingStudents().map(entry => (
                  <div key={entry.student.id} className="flex items-center justify-between border-b pb-2">
                    <div>
                      <p className="font-medium">{entry.student.name}</p>
                      <p className="text-xs text-muted-foreground">{entry.student.student_id}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold text-green-600">{entry.avgScore}</span>
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">High</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No top performing students found.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-orange-500" />
              Students Needing Attention (Average ≤ 7)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {gradesLoading ? (
              <p className="text-muted-foreground">Loading student data...</p>
            ) : lowPerformingStudents().length > 0 ? (
              <div className="space-y-4">
                {lowPerformingStudents().map(entry => (
                  <div key={entry.student.id} className="flex items-center justify-between border-b pb-2">
                    <div>
                      <p className="font-medium">{entry.student.name}</p>
                      <p className="text-xs text-muted-foreground">{entry.student.student_id}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold text-orange-600">{entry.avgScore}</span>
                      <span className="text-xs bg-orange-100 text-orange-800 px-2 py-0.5 rounded-full">Needs Help</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No students requiring attention found.</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Semester Grade Cards */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight">Semester Performance</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {semestersLoading ? (
            <p className="text-muted-foreground col-span-full">Loading semester data...</p>
          ) : semesters && semesters.length > 0 ? (
            semesters.map(semester => (
              <Card key={semester.id}>
                <CardHeader>
                  <CardTitle className="text-lg">
                    {semester.name} - {semester.courses?.name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {getGradesBySemester(semester.id).length > 0 ? (
                    <div className="space-y-3 max-h-[300px] overflow-y-auto">
                      {getGradesBySemester(semester.id).map(grade => (
                        <div key={grade.id} className="flex justify-between items-center border-b pb-2">
                          <div>
                            <p className="font-medium">{grade.students?.name}</p>
                            <p className="text-xs text-muted-foreground">{grade.topics?.name}</p>
                          </div>
                          <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                            Number(grade.score) > 7 
                              ? "bg-green-100 text-green-800" 
                              : "bg-orange-100 text-orange-800"
                          }`}>
                            {grade.score}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">No grades found for this semester.</p>
                  )}
                </CardContent>
              </Card>
            ))
          ) : (
            <p className="text-muted-foreground col-span-full">No semesters found.</p>
          )}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <AttendanceCard
          title="Overall Attendance"
          percentage={88}
          present={22}
          total={25}
        />
        <ProgressChartCard
          title="Student Progress"
          data={progressData}
        />
      </div>
    </div>
  );
}
