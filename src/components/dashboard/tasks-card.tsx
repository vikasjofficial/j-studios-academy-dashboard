
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ListTodo, Clock, CheckCircle, XCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface Task {
  id: string;
  title: string;
  dueDate: string;
  status: 'pending' | 'completed' | 'overdue';
  priority: 'low' | 'medium' | 'high';
}

interface TasksCardProps {
  title: string;
  tasks: Task[];
  className?: string;
}

export function TasksCard({ title, tasks, className }: TasksCardProps) {
  const getPriorityStyles = (priority: Task['priority']) => {
    switch (priority) {
      case 'low':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'medium':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: Task['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'overdue':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-amber-500" />;
    }
  };

  // Sort tasks by status (pending/overdue first, then completed) and then by priority
  const sortedTasks = [...tasks].sort((a, b) => {
    // First by status
    if (a.status === 'completed' && b.status !== 'completed') return 1;
    if (a.status !== 'completed' && b.status === 'completed') return -1;
    
    // Then by priority
    const priorityOrder: Record<Task['priority'], number> = {
      high: 0,
      medium: 1,
      low: 2
    };
    
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });

  return (
    <Card className={cn("overflow-hidden transition-all hover-card-animation", className)}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-medium">{title}</CardTitle>
        <ListTodo className="h-5 w-5 text-muted-foreground" />
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y">
          {sortedTasks.length > 0 ? (
            sortedTasks.map((task) => (
              <div
                key={task.id}
                className={cn(
                  "p-4 flex items-center justify-between hover:bg-muted/40 transition-colors",
                  task.status === 'completed' && "opacity-60"
                )}
              >
                <div className="flex items-center space-x-3">
                  {getStatusIcon(task.status)}
                  <div className="space-y-1">
                    <p className={cn(
                      "font-medium text-sm",
                      task.status === 'completed' && "line-through"
                    )}>
                      {task.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Due: {task.dueDate}
                    </p>
                  </div>
                </div>
                <Badge variant="outline" className={cn("text-xs", getPriorityStyles(task.priority))}>
                  {task.priority}
                </Badge>
              </div>
            ))
          ) : (
            <div className="p-6 text-center text-muted-foreground">
              No tasks available
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
