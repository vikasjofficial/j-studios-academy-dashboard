
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarDays, Pencil, Plus, Trash2 } from "lucide-react";
import { TopicsList } from "./topics-list";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { toast } from "sonner";
import { EditSemesterForm } from "./edit-semester-form";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "../ui/alert-dialog";

// Define Semester interface to match the database table
interface Semester {
  id: string;
  name: string;
  start_date: string;
  end_date: string;
  course_id: string;
  status: string;
  created_at?: string;
  updated_at?: string;
}

interface SemestersListProps {
  courseId: string;
  courseName: string;
}

export function SemestersList({ courseId, courseName }: SemestersListProps) {
  const [selectedSemester, setSelectedSemester] = useState<Semester | null>(null);
  const [isAddTopicDialogOpen, setIsAddTopicDialogOpen] = useState(false);
  const [isEditSemesterOpen, setIsEditSemesterOpen] = useState(false);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [semesterToDelete, setSemesterToDelete] = useState<Semester | null>(null);
  
  const queryClient = useQueryClient();
  
  const { data: semesters, isLoading } = useQuery({
    queryKey: ["semesters", courseId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("semesters")
        .select("*")
        .eq("course_id", courseId)
        .order("start_date", { ascending: false });
        
      if (error) throw error;
      return data as Semester[];
    },
  });

  const handleDeleteSemester = async () => {
    if (!semesterToDelete) return;
    
    try {
      // First check if there are topics associated with this semester
      const { data: topics, error: checkError } = await supabase
        .from("topics")
        .select("id")
        .eq("semester_id", semesterToDelete.id);
      
      if (checkError) throw checkError;
      
      if (topics && topics.length > 0) {
        // Delete associated topics first
        const { error: topicsError } = await supabase
          .from("topics")
          .delete()
          .eq("semester_id", semesterToDelete.id);
        
        if (topicsError) throw topicsError;
      }
      
      // Then delete the semester
      const { error: deleteError } = await supabase
        .from("semesters")
        .delete()
        .eq("id", semesterToDelete.id);
      
      if (deleteError) throw deleteError;
      
      toast.success("Semester deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["semesters", courseId] });
      setSemesterToDelete(null);
      setIsDeleteAlertOpen(false);
    } catch (error) {
      console.error("Error deleting semester:", error);
      toast.error("Failed to delete semester. Please try again.");
    }
  };

  if (isLoading) {
    return <div className="py-4 text-center text-sm text-muted-foreground">Loading semesters...</div>;
  }

  return (
    <div className="space-y-6">
      {semesters && semesters.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {semesters.map((semester) => (
            <Card key={semester.id} className="overflow-hidden">
              <CardHeader className="pb-2">
                <CardTitle className="flex justify-between items-center text-xl">
                  <div className="flex items-center gap-2">
                    <CalendarDays className="h-5 w-5 text-primary" />
                    {semester.name}
                  </div>
                  <div className="flex gap-1">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => {
                        setSelectedSemester(semester);
                        setIsEditSemesterOpen(true);
                      }}
                      className="h-8 px-2"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => {
                        setSelectedSemester(semester);
                        setIsAddTopicDialogOpen(true);
                      }}
                      className="h-8 px-2"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => {
                        setSemesterToDelete(semester);
                        setIsDeleteAlertOpen(true);
                      }}
                      className="h-8 px-2 text-red-500 hover:text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  {format(new Date(semester.start_date), "MMM d, yyyy")} - {format(new Date(semester.end_date), "MMM d, yyyy")}
                </p>
                
                <TopicsList semesterId={semester.id} courseId={courseId} />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-6 text-center">
            <p className="text-muted-foreground mb-4">No semesters found for this course.</p>
            <p className="text-sm">Click the "New Semester" button above to create one.</p>
          </CardContent>
        </Card>
      )}
      
      {selectedSemester && (
        <>
          <Dialog open={isAddTopicDialogOpen} onOpenChange={setIsAddTopicDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Topic to {selectedSemester.name}</DialogTitle>
              </DialogHeader>
              <AddTopicForm 
                semesterId={selectedSemester.id} 
                courseId={courseId} 
                onSuccess={() => setIsAddTopicDialogOpen(false)} 
              />
            </DialogContent>
          </Dialog>
          
          <Dialog open={isEditSemesterOpen} onOpenChange={setIsEditSemesterOpen}>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Pencil className="h-5 w-5" />
                  Edit Semester
                </DialogTitle>
              </DialogHeader>
              <EditSemesterForm 
                semester={selectedSemester}
                courseName={courseName}
                onSuccess={() => setIsEditSemesterOpen(false)}
              />
            </DialogContent>
          </Dialog>
        </>
      )}
      
      <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the semester and all its topics.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteSemester} className="bg-red-500 hover:bg-red-600">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// Simple form to add topics
function AddTopicForm({ semesterId, courseId, onSuccess }: { semesterId: string, courseId: string, onSuccess: () => void }) {
  const [topicName, setTopicName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topicName.trim()) return;
    
    setIsSubmitting(true);
    
    try {
      // Get the highest order_id
      const { data: existingTopics } = await supabase
        .from("topics")
        .select("order_id")
        .eq("semester_id", semesterId)
        .order("order_id", { ascending: false })
        .limit(1);
      
      const nextOrderId = existingTopics && existingTopics.length > 0 ? (existingTopics[0].order_id || 0) + 1 : 1;
      
      const { error } = await supabase
        .from("topics")
        .insert({
          name: topicName,
          semester_id: semesterId,
          course_id: courseId,
          order_id: nextOrderId,
          description: `Topic ${nextOrderId}`
        });
        
      if (error) throw error;
      
      queryClient.invalidateQueries({ queryKey: ["topics", semesterId] });
      onSuccess();
    } catch (error) {
      console.error("Error adding topic:", error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid w-full gap-1.5">
        <label htmlFor="topicName" className="text-sm font-medium">Topic Name</label>
        <input
          id="topicName"
          value={topicName}
          onChange={(e) => setTopicName(e.target.value)}
          className="border rounded-md px-3 py-2 w-full"
          placeholder="Enter topic name"
          required
        />
      </div>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onSuccess}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Adding..." : "Add Topic"}
        </Button>
      </div>
    </form>
  );
}
