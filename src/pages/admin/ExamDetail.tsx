
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Exam, ExamQuestion } from "@/components/exams/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Plus, Save, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { ExamQuestionsList } from "@/components/exams/exam-questions-list";
import { CreateQuestionDialog } from "@/components/exams/create-question-dialog";
import DashboardLayout from "@/components/dashboard-layout";

export default function ExamDetail() {
  const { examId } = useParams<{ examId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const [exam, setExam] = useState<Exam | null>(null);
  const [isCreateQuestionDialogOpen, setIsCreateQuestionDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Fetch exam details
  const { data: examData, isLoading: examLoading } = useQuery({
    queryKey: ["exam", examId],
    queryFn: async () => {
      if (!examId) return null;
      
      const { data, error } = await supabase
        .from("exams")
        .select("*")
        .eq("id", examId)
        .single();
        
      if (error) throw error;
      return data as Exam;
    },
    enabled: !!examId,
  });

  // Fetch exam questions
  const { data: questions, isLoading: questionsLoading } = useQuery({
    queryKey: ["exam-questions", examId],
    queryFn: async () => {
      if (!examId) return [];
      
      const { data, error } = await supabase
        .from("exam_questions")
        .select("*")
        .eq("exam_id", examId)
        .order("order_position");
        
      if (error) throw error;
      return data as ExamQuestion[];
    },
    enabled: !!examId,
  });

  useEffect(() => {
    if (examData) {
      setExam(examData);
    }
  }, [examData]);

  const handleExamChange = (field: keyof Exam, value: any) => {
    if (!exam) return;
    setExam({ ...exam, [field]: value });
  };

  const handleSaveExam = async () => {
    if (!exam || !examId) return;
    
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from("exams")
        .update({
          name: exam.name,
          description: exam.description,
          total_time_minutes: exam.total_time_minutes,
          is_active: exam.is_active,
        })
        .eq("id", examId);
        
      if (error) throw error;
      
      queryClient.invalidateQueries({ queryKey: ["exam", examId] });
      toast.success("Exam updated successfully");
    } catch (error) {
      console.error("Error updating exam:", error);
      toast.error("Failed to update exam");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreateQuestion = async (question: Partial<ExamQuestion>) => {
    if (!examId) return null;
    
    try {
      // Get the next order position
      const nextPosition = questions && questions.length > 0 
        ? Math.max(...questions.map(q => q.order_position)) + 1 
        : 1;
      
      const { data, error } = await supabase
        .from("exam_questions")
        .insert({
          exam_id: examId,
          question_text: question.question_text || "", // Ensure question_text is not optional
          order_position: nextPosition,
          points: question.points || 10,
        })
        .select()
        .single();
        
      if (error) throw error;
      
      queryClient.invalidateQueries({ queryKey: ["exam-questions", examId] });
      toast.success("Question added successfully");
      return data as ExamQuestion;
    } catch (error) {
      console.error("Error adding question:", error);
      toast.error("Failed to add question");
      return null;
    }
  };

  const handleDeleteQuestion = async (questionId: string) => {
    try {
      const { error } = await supabase
        .from("exam_questions")
        .delete()
        .eq("id", questionId);
        
      if (error) throw error;
      
      queryClient.invalidateQueries({ queryKey: ["exam-questions", examId] });
      toast.success("Question deleted successfully");
    } catch (error) {
      console.error("Error deleting question:", error);
      toast.error("Failed to delete question");
    }
  };

  if (examLoading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center py-12">
          <div className="animate-spin h-8 w-8 border-2 border-current border-t-transparent rounded-full"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (!exam && !examLoading) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <p className="text-lg text-muted-foreground">Exam not found</p>
          <Button onClick={() => navigate("/admin/exams")} className="mt-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Exams
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-in-subtle px-4 md:px-3 max-w-full">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => navigate("/admin/exams")}>
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back
            </Button>
            <h1 className="text-2xl font-bold">Edit Exam</h1>
          </div>
          <Button onClick={handleSaveExam} disabled={isSaving}>
            <Save className="mr-2 h-4 w-4" />
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </div>

        {exam && (
          <Card>
            <CardHeader>
              <CardTitle>Exam Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="name">Exam Name</Label>
                  <Input
                    id="name"
                    value={exam.name}
                    onChange={(e) => handleExamChange("name", e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="duration">Duration (minutes)</Label>
                  <Input
                    id="duration"
                    type="number"
                    min={1}
                    value={exam.total_time_minutes}
                    onChange={(e) => handleExamChange("total_time_minutes", parseInt(e.target.value))}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={exam.description || ""}
                  onChange={(e) => handleExamChange("description", e.target.value)}
                  placeholder="Enter exam description..."
                  className="min-h-[100px]"
                />
              </div>
            </CardContent>
          </Card>
        )}

        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Questions</h2>
          <Button onClick={() => setIsCreateQuestionDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Question
          </Button>
        </div>

        <Card>
          <CardContent className="p-4">
            {questionsLoading ? (
              <div className="flex justify-center py-6">
                <div className="animate-spin h-6 w-6 border-2 border-current border-t-transparent rounded-full"></div>
              </div>
            ) : (
              <ExamQuestionsList
                questions={questions || []}
                onDeleteQuestion={handleDeleteQuestion}
              />
            )}
          </CardContent>
        </Card>

        <CreateQuestionDialog
          open={isCreateQuestionDialogOpen}
          onOpenChange={setIsCreateQuestionDialogOpen}
          onCreateQuestion={handleCreateQuestion}
        />
      </div>
    </DashboardLayout>
  );
}
