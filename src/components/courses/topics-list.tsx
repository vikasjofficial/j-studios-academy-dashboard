
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Book, Calendar } from "lucide-react";

interface TopicsListProps {
  semesterId: string;
  courseId: string;
}

export function TopicsList({ semesterId, courseId }: TopicsListProps) {
  const { data: topics, isLoading } = useQuery({
    queryKey: ["topics", semesterId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("topics")
        .select("*, lectures(*)")
        .eq("semester_id", semesterId)
        .eq("course_id", courseId)
        .order("order");
        
      if (error) throw error;
      return data;
    },
  });

  const { data: lectureCount } = useQuery({
    queryKey: ["lecture-count", semesterId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("lectures")
        .select("topic_id, count(*)", { count: "exact" })
        .eq("semester_id", semesterId)
        .group("topic_id");
        
      if (error) throw error;
      return data;
    },
  });

  const getLectureCountForTopic = (topicId: string) => {
    const found = lectureCount?.find(count => count.topic_id === topicId);
    return found ? Number(found.count) : 0;
  };

  if (isLoading) {
    return <div className="py-4 text-center text-sm text-muted-foreground">Loading topics...</div>;
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium flex items-center gap-2">
        <Book className="h-4 w-4" />
        Topics
      </h3>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order</TableHead>
              <TableHead>Topic</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Scheduled Lectures</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {topics && topics.length > 0 ? (
              topics.map((topic) => (
                <TableRow key={topic.id}>
                  <TableCell className="font-medium">{topic.order}</TableCell>
                  <TableCell>{topic.name}</TableCell>
                  <TableCell className="max-w-md truncate">{topic.description}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="flex items-center gap-1 w-fit">
                      <Calendar className="h-3 w-3" />
                      {getLectureCountForTopic(topic.id)} lectures
                    </Badge>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-4 text-sm text-muted-foreground">
                  No topics found for this semester.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
