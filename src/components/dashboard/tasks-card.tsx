
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/auth-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckSquare, Clock, AlertTriangle, SquarePen, ListTodo } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import styles from "@/styles/card.module.css";

export interface Task {
  id: string;
  title: string;
  due_date: string;
  status: string;
  description?: string;
}

export function TasksCard() {
  const { user } = useAuth();
  const [showAll, setShowAll] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [taskDialogOpen, setTaskDialogOpen] = useState(false);

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
      
      // Use type assertion to fix TypeScript errors
      const { data, error } = await supabase
        .from("student_tasks" as any)
        .select(`
          id,
          tasks:task_id(id, title, description),
          due_date,
          status
        `)
        .eq("student_id", student.id)
        .order("due_date", { ascending: true });
        
      if (error) throw error;
      
      return (data as any[]).map(item => ({
        id: item.id,
        title: item.tasks.title,
        description: item.tasks.description,
        due_date: format(new Date(item.due_date), "MMM d, yyyy"),
        status: item.status
      }));
    },
    enabled: !!user?.id,
  });
  
  const displayedTasks = showAll ? tasks : tasks?.slice(0, 3);

  // Get badge color based on status
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return (
          <Badge className="ml-2 bg-[#0EA5E9] hover:bg-[#0EA5E9]/90 text-white">
            <CheckSquare className="h-3 w-3 mr-1" />
            Completed
          </Badge>
        );
      case 'pending':
        return (
          <Badge className="ml-2 bg-[#F59E0B] hover:bg-[#F59E0B]/90 text-white">
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        );
      case 'overdue':
        return (
          <Badge className="ml-2 bg-[#EF4444] hover:bg-[#EF4444]/90 text-white">
            <AlertTriangle className="h-3 w-3 mr-1" />
            Overdue
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary" className="ml-2">
            {status}
          </Badge>
        );
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-gradient-to-r from-blue-500 to-blue-600';
      case 'pending':
        return 'bg-gradient-to-r from-orange-400 to-orange-500';
      case 'overdue':
        return 'bg-gradient-to-r from-red-500 to-red-600';
      default:
        return 'bg-gradient-to-r from-gray-400 to-gray-500';
    }
  };

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setTaskDialogOpen(true);
  };

  return (
    <Card className={`overflow-hidden shadow-lg ${styles.glassMorphism}`}>
      <CardHeader className="bg-gradient-to-r from-[#F97316] to-[#FB923C] text-white pb-3">
        <CardTitle className="text-lg font-medium flex items-center">
          <ListTodo className="mr-2 h-5 w-5 text-white" />
          My Tasks
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-5">
        {isLoading ? (
          <div className="flex justify-center items-center py-6">
            <div className="h-5 w-5 border-2 border-[#F97316] border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : !tasks || tasks.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            <SquarePen className="mx-auto h-10 w-10 text-muted-foreground/50 mb-2" />
            <p>No tasks due.</p>
          </div>
        ) : (
          <>
            <div className="space-y-3">
              {displayedTasks?.map(task => (
                <div 
                  key={task.id} 
                  className={`relative overflow-hidden rounded-lg transition-all duration-300 transform hover:translate-y-[-2px] hover:shadow-md cursor-pointer`}
                  onClick={() => handleTaskClick(task)}
                >
                  <div className={`${getStatusColor(task.status)} w-1.5 absolute left-0 top-0 h-full`}></div>
                  <div className="pl-4 pr-3 py-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 bg-gradient-to-r from-black/5 to-black/10 hover:from-black/10 hover:to-black/15">
                    <div className="font-medium">
                      {task.title}
                      {getStatusBadge(task.status)}
                    </div>
                    <div className="flex items-center text-xs text-muted-foreground bg-black/20 px-2 py-1 rounded-full">
                      <Clock className="mr-1 h-3 w-3" />
                      <span>Due: {task.due_date}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {tasks && tasks.length > 3 && (
              <div className="mt-5 flex justify-end">
                <Button 
                  className="bg-gradient-to-r from-[#F97316] to-[#FB923C] hover:from-[#F97316]/90 hover:to-[#FB923C]/90 text-white"
                  size="sm" 
                  onClick={() => setShowAll(!showAll)}
                >
                  {showAll ? "Show Less" : `Show All (${tasks.length})`}
                </Button>
              </div>
            )}
          </>
        )}

        {/* Task Detail Dialog */}
        <Dialog open={taskDialogOpen} onOpenChange={setTaskDialogOpen}>
          <DialogContent className={styles.glassMorphism}>
            <DialogHeader className="bg-gradient-to-r from-[#F97316] to-[#FB923C] text-white p-4 rounded-t-lg -mt-6 -mx-6 mb-4">
              <DialogTitle className="text-xl font-bold">{selectedTask?.title}</DialogTitle>
              <DialogDescription className="text-white/80 flex items-center pt-2">
                <span className="mr-2">Due Date: {selectedTask?.due_date}</span>
                {selectedTask && getStatusBadge(selectedTask.status)}
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <h4 className="text-sm font-medium mb-2">Description:</h4>
              <div className="text-sm bg-muted/30 p-4 rounded-md border border-muted">
                {selectedTask?.description || "No description provided."}
              </div>
            </div>
            <DialogFooter>
              <Button 
                className="bg-gradient-to-r from-[#F97316] to-[#FB923C] hover:from-[#F97316]/90 hover:to-[#FB923C]/90 text-white" 
                onClick={() => setTaskDialogOpen(false)}
              >
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
