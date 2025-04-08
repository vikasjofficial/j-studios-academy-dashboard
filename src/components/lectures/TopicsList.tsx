
import { DragDropContext, Droppable, DropResult } from "react-beautiful-dnd";
import { LectureTopic } from "./types";
import { TopicItem } from "./TopicItem";

interface TopicsListProps {
  topics: LectureTopic[];
  readOnly: boolean;
  editingTopic: LectureTopic | null;
  editedTopicName: string;
  onEditTopic: (topic: LectureTopic) => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
  onDeleteTopic: (topicId: string) => void;
  onToggleCompletion: (topic: LectureTopic) => void;
  onEditNameChange: (name: string) => void;
  onDragEnd: (result: DropResult) => void;
}

export function TopicsList({
  topics,
  readOnly,
  editingTopic,
  editedTopicName,
  onEditTopic,
  onSaveEdit,
  onCancelEdit,
  onDeleteTopic,
  onToggleCompletion,
  onEditNameChange,
  onDragEnd
}: TopicsListProps) {
  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId="topics" isDropDisabled={readOnly}>
        {(provided) => (
          <div
            {...provided.droppableProps}
            ref={provided.innerRef}
            className="space-y-2"
          >
            {topics.map((topic, index) => (
              <TopicItem 
                key={topic.id}
                topic={topic}
                index={index}
                readOnly={readOnly}
                editingTopic={editingTopic}
                editedTopicName={editedTopicName}
                onEditTopic={onEditTopic}
                onSaveEdit={onSaveEdit}
                onCancelEdit={onCancelEdit}
                onDeleteTopic={onDeleteTopic}
                onToggleCompletion={onToggleCompletion}
                onEditNameChange={onEditNameChange}
              />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
}
