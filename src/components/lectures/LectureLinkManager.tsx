import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Lecture } from "./types";
import { Plus, Link2, Trash2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

interface LectureLink {
  id: string;
  lecture_id: string;
  title: string;
  url: string;
  created_at: string;
  updated_at: string;
}

interface LectureLinkManagerProps {
  lecture: Lecture;
  readOnly?: boolean;
}

export function LectureLinkManager({
  lecture,
  readOnly = false
}: LectureLinkManagerProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [newLink, setNewLink] = useState({ title: '', url: '' });
  const [linkToDelete, setLinkToDelete] = useState<LectureLink | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Fetch links for this lecture
  const { data: links, isLoading, refetch } = useQuery({
    queryKey: ["lectureLinks", lecture.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('lecture_links')
        .select("*")
        .eq("lecture_id", lecture.id)
        .order("created_at");
      
      if (error) {
        throw error;
      }
      
      return data as LectureLink[];
    },
  });

  // Add new link
  const handleAddLink = async () => {
    if (!newLink.title.trim() || !newLink.url.trim()) {
      toast.error("Please enter both title and URL");
      return;
    }

    // Basic URL validation
    try {
      new URL(newLink.url);
    } catch {
      toast.error("Please enter a valid URL");
      return;
    }

    setIsSaving(true);
    
    try {
      const { error } = await supabase
        .from('lecture_links')
        .insert({
          lecture_id: lecture.id,
          title: newLink.title.trim(),
          url: newLink.url.trim()
        });
      
      if (error) throw error;
      
      toast.success("Link added successfully");
      setNewLink({ title: '', url: '' });
      setIsAdding(false);
      refetch();
    } catch (error) {
      console.error("Error adding link:", error);
      toast.error("Failed to add link");
    } finally {
      setIsSaving(false);
    }
  };

  // Confirm link deletion
  const handleDeleteClick = (link: LectureLink) => {
    setLinkToDelete(link);
    setIsDeleteDialogOpen(true);
  };

  // Delete link
  const deleteLink = async () => {
    if (!linkToDelete) return;
    
    try {
      const { error } = await supabase
        .from('lecture_links')
        .delete()
        .eq("id", linkToDelete.id);
      
      if (error) throw error;
      
      toast.success("Link deleted successfully");
      setIsDeleteDialogOpen(false);
      refetch();
    } catch (error) {
      console.error("Error deleting link:", error);
      toast.error("Failed to delete link");
    }
  };

  // Open link in new tab
  const handleLinkClick = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  if (isLoading) {
    return <div className="text-center py-4">Loading links...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Resource Links</h3>
        {!readOnly && (
          <Button 
            onClick={() => setIsAdding(true)} 
            size="sm"
            disabled={isAdding}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Link
          </Button>
        )}
      </div>
      
      {/* Add new link form */}
      {isAdding && !readOnly && (
        <Card className="border-dashed">
          <CardContent className="p-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="link-title">Link Title</Label>
              <Input
                id="link-title"
                placeholder="Enter link title (e.g., 'Course Materials')"
                value={newLink.title}
                onChange={(e) => setNewLink(prev => ({ ...prev, title: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="link-url">URL</Label>
              <Input
                id="link-url"
                placeholder="https://example.com"
                value={newLink.url}
                onChange={(e) => setNewLink(prev => ({ ...prev, url: e.target.value }))}
              />
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={handleAddLink} 
                disabled={isSaving}
                size="sm"
              >
                {isSaving ? "Saving..." : "Save Link"}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  setIsAdding(false);
                  setNewLink({ title: '', url: '' });
                }}
                size="sm"
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Links list */}
      {links && links.length > 0 ? (
        <div className="space-y-2">
          {links.map((link) => (
            <Card key={link.id} className="overflow-hidden hover:bg-muted/50 transition-colors">
              <CardContent className="p-3 flex items-center justify-between">
                <div 
                  className="flex items-center flex-1 cursor-pointer"
                  onClick={() => handleLinkClick(link.url)}
                >
                  <Link2 className="h-5 w-5 mr-3 text-primary" />
                  <div className="overflow-hidden">
                    <p className="font-medium truncate hover:text-primary transition-colors">
                      {link.title}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {link.url}
                    </p>
                  </div>
                  <ExternalLink className="h-4 w-4 ml-2 text-muted-foreground" />
                </div>
                
                <div className="flex gap-1 ml-2">
                  {!readOnly && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 w-8 p-0 text-destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteClick(link);
                      }}
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
        <div className="text-center py-8 text-muted-foreground">
          {readOnly ? "No resource links available for this lecture." : "No links added yet. Click 'Add Link' to get started."}
        </div>
      )}
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Link</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{linkToDelete?.title}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={deleteLink} 
              className="bg-destructive hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}