
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/auth-context";
import { LectureFolder, Lecture } from "@/components/lectures/types";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { LecturesFoldersList } from "@/components/lectures/LecturesFoldersList";
import { LecturesList } from "@/components/lectures/LecturesList";
import { LectureViewer } from "@/components/lectures/LectureViewer";

export default function StudentLectures() {
  const { user } = useAuth();
  const [selectedFolder, setSelectedFolder] = useState<LectureFolder | null>(null);
  const [selectedLecture, setSelectedLecture] = useState<Lecture | null>(null);
  const [activeTab, setActiveTab] = useState<string>("folders");

  // Fetch assigned lecture folders for the student
  const { data: folders, isLoading: foldersLoading } = useQuery({
    queryKey: ["studentLectureFolders", user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from("lecture_folders")
        .select(`
          *,
          lectures!inner(
            id,
            lecture_assignments!inner(student_id)
          )
        `)
        .eq("lectures.lecture_assignments.student_id", user.id)
        .order("name");
      
      if (error) {
        throw error;
      }
      
      // Deduplicate folders since the join might return duplicates
      const uniqueFolders = data.filter((folder, index, self) =>
        index === self.findIndex((f) => f.id === folder.id)
      );
      
      return uniqueFolders as LectureFolder[];
    },
    enabled: !!user,
  });

  // Fetch assigned lectures based on selected folder
  const { data: lectures, isLoading: lecturesLoading } = useQuery({
    queryKey: ["studentLectures", user?.id, selectedFolder?.id],
    queryFn: async () => {
      if (!user || !selectedFolder) return [];
      
      const { data, error } = await supabase
        .from("lecture_assignments")
        .select(`
          lecture_id,
          lectures:lecture_id(
            id,
            title,
            content,
            folder_id,
            created_at,
            updated_at
          )
        `)
        .eq("student_id", user.id)
        .eq("lectures.folder_id", selectedFolder.id);
      
      if (error) {
        throw error;
      }
      
      // Transform the data to get the lectures
      const lecturesList = data.map(item => item.lectures);
      
      return lecturesList as Lecture[];
    },
    enabled: !!user && !!selectedFolder,
  });

  // Select a folder to view its lectures
  const handleFolderSelect = (folder: LectureFolder) => {
    setSelectedFolder(folder);
    setSelectedLecture(null);
    setActiveTab("lectures");
  };

  // Select a lecture to view
  const handleLectureSelect = (lecture: Lecture) => {
    setSelectedLecture(lecture);
    setActiveTab("viewer");
  };

  // Go back to lectures list
  const handleBackToLectures = () => {
    setSelectedLecture(null);
    setActiveTab("lectures");
  };

  // Go back to folders list
  const handleBackToFolders = () => {
    setSelectedFolder(null);
    setSelectedLecture(null);
    setActiveTab("folders");
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">My Lectures</h1>
        <p className="text-muted-foreground">Access your learning materials</p>
      </div>

      <Card>
        <CardContent className="p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="folders" disabled={activeTab === "viewer"}>
                Lecture Folders
              </TabsTrigger>
              <TabsTrigger 
                value="lectures" 
                disabled={!selectedFolder || activeTab === "viewer"}
              >
                Lectures
              </TabsTrigger>
              <TabsTrigger 
                value="viewer" 
                disabled={!selectedLecture}
              >
                Lecture Content
              </TabsTrigger>
            </TabsList>

            <TabsContent value="folders" className="p-4 border rounded-md">
              <LecturesFoldersList 
                folders={folders || []} 
                isLoading={foldersLoading}
                onSelectFolder={handleFolderSelect}
                viewOnly={true}
              />
            </TabsContent>

            <TabsContent value="lectures" className="p-4 border rounded-md">
              {selectedFolder && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold">
                      Lectures in: {selectedFolder.name}
                    </h2>
                    <button 
                      onClick={handleBackToFolders}
                      className="text-sm text-primary hover:underline"
                    >
                      Back to folders
                    </button>
                  </div>
                  
                  <LecturesList 
                    lectures={lectures || []} 
                    isLoading={lecturesLoading}
                    onSelectLecture={handleLectureSelect}
                    viewOnly={true}
                  />
                </div>
              )}
            </TabsContent>

            <TabsContent value="viewer" className="p-4 border rounded-md">
              {selectedLecture && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold">
                      {selectedLecture.title}
                    </h2>
                    <button 
                      onClick={handleBackToLectures}
                      className="text-sm text-primary hover:underline"
                    >
                      Back to lectures
                    </button>
                  </div>
                  
                  <LectureViewer lecture={selectedLecture} />
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
