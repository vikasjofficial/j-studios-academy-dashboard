import DashboardLayout from '@/components/dashboard-layout';
import { StatsCard } from '@/components/dashboard/stats-card';
import { CollapsibleStatsCard } from '@/components/dashboard/collapsible-stats-card';
import { StatsAccordion, StatsData } from '@/components/dashboard/stats-accordion';
import { AttendanceCard } from '@/components/dashboard/attendance-card';
import { ProgressChartCard } from '@/components/dashboard/progress-chart-card';
import { Users, BookOpen, MessageSquare, DownloadIcon, BarChart2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useRef, useEffect } from 'react';
import styles from '@/styles/moving-border.module.css';

export default function AdminDashboard() {
  // Fetch all students for the total count
  const { data: students, isLoading: studentsLoading } = useQuery({
    queryKey: ["admin-dashboard-students-count"],
    queryFn: async () => {
      const { data, error, count } = await supabase
        .from("students")
        .select("*", { count: 'exact' });
        
      if (error) throw error;
      return { data, count: count || 0 };
    },
  });

  // Fetch all courses for the total count
  const { data: courses, isLoading: coursesLoading } = useQuery({
    queryKey: ["admin-dashboard-courses-count"],
    queryFn: async () => {
      const { data, error, count } = await supabase
        .from("courses")
        .select("*", { count: 'exact' });
        
      if (error) throw error;
      return { data, count: count || 0 };
    },
  });

  // Fetch all messages for the total count
  const { data: messages, isLoading: messagesLoading } = useQuery({
    queryKey: ["admin-dashboard-messages-count"],
    queryFn: async () => {
      const { data, error, count } = await supabase
        .from("messages")
        .select("*", { count: 'exact' });
        
      if (error) throw error;
      return { data, count: count || 0 };
    },
  });

  // Create the stats data with actual counts
  const statsData: StatsData[] = [
    { 
      id: 'students',
      title: 'Total Students', 
      value: studentsLoading ? '...' : students?.count || 0, 
      icon: <Users className="h-5 w-5" />, 
      trend: { value: 12, isPositive: true },
      description: 'Total number of enrolled students'
    },
    { 
      id: 'courses',
      title: 'Active Courses', 
      value: coursesLoading ? '...' : courses?.count || 0, 
      icon: <BookOpen className="h-5 w-5" />, 
      trend: { value: 0, isPositive: true },
      description: 'Currently active courses in this semester'
    },
    { 
      id: 'messages',
      title: 'Messages', 
      value: messagesLoading ? '...' : messages?.count || 0, 
      icon: <MessageSquare className="h-5 w-5" />, 
      trend: { value: 7, isPositive: true },
      description: 'Total messages in the system'
    },
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

  // Get high performing students (score >= 8)
  const highPerformingStudents = () => {
    if (!grades) return [];
    
    // Create a map of student scores by topic
    const studentTopicScores: Record<string, { 
      student: any, 
      topicScores: Record<string, number>,
      highScoreTopics: string[]
    }> = {};
    
    grades.forEach(grade => {
      if (!grade.students || !grade.score || !grade.topics) return;
      
      const studentId = grade.students.id;
      const topicName = grade.topics.name;
      const score = Number(grade.score);
      
      // Ensure score is within bounds (1-10)
      const boundedScore = Math.min(Math.max(score, 1), 10);
      
      if (!studentTopicScores[studentId]) {
        studentTopicScores[studentId] = {
          student: grade.students,
          topicScores: {},
          highScoreTopics: []
        };
      }
      
      studentTopicScores[studentId].topicScores[topicName] = boundedScore;
      
      // If score is high (>= 8), add to high score topics
      if (boundedScore >= 8) {
        if (!studentTopicScores[studentId].highScoreTopics.includes(topicName)) {
          studentTopicScores[studentId].highScoreTopics.push(topicName);
        }
      }
    });
    
    // Filter for high performers (>= 8 in any topic)
    return Object.values(studentTopicScores)
      .filter(entry => {
        const scores = Object.values(entry.topicScores);
        return scores.some(score => score >= 8);
      })
      .sort((a, b) => {
        // Sort by highest score in any topic
        const maxScoreA = Math.max(...Object.values(a.topicScores));
        const maxScoreB = Math.max(...Object.values(b.topicScores));
        return maxScoreB - maxScoreA;
      });
  };

  // Get low performing students (score <= 7)
  const lowPerformingStudents = () => {
    if (!grades) return [];
    
    // Create a map of student scores by topic
    const studentTopicScores: Record<string, { 
      student: any, 
      topicScores: Record<string, number>,
      lowScoreTopics: string[]
    }> = {};
    
    grades.forEach(grade => {
      if (!grade.students || !grade.score || !grade.topics) return;
      
      const studentId = grade.students.id;
      const topicName = grade.topics.name;
      const score = Number(grade.score);
      
      // Ensure score is within bounds (1-10)
      const boundedScore = Math.min(Math.max(score, 1), 10);
      
      if (!studentTopicScores[studentId]) {
        studentTopicScores[studentId] = {
          student: grade.students,
          topicScores: {},
          lowScoreTopics: []
        };
      }
      
      studentTopicScores[studentId].topicScores[topicName] = boundedScore;
      
      // If score is low (<= 7), add to low score topics
      if (boundedScore <= 7) {
        if (!studentTopicScores[studentId].lowScoreTopics.includes(topicName)) {
          studentTopicScores[studentId].lowScoreTopics.push(topicName);
        }
      }
    });
    
    // Filter for low performers (<= 7 in any topic)
    return Object.values(studentTopicScores)
      .filter(entry => {
        const scores = Object.values(entry.topicScores);
        return scores.some(score => score <= 7);
      })
      .sort((a, b) => {
        // Sort by lowest score in any topic
        const minScoreA = Math.min(...Object.values(a.topicScores));
        const minScoreB = Math.min(...Object.values(b.topicScores));
        return minScoreA - minScoreB;
      });
  };

  // Create a ref for scrolling to the latest messages
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [grades]);

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-muted-foreground">Overview of J-Studios Academy.</p>
        </div>

        {/* Stats Cards as Collapsibles */}
        <div className="space-y-4">
          <CollapsibleStatsCard
            title="Total Students"
            value={studentsLoading ? "..." : students?.count || 0}
            description="Total number of enrolled students"
            icon={<Users className="h-5 w-5" />}
            trend={{ value: 12, isPositive: true }}
            color="bg-indigo-500"
            textColor="text-white"
            detailContent={
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Active students:</span>
                  <span>{studentsLoading ? "..." : Math.floor((students?.count || 0) * 0.85)}</span>
                </div>
                <div className="flex justify-between">
                  <span>New this month:</span>
                  <span>{studentsLoading ? "..." : Math.floor((students?.count || 0) * 0.12)}</span>
                </div>
                <div className="flex items-center gap-2 mt-2 text-sm">
                  <DownloadIcon className="h-4 w-4" />
                  <span>Download student list</span>
                </div>
              </div>
            }
          />
          
          <CollapsibleStatsCard
            title="Active Courses"
            value={coursesLoading ? "..." : courses?.count || 0}
            description="Currently active courses in this semester"
            icon={<BookOpen className="h-5 w-5" />}
            trend={{ value: 0, isPositive: true }}
            color="bg-amber-300"
            textColor="text-black"
            detailContent={
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Upcoming courses:</span>
                  <span>{coursesLoading ? "..." : Math.floor((courses?.count || 0) * 0.3)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Completed courses:</span>
                  <span>{coursesLoading ? "..." : Math.floor((courses?.count || 0) * 0.2)}</span>
                </div>
                <div className="flex items-center gap-2 mt-2 text-sm">
                  <BarChart2 className="h-4 w-4" />
                  <span>View enrollment statistics</span>
                </div>
              </div>
            }
          />
          
          <CollapsibleStatsCard
            title="Messages"
            value={messagesLoading ? "..." : messages?.count || 0}
            description="Total messages in the system"
            icon={<MessageSquare className="h-5 w-5" />}
            trend={{ value: 7, isPositive: true }}
            color="bg-indigo-500"
            textColor="text-white"
            detailContent={
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Unread messages:</span>
                  <span>{messagesLoading ? "..." : Math.floor((messages?.count || 0) * 0.15)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Today's messages:</span>
                  <span>{messagesLoading ? "..." : Math.floor((messages?.count || 0) * 0.05)}</span>
                </div>
                <div className="flex items-center gap-2 mt-2 text-sm">
                  <MessageSquare className="h-4 w-4" />
                  <span>Go to message center</span>
                </div>
              </div>
            }
          />
        </div>

        {/* Performance Overview Cards with moving border animation */}
        <div className="grid gap-6 md:grid-cols-2">
          <div className={styles.movingBorderWrapper}>
            <Card className={`${styles.movingBorderContent} border-none`}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-yellow-500" />
                  Top Performing Students (Score 8-10)
                </CardTitle>
              </CardHeader>
              <CardContent>
                {gradesLoading ? (
                  <p className="text-muted-foreground">Loading student data...</p>
                ) : highPerformingStudents().length > 0 ? (
                  <div className="space-y-4">
                    {highPerformingStudents().map(entry => (
                      <div key={entry.student.id} className="flex flex-col border-b pb-2">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{entry.student.name}</p>
                            <p className="text-xs text-muted-foreground">{entry.student.student_id}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-lg font-bold text-green-600">
                              {Math.max(...Object.values(entry.topicScores)).toFixed(1)}
                            </span>
                            <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">High</span>
                          </div>
                        </div>
                        {entry.highScoreTopics.length > 0 && (
                          <div className="mt-1">
                            <p className="text-xs font-semibold text-green-700">Strong topics:</p>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {entry.highScoreTopics.map(topic => (
                                <span key={topic} className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-full">
                                  {topic}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No top performing students found.</p>
                )}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-orange-500" />
                Students Needing Attention (Score 1-7)
              </CardTitle>
            </CardHeader>
            <CardContent>
              {gradesLoading ? (
                <p className="text-muted-foreground">Loading student data...</p>
              ) : lowPerformingStudents().length > 0 ? (
                <div className="space-y-4">
                  {lowPerformingStudents().map(entry => (
                    <div key={entry.student.id} className="flex flex-col border-b pb-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{entry.student.name}</p>
                          <p className="text-xs text-muted-foreground">{entry.student.student_id}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-bold text-orange-600">
                            {Math.min(...Object.values(entry.topicScores)).toFixed(1)}
                          </span>
                          <span className="text-xs bg-orange-100 text-orange-800 px-2 py-0.5 rounded-full">Needs Help</span>
                        </div>
                      </div>
                      {entry.lowScoreTopics.length > 0 && (
                        <div className="mt-1">
                          <p className="text-xs font-semibold text-orange-700">Struggling topics:</p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {entry.lowScoreTopics.map(topic => (
                              <span key={topic} className="text-xs bg-orange-50 text-orange-700 px-2 py-0.5 rounded-full">
                                {topic}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No students requiring attention found.</p>
              )}
            </CardContent>
          </Card>
          <div ref={messagesEndRef} />
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
    </DashboardLayout>
  );
}
