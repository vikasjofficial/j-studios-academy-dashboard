
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";

interface AddTopicFormProps {
  newTopicName: string;
  onNewTopicNameChange: (name: string) => void;
  onAddTopic: () => void;
}

export function AddTopicForm({
  newTopicName,
  onNewTopicNameChange,
  onAddTopic
}: AddTopicFormProps) {
  return (
    <div className="flex gap-2 mb-4">
      <Input
        placeholder="Add a new topic"
        value={newTopicName}
        onChange={(e) => onNewTopicNameChange(e.target.value)}
        className="flex-1"
      />
      <Button onClick={onAddTopic} disabled={!newTopicName.trim()}>
        <Plus className="h-4 w-4 mr-2" />
        Add
      </Button>
    </div>
  );
}
