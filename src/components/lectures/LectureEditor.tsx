
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Lecture } from "./types";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { LectureTopicsList } from "./LectureTopicsList";
import { LectureFileUploader } from "./LectureFileUploader";
import { StudentAssignmentManager } from "./StudentAssignmentManager";

interface LectureEditorProps {
  lecture: Lecture;
  onLectureUpdated: () => void;
}

export function LectureEditor({ lecture, onLectureUpdated }: LectureEditorProps) {
  const [title, setTitle] = useState(lecture.title);
  const [content, setContent] = useState(lecture.content || "");
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("topics");
  
  // Save lecture content
  const saveLecture = async () => {
    if (!title.trim()) {
      toast.error("Lecture title cannot be empty");
      return;
    }
    
    setIsLoading(true);
    
    try {
      const { error } = await supabase
        .from("classes")
        .update({
          title,
          content,
          updated_at: new Date().toISOString()
        })
        .eq("id", lecture.id);
      
      if (error) throw error;
      
      toast.success("Lecture updated successfully");
      onLectureUpdated();
    } catch (error) {
      console.error("Error updating lecture:", error);
      toast.error("Failed to update lecture");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle topic updates
  const handleTopicsUpdated = () => {
    // Refresh lecture data
    onLectureUpdated();
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Lecture Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="lectureTitle">Title</Label>
            <Input
              id="lectureTitle"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Lecture title"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="lectureContent">Content</Label>
            <Textarea
              id="lectureContent"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Lecture content..."
              rows={8}
              className="min-h-[200px]"
            />
          </div>
          
          <div className="flex justify-end">
            <Button 
              onClick={saveLecture} 
              disabled={isLoading || !title.trim()}
            >
              {isLoading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {/* Navigation-style tabs that can be clicked anytime */}
      <div className="bg-gray-800 rounded-md p-1.5 flex justify-center">
        <div className="inline-flex p-1 bg-gray-700/50 rounded-md">
          <Button 
            variant={activeTab === "topics" ? "default" : "ghost"} 
            className={`rounded-md ${activeTab === "topics" ? "bg-gray-900 text-white" : "bg-transparent text-gray-400 hover:text-white"}`}
            onClick={() => setActiveTab("topics")}
          >
            Lecture Topics
          </Button>
          <Button
            variant={activeTab === "files" ? "default" : "ghost"}
            className={`rounded-md ${activeTab === "files" ? "bg-gray-900 text-white" : "bg-transparent text-gray-400 hover:text-white"}`}
            onClick={() => setActiveTab("files")}
          >
            Files
          </Button>
          <Button
            variant={activeTab === "assignments" ? "default" : "ghost"}
            className={`rounded-md ${activeTab === "assignments" ? "bg-gray-900 text-white" : "bg-transparent text-gray-400 hover:text-white"}`}
            onClick={() => setActiveTab("assignments")}
          >
            Assignments
          </Button>
        </div>
      </div>
      
      {activeTab === "topics" && (
        <div className="p-4 border rounded-md">
          <LectureTopicsList
            lecture={lecture}
            onTopicsUpdated={handleTopicsUpdated}
          />
        </div>
      )}
      
      {activeTab === "files" && (
        <div className="p-4 border rounded-md">
          <LectureFileUploader lecture={lecture} />
        </div>
      )}
      
      {activeTab === "assignments" && (
        <div className="p-4 border rounded-md">
          <StudentAssignmentManager lecture={lecture} />
        </div>
      )}
    </div>
  );
}
