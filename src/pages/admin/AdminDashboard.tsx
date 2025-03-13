
import { StatsCard } from '@/components/dashboard/stats-card';
import { CalendarCard } from '@/components/dashboard/calendar-card';
import { AttendanceCard } from '@/components/dashboard/attendance-card';
import { ProgressChartCard } from '@/components/dashboard/progress-chart-card';
import { TasksCard } from '@/components/dashboard/tasks-card';
import { Users, BookOpen, GraduationCap, MessageSquare } from 'lucide-react';

export default function AdminDashboard() {
  // Mock data for the dashboard components
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

  const tasksData = [
    { id: '1', title: 'Prepare lecture slides', dueDate: 'May 14, 2025', status: 'pending' as const, priority: 'high' as const },
    { id: '2', title: 'Grade semester projects', dueDate: 'May 22, 2025', status: 'pending' as const, priority: 'medium' as const },
    { id: '3', title: 'Schedule one-on-one sessions', dueDate: 'May 18, 2025', status: 'pending' as const, priority: 'medium' as const },
    { id: '4', title: 'Update course materials', dueDate: 'May 10, 2025', status: 'completed' as const, priority: 'low' as const },
  ];

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
          className="md:col-span-2 lg:col-span-2"
        />
        <TasksCard
          title="Upcoming Tasks"
          tasks={tasksData}
          className="md:col-span-2 lg:col-span-1"
        />
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
