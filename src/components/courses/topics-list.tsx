
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface TopicsListProps {
  semesterId: string;
  courseId: string;
}

interface Topic {
  id: string;
  name: string;
  description: string | null;
  order_id: number | null;
  semester_id: string | null;
  course_id: string;
  created_at: string | null;
  updated_at: string | null;
}

export function TopicsList({ semesterId, courseId }: TopicsListProps) {
  const [editingTopic, setEditingTopic] = useState<Topic | null>(null);
  const [editTopicName, setEditTopicName] = useState("");
  const queryClient = useQueryClient();

  const { data: topics, isLoading } = useQuery({
    queryKey: ["topics", semesterId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("topics")
        .select("*")
        .eq("semester_id", semesterId)
        .eq("course_id", courseId)
        .order("order_id");
        
      if (error) throw error;
      return data as Topic[];
    },
  });

  const handleEditTopic = (topic: Topic) => {
    setEditingTopic(topic);
    setEditTopicName(topic.name);
  };

  const handleSaveEdit = async () => {
    if (!editingTopic || !editTopicName.trim()) return;
    
    try {
      const { error } = await supabase
        .from("topics")
        .update({ name: editTopicName })
        .eq("id", editingTopic.id);
        
      if (error) throw error;
      
      queryClient.invalidateQueries({ queryKey: ["topics", semesterId] });
      toast.success("Topic updated successfully");
      setEditingTopic(null);
    } catch (error) {
      console.error("Error updating topic:", error);
      toast.error("Failed to update topic");
    }
  };

  const handleDeleteTopic = async (topicId: string) => {
    if (!confirm("Are you sure you want to delete this topic?")) return;
    
    try {
      const { error } = await supabase
        .from("topics")
        .delete()
        .eq("id", topicId);
        
      if (error) throw error;
      
      queryClient.invalidateQueries({ queryKey: ["topics", semesterId] });
      toast.success("Topic deleted successfully");
    } catch (error) {
      console.error("Error deleting topic:", error);
      toast.error("Failed to delete topic");
    }
  };

  if (isLoading) {
    return <div className="py-4 text-center text-sm text-muted-foreground">Loading topics...</div>;
  }

  if (!topics || topics.length === 0) {
    return (
      <div className="text-center py-2 text-sm text-muted-foreground">
        No topics found for this semester.
      </div>
    );
  }

  return (
    <div className="border rounded-md overflow-hidden">
      <div className="bg-muted px-4 py-2 flex font-medium text-sm">
        <div className="w-16 text-center">#</div>
        <div className="flex-1">Topic Name</div>
        <div className="w-24 text-right">Actions</div>
      </div>
      <div className="divide-y">
        {topics.map((topic) => (
          <div key={topic.id} className="px-4 py-2 flex items-center text-sm">
            {editingTopic?.id === topic.id ? (
              <>
                <div className="w-16 text-center">{topic.order_id}</div>
                <div className="flex-1 pr-2">
                  <input
                    value={editTopicName}
                    onChange={(e) => setEditTopicName(e.target.value)}
                    className="w-full px-2 py-1 border rounded"
                    autoFocus
                  />
                </div>
                <div className="w-24 flex justify-end gap-1">
                  <Button size="sm" variant="outline" className="h-7 px-2" onClick={handleSaveEdit}>
                    Save
                  </Button>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    className="h-7 px-2" 
                    onClick={() => setEditingTopic(null)}
                  >
                    Cancel
                  </Button>
                </div>
              </>
            ) : (
              <>
                <div className="w-16 text-center">{topic.order_id}</div>
                <div className="flex-1 truncate">{topic.name}</div>
                <div className="w-24 flex justify-end">
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    className="h-7 w-7 p-0" 
                    onClick={() => handleEditTopic(topic)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    className="h-7 w-7 p-0 text-red-500" 
                    onClick={() => handleDeleteTopic(topic.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
