
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CreateTaskDialog } from "./create-task-dialog";
import { AssignTaskDialog } from "./assign-task-dialog";
import { EditTaskStatusDialog } from "./edit-task-status-dialog";
import { toast } from "sonner";
import { CheckCircle, Clock, CircleAlert, PencilLine, UserPlus } from "lucide-react";

export type Task = {
  id: string;
  title: string;
  description: string | null;
  created_at: string;
  created_by: string;
  is_active: boolean;
}

export function TaskList() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [isEditStatusDialogOpen, setIsEditStatusDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  // Fetch all tasks
  const { data: tasks, isLoading, refetch } = useQuery({
    queryKey: ["admin-tasks"],
    queryFn: async () => {
      // Use type assertion to fix TypeScript errors
      const { data, error } = await supabase
        .from("tasks" as any)
        .select("*")
        .order("created_at", { ascending: false });
        
      if (error) {
        toast.error("Failed to fetch tasks");
        throw error;
      }
      
      return data as Task[];
    },
  });
  
  const handleTaskCreated = () => {
    setIsCreateDialogOpen(false);
    refetch();
    toast.success("Task created successfully");
  };
  
  const handleTaskAssigned = () => {
    setIsAssignDialogOpen(false);
    toast.success("Task assigned successfully");
  };
  
  const handleStatusUpdated = () => {
    setIsEditStatusDialogOpen(false);
    toast.success("Task status updated successfully");
  };
  
  const openAssignDialog = (task: Task) => {
    setSelectedTask(task);
    setIsAssignDialogOpen(true);
  };
  
  const openEditStatusDialog = (task: Task) => {
    setSelectedTask(task);
    setIsEditStatusDialogOpen(true);
  };

  return (
    <div>
      <div className="flex justify-between mb-4">
        <h2 className="text-xl font-semibold">Task Management</h2>
        <Button onClick={() => setIsCreateDialogOpen(true)}>Create New Task</Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Tasks</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center p-4">
              <div className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : !tasks || tasks.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground">
              No tasks available. Create a new task to get started.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tasks.map((task) => (
                  <TableRow key={task.id}>
                    <TableCell className="font-medium">{task.title}</TableCell>
                    <TableCell>{task.description || "—"}</TableCell>
                    <TableCell>{new Date(task.created_at).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs ${task.is_active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}>
                        {task.is_active ? "Active" : "Inactive"}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => openAssignDialog(task)}
                        >
                          <UserPlus className="h-4 w-4 mr-1" />
                          Assign
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => openEditStatusDialog(task)}
                        >
                          <PencilLine className="h-4 w-4 mr-1" />
                          Status
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
      
      {/* Dialogs */}
      <CreateTaskDialog 
        open={isCreateDialogOpen} 
        onOpenChange={setIsCreateDialogOpen}
        onTaskCreated={handleTaskCreated}
      />
      
      {selectedTask && (
        <>
          <AssignTaskDialog 
            open={isAssignDialogOpen} 
            onOpenChange={setIsAssignDialogOpen}
            task={selectedTask}
            onTaskAssigned={handleTaskAssigned}
          />
          
          <EditTaskStatusDialog 
            open={isEditStatusDialogOpen} 
            onOpenChange={setIsEditStatusDialogOpen}
            task={selectedTask}
            onStatusUpdated={handleStatusUpdated}
          />
        </>
      )}
    </div>
  );
}
