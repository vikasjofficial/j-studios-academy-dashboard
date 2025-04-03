
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/auth-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Clock, CircleAlert } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";

export interface Task {
  id: string;
  title: string;
  due_date: string;
  is_completed: boolean;
}

export function TasksCard() {
  const { user } = useAuth();
  const [showAll, setShowAll] = useState(false);

  // Fetch student tasks
  const { data: tasks, isLoading } = useQuery({
    queryKey: ["student-tasks", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data: student, error: studentError } = await supabase
        .from("students")
        .select("id")
        .eq("id", user.id)
        .single();
        
      if (studentError) throw studentError;
      
      const { data, error } = await supabase
        .from("student_tasks")
        .select(`
          id,
          tasks:task_id(title),
          due_date,
          status
        `)
        .eq("student_id", student.id)
        .order("due_date", { ascending: true });
        
      if (error) throw error;
      
      return data.map(item => ({
        id: item.id,
        title: item.tasks.title,
        due_date: format(new Date(item.due_date), "MMM d, yyyy"),
        status: item.status
      }));
    },
    enabled: !!user?.id,
  });
  
  const displayedTasks = showAll ? tasks : tasks?.slice(0, 3);

  // Get badge color based on status
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return "text-green-700";
      case 'pending':
        return "text-blue-700";
      case 'overdue':
        return "text-red-700";
      default:
        return "text-gray-700";
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-medium flex items-center">
          <CheckCircle className="mr-2 h-4 w-4 text-primary" />
          My Tasks
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center py-6">
            <div className="h-5 w-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : !tasks || tasks.length === 0 ? (
          <div className="text-center py-3 text-sm text-muted-foreground">
            No tasks due.
          </div>
        ) : (
          <>
            <div className="space-y-3">
              {displayedTasks?.map(task => (
                <div key={task.id} className="flex justify-between border-b pb-2 last:border-0 last:pb-0">
                  <div className="font-medium">{task.title}</div>
                  <div className="flex items-center">
                    <Clock className="mr-2 h-3 w-3 text-muted-foreground" />
                    <span className={`text-xs ${getStatusColor(task.status)}`}>
                      {task.due_date}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            
            {tasks && tasks.length > 3 && (
              <div className="mt-3 flex justify-end">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setShowAll(!showAll)}
                >
                  {showAll ? "Show Less" : `Show All (${tasks.length})`}
                </Button>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
