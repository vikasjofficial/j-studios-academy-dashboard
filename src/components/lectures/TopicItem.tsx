
import { useState } from "react";
import { motion } from "framer-motion";
import { Pencil, Trash2, GripVertical, CheckCircle, Circle, Check } from "lucide-react";
import { Draggable } from "react-beautiful-dnd";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { LectureTopic } from "./types";

interface TopicItemProps {
  topic: LectureTopic;
  index: number;
  readOnly: boolean;
  editingTopic: LectureTopic | null;
  editedTopicName: string;
  onEditTopic: (topic: LectureTopic) => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
  onDeleteTopic: (topicId: string) => void;
  onToggleCompletion: (topic: LectureTopic) => void;
  onEditNameChange: (name: string) => void;
  isStudent?: boolean;
}

export function TopicItem({
  topic,
  index,
  readOnly,
  editingTopic,
  editedTopicName,
  onEditTopic,
  onSaveEdit,
  onCancelEdit,
  onDeleteTopic,
  onToggleCompletion,
  onEditNameChange,
  isStudent = false
}: TopicItemProps) {
  return (
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
          <Card className={`overflow-hidden ${topic.completed ? (isStudent ? 'bg-gray-800' : 'border-green-500 bg-green-50/30') : ''}`}>
            <CardContent className="p-3 flex items-center justify-between">
              {editingTopic?.id === topic.id ? (
                // Edit mode
                <div className="flex-1 flex items-center gap-2">
                  <Input
                    value={editedTopicName}
                    onChange={(e) => onEditNameChange(e.target.value)}
                    className="flex-1"
                    autoFocus
                  />
                  <div className="flex gap-1">
                    <Button 
                      size="sm" 
                      onClick={onSaveEdit}
                      disabled={!editedTopicName.trim()}
                    >
                      Save
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={onCancelEdit}
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
                    <div className="flex items-center gap-2">
                      {!isStudent ? (
                        // Admin/Teacher view with clickable checkbox
                        <Button
                          variant="ghost"
                          size="sm"
                          className={`h-8 w-8 p-0 ${topic.completed ? 'text-green-600 hover:text-green-700' : 'text-muted-foreground hover:text-foreground'}`}
                          onClick={() => onToggleCompletion(topic)}
                        >
                          {topic.completed ? 
                            <CheckCircle className="h-5 w-5 fill-green-100" /> : 
                            <Circle className="h-5 w-5" />
                          }
                        </Button>
                      ) : (
                        // Student view with non-clickable indicator
                        <div className="h-8 w-8 flex items-center justify-center">
                          {topic.completed && <Check className="h-5 w-5 text-green-500" />}
                        </div>
                      )}
                      <div className={`font-medium ${topic.completed ? (isStudent ? 'text-green-500' : 'text-green-600') : ''}`}>
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
                        onClick={() => onEditTopic(topic)}
                      >
                        <Pencil className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 w-8 p-0 text-destructive"
                        onClick={() => onDeleteTopic(topic.id)}
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
  );
}
