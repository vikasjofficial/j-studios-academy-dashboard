
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { Edit, Trash2, Users, Folder, Clock } from "lucide-react";
import { Exam, ExamType } from "../types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useDeleteExamDialog } from "../hooks/use-delete-exam-dialog";
import { useFolderAssignDialog } from "../hooks/use-folder-assign-dialog";

interface ExamCardProps {
  exam: Exam;
}

export function ExamCard({ exam }: ExamCardProps) {
  const navigate = useNavigate();
  const { openDeleteDialog } = useDeleteExamDialog();
  const { openFolderAssignDialog } = useFolderAssignDialog();

  const formatExamType = (type: ExamType) => {
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  const navigateToExamDetail = (examId: string) => {
    navigate(`/admin/exams/${examId}`);
  };

  const navigateToAssignExam = (examId: string) => {
    navigate(`/admin/exams/${examId}/assign`);
  };

  return (
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
              onClick={() => openDeleteDialog(exam)}
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Delete
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
