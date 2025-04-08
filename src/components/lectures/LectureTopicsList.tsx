
import { Lecture } from "./types";
import { AddTopicForm } from "./AddTopicForm";
import { TopicsList } from "./TopicsList";
import { useTopics } from "./hooks/useTopics";
import { useAuth } from "@/context/auth-context";

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
  const { user } = useAuth();
  const isStudent = user?.role === 'student';
  
  const {
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
  } = useTopics(lecture, onTopicsUpdated);

  if (isLoading) {
    return <div className="text-center py-4">Loading topics...</div>;
  }

  // If the user is a student, force readOnly to true
  const finalReadOnly = isStudent ? true : readOnly;

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium mb-2">Topics</h3>
      
      {!finalReadOnly && (
        <AddTopicForm
          newTopicName={newTopicName}
          onNewTopicNameChange={setNewTopicName}
          onAddTopic={handleAddTopic}
        />
      )}
      
      {topics && topics.length > 0 ? (
        <TopicsList
          topics={topics}
          readOnly={finalReadOnly}
          editingTopic={editingTopic}
          editedTopicName={editedTopicName}
          onEditTopic={handleEditTopic}
          onSaveEdit={handleSaveEdit}
          onCancelEdit={handleCancelEdit}
          onDeleteTopic={handleDeleteTopic}
          onToggleCompletion={handleToggleCompletion}
          onEditNameChange={setEditedTopicName}
          onDragEnd={handleDragEnd}
          isStudent={isStudent}
        />
      ) : (
        <div className="text-center py-4 text-muted-foreground">
          {finalReadOnly ? "No topics available for this lecture." : "Add topics to create a lecture outline."}
        </div>
      )}
    </div>
  );
}
