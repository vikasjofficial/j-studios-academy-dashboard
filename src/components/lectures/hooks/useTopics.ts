
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Lecture, LectureTopic } from "../types";
import { DropResult } from "react-beautiful-dnd";

export function useTopics(lecture: Lecture, onTopicsUpdated: () => void) {
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
          order_position: nextPosition,
          completed: false
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

  // Toggle topic completion
  const handleToggleCompletion = async (topic: LectureTopic) => {
    try {
      // Update the database directly instead of using rpc
      const { error } = await supabase
        .from('classes_topics')
        .update({ 
          completed: !topic.completed,
          updated_at: new Date().toISOString()
        })
        .eq("id", topic.id);
      
      if (error) throw error;
      
      toast.success(topic.completed ? "Topic marked as incomplete" : "Topic marked as complete");
      refetch();
      onTopicsUpdated();
    } catch (error) {
      console.error("Error toggling topic completion:", error);
      toast.error("Failed to update topic status");
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

  return {
    topics,
    isLoading,
    newTopicName,
    setNewTopicName,
    editingTopic,
    editedTopicName,
    setEditedTopicName,
    handleAddTopic,
    handleToggleCompletion,
    handleDeleteTopic,
    handleEditTopic,
    handleSaveEdit,
    handleCancelEdit,
    handleDragEnd
  };
}
