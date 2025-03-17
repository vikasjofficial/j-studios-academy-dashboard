
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Exam } from "@/components/exams/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ArrowLeft, BookPlus, Users, PenSquare } from "lucide-react";
import { ExamQuestionsList } from "@/components/exams/exam-questions-list";
import { CreateQuestionDialog } from "@/components/exams/create-question-dialog";
import DashboardLayout from "@/components/dashboard-layout";
import { toast } from "sonner";
import { AssignedExamsList } from "@/components/exams/assigned-exams-list";

export default function ExamDetail() {
  const { examId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isCreateQuestionDialogOpen, setIsCreateQuestionDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"questions" | "students">("questions");

  // Fetch exam details
  const { data: exam, isLoading } = useQuery({
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

  const handleCreateQuestion = async (questionData: { question_text: string; points: number; }) => {
    if (!examId) return null;
    
    try {
      // Get the current max order_position
      const { data: existingQuestions, error: fetchError } = await supabase
        .from("exam_questions")
        .select("order_position")
        .eq("exam_id", examId)
        .order("order_position", { ascending: false })
        .limit(1);
        
      if (fetchError) throw fetchError;
      
      const nextPosition = existingQuestions.length > 0 
        ? (existingQuestions[0]?.order_position || 0) + 1 
        : 1;
      
      const { data, error } = await supabase
        .from("exam_questions")
        .insert({
          exam_id: examId,
          question_text: questionData.question_text,
          points: questionData.points,
          order_position: nextPosition
        })
        .select()
        .single();
        
      if (error) throw error;
      
      queryClient.invalidateQueries({ queryKey: ["exam-questions"] });
      toast.success("Question added successfully");
      return data;
    } catch (error) {
      console.error("Error creating question:", error);
      toast.error("Failed to create question");
      return null;
    }
  };

  return (
    <div className="flex">
      {/* Sidebar is already rendered by DashboardLayout */}
      
      {/* Empty div spacer */}
      <div className="w-16 md:w-24 lg:w-28 h-full flex-shrink-0"></div>
      
      <div className="flex-1">
        <DashboardLayout>
          <div className="space-y-6 animate-in-subtle px-4 md:px-3 max-w-full overflow-x-auto">
            <div className="flex items-center justify-between">
              <Button 
                variant="outline" 
                size="sm" 
                className="flex items-center gap-2"
                onClick={() => navigate("/admin/exams")}
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Exams
              </Button>
            </div>
            
            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin h-8 w-8 border-2 border-current border-t-transparent rounded-full"></div>
              </div>
            ) : exam ? (
              <div className="space-y-6">
                <div>
                  <h1 className="text-3xl font-bold tracking-tight">{exam.name}</h1>
                  <p className="text-muted-foreground mt-1">
                    {exam.description || "No description provided"}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="outline" className="capitalize">
                      {exam.exam_type}
                    </Badge>
                    <Badge variant="outline">
                      {exam.total_time_minutes} minutes
                    </Badge>
                  </div>
                </div>
                
                <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "questions" | "students")}>
                  <div className="flex justify-between items-center">
                    <TabsList>
                      <TabsTrigger value="questions" className="flex items-center gap-2">
                        <BookPlus className="h-4 w-4" />
                        Questions
                      </TabsTrigger>
                      <TabsTrigger value="students" className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Students & Grades
                      </TabsTrigger>
                    </TabsList>
                    
                    {activeTab === "questions" && (
                      <Button 
                        size="sm" 
                        onClick={() => setIsCreateQuestionDialogOpen(true)}
                        className="flex items-center gap-2"
                      >
                        <PenSquare className="h-4 w-4" />
                        Add Question
                      </Button>
                    )}
                  </div>
                  
                  <TabsContent value="questions" className="mt-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-xl">Exam Questions</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ExamQuestionsList examId={examId!} />
                      </CardContent>
                    </Card>
                  </TabsContent>
                  
                  <TabsContent value="students" className="mt-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-xl">Assigned Students & Grades</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <AssignedExamsList examId={examId!} />
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Exam not found</p>
              </div>
            )}
            
            <CreateQuestionDialog
              open={isCreateQuestionDialogOpen}
              onOpenChange={setIsCreateQuestionDialogOpen}
              onCreateQuestion={handleCreateQuestion}
            />
          </div>
        </DashboardLayout>
      </div>
    </div>
  );
}

// Add the missing Badge import
import { Badge } from "@/components/ui/badge";
