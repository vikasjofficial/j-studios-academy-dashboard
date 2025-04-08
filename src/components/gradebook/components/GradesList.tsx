
import { useState } from "react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  HoverCard, 
  HoverCardContent, 
  HoverCardTrigger 
} from "@/components/ui/hover-card";
import { Info } from "lucide-react";
import { Topic, Grade } from "../types";
import { motion } from "framer-motion";

interface GradesListProps {
  topics: Topic[];
  getGrade: (topicId: string) => Grade | null;
  getScoreColor: (score: number) => string;
  viewMode?: 'table' | 'grid';
}

export function GradesList({ topics, getGrade, getScoreColor, viewMode = 'grid' }: GradesListProps) {
  if (topics.length === 0) {
    return (
      <div className="p-2 text-center text-muted-foreground text-xs">
        No topics found for this semester
      </div>
    );
  }

  // Table view - more compact
  if (viewMode === 'table') {
    return (
      <div className="rounded-md border border-border/40">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30 hover:bg-muted/30">
              <TableHead className="font-medium text-xs py-1 h-8 w-[70%]">Topic</TableHead>
              <TableHead className="text-center font-medium text-xs py-1 h-8 w-[30%]">Score</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {topics.map((topic, index) => {
              const grade = getGrade(topic.id);
              return (
                <TableRow key={topic.id} className="h-8">
                  <TableCell className="py-1 text-xs">{topic.name}</TableCell>
                  <TableCell className="text-center py-1">
                    {grade ? (
                      <HoverCard>
                        <HoverCardTrigger>
                          <span className={`inline-block py-0.5 px-1.5 rounded-full text-xs ${getScoreColor(grade.score)}`}>
                            {grade.score}
                          </span>
                        </HoverCardTrigger>
                        {grade.comment && (
                          <HoverCardContent className="w-56 p-1.5 shadow-lg backdrop-blur-sm bg-card/90 border-primary/20">
                            <div className="flex flex-col space-y-1">
                              <div className="flex items-center">
                                <Info className="h-3 w-3 mr-1 text-primary" />
                                <h4 className="text-xs font-medium">Teacher's Note:</h4>
                              </div>
                              <p className="text-xs text-muted-foreground">{grade.comment}</p>
                            </div>
                          </HoverCardContent>
                        )}
                      </HoverCard>
                    ) : (
                      <span className="text-muted-foreground text-xs">-</span>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    );
  }

  // Grid view (original design with animations but more compact)
  return (
    <div className="space-y-1">
      {topics.map((topic, index) => {
        const grade = getGrade(topic.id);
        return (
          <motion.div
            key={topic.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2, delay: index * 0.05 }}
            className="flex justify-between items-center p-1.5 rounded-md bg-muted/10 hover:bg-muted/20 transition-colors"
          >
            <span className="font-medium text-xs truncate">{topic.name}</span>
            {grade ? (
              <HoverCard>
                <HoverCardTrigger>
                  <motion.span 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`inline-block py-0.5 px-2 rounded-full shadow-sm text-xs ${getScoreColor(grade.score)}`}
                  >
                    {grade.score}
                  </motion.span>
                </HoverCardTrigger>
                {grade.comment && (
                  <HoverCardContent className="w-56 p-2 shadow-lg backdrop-blur-sm bg-card/90 border-primary/20">
                    <div className="flex flex-col space-y-1">
                      <div className="flex items-center">
                        <Info className="h-3 w-3 mr-1 text-primary" />
                        <h4 className="text-xs font-medium">Teacher's Note:</h4>
                      </div>
                      <p className="text-xs text-muted-foreground">{grade.comment}</p>
                    </div>
                  </HoverCardContent>
                )}
              </HoverCard>
            ) : (
              <span className="text-muted-foreground text-xs">-</span>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}
