
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Lecture, LectureFile } from "./types";
import { File } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { LectureTopicsList } from "./LectureTopicsList";
import { LectureFileUploader } from "./LectureFileUploader";

interface LectureViewerProps {
  lecture: Lecture;
}

export function LectureViewer({ lecture }: LectureViewerProps) {
  const [selectedFile, setSelectedFile] = useState<LectureFile | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  // Fetch topics for this lecture
  const { data: topics } = useQuery({
    queryKey: ["lectureTopics", lecture.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("lecture_topics")
        .select("*")
        .eq("lecture_id", lecture.id)
        .order("order_position");
      
      if (error) {
        throw error;
      }
      
      return data;
    },
  });

  // Fetch files for this lecture
  const { data: files } = useQuery({
    queryKey: ["lectureFiles", lecture.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("lecture_files")
        .select("*")
        .eq("lecture_id", lecture.id)
        .order("created_at");
      
      if (error) {
        throw error;
      }
      
      // If files are found, automatically select the first one
      if (data && data.length > 0 && !selectedFile) {
        setSelectedFile(data[0]);
      }
      
      return data;
    },
  });

  // Get the PDF URL when a file is selected
  useEffect(() => {
    if (selectedFile) {
      const { data } = supabase.storage
        .from("lecture-files")
        .getPublicUrl(selectedFile.file_path);
      
      setPdfUrl(data.publicUrl);
    } else {
      setPdfUrl(null);
    }
  }, [selectedFile]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{lecture.title}</CardTitle>
        </CardHeader>
        <CardContent>
          {lecture.content ? (
            <div className="whitespace-pre-wrap">{lecture.content}</div>
          ) : (
            <p className="text-muted-foreground">No content provided for this lecture.</p>
          )}
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
            onTopicsUpdated={() => {}}
            readOnly={true}
          />
        </TabsContent>
        
        <TabsContent value="files" className="space-y-4 p-4 border rounded-md">
          <LectureFileUploader lecture={lecture} readOnly={true} />
          
          {files && files.length > 0 && (
            <div>
              <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
                {files.map((file) => (
                  <Button
                    key={file.id}
                    variant={selectedFile?.id === file.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedFile(file)}
                    className="flex items-center"
                  >
                    <File className="h-4 w-4 mr-2" />
                    <span className="truncate max-w-[150px]">{file.file_name}</span>
                  </Button>
                ))}
              </div>
              
              {pdfUrl && (
                <div className="border rounded-md overflow-hidden">
                  <iframe
                    src={`${pdfUrl}#toolbar=0`}
                    className="w-full h-[600px]"
                    title={selectedFile?.file_name || "PDF Viewer"}
                  />
                </div>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
