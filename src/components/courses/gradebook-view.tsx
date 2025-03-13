
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ListChecks, Save } from "lucide-react";
import { toast } from "sonner";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";

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

  // Get color based on score
  const getScoreColor = (score: number) => {
    if (score >= 9) return "bg-[#4ade80]"; // Neon Green
    if (score >= 6) return "bg-[#86efac]"; // Faint Green
    if (score >= 3) return "bg-[#fdba74]"; // Orange
    return "bg-[#f87171]"; // Red
  };

  const handleGradeChange = (studentId: string, topicId: string, score: number) => {
    // Ensure score is between 1-10
    let validScore = Math.max(1, Math.min(10, score));
    
    setGrades(prev => ({
      ...prev,
      [studentId]: {
        ...(prev[studentId] || {}),
        [topicId]: validScore
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
          // For updates, include all required fields
          updates.push({
            id: existingGradeMap[key],
            student_id: grade.student_id,
            topic_id: grade.topic_id,
            course_id: courseId,
            score: grade.score
          });
        } else {
          inserts.push(grade);
        }
      });
      
      console.log("Updates:", updates);
      console.log("Inserts:", inserts);
      
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

  const calculateAverage = (studentId: string) => {
    if (!grades[studentId]) return '-';
    
    const studentGrades = Object.values(grades[studentId]);
    if (studentGrades.length === 0) return '-';
    
    const sum = studentGrades.reduce((acc, curr) => acc + curr, 0);
    const avg = Math.round(sum / studentGrades.length * 10) / 10;
    return avg.toString();
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
              <div className="flex flex-wrap gap-2 mb-6">
                {semesters.map(semester => (
                  <Button
                    key={semester.id}
                    variant={selectedSemesterId === semester.id ? "default" : "outline"}
                    onClick={() => setSelectedSemesterId(semester.id)}
                    size="sm"
                  >
                    {semester.name}
                  </Button>
                ))}
              </div>
              
              {selectedSemesterId && students && students.length > 0 && topics && topics.length > 0 ? (
                <div className="space-y-4">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/50">
                          <TableHead className="w-[200px] font-bold">Student</TableHead>
                          {topics.map(topic => (
                            <TableHead key={topic.id} className="text-center min-w-[100px] font-medium">
                              {topic.name}
                            </TableHead>
                          ))}
                          <TableHead className="text-center min-w-[80px] font-medium">Average</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {students.map(student => (
                          <TableRow key={student.id} className="hover:bg-muted/20">
                            <TableCell className="font-medium">
                              <div>
                                <div>{student.name}</div>
                                <div className="text-xs text-muted-foreground">{student.student_id}</div>
                              </div>
                            </TableCell>
                            {topics.map(topic => (
                              <TableCell key={topic.id} className="text-center">
                                <Input
                                  type="number"
                                  min="1"
                                  max="10"
                                  value={grades[student.id]?.[topic.id] || ""}
                                  onChange={(e) => handleGradeChange(
                                    student.id,
                                    topic.id,
                                    e.target.value ? Number(e.target.value) : 1
                                  )}
                                  className={`w-16 text-center h-8 mx-auto ${
                                    grades[student.id]?.[topic.id] 
                                      ? getScoreColor(grades[student.id][topic.id]) 
                                      : ""
                                  }`}
                                />
                              </TableCell>
                            ))}
                            <TableCell className="text-center font-medium">
                              {calculateAverage(student.id)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                  
                  <div className="flex justify-end">
                    <Button 
                      onClick={saveGrades} 
                      disabled={isSaving}
                      className="flex items-center gap-2"
                    >
                      <Save className="h-4 w-4" />
                      {isSaving ? "Saving..." : "Save Grades"}
                    </Button>
                  </div>
                </div>
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
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
