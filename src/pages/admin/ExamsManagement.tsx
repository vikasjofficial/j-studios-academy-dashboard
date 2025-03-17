
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Exam, ExamType } from "@/components/exams/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { BookPlus, Edit, Trash2, Users, FolderPlus, Folder } from "lucide-react";
import { CreateExamDialog } from "@/components/exams/create-exam-dialog";
import { ExamsList } from "@/components/exams/exams-list";
import { useAuth } from "@/context/auth-context";
import { toast } from "sonner";
import DashboardLayout from "@/components/dashboard-layout";
import { CreateFolderDialog } from "@/components/exams/create-folder-dialog";

export default function ExamsManagement() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isCreateFolderDialogOpen, setIsCreateFolderDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<ExamType>("oral");

  // Fetch exam folders of the selected type
  const { data: folders, isLoading: foldersLoading } = useQuery({
    queryKey: ["exam-folders", activeTab],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("exam_folders")
        .select("*")
        .eq("exam_type", activeTab)
        .order("name");

      if (error) throw error;
      return data || [];
    },
  });

  // Fetch exams of the selected type
  const { data: exams, isLoading } = useQuery({
    queryKey: ["exams", activeTab],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("exams")
        .select("*, exam_folders(id, name)")
        .eq("exam_type", activeTab)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as (Exam & { exam_folders: { id: string; name: string } | null })[];
    },
  });

  const handleCreateExam = async (exam: Partial<Exam>) => {
    try {
      // Ensure required fields are not undefined
      const examData = {
        name: exam.name || "",
        description: exam.description,
        exam_type: exam.exam_type || "oral",
        total_time_minutes: exam.total_time_minutes || 60,
        created_by: user?.email || "Admin",
        is_active: true,
        folder_id: exam.folder_id
      };

      const { data, error } = await supabase
        .from("exams")
        .insert(examData)
        .select()
        .single();

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ["exams"] });
      toast.success(`${exam.name} exam created successfully!`);
      return data as Exam;
    } catch (error) {
      console.error("Error creating exam:", error);
      toast.error("Failed to create exam");
      return null;
    }
  };

  const handleCreateFolder = async (folderName: string) => {
    try {
      const { data, error } = await supabase
        .from("exam_folders")
        .insert({
          name: folderName,
          exam_type: activeTab
        })
        .select()
        .single();

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ["exam-folders"] });
      toast.success(`Folder "${folderName}" created successfully!`);
      return data;
    } catch (error) {
      console.error("Error creating folder:", error);
      toast.error("Failed to create folder");
      return null;
    }
  };

  const handleExamTypeChange = (value: string) => {
    setActiveTab(value as ExamType);
  };

  return (
    <div className="flex">
      {/* Sidebar is already rendered by DashboardLayout */}
      
      {/* Empty div spacer - only for exams page - increased width */}
      <div className="w-16 md:w-24 lg:w-28 h-full flex-shrink-0"></div>
      
      <div className="flex-1">
        <DashboardLayout>
          <div className="space-y-6 animate-in-subtle px-4 md:px-3 max-w-full overflow-x-auto">
            <div className="w-full">
              <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                <BookPlus className="h-7 w-7 text-primary" />
                Exams Management
              </h1>
              <p className="text-muted-foreground mt-1">
                Create and manage exams for students. Assign oral, written, and practical exams to students.
              </p>
            </div>

            <div className="flex justify-between items-center">
              <Tabs 
                defaultValue="oral" 
                value={activeTab} 
                onValueChange={handleExamTypeChange}
                className="w-full"
              >
                <TabsList className="grid grid-cols-3 w-[400px]">
                  <TabsTrigger value="oral">Oral Exams</TabsTrigger>
                  <TabsTrigger value="written">Written Exams</TabsTrigger>
                  <TabsTrigger value="practical">Practical Exams</TabsTrigger>
                </TabsList>
              </Tabs>

              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => setIsCreateFolderDialogOpen(true)}
                >
                  <FolderPlus className="mr-2 h-4 w-4" />
                  Create Folder
                </Button>
                <Button onClick={() => setIsCreateDialogOpen(true)}>
                  <BookPlus className="mr-2 h-4 w-4" />
                  Create Exam
                </Button>
              </div>
            </div>

            <Card className="glass-morphism rounded-xl border border-white/10">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2">
                  <BookPlus className="h-5 w-5 text-primary" />
                  {activeTab === "oral" && "Oral Exams"}
                  {activeTab === "written" && "Written Exams"}
                  {activeTab === "practical" && "Practical Exams"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading || foldersLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin h-8 w-8 border-2 border-current border-t-transparent rounded-full"></div>
                  </div>
                ) : (
                  <ExamsList 
                    exams={exams || []} 
                    examType={activeTab}
                    folders={folders || []}
                  />
                )}
              </CardContent>
            </Card>

            <CreateExamDialog
              open={isCreateDialogOpen}
              onOpenChange={setIsCreateDialogOpen}
              onCreateExam={handleCreateExam}
              examType={activeTab}
              folders={folders || []}
            />

            <CreateFolderDialog
              open={isCreateFolderDialogOpen}
              onOpenChange={setIsCreateFolderDialogOpen}
              onCreateFolder={handleCreateFolder}
              examType={activeTab}
            />
          </div>
        </DashboardLayout>
      </div>
    </div>
  );
}
