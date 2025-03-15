
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { LecturesFoldersList } from "@/components/lectures/LecturesFoldersList";
import { LecturesList } from "@/components/lectures/LecturesList";
import { LectureEditor } from "@/components/lectures/LectureEditor";
import { LectureFolder, Lecture } from "@/components/lectures/types";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { CreateLectureFolderDialog } from "@/components/lectures/CreateLectureFolderDialog";
import { CreateLectureDialog } from "@/components/lectures/CreateLectureDialog";

export default function LecturesManagement() {
  const [selectedFolder, setSelectedFolder] = useState<LectureFolder | null>(null);
  const [selectedLecture, setSelectedLecture] = useState<Lecture | null>(null);
  const [activeTab, setActiveTab] = useState<string>("folders");

  // Fetch all lecture folders
  const { data: folders, isLoading: foldersLoading, refetch: refetchFolders } = useQuery({
    queryKey: ["lectureFolders"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("lecture_folders")
        .select("*")
        .order("name");
      
      if (error) {
        throw error;
      }
      
      return data as LectureFolder[];
    },
  });

  // Fetch lectures based on selected folder
  const { data: lectures, isLoading: lecturesLoading, refetch: refetchLectures } = useQuery({
    queryKey: ["lectures", selectedFolder?.id],
    queryFn: async () => {
      if (!selectedFolder) return [];
      
      const { data, error } = await supabase
        .from("lectures")
        .select("*")
        .eq("folder_id", selectedFolder.id)
        .order("title");
      
      if (error) {
        throw error;
      }
      
      return data as Lecture[];
    },
    enabled: !!selectedFolder,
  });

  // Select a folder to view its lectures
  const handleFolderSelect = (folder: LectureFolder) => {
    setSelectedFolder(folder);
    setSelectedLecture(null);
    setActiveTab("lectures");
  };

  // Select a lecture to edit
  const handleLectureSelect = (lecture: Lecture) => {
    setSelectedLecture(lecture);
    setActiveTab("editor");
  };

  // Handle lecture update success
  const handleLectureUpdated = () => {
    refetchLectures();
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
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Lectures Management</h1>
        
        <div className="flex gap-2">
          {activeTab === "folders" && (
            <CreateLectureFolderDialog onSuccess={refetchFolders} />
          )}
          
          {activeTab === "lectures" && selectedFolder && (
            <CreateLectureDialog 
              folder={selectedFolder} 
              onSuccess={refetchLectures} 
            />
          )}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="folders" disabled={activeTab === "editor"}>
            Folders
          </TabsTrigger>
          <TabsTrigger 
            value="lectures" 
            disabled={!selectedFolder || activeTab === "editor"}
          >
            Lectures
          </TabsTrigger>
          <TabsTrigger 
            value="editor" 
            disabled={!selectedLecture}
          >
            Lecture Editor
          </TabsTrigger>
        </TabsList>

        <TabsContent value="folders" className="p-4 border rounded-md">
          <LecturesFoldersList 
            folders={folders || []} 
            isLoading={foldersLoading}
            onSelectFolder={handleFolderSelect}
            onFolderDeleted={refetchFolders}
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
                onLectureDeleted={refetchLectures}
              />
            </div>
          )}
        </TabsContent>

        <TabsContent value="editor" className="p-4 border rounded-md">
          {selectedLecture && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">
                  Editing: {selectedLecture.title}
                </h2>
                <button 
                  onClick={handleBackToLectures}
                  className="text-sm text-primary hover:underline"
                >
                  Back to lectures
                </button>
              </div>
              
              <LectureEditor 
                lecture={selectedLecture} 
                onLectureUpdated={handleLectureUpdated}
              />
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
