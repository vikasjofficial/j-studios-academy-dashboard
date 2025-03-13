
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
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'medium':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case 'high':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
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
    <Card className={cn(
      "overflow-hidden glass-morphism border-0 relative",
      "before:absolute before:inset-0 before:rounded-lg before:bg-gradient-to-br before:from-orange-500/30 before:to-transparent before:opacity-20 before:-z-10",
      className
    )}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-medium">{title}</CardTitle>
        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-orange-500/20 text-orange-500">
          <ListTodo className="h-5 w-5" />
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-white/10">
          {sortedTasks.length > 0 ? (
            sortedTasks.map((task) => (
              <div
                key={task.id}
                className={cn(
                  "p-4 flex items-center justify-between hover:bg-white/5 transition-colors",
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
