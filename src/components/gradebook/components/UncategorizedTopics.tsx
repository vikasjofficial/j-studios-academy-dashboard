
import { 
  Collapsible, 
  CollapsibleContent, 
  CollapsibleTrigger 
} from "@/components/ui/collapsible";
import { Topic, Grade } from "../types";
import { GradesList } from "./GradesList";

interface UncategorizedTopicsProps {
  topics: Topic[];
  getGrade: (topicId: string) => Grade | null;
  getScoreColor: (score: number) => string;
}

export function UncategorizedTopics({ topics, getGrade, getScoreColor }: UncategorizedTopicsProps) {
  if (!topics || topics.length === 0) return null;
  
  return (
    <Collapsible className="w-full border rounded-md overflow-hidden">
      <div className="bg-muted/50 p-3 border-b flex justify-between items-center">
        <h3 className="font-semibold">Uncategorized Topics</h3>
        <CollapsibleTrigger className="hover:bg-muted p-1 rounded">
          <span className="sr-only">Toggle</span>
        </CollapsibleTrigger>
      </div>
      
      <CollapsibleContent>
        <GradesList 
          topics={topics} 
          getGrade={getGrade} 
          getScoreColor={getScoreColor} 
        />
      </CollapsibleContent>
    </Collapsible>
  );
}
