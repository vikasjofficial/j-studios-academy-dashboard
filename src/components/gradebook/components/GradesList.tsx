
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
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Topic</TableHead>
          <TableHead className="text-center">Score</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {topics.map(topic => {
          const grade = getGrade(topic.id);
          return (
            <TableRow key={topic.id}>
              <TableCell>{topic.name}</TableCell>
              <TableCell className="text-center">
                {grade ? (
                  <HoverCard>
                    <HoverCardTrigger>
                      <span 
                        className={`inline-block py-1 px-3 rounded ${getScoreColor(grade.score)}`}
                      >
                        {grade.score}
                      </span>
                    </HoverCardTrigger>
                    {grade.comment && (
                      <HoverCardContent className="w-64 p-3">
                        <div className="flex flex-col space-y-1">
                          <div className="flex items-center">
                            <Info className="h-3 w-3 mr-1 text-muted-foreground" />
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
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
