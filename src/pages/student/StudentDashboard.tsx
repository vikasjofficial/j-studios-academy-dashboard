
import { CalendarCard } from '@/components/dashboard/calendar-card';
import { AttendanceCard } from '@/components/dashboard/attendance-card';
import { ProgressChartCard } from '@/components/dashboard/progress-chart-card';
import { TasksCard } from '@/components/dashboard/tasks-card';
import { useAuth } from '@/context/auth-context';
import StudentAttendanceDashboard from '@/components/dashboard/student-attendance-dashboard';

export default function StudentDashboard() {
  const { user } = useAuth();

  // Mock data for the student dashboard
  const calendarEvents = [
    { id: '1', title: 'Sound Design Basics', date: 'May 15, 2025', time: '10:00 AM', type: 'lecture' as const },
    { id: '2', title: 'Mixing Techniques', date: 'May 16, 2025', time: '02:00 PM', type: 'lecture' as const },
    { id: '3', title: 'Project Submission', date: 'May 20, 2025', time: '11:59 PM', type: 'assignment' as const },
    { id: '4', title: 'End of Semester Exam', date: 'June 10, 2025', time: '09:00 AM', type: 'exam' as const },
  ];

  const progressData = [
    { name: 'Composition', mark: 78, average: 75 },
    { name: 'Mixing', mark: 85, average: 75 },
    { name: 'Sound Design', mark: 92, average: 80 },
    { name: 'Arranging', mark: 70, average: 72 },
    { name: 'Theory', mark: 82, average: 74 },
  ];

  const tasksData = [
    { id: '1', title: 'Sound Design Project', dueDate: 'May 20, 2025', status: 'pending' as const, priority: 'high' as const },
    { id: '2', title: 'Theory Assignment', dueDate: 'May 18, 2025', status: 'pending' as const, priority: 'medium' as const },
    { id: '3', title: 'Mixing Exercise', dueDate: 'May 25, 2025', status: 'pending' as const, priority: 'medium' as const },
    { id: '4', title: 'Reading Assignment', dueDate: 'May 10, 2025', status: 'completed' as const, priority: 'low' as const },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Welcome, {user?.name}</h1>
        <p className="text-muted-foreground">Your personal J-Studios Academy dashboard.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
        <CalendarCard
          title="My Schedule"
          events={calendarEvents}
        />
        <AttendanceCard
          title="My Attendance"
          percentage={92}
          present={23}
          total={25}
        />
      </div>

      <div className="bg-white/5 backdrop-blur-md rounded-xl p-6 border border-white/10">
        <h2 className="text-xl font-semibold mb-4">Attendance by Course</h2>
        <StudentAttendanceDashboard />
      </div>

      <ProgressChartCard
        title="My Progress"
        data={progressData}
      />

      <TasksCard
        title="My Assignments"
        tasks={tasksData}
      />
    </div>
  );
}
