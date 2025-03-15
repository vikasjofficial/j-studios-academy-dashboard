
import { useState } from "react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Lecture, LectureTopic } from "./types";
import { Plus, Pencil, Trash2, GripVertical } from "lucide-react";
import { DragDropContext, Droppable, Draggable, DropResult } from "react-beautiful-dnd";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

interface LectureTopicsListProps {
  lecture: Lecture;
  onTopicsUpdated: () => void;
  readOnly?: boolean;
}

export function LectureTopicsList({
  lecture,
  onTopicsUpdated,
  readOnly = false
}: LectureTopicsListProps) {
  const [newTopicName, setNewTopicName] = useState("");
  const [editingTopic, setEditingTopic] = useState<LectureTopic | null>(null);
  const [editedTopicName, setEditedTopicName] = useState("");

  // Fetch topics for this lecture using classes_topics table
  const { data: topics, isLoading, refetch } = useQuery({
    queryKey: ["lectureTopics", lecture.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('classes_topics')
        .select("*")
        .eq("lecture_id", lecture.id)
        .order("order_position");
      
      if (error) {
        throw error;
      }
      
      return data as LectureTopic[];
    },
  });

  // Add new topic
  const handleAddTopic = async () => {
    if (!newTopicName.trim()) {
      toast.error("Please enter a topic name");
      return;
    }
    
    try {
      const nextPosition = topics ? topics.length : 0;
      
      const { error } = await supabase
        .from('classes_topics')
        .insert({
          name: newTopicName,
          lecture_id: lecture.id,
          order_position: nextPosition
        });
      
      if (error) throw error;
      
      toast.success("Topic added");
      setNewTopicName("");
      refetch();
      onTopicsUpdated();
    } catch (error) {
      console.error("Error adding topic:", error);
      toast.error("Failed to add topic");
    }
  };

  // Delete topic
  const handleDeleteTopic = async (topicId: string) => {
    try {
      const { error } = await supabase
        .from('classes_topics')
        .delete()
        .eq("id", topicId);
      
      if (error) throw error;
      
      toast.success("Topic deleted");
      refetch();
      onTopicsUpdated();
    } catch (error) {
      console.error("Error deleting topic:", error);
      toast.error("Failed to delete topic");
    }
  };

  // Start editing topic
  const handleEditTopic = (topic: LectureTopic) => {
    setEditingTopic(topic);
    setEditedTopicName(topic.name);
  };

  // Save edited topic
  const handleSaveEdit = async () => {
    if (!editingTopic || !editedTopicName.trim()) return;
    
    try {
      const { error } = await supabase
        .from('classes_topics')
        .update({ 
          name: editedTopicName,
          updated_at: new Date().toISOString()
        })
        .eq("id", editingTopic.id);
      
      if (error) throw error;
      
      toast.success("Topic updated");
      setEditingTopic(null);
      refetch();
      onTopicsUpdated();
    } catch (error) {
      console.error("Error updating topic:", error);
      toast.error("Failed to update topic");
    }
  };

  // Cancel editing
  const handleCancelEdit = () => {
    setEditingTopic(null);
  };

  // Handle drag and drop reordering
  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination || !topics) return;
    
    const startIndex = result.source.index;
    const endIndex = result.destination.index;
    
    if (startIndex === endIndex) return;
    
    // Reorder the topics array
    const reorderedTopics = Array.from(topics);
    const [movedTopic] = reorderedTopics.splice(startIndex, 1);
    reorderedTopics.splice(endIndex, 0, movedTopic);
    
    // Update the order_position field for each topic
    try {
      for (let i = 0; i < reorderedTopics.length; i++) {
        await supabase
          .from('classes_topics')
          .update({ order_position: i })
          .eq("id", reorderedTopics[i].id);
      }
      
      refetch();
      onTopicsUpdated();
    } catch (error) {
      console.error("Error reordering topics:", error);
      toast.error("Failed to reorder topics");
    }
  };

  if (isLoading) {
    return <div className="text-center py-4">Loading topics...</div>;
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium mb-2">Topics</h3>
      
      {!readOnly && (
        <div className="flex gap-2 mb-4">
          <Input
            placeholder="Add a new topic"
            value={newTopicName}
            onChange={(e) => setNewTopicName(e.target.value)}
            className="flex-1"
          />
          <Button onClick={handleAddTopic} disabled={!newTopicName.trim()}>
            <Plus className="h-4 w-4 mr-2" />
            Add
          </Button>
        </div>
      )}
      
      {topics && topics.length > 0 ? (
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="topics" isDropDisabled={readOnly}>
            {(provided) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className="space-y-2"
              >
                {topics.map((topic, index) => (
                  <Draggable 
                    key={topic.id} 
                    draggableId={topic.id} 
                    index={index}
                    isDragDisabled={readOnly || editingTopic !== null}
                  >
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                      >
                        <Card className="overflow-hidden">
                          <CardContent className="p-3 flex items-center justify-between">
                            {editingTopic?.id === topic.id ? (
                              // Edit mode
                              <div className="flex-1 flex items-center gap-2">
                                <Input
                                  value={editedTopicName}
                                  onChange={(e) => setEditedTopicName(e.target.value)}
                                  className="flex-1"
                                  autoFocus
                                />
                                <div className="flex gap-1">
                                  <Button 
                                    size="sm" 
                                    onClick={handleSaveEdit}
                                    disabled={!editedTopicName.trim()}
                                  >
                                    Save
                                  </Button>
                                  <Button 
                                    size="sm" 
                                    variant="outline" 
                                    onClick={handleCancelEdit}
                                  >
                                    Cancel
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              // View mode
                              <>
                                <div className="flex items-center flex-1">
                                  {!readOnly && (
                                    <div
                                      {...provided.dragHandleProps}
                                      className="mr-2 cursor-grab"
                                    >
                                      <GripVertical className="h-4 w-4 text-muted-foreground" />
                                    </div>
                                  )}
                                  <div className="flex items-center">
                                    <div className="font-medium">
                                      {index + 1}. {topic.name}
                                    </div>
                                  </div>
                                </div>
                                
                                {!readOnly && (
                                  <div className="flex gap-1">
                                    <Button 
                                      variant="ghost" 
                                      size="sm" 
                                      className="h-8 w-8 p-0"
                                      onClick={() => handleEditTopic(topic)}
                                    >
                                      <Pencil className="h-4 w-4" />
                                      <span className="sr-only">Edit</span>
                                    </Button>
                                    <Button 
                                      variant="ghost" 
                                      size="sm" 
                                      className="h-8 w-8 p-0 text-destructive"
                                      onClick={() => handleDeleteTopic(topic.id)}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                      <span className="sr-only">Delete</span>
                                    </Button>
                                  </div>
                                )}
                              </>
                            )}
                          </CardContent>
                        </Card>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      ) : (
        <div className="text-center py-4 text-muted-foreground">
          {readOnly ? "No topics available for this lecture." : "Add topics to create a lecture outline."}
        </div>
      )}
    </div>
  );
}
