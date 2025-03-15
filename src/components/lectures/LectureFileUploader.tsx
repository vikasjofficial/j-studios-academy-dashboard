
import { useState, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Lecture, LectureFile } from "./types";
import { Upload, File, Trash2, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle 
} from "@/components/ui/alert-dialog";

interface LectureFileUploaderProps {
  lecture: Lecture;
  readOnly?: boolean;
}

export function LectureFileUploader({
  lecture,
  readOnly = false
}: LectureFileUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [fileToDelete, setFileToDelete] = useState<LectureFile | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Fetch files for this lecture using classes_files table
  const { data: files, isLoading, refetch } = useQuery({
    queryKey: ["lectureFiles", lecture.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('classes_files')
        .select("*")
        .eq("lecture_id", lecture.id)
        .order("created_at");
      
      if (error) {
        throw error;
      }
      
      return data as LectureFile[];
    },
  });

  // Open file selector
  const handleSelectFile = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Upload file
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setIsUploading(true);
    setUploadProgress(0);
    
    try {
      // Generate a unique file path
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      const filePath = `${lecture.id}/${fileName}`;
      
      // Upload file to storage
      const { error: uploadError } = await supabase.storage
        .from("lecture-files")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
          contentType: file.type,
          // Handle progress tracking separately with a more compatible approach
        });
      
      if (uploadError) throw uploadError;
      
      // Get the public URL
      const { data: publicURLData } = supabase.storage
        .from("lecture-files")
        .getPublicUrl(filePath);
      
      // Add file record to database using classes_files table
      const { error: dbError } = await supabase
        .from('classes_files')
        .insert({
          lecture_id: lecture.id,
          file_name: file.name,
          file_path: filePath,
          file_type: file.type
        });
      
      if (dbError) throw dbError;
      
      toast.success("File uploaded successfully");
      refetch();
    } catch (error) {
      console.error("Error uploading file:", error);
      toast.error("Failed to upload file");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  // Confirm file deletion
  const handleDeleteClick = (file: LectureFile) => {
    setFileToDelete(file);
    setIsDeleteDialogOpen(true);
  };

  // Delete file
  const deleteFile = async () => {
    if (!fileToDelete) return;
    
    try {
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from("lecture-files")
        .remove([fileToDelete.file_path]);
      
      if (storageError) throw storageError;
      
      // Delete from database using classes_files table
      const { error: dbError } = await supabase
        .from('classes_files')
        .delete()
        .eq("id", fileToDelete.id);
      
      if (dbError) throw dbError;
      
      toast.success("File deleted successfully");
      setIsDeleteDialogOpen(false);
      refetch();
    } catch (error) {
      console.error("Error deleting file:", error);
      toast.error("Failed to delete file");
    }
  };

  // Download file
  const handleDownload = async (file: LectureFile) => {
    try {
      const { data, error } = await supabase.storage
        .from("lecture-files")
        .download(file.file_path);
      
      if (error) throw error;
      
      // Create a download link and click it
      const url = URL.createObjectURL(data);
      const a = document.createElement("a");
      a.href = url;
      a.download = file.file_name;
      document.body.appendChild(a);
      a.click();
      URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Error downloading file:", error);
      toast.error("Failed to download file");
    }
  };

  if (isLoading) {
    return <div className="text-center py-4">Loading files...</div>;
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium mb-2">Files</h3>
      
      {!readOnly && (
        <div className="mb-4">
          <input
            type="file"
            className="hidden"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="application/pdf"
          />
          <Button onClick={handleSelectFile} disabled={isUploading}>
            <Upload className="h-4 w-4 mr-2" />
            {isUploading ? "Uploading..." : "Upload PDF"}
          </Button>
          
          {isUploading && (
            <div className="mt-2">
              <Progress value={uploadProgress} className="h-2" />
              <p className="text-xs text-muted-foreground mt-1">
                Uploading: {Math.round(uploadProgress)}%
              </p>
            </div>
          )}
        </div>
      )}
      
      {files && files.length > 0 ? (
        <div className="space-y-2">
          {files.map((file) => (
            <Card key={file.id} className="overflow-hidden">
              <CardContent className="p-3 flex items-center justify-between">
                <div className="flex items-center flex-1">
                  <File className="h-5 w-5 mr-3 text-primary" />
                  <div className="overflow-hidden">
                    <p className="font-medium truncate">{file.file_name}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(file.created_at || "").toLocaleDateString()}
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-1">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 w-8 p-0"
                    onClick={() => handleDownload(file)}
                  >
                    <Download className="h-4 w-4" />
                    <span className="sr-only">Download</span>
                  </Button>
                  
                  {!readOnly && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 w-8 p-0 text-destructive"
                      onClick={() => handleDeleteClick(file)}
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Delete</span>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-4 text-muted-foreground">
          {readOnly ? "No files available for this lecture." : "Upload PDF files for this lecture."}
        </div>
      )}
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete File</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{fileToDelete?.file_name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={deleteFile} className="bg-destructive hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
