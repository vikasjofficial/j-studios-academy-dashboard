
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarDays, Plus } from "lucide-react";
import { TopicsList } from "./topics-list";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";

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
      )}
    </div>
  );
}

// Simple form to add topics
function AddTopicForm({ semesterId, courseId, onSuccess }: { semesterId: string, courseId: string, onSuccess: () => void }) {
  const [topicName, setTopicName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
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
