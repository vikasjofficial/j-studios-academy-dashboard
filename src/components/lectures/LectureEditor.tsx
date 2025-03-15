
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
      
      <Tabs defaultValue="topics" className="w-full">
        <TabsList className="grid grid-cols-2 mb-4">
          <TabsTrigger value="topics">Topics</TabsTrigger>
          <TabsTrigger value="files">Files</TabsTrigger>
        </TabsList>
        
        <TabsContent value="topics" className="p-4 border rounded-md">
          <LectureTopicsList
            lecture={lecture}
            onTopicsUpdated={handleTopicsUpdated}
          />
        </TabsContent>
        
        <TabsContent value="files" className="p-4 border rounded-md">
          <LectureFileUploader lecture={lecture} />
        </TabsContent>
      </Tabs>
      
      <StudentAssignmentManager lecture={lecture} />
    </div>
  );
}
