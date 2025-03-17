
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Clock } from "lucide-react";

export interface Task {
  id: string;
  title: string;
  due_date: string;
  is_completed: boolean;
}

export interface TasksCardProps {
  title?: string;
  tasks?: Task[];
}

export function TasksCard({ title = "My Tasks", tasks = [] }: TasksCardProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-medium flex items-center">
          <CheckCircle className="mr-2 h-4 w-4 text-primary" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {tasks && tasks.length > 0 ? (
          <div className="space-y-3">
            {tasks.map(task => (
              <div key={task.id} className="flex justify-between border-b pb-2 last:border-0 last:pb-0">
                <div className="font-medium">{task.title}</div>
                <div className="flex items-center">
                  <Clock className="mr-2 h-3 w-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">{task.due_date}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-3 text-sm text-muted-foreground">
            No tasks due.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
