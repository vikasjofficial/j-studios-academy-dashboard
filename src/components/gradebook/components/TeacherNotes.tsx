
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageSquare } from "lucide-react";
import { CourseSelector } from "./CourseSelector";
import { Course } from "../types";

interface TeacherNote {
  topicId: string;
  topicName: string;
  semesterName: string;
  comment: string;
}

interface TeacherNotesProps {
  courses: Course[];
  selectedCourse: string | null;
  onSelectCourse: (courseId: string) => void;
  notes: TeacherNote[];
}

export function TeacherNotes({ 
  courses, 
  selectedCourse, 
  onSelectCourse, 
  notes 
}: TeacherNotesProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-md flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-primary" />
          Teacher Notes
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <CourseSelector 
            courses={courses} 
            selectedCourse={selectedCourse} 
            onSelectCourse={onSelectCourse} 
          />

          <div className="rounded-lg border p-4 space-y-3">
            {notes && notes.length > 0 ? (
              <Tabs defaultValue="all" className="w-full">
                <TabsList className="w-full">
                  <TabsTrigger value="all" className="flex-1">All Notes</TabsTrigger>
                  <TabsTrigger value="bySemester" className="flex-1">By Semester</TabsTrigger>
                </TabsList>
                
                <TabsContent value="all" className="mt-4 space-y-3">
                  {notes.map((item, index) => (
                    <div key={index} className="p-3 rounded-md bg-card/50 border">
                      <div className="flex justify-between mb-1">
                        <h4 className="font-medium">{item.topicName}</h4>
                        <span className="text-xs text-muted-foreground">{item.semesterName}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{item.comment}</p>
                    </div>
                  ))}
                </TabsContent>
                
                <TabsContent value="bySemester" className="mt-4 space-y-5">
                  {Object.entries(
                    notes.reduce((acc: {[key: string]: any[]}, item) => {
                      if (!acc[item.semesterName]) {
                        acc[item.semesterName] = [];
                      }
                      acc[item.semesterName].push(item);
                      return acc;
                    }, {})
                  ).map(([semesterName, comments]) => (
                    <div key={semesterName} className="space-y-2">
                      <h3 className="font-medium text-sm border-b pb-1">{semesterName}</h3>
                      <div className="space-y-2 pl-2">
                        {comments.map((item, index) => (
                          <div key={index} className="p-3 rounded-md bg-card/50 border">
                            <h4 className="font-medium mb-1">{item.topicName}</h4>
                            <p className="text-sm text-muted-foreground">{item.comment}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </TabsContent>
              </Tabs>
            ) : (
              <p className="text-muted-foreground text-center py-4">No notes available for this course.</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
