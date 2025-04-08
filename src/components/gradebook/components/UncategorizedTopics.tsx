
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Topic, Grade } from "../types";
import { GradesList } from "./GradesList";
import { ListFilter } from "lucide-react";

interface UncategorizedTopicsProps {
  topics: Topic[];
  getGrade: (topicId: string) => Grade | null;
  getScoreColor: (score: number) => string;
  viewMode?: 'table' | 'grid';
}

export function UncategorizedTopics({ 
  topics, 
  getGrade, 
  getScoreColor,
  viewMode = 'grid' 
}: UncategorizedTopicsProps) {
  if (!topics || topics.length === 0) {
    return null;
  }

  return (
    <Card className="overflow-hidden border border-border/40">
      <CardHeader className="p-4 pb-2 bg-muted/10">
        <CardTitle className="text-base flex items-center gap-2">
          <ListFilter className="h-4 w-4 text-primary" />
          <span>Uncategorized Topics</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-2">
        <GradesList 
          topics={topics} 
          getGrade={getGrade} 
          getScoreColor={getScoreColor}
          viewMode={viewMode}
        />
      </CardContent>
    </Card>
  );
}
