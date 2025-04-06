
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { 
  Folder, 
  FolderPlus, 
  MoreVertical, 
  Edit, 
  Trash2 
} from "lucide-react";

export type TaskFolder = {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

interface TaskFoldersProps {
  selectedFolder: TaskFolder | null;
  onSelectFolder: (folder: TaskFolder | null) => void;
  onCreateFolder: () => void;
  onRenameFolder: (folder: TaskFolder) => void;
  onDeleteFolder: (folder: TaskFolder) => void;
}

export function TaskFolders({
  selectedFolder,
  onSelectFolder,
  onCreateFolder,
  onRenameFolder,
  onDeleteFolder
}: TaskFoldersProps) {
  // Fetch all folders
  const { data: folders, isLoading } = useQuery({
    queryKey: ["task-folders"],
    queryFn: async () => {
      try {
        // Use the generic version to work around TypeScript issues
        const { data, error } = await supabase
          .from('task_folders')
          .select("*")
          .order("name");
          
        if (error) {
          console.error("Error fetching folders:", error);
          toast.error("Failed to fetch task folders");
          throw error;
        }
        
        return data as TaskFolder[];
      } catch (error) {
        console.error("Error in query function:", error);
        throw error;
      }
    },
  });

  return (
    <Card className="mb-4">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg font-medium">Folders</CardTitle>
          <Button 
            size="sm"
            variant="outline"
            onClick={onCreateFolder}
          >
            <FolderPlus className="h-4 w-4 mr-1" />
            New Folder
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center p-4">
            <div className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : !folders || folders.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground">
            No folders available. Create a new folder to organize your tasks.
          </div>
        ) : (
          <div className="space-y-1">
            <Button
              variant={selectedFolder === null ? "secondary" : "ghost"}
              className="w-full justify-start"
              onClick={() => onSelectFolder(null)}
            >
              <Folder className="h-4 w-4 mr-2" />
              All Tasks
            </Button>
            
            {folders.map((folder) => (
              <div key={folder.id} className="flex items-center justify-between group">
                <Button
                  variant={selectedFolder?.id === folder.id ? "secondary" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => onSelectFolder(folder)}
                >
                  <Folder className="h-4 w-4 mr-2" />
                  {folder.name}
                </Button>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100"
                    >
                      <MoreVertical className="h-4 w-4" />
                      <span className="sr-only">Open menu</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onRenameFolder(folder)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Rename
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      className="text-destructive focus:text-destructive"
                      onClick={() => onDeleteFolder(folder)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
