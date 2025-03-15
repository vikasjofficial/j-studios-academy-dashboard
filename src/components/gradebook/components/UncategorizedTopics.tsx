
import { 
  Collapsible, 
  CollapsibleContent, 
  CollapsibleTrigger 
} from "@/components/ui/collapsible";
import { Topic, Grade } from "../types";
import { GradesList } from "./GradesList";
import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { useState } from "react";

interface UncategorizedTopicsProps {
  topics: Topic[];
  getGrade: (topicId: string) => Grade | null;
  getScoreColor: (score: number) => string;
}

export function UncategorizedTopics({ topics, getGrade, getScoreColor }: UncategorizedTopicsProps) {
  const [isOpen, setIsOpen] = useState(true);
  
  if (!topics || topics.length === 0) return null;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
      className="w-full"
    >
      <Collapsible 
        open={isOpen} 
        onOpenChange={setIsOpen} 
        className="w-full border rounded-md overflow-hidden shadow-sm"
      >
        <div className="bg-muted/30 p-3 border-b flex justify-between items-center cursor-pointer hover:bg-muted/40 transition-colors"
            onClick={() => setIsOpen(!isOpen)}>
          <h3 className="font-semibold text-primary-foreground">Uncategorized Topics</h3>
          <CollapsibleTrigger className="hover:bg-muted/50 p-1 rounded transition-colors">
            <motion.div
              animate={{ rotate: isOpen ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronDown className="h-4 w-4" />
              <span className="sr-only">Toggle</span>
            </motion.div>
          </CollapsibleTrigger>
        </div>
        
        <CollapsibleContent className="transition-all duration-300 ease-in-out">
          <GradesList 
            topics={topics} 
            getGrade={getGrade} 
            getScoreColor={getScoreColor} 
          />
        </CollapsibleContent>
      </Collapsible>
    </motion.div>
  );
}
