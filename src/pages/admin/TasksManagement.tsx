
import DashboardLayout from '@/components/dashboard-layout';
import { TaskList } from '@/components/tasks/task-list';

export default function TasksManagement() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tasks Management</h1>
          <p className="text-muted-foreground">Create, manage, and assign tasks to students.</p>
        </div>
        
        <TaskList />
      </div>
    </DashboardLayout>
  );
}
