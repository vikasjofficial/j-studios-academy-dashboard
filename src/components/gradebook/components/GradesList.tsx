
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
}

export function GradesList({ topics, getGrade, getScoreColor }: GradesListProps) {
  if (topics.length === 0) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        No topics found for this semester
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-md">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/30 hover:bg-muted/30">
            <TableHead className="font-semibold">Topic</TableHead>
            <TableHead className="text-center font-semibold">Score</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {topics.map((topic, index) => {
            const grade = getGrade(topic.id);
            return (
              <motion.tr
                key={topic.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="border-b hover:bg-muted/10 transition-colors"
              >
                <TableCell className="font-medium">{topic.name}</TableCell>
                <TableCell className="text-center">
                  {grade ? (
                    <HoverCard>
                      <HoverCardTrigger>
                        <motion.span 
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className={`inline-block py-1 px-3 rounded-full shadow-sm ${getScoreColor(grade.score)}`}
                        >
                          {grade.score}
                        </motion.span>
                      </HoverCardTrigger>
                      {grade.comment && (
                        <HoverCardContent className="w-64 p-3 shadow-lg backdrop-blur-sm bg-card/90 border-primary/20">
                          <div className="flex flex-col space-y-1">
                            <div className="flex items-center">
                              <Info className="h-3 w-3 mr-1 text-primary" />
                              <h4 className="text-sm font-medium">Teacher's Note:</h4>
                            </div>
                            <p className="text-sm text-muted-foreground">{grade.comment}</p>
                          </div>
                        </HoverCardContent>
                      )}
                    </HoverCard>
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </TableCell>
              </motion.tr>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
