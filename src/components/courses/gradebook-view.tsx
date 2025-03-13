
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { CalendarDays, GraduationCap, ListChecks, Save } from "lucide-react";
import { toast } from "sonner";

interface GradebookViewProps {
  courseId: string;
  courseName: string;
}

interface Student {
  id: string;
  name: string;
  student_id: string;
}

interface Semester {
  id: string;
  name: string;
}

interface Topic {
  id: string;
  name: string;
  order_id: number;
}

interface Grade {
  id?: string;
  student_id: string;
  topic_id: string;
  course_id: string;
  score: number;
}

export function GradebookView({ courseId, courseName }: GradebookViewProps) {
  const [selectedSemesterId, setSelectedSemesterId] = useState<string | null>(null);
  const [grades, setGrades] = useState<Record<string, Record<string, number>>>({});
  const [isSaving, setIsSaving] = useState(false);

  // Fetch semesters for the course
  const { data: semesters } = useQuery({
    queryKey: ["semesters", courseId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("semesters")
        .select("id, name")
        .eq("course_id", courseId)
        .order("start_date");
        
      if (error) throw error;
      
      if (data.length > 0 && !selectedSemesterId) {
        setSelectedSemesterId(data[0].id);
      }
      
      return data as Semester[];
    },
  });

  // Fetch students enrolled in the course
  const { data: students } = useQuery({
    queryKey: ["enrolled-students", courseId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("enrollments")
        .select(`
          student_id,
          students:student_id(id, name, student_id)
        `)
        .eq("course_id", courseId);
        
      if (error) throw error;
      
      return data.map(item => item.students) as Student[];
    },
  });

  // Fetch topics for the selected semester
  const { data: topics } = useQuery({
    queryKey: ["topics", selectedSemesterId],
    queryFn: async () => {
      if (!selectedSemesterId) return [];
      
      const { data, error } = await supabase
        .from("topics")
        .select("id, name, order_id")
        .eq("semester_id", selectedSemesterId)
        .eq("course_id", courseId)
        .order("order_id");
        
      if (error) throw error;
      return data as Topic[];
    },
    enabled: !!selectedSemesterId,
  });

  // Fetch existing grades
  const { data: existingGrades } = useQuery({
    queryKey: ["grades", courseId, selectedSemesterId],
    queryFn: async () => {
      if (!selectedSemesterId || !topics || topics.length === 0) return [];
      
      const topicIds = topics.map(topic => topic.id);
      
      const { data, error } = await supabase
        .from("grades")
        .select("id, student_id, topic_id, score")
        .eq("course_id", courseId)
        .in("topic_id", topicIds);
        
      if (error) throw error;
      
      // Initialize grades state
      const gradeMap: Record<string, Record<string, number>> = {};
      
      data.forEach(grade => {
        if (!gradeMap[grade.student_id]) {
          gradeMap[grade.student_id] = {};
        }
        gradeMap[grade.student_id][grade.topic_id] = grade.score;
      });
      
      setGrades(gradeMap);
      
      return data;
    },
    enabled: !!selectedSemesterId && !!topics && topics.length > 0,
  });

  const handleGradeChange = (studentId: string, topicId: string, score: number) => {
    setGrades(prev => ({
      ...prev,
      [studentId]: {
        ...(prev[studentId] || {}),
        [topicId]: score
      }
    }));
  };

  const saveGrades = async () => {
    if (!selectedSemesterId) return;
    
    setIsSaving(true);
    
    try {
      const updatedGrades: Grade[] = [];
      
      // Format grades for saving
      Object.entries(grades).forEach(([studentId, topicGrades]) => {
        Object.entries(topicGrades).forEach(([topicId, score]) => {
          updatedGrades.push({
            student_id: studentId,
            topic_id: topicId,
            course_id: courseId,
            score
          });
        });
      });
      
      // Check for existing grades to update or insert
      const { data: existingGradeRecords, error: checkError } = await supabase
        .from("grades")
        .select("id, student_id, topic_id")
        .eq("course_id", courseId);
      
      if (checkError) throw checkError;
      
      // Create a map of existing grades
      const existingGradeMap: Record<string, string> = {};
      existingGradeRecords.forEach(grade => {
        const key = `${grade.student_id}-${grade.topic_id}`;
        existingGradeMap[key] = grade.id;
      });
      
      // Separate updates and inserts
      const updates: any[] = [];
      const inserts: any[] = [];
      
      updatedGrades.forEach(grade => {
        const key = `${grade.student_id}-${grade.topic_id}`;
        if (existingGradeMap[key]) {
          updates.push({
            id: existingGradeMap[key],
            score: grade.score
          });
        } else {
          inserts.push(grade);
        }
      });
      
      // Perform updates
      if (updates.length > 0) {
        const { error: updateError } = await supabase
          .from("grades")
          .upsert(updates);
          
        if (updateError) throw updateError;
      }
      
      // Perform inserts
      if (inserts.length > 0) {
        const { error: insertError } = await supabase
          .from("grades")
          .insert(inserts);
          
        if (insertError) throw insertError;
      }
      
      toast.success("Grades saved successfully");
    } catch (error) {
      console.error("Error saving grades:", error);
      toast.error("Failed to save grades");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ListChecks className="h-5 w-5" />
            Gradebook for {courseName}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {semesters && semesters.length > 0 ? (
            <>
              <Tabs 
                value={selectedSemesterId || ""} 
                onValueChange={setSelectedSemesterId}
                className="mb-6"
              >
                <TabsList className="mb-4">
                  {semesters.map(semester => (
                    <TabsTrigger key={semester.id} value={semester.id} className="flex items-center gap-1">
                      <CalendarDays className="h-4 w-4" />
                      {semester.name}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
              
              {selectedSemesterId && students && students.length > 0 && topics && topics.length > 0 ? (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-muted">
                          <th className="border px-4 py-2 text-left">Student</th>
                          {topics.map(topic => (
                            <th key={topic.id} className="border px-4 py-2 text-center">
                              {topic.name}
                            </th>
                          ))}
                          <th className="border px-4 py-2 text-center">Average</th>
                        </tr>
                      </thead>
                      <tbody>
                        {students.map(student => {
                          // Calculate average grade
                          const studentGrades = grades[student.id] || {};
                          const gradeValues = Object.values(studentGrades);
                          const average = gradeValues.length > 0
                            ? gradeValues.reduce((sum, grade) => sum + grade, 0) / gradeValues.length
                            : 0;
                            
                          return (
                            <tr key={student.id}>
                              <td className="border px-4 py-2">
                                <div>
                                  <div>{student.name}</div>
                                  <div className="text-xs text-muted-foreground">{student.student_id}</div>
                                </div>
                              </td>
                              {topics.map(topic => (
                                <td key={topic.id} className="border px-4 py-2 text-center">
                                  <input
                                    type="number"
                                    min="0"
                                    max="100"
                                    value={grades[student.id]?.[topic.id] || ""}
                                    onChange={(e) => handleGradeChange(
                                      student.id,
                                      topic.id,
                                      e.target.value ? Number(e.target.value) : 0
                                    )}
                                    className="w-16 text-center border rounded px-2 py-1"
                                  />
                                </td>
                              ))}
                              <td className="border px-4 py-2 text-center font-medium">
                                {average ? average.toFixed(1) : "-"}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                  
                  <div className="mt-6 flex justify-end">
                    <Button 
                      onClick={saveGrades} 
                      disabled={isSaving}
                      className="flex items-center gap-2"
                    >
                      <Save className="h-4 w-4" />
                      {isSaving ? "Saving..." : "Save Grades"}
                    </Button>
                  </div>
                </>
              ) : (
                <div className="text-center py-6">
                  {!topics || topics.length === 0 ? (
                    <p className="text-muted-foreground">No topics found for this semester.</p>
                  ) : (
                    <p className="text-muted-foreground">No students enrolled in this course.</p>
                  )}
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-6">
              <p className="text-muted-foreground mb-4">No semesters found for this course.</p>
              <Button variant="outline" className="flex items-center gap-2">
                <GraduationCap className="h-4 w-4" />
                Create Semester
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
