
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/auth-context";
import { Lecture } from "@/components/lectures/types";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { LecturesList } from "@/components/lectures/LecturesList";
import { LectureViewer } from "@/components/lectures/LectureViewer";

export default function StudentLectures() {
  const { user } = useAuth();
  const [selectedLecture, setSelectedLecture] = useState<Lecture | null>(null);
  const [activeTab, setActiveTab] = useState<string>("lectures");

  // Fetch all assigned lectures for the student using classes_assignments and classes tables
  const { data: lectures, isLoading: lecturesLoading } = useQuery({
    queryKey: ["studentLectures", user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      // First get the lecture IDs assigned to the student
      const { data: assignments, error: assignmentsError } = await supabase
        .from('classes_assignments')
        .select("lecture_id")
        .eq("student_id", user.id);
      
      if (assignmentsError) throw assignmentsError;
      
      const lectureIds = assignments.map(a => a.lecture_id);
      if (lectureIds.length === 0) return [];
      
      // Then fetch the lectures with their folders
      const { data, error } = await supabase
        .from('classes')
        .select(`
          *,
          classes_folders!inner (
            name
          ),
          classes_topics (
            id,
            name,
            completed
          )
        `)
        .in("id", lectureIds)
        .order("title");
      
      if (error) throw error;
      
      return data as Lecture[];
    },
    enabled: !!user,
  });

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
              <TabsTrigger value="lectures" disabled={activeTab === "viewer"}>
                All Lectures
              </TabsTrigger>
              <TabsTrigger 
                value="viewer" 
                disabled={!selectedLecture}
              >
                Lecture Content
              </TabsTrigger>
            </TabsList>

            <TabsContent value="lectures" className="p-4 border rounded-md">
              <LecturesList 
                lectures={lectures || []} 
                isLoading={lecturesLoading}
                onSelectLecture={handleLectureSelect}
                viewOnly={true}
                showProgress={true}
              />
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
