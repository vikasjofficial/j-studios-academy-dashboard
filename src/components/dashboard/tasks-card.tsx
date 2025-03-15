
import { ListTodo, Clock, CheckCircle, XCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import cardStyles from '@/styles/card.module.css';

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

  // Sort tasks by status and priority
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
    <div className={cn(
      "relative p-6 rounded-xl overflow-hidden backdrop-blur-md transition-all",
      "bg-white/5 border border-white/10 hover:bg-white/10",
      cardStyles.glassMorphism,
      className
    )}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold">{title}</h3>
        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/20 text-primary">
          <ListTodo className="h-5 w-5" />
        </div>
      </div>
      
      <div className="space-y-2">
        {sortedTasks.length > 0 ? (
          sortedTasks.map((task) => (
            <div
              key={task.id}
              className={cn(
                "p-3 rounded-lg bg-white/5 border border-white/10 flex items-center justify-between",
                "hover:bg-white/10 transition-colors",
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
          <div className="p-4 text-center text-muted-foreground bg-white/5 rounded-lg">
            No tasks available
          </div>
        )}
      </div>
      
      {sortedTasks.length > 0 && (
        <div className="mt-4 flex justify-end">
          <button className="text-xs px-3 py-1.5 rounded-md bg-primary/20 text-primary hover:bg-primary/30 transition-colors">
            Add Task
          </button>
        </div>
      )}
    </div>
  );
}
