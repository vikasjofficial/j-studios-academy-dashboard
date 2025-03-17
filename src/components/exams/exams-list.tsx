
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Exam, ExamType } from "./types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Users, Clock, PlayCircle, Folder, CheckCircle } from "lucide-react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface ExamFolder {
  id: string;
  name: string;
  exam_type: ExamType;
  created_at: string;
}

interface ExamsListProps {
  exams: (Exam & { exam_folders?: { id: string; name: string } | null })[];
  examType: ExamType;
  folders: ExamFolder[];
}

export function ExamsList({ exams, examType, folders }: ExamsListProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [examToDelete, setExamToDelete] = useState<Exam | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [editFolderOpen, setEditFolderOpen] = useState<string | null>(null);
  const [editFolderName, setEditFolderName] = useState("");
  const [folderAssignDialogOpen, setFolderAssignDialogOpen] = useState(false);
  const [examToAssignFolder, setExamToAssignFolder] = useState<Exam | null>(null);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({});

  // Group exams by folder
  const ungroupedExams = exams.filter(exam => !exam.folder_id);
  const groupedExams: Record<string, Exam[]> = {};
  
  exams.forEach(exam => {
    if (exam.folder_id) {
      if (!groupedExams[exam.folder_id]) {
        groupedExams[exam.folder_id] = [];
      }
      groupedExams[exam.folder_id].push(exam);
    }
  });

  const formatExamType = (type: ExamType) => {
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  const handleDeleteClick = (exam: Exam) => {
    setExamToDelete(exam);
    setDeleteDialogOpen(true);
  };

  const handleDeleteExam = async () => {
    if (!examToDelete) return;
    
    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from("exams")
        .delete()
        .eq("id", examToDelete.id);

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ["exams"] });
      toast.success(`${examToDelete.name} deleted successfully`);
      setDeleteDialogOpen(false);
    } catch (error) {
      console.error("Error deleting exam:", error);
      toast.error("Failed to delete exam");
    } finally {
      setIsDeleting(false);
    }
  };

  const navigateToExamDetail = (examId: string) => {
    navigate(`/admin/exams/${examId}`);
  };

  const navigateToAssignExam = (examId: string) => {
    navigate(`/admin/exams/${examId}/assign`);
  };

  const handleFolderEdit = (folderId: string, currentName: string) => {
    setEditFolderName(currentName);
    setEditFolderOpen(folderId);
  };

  const saveEditedFolder = async (folderId: string) => {
    try {
      const { error } = await supabase
        .from("exam_folders")
        .update({ name: editFolderName })
        .eq("id", folderId);

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ["exam-folders"] });
      queryClient.invalidateQueries({ queryKey: ["exams"] });
      toast.success("Folder name updated successfully");
      setEditFolderOpen(null);
    } catch (error) {
      console.error("Error updating folder:", error);
      toast.error("Failed to update folder name");
    }
  };

  const deleteFolder = async (folderId: string) => {
    try {
      // First, update all exams in this folder to have null folder_id
      const { error: updateError } = await supabase
        .from("exams")
        .update({ folder_id: null })
        .eq("folder_id", folderId);

      if (updateError) throw updateError;

      // Then delete the folder
      const { error: deleteError } = await supabase
        .from("exam_folders")
        .delete()
        .eq("id", folderId);

      if (deleteError) throw deleteError;

      queryClient.invalidateQueries({ queryKey: ["exam-folders"] });
      queryClient.invalidateQueries({ queryKey: ["exams"] });
      toast.success("Folder deleted successfully");
    } catch (error) {
      console.error("Error deleting folder:", error);
      toast.error("Failed to delete folder");
    }
  };

  const openFolderAssignDialog = (exam: Exam) => {
    setExamToAssignFolder(exam);
    setSelectedFolderId(exam.folder_id || null);
    setFolderAssignDialogOpen(true);
  };

  const assignExamToFolder = async () => {
    if (!examToAssignFolder) return;

    try {
      const { error } = await supabase
        .from("exams")
        .update({ folder_id: selectedFolderId })
        .eq("id", examToAssignFolder.id);

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ["exams"] });
      toast.success("Exam moved to folder successfully");
      setFolderAssignDialogOpen(false);
    } catch (error) {
      console.error("Error assigning exam to folder:", error);
      toast.error("Failed to move exam to folder");
    }
  };

  const toggleFolder = (folderId: string) => {
    setExpandedFolders(prev => ({
      ...prev,
      [folderId]: !prev[folderId]
    }));
  };

  if (exams.length === 0 && folders.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No {examType} exams found.</p>
        <p className="text-sm text-muted-foreground mt-2">
          Create a new {examType} exam or folder to get started.
        </p>
      </div>
    );
  }

  const renderExamCard = (exam: Exam) => (
    <Card key={exam.id} className="hover:bg-muted/50 transition-colors mb-3">
      <CardContent className="p-4">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <h3 className="text-lg font-semibold">{exam.name}</h3>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              {exam.total_time_minutes} minutes
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">{formatExamType(exam.exam_type)}</Badge>
              {exam.is_active ? (
                <Badge variant="success">Active</Badge>
              ) : (
                <Badge variant="destructive">Inactive</Badge>
              )}
            </div>
            {exam.description && (
              <p className="text-sm text-muted-foreground max-w-2xl">
                {exam.description}
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              Created on {format(new Date(exam.created_at), "MMM d, yyyy")}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={() => openFolderAssignDialog(exam)}>
              <Folder className="h-4 w-4 mr-1" />
              Move
            </Button>
            <Button size="sm" variant="outline" onClick={() => navigateToExamDetail(exam.id)}>
              <Edit className="h-4 w-4 mr-1" />
              Edit
            </Button>
            <Button size="sm" variant="outline" onClick={() => navigateToAssignExam(exam.id)}>
              <Users className="h-4 w-4 mr-1" />
              Assign
            </Button>
            <Button 
              size="sm" 
              variant="destructive" 
              onClick={() => handleDeleteClick(exam)}
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Delete
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-4">
      {/* Folders */}
      {folders.map(folder => (
        <div key={folder.id} className="mb-4">
          <Collapsible 
            open={expandedFolders[folder.id]} 
            onOpenChange={() => toggleFolder(folder.id)}
            className="border rounded-lg"
          >
            <div className="p-3 flex items-center justify-between bg-muted/30 rounded-t-lg">
              <CollapsibleTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2 p-0 h-auto">
                  <Folder className="h-5 w-5 text-primary" />
                  <span className="font-medium">{folder.name}</span>
                  {groupedExams[folder.id]?.length > 0 && (
                    <Badge variant="outline" className="ml-2">
                      {groupedExams[folder.id]?.length || 0} exams
                    </Badge>
                  )}
                </Button>
              </CollapsibleTrigger>
              
              <div className="flex items-center gap-2">
                {editFolderOpen === folder.id ? (
                  <>
                    <Input 
                      value={editFolderName} 
                      onChange={(e) => setEditFolderName(e.target.value)}
                      className="h-8 w-40"
                    />
                    <Button 
                      size="sm" 
                      onClick={() => saveEditedFolder(folder.id)}
                      variant="ghost"
                    >
                      <CheckCircle className="h-4 w-4" />
                    </Button>
                    <Button 
                      size="sm" 
                      onClick={() => setEditFolderOpen(null)}
                      variant="ghost"
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </>
                ) : (
                  <>
                    <Button 
                      size="sm" 
                      variant="ghost"
                      onClick={() => handleFolderEdit(folder.id, folder.name)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="ghost"
                      className="text-destructive hover:text-destructive"
                      onClick={() => deleteFolder(folder.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </>
                )}
              </div>
            </div>
            
            <CollapsibleContent className="p-4 pt-2">
              {groupedExams[folder.id]?.length > 0 ? (
                groupedExams[folder.id].map(exam => renderExamCard(exam))
              ) : (
                <div className="text-center py-4 text-muted-foreground">
                  No exams in this folder yet.
                </div>
              )}
            </CollapsibleContent>
          </Collapsible>
        </div>
      ))}

      {/* Ungrouped Exams */}
      {ungroupedExams.length > 0 && (
        <div className="mt-4">
          <h3 className="text-lg font-medium mb-3">Uncategorized Exams</h3>
          {ungroupedExams.map(exam => renderExamCard(exam))}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Exam</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>
              Are you sure you want to delete{" "}
              <span className="font-semibold">{examToDelete?.name}</span>?
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              This will permanently delete the exam and all associated questions, assignments, and results.
              This action cannot be undone.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDeleteExam}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Folder Assignment Dialog */}
      <Dialog open={folderAssignDialogOpen} onOpenChange={setFolderAssignDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Move Exam to Folder</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="mb-4">
              Select a folder to move <span className="font-semibold">{examToAssignFolder?.name}</span> to:
            </p>
            <Select value={selectedFolderId || ""} onValueChange={setSelectedFolderId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a folder" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">None (Remove from folder)</SelectItem>
                {folders.map(folder => (
                  <SelectItem key={folder.id} value={folder.id}>
                    {folder.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFolderAssignDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={assignExamToFolder}
            >
              Move Exam
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
