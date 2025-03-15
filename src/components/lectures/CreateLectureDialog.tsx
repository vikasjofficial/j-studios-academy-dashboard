
import { useState } from "react";
import { Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { LectureFolder } from "./types";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface CreateLectureDialogProps {
  folder: LectureFolder;
  onSuccess: () => void;
}

export function CreateLectureDialog({ folder, onSuccess }: CreateLectureDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [lectureTitle, setLectureTitle] = useState("");
  const [lectureContent, setLectureContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!lectureTitle.trim()) {
      toast.error("Please enter a lecture title");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Use rpc with type assertion to bypass TypeScript errors
      const { data, error } = await supabase
        .rpc('create_lecture', {
          title_input: lectureTitle,
          content_input: lectureContent,
          folder_id_input: folder.id
        }) as unknown as { data: any, error: any };
      
      if (error) {
        console.error("Error creating lecture:", error);
        throw error;
      }
      
      toast.success("Lecture created successfully");
      setLectureTitle("");
      setLectureContent("");
      setIsOpen(false);
      onSuccess();
    } catch (error) {
      console.error("Error creating lecture:", error);
      toast.error("Failed to create lecture");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          New Lecture
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create New Lecture</DialogTitle>
            <DialogDescription>
              Create a new lecture in folder: {folder.name}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="lectureTitle">Lecture Title</Label>
              <Input
                id="lectureTitle"
                value={lectureTitle}
                onChange={(e) => setLectureTitle(e.target.value)}
                placeholder="Enter lecture title"
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="lectureContent">Initial Content (Optional)</Label>
              <Textarea
                id="lectureContent"
                value={lectureContent}
                onChange={(e) => setLectureContent(e.target.value)}
                placeholder="Enter initial lecture content"
                rows={5}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setIsOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting || !lectureTitle.trim()}
            >
              {isSubmitting ? "Creating..." : "Create Lecture"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
