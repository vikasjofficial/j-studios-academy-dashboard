import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CreateTaskDialog } from "./create-task-dialog";
import { AssignTaskDialog } from "./assign-task-dialog";
import { EditTaskStatusDialog } from "./edit-task-status-dialog";
import { EditTaskDialog } from "./edit-task-dialog";
import { UnassignTaskDialog } from "./unassign-task-dialog";
import { TaskFolders, TaskFolder } from "./task-folders";
import { CreateFolderDialog } from "./create-folder-dialog";
import { RenameFolderDialog } from "./rename-folder-dialog";
import { DeleteFolderDialog } from "./delete-folder-dialog";
import { toast } from "sonner";
import { 
  CheckCircle, Clock, CircleAlert, PencilLine, 
  UserPlus, Edit, Users, UserMinus, Folder
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export type Task = {
  id: string;
  title: string;
  description: string | null;
  created_at: string;
  created_by: string;
  is_active: boolean;
  folder_id: string | null;
  folder_name?: string | null;
}

type StudentAssignment = {
  id: string;
  student_id: string;
  student_name: string;
  due_date: string;
  status: string;
}

export function TaskList() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [isEditStatusDialogOpen, setIsEditStatusDialogOpen] = useState(false);
  const [isEditTaskDialogOpen, setIsEditTaskDialogOpen] = useState(false);
  const [isUnassignDialogOpen, setIsUnassignDialogOpen] = useState(false);
  const [isViewAssignmentsOpen, setIsViewAssignmentsOpen] = useState(false);
  const [isCreateFolderOpen, setIsCreateFolderOpen] = useState(false);
  const [isRenameFolderOpen, setIsRenameFolderOpen] = useState(false);
  const [isDeleteFolderOpen, setIsDeleteFolderOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [selectedStudentTask, setSelectedStudentTask] = useState<{id: string, studentName: string} | null>(null);
  const [taskAssignments, setTaskAssignments] = useState<StudentAssignment[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<TaskFolder | null>(null);
  const [folderToEdit, setFolderToEdit] = useState<TaskFolder | null>(null);

  // Fetch all tasks, optionally filtered by folder
  const { data: tasks, isLoading, refetch } = useQuery({
    queryKey: ["admin-tasks", selectedFolder?.id],
    queryFn: async () => {
      try {
        let query = supabase
          .from("tasks")
          .select(`
            *,
            task_folders(name)
          `)
          .order("created_at", { ascending: false });
          
        // Apply folder filter if a folder is selected
        if (selectedFolder) {
          query = query.eq("folder_id", selectedFolder.id);
        }
        
        const { data, error } = await query;
        
        if (error) {
          console.error("Error fetching tasks:", error);
          toast.error("Failed to fetch tasks");
          throw error;
        }
        
        // Format the data to include folder name
        const formattedData = data.map(task => ({
          ...task,
          folder_name: task.task_folders ? task.task_folders.name : null
        }));
        
        return formattedData as Task[];
      } catch (error) {
        console.error("Error in query function:", error);
        throw error;
      }
    },
  });
  
  const fetchTaskAssignments = async (taskId: string) => {
    try {
      const { data, error } = await supabase
        .from("student_tasks")
        .select(`
          id,
          student_id,
          students:student_id(name),
          due_date,
          status
        `)
        .eq("task_id", taskId);
        
      if (error) throw error;
      
      const formattedData = data.map(item => ({
        id: item.id,
        student_id: item.student_id,
        student_name: item.students?.name || 'Unknown',
        due_date: new Date(item.due_date).toLocaleDateString(),
        status: item.status
      }));
      
      setTaskAssignments(formattedData);
    } catch (error) {
      console.error("Error fetching task assignments:", error);
      toast.error("Failed to fetch assigned students");
    }
  };
  
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

  const handleTaskUpdated = () => {
    setIsEditTaskDialogOpen(false);
    refetch();
    toast.success("Task updated successfully");
  };
  
  const handleTaskUnassigned = () => {
    setIsUnassignDialogOpen(false);
    if (selectedTask) {
      fetchTaskAssignments(selectedTask.id);
    }
  };
  
  const handleFolderCreated = () => {
    refetch();
  };
  
  const handleFolderRenamed = () => {
    refetch();
  };
  
  const handleFolderDeleted = () => {
    setSelectedFolder(null);
    refetch();
  };
  
  const openAssignDialog = (task: Task) => {
    setSelectedTask(task);
    setIsAssignDialogOpen(true);
  };
  
  const openEditStatusDialog = (task: Task) => {
    setSelectedTask(task);
    setIsEditStatusDialogOpen(true);
  };

  const openEditTaskDialog = (task: Task) => {
    setSelectedTask(task);
    setIsEditTaskDialogOpen(true);
  };
  
  const openViewAssignments = async (task: Task) => {
    setSelectedTask(task);
    await fetchTaskAssignments(task.id);
    setIsViewAssignmentsOpen(true);
  };
  
  const openUnassignDialog = (studentTaskId: string, studentName: string) => {
    if (!selectedTask) return;
    setSelectedStudentTask({ id: studentTaskId, studentName });
    setIsUnassignDialogOpen(true);
  };
  
  const openCreateFolder = () => {
    setIsCreateFolderOpen(true);
  };
  
  const openRenameFolder = (folder: TaskFolder) => {
    setFolderToEdit(folder);
    setIsRenameFolderOpen(true);
  };
  
  const openDeleteFolder = (folder: TaskFolder) => {
    setFolderToEdit(folder);
    setIsDeleteFolderOpen(true);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-[250px_1fr] gap-4">
      <div>
        <TaskFolders
          selectedFolder={selectedFolder}
          onSelectFolder={setSelectedFolder}
          onCreateFolder={openCreateFolder}
          onRenameFolder={openRenameFolder}
          onDeleteFolder={openDeleteFolder}
        />
      </div>
      
      <div>
        <div className="flex justify-between mb-4">
          <h2 className="text-xl font-semibold">
            {selectedFolder ? `Tasks: ${selectedFolder.name}` : 'All Tasks'}
          </h2>
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
                    <TableHead>Folder</TableHead>
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
                      <TableCell>
                        {task.folder_name ? (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                            <Folder className="h-3 w-3 mr-1" />
                            {task.folder_name}
                          </span>
                        ) : (
                          "—"
                        )}
                      </TableCell>
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
                            onClick={() => openEditTaskDialog(task)}
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
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
                            onClick={() => openViewAssignments(task)}
                          >
                            <Users className="h-4 w-4 mr-1" />
                            View Assignments
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
      </div>
      
      {/* View Assignments Dialog */}
      <Dialog open={isViewAssignmentsOpen} onOpenChange={setIsViewAssignmentsOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>
              {selectedTask?.title} - Assigned Students
            </DialogTitle>
          </DialogHeader>
          
          {taskAssignments.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              This task has not been assigned to any students yet.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {taskAssignments.map((assignment) => (
                  <TableRow key={assignment.id}>
                    <TableCell>{assignment.student_name}</TableCell>
                    <TableCell>{assignment.due_date}</TableCell>
                    <TableCell>
                      {assignment.status === 'completed' && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Completed
                        </span>
                      )}
                      {assignment.status === 'pending' && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800">
                          <Clock className="h-3 w-3 mr-1" />
                          Pending
                        </span>
                      )}
                      {assignment.status === 'overdue' && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-red-100 text-red-800">
                          <CircleAlert className="h-3 w-3 mr-1" />
                          Overdue
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                        onClick={() => openUnassignDialog(assignment.id, assignment.student_name)}
                      >
                        <UserMinus className="h-4 w-4 mr-1" />
                        Unassign
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </DialogContent>
      </Dialog>
      
      {/* Folder Dialogs */}
      <CreateFolderDialog
        open={isCreateFolderOpen}
        onOpenChange={setIsCreateFolderOpen}
        onFolderCreated={handleFolderCreated}
      />
      
      {folderToEdit && (
        <>
          <RenameFolderDialog
            open={isRenameFolderOpen}
            onOpenChange={setIsRenameFolderOpen}
            folder={folderToEdit}
            onFolderRenamed={handleFolderRenamed}
          />
          
          <DeleteFolderDialog
            open={isDeleteFolderOpen}
            onOpenChange={setIsDeleteFolderOpen}
            folder={folderToEdit}
            onFolderDeleted={handleFolderDeleted}
          />
        </>
      )}
      
      {/* Other Dialogs */}
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

          <EditTaskDialog
            open={isEditTaskDialogOpen}
            onOpenChange={setIsEditTaskDialogOpen}
            task={selectedTask}
            onTaskUpdated={handleTaskUpdated}
          />
          
          {selectedStudentTask && (
            <UnassignTaskDialog
              open={isUnassignDialogOpen}
              onOpenChange={setIsUnassignDialogOpen}
              task={selectedTask}
              studentTaskId={selectedStudentTask.id}
              studentName={selectedStudentTask.studentName}
              onTaskUnassigned={handleTaskUnassigned}
            />
          )}
        </>
      )}
    </div>
  );
}
