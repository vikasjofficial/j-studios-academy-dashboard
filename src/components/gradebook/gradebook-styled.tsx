
import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Save, ChevronLeft, ChevronRight, BookOpen, MessageSquare, Info } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/auth-context";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface Student {
  id: string;
  name: string;
  student_id: string;
}

interface Grade {
  id?: string;
  student_id: string;
  topic_id: string;
  course_id: string;
  score: number;
  comment?: string;
}

interface Course {
  id: string;
  name: string;
}

interface Topic {
  id: string;
  name: string;
  order_id: number;
}

interface Semester {
  id: string;
  name: string;
}

interface Comment {
  id?: string;
  student_id: string;
  topic_id: string;
  course_id: string;
  content: string;
  created_at?: string;
}

interface GradebookStyledProps {
  selectedCourseId?: string;
}

export function GradebookStyled({ selectedCourseId }: GradebookStyledProps) {
  const { user } = useAuth();
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
  const [selectedSemesterId, setSelectedSemesterId] = useState<string | null>(null);
  const [grades, setGrades] = useState<Record<string, Record<string, number>>>({});
  const [comments, setComments] = useState<Record<string, Record<string, string>>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [showCommentFor, setShowCommentFor] = useState<{studentId: string, topicId: string} | null>(null);
  const [selectedStudentForComments, setSelectedStudentForComments] = useState<string | null>(null);
  const commentInputRef = useRef<HTMLTextAreaElement>(null);
  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    if (selectedCourseId) {
      setSelectedCourse(selectedCourseId);
    }
  }, [selectedCourseId]);

  const { data: courses } = useQuery({
    queryKey: ["all-courses"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("courses")
        .select("id, name")
        .order("name");
        
      if (error) throw error;
      return data as Course[];
    },
    enabled: !selectedCourseId,
  });

  useEffect(() => {
    if (!selectedCourseId && courses && courses.length > 0 && !selectedCourse) {
      setSelectedCourse(courses[0].id);
    }
  }, [courses, selectedCourse, selectedCourseId]);

  const { data: semesters } = useQuery({
    queryKey: ["course-semesters", selectedCourse],
    queryFn: async () => {
      if (!selectedCourse) return [];
      
      const { data, error } = await supabase
        .from("semesters")
        .select("id, name")
        .eq("course_id", selectedCourse)
        .order("start_date");
        
      if (error) throw error;
      return data as Semester[];
    },
    enabled: !!selectedCourse,
  });

  useEffect(() => {
    if (semesters && semesters.length > 0 && !selectedSemesterId) {
      setSelectedSemesterId(semesters[0].id);
    }
  }, [semesters, selectedSemesterId]);

  const { data: students } = useQuery({
    queryKey: ["students", selectedCourse],
    queryFn: async () => {
      if (!selectedCourse) return [];
      
      const { data, error } = await supabase
        .from("enrollments")
        .select(`
          student_id,
          students:student_id(id, name, student_id)
        `)
        .eq("course_id", selectedCourse);
        
      if (error) throw error;
      return data.map(item => item.students) as Student[];
    },
    enabled: !!selectedCourse,
  });

  const { data: topics } = useQuery({
    queryKey: ["topics", selectedSemesterId],
    queryFn: async () => {
      if (!selectedSemesterId) return [];
      
      const { data, error } = await supabase
        .from("topics")
        .select("id, name, order_id")
        .eq("semester_id", selectedSemesterId)
        .eq("course_id", selectedCourse)
        .order("order_id");
        
      if (error) throw error;
      return data as Topic[];
    },
    enabled: !!selectedSemesterId && !!selectedCourse,
  });

  const { data: existingGrades, refetch: refetchGrades } = useQuery({
    queryKey: ["grades", selectedCourse, selectedSemesterId],
    queryFn: async () => {
      if (!selectedSemesterId || !topics || topics.length === 0) return [];
      
      const topicIds = topics.map(topic => topic.id);
      
      console.log("Fetching grades with comments for topics:", topicIds);
      
      const { data, error } = await supabase
        .from("grades")
        .select("id, student_id, topic_id, score, comment")
        .eq("course_id", selectedCourse)
        .in("topic_id", topicIds);
        
      if (error) {
        console.error("Error fetching grades:", error);
        throw error;
      }
      
      console.log("Fetched grades data:", data);
      
      const gradeMap: Record<string, Record<string, number>> = {};
      const commentMap: Record<string, Record<string, string>> = {};
      
      data.forEach(grade => {
        if (!gradeMap[grade.student_id]) {
          gradeMap[grade.student_id] = {};
        }
        gradeMap[grade.student_id][grade.topic_id] = grade.score;
        
        if (grade.comment) {
          if (!commentMap[grade.student_id]) {
            commentMap[grade.student_id] = {};
          }
          commentMap[grade.student_id][grade.topic_id] = grade.comment;
        }
      });
      
      console.log("Processed comment map:", commentMap);
      
      setGrades(gradeMap);
      setComments(commentMap);
      
      return data;
    },
    enabled: !!selectedSemesterId && !!topics && topics.length > 0 && !!selectedCourse,
  });

  const handleGradeChange = (studentId: string, topicId: string, score: number) => {
    let validScore = Math.max(1, Math.min(10, score));
    
    setGrades(prev => ({
      ...prev,
      [studentId]: {
        ...(prev[studentId] || {}),
        [topicId]: validScore
      }
    }));
  };

  const handleCommentChange = (studentId: string, topicId: string, comment: string) => {
    console.log("Setting comment for student:", studentId, "topic:", topicId, "comment:", comment);
    setComments(prev => ({
      ...prev,
      [studentId]: {
        ...(prev[studentId] || {}),
        [topicId]: comment
      }
    }));
  };

  const getScoreColor = (score: number) => {
    if (score >= 9) return "bg-[#4ade80] text-black font-medium";
    if (score >= 6) return "bg-[#86efac] text-black font-medium";
    if (score >= 3) return "bg-[#fdba74] text-black font-medium";
    return "bg-[#f87171] text-black font-medium";
  };

  const saveGrades = async () => {
    if (!selectedCourse || !selectedSemesterId) return;
    
    setIsSaving(true);
    console.log("Starting to save grades and comments");
    
    try {
      const updatedGrades: any[] = [];
      
      Object.entries(grades).forEach(([studentId, topicGrades]) => {
        Object.entries(topicGrades).forEach(([topicId, score]) => {
          const comment = comments[studentId]?.[topicId] || "";
          
          updatedGrades.push({
            student_id: studentId,
            topic_id: topicId,
            course_id: selectedCourse,
            score,
            comment
          });
        });
      });
      
      console.log("Grades prepared for saving:", updatedGrades);
      
      const { data: existingGradeRecords, error: checkError } = await supabase
        .from("grades")
        .select("id, student_id, topic_id")
        .eq("course_id", selectedCourse);
      
      if (checkError) throw checkError;
      
      const existingGradeMap: Record<string, string> = {};
      existingGradeRecords.forEach(grade => {
        const key = `${grade.student_id}-${grade.topic_id}`;
        existingGradeMap[key] = grade.id;
      });
      
      const updates: any[] = [];
      const inserts: any[] = [];
      
      updatedGrades.forEach(grade => {
        const key = `${grade.student_id}-${grade.topic_id}`;
        if (existingGradeMap[key]) {
          updates.push({
            id: existingGradeMap[key],
            student_id: grade.student_id,
            topic_id: grade.topic_id,
            course_id: selectedCourse,
            score: grade.score,
            comment: grade.comment
          });
        } else {
          inserts.push(grade);
        }
      });
      
      console.log("Updates to perform:", updates);
      console.log("Inserts to perform:", inserts);
      
      if (updates.length > 0) {
        const { error: updateError } = await supabase
          .from("grades")
          .upsert(updates);
          
        if (updateError) {
          console.error("Error updating grades:", updateError);
          throw updateError;
        }
      }
      
      if (inserts.length > 0) {
        const { error: insertError } = await supabase
          .from("grades")
          .insert(inserts);
          
        if (insertError) {
          console.error("Error inserting grades:", insertError);
          throw insertError;
        }
      }
      
      await refetchGrades();
      toast.success("Grades and comments saved successfully");
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

  const currentCourse = courses?.find(course => course.id === selectedCourse);
  const selectedCourseName = currentCourse?.name || "";

  const { data: courseDetails } = useQuery({
    queryKey: ["course-details", selectedCourse],
    queryFn: async () => {
      if (!selectedCourse) return null;
      
      const { data, error } = await supabase
        .from("courses")
        .select("name")
        .eq("id", selectedCourse)
        .single();
        
      if (error) throw error;
      return data;
    },
    enabled: !!selectedCourse,
  });

  const getTopicName = (topicId: string) => {
    const topic = topics?.find(t => t.id === topicId);
    return topic ? topic.name : "";
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStudentComments = () => {
    if (!selectedStudentForComments) return [];
    
    const studentComments: {topicId: string, topicName: string, comment: string}[] = [];
    
    if (comments[selectedStudentForComments]) {
      Object.entries(comments[selectedStudentForComments]).forEach(([topicId, comment]) => {
        if (comment && comment.trim() !== "") {
          studentComments.push({
            topicId,
            topicName: getTopicName(topicId),
            comment
          });
        }
      });
    }
    
    return studentComments;
  };

  const getAllStudentComments = () => {
    const allComments: {studentId: string, studentName: string, topicId: string, topicName: string, comment: string}[] = [];
    
    if (!students || !comments) return allComments;

    Object.entries(comments).forEach(([studentId, studentComments]) => {
      const student = students.find(s => s.id === studentId);
      if (student) {
        Object.entries(studentComments).forEach(([topicId, comment]) => {
          if (comment && comment.trim() !== "") {
            allComments.push({
              studentId,
              studentName: student.name,
              topicId,
              topicName: getTopicName(topicId),
              comment
            });
          }
        });
      }
    });
    
    return allComments;
  };

  const selectedStudent = students?.find(s => s.id === selectedStudentForComments);
  
  const displayCourseName = courseDetails?.name || selectedCourseName || "Selected Course";

  return (
    <div className="space-y-6 w-full max-w-full">
      <div className="space-y-4 glass-morphism rounded-lg border border-white/10 w-full px-3 sm:px-4 py-4 max-w-full">
        <div className="flex items-center gap-3 mb-2">
          <BookOpen className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-medium">Gradebook for {displayCourseName}</h2>
        </div>
        
        <p className="text-muted-foreground text-sm">
          View and manage student grades for all courses. As an admin, you can edit and save grades directly.
        </p>
        
        <div className="flex flex-wrap gap-2 my-5">
          {semesters?.map((semester, index) => (
            <Button
              key={semester.id}
              variant={selectedSemesterId === semester.id ? "default" : "outline"}
              onClick={() => setSelectedSemesterId(semester.id)}
              className={selectedSemesterId === semester.id 
                ? "bg-primary text-primary-foreground" 
                : "bg-secondary/50 text-foreground border-white/10 hover:bg-secondary"}
              size="sm"
            >
              Semester {index + 1}
            </Button>
          ))}
        </div>
        
        <div className="overflow-x-auto rounded-lg border border-white/10 bg-black/20 backdrop-blur-sm w-130 gradebook-inner-card">
          <table className="min-w-full table-auto">
            <thead>
              <tr className="text-left border-b border-white/10">
                <th className="p-3 font-medium text-foreground">Student</th>
                {topics?.map(topic => (
                  <th key={topic.id} className="p-3 font-medium text-foreground text-center">
                    {topic.name}
                  </th>
                ))}
                <th className="p-3 font-medium text-foreground text-center">Average</th>
              </tr>
            </thead>
            <tbody>
              {students?.map((student, index) => (
                <tr key={student.id} className={`border-b border-white/5 ${index % 2 === 0 ? "" : "bg-white/5"}`}>
                  <td className="p-3">
                    <div>
                      <div className="font-medium text-foreground">{student.name}</div>
                      <div className="text-xs text-muted-foreground">{student.student_id}</div>
                    </div>
                  </td>
                  {topics?.map(topic => (
                    <td key={topic.id} className="p-3 text-center">
                      <div className="flex flex-col items-center">
                        {isAdmin ? (
                          <div className="flex flex-col items-center space-y-1">
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
                              className={`w-16 h-8 text-center mx-auto backdrop-blur-sm border border-white/10 ${
                                grades[student.id]?.[topic.id] 
                                  ? getScoreColor(grades[student.id][topic.id]) 
                                  : "bg-secondary/50"
                              }`}
                            />
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-6 w-6 rounded-full text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                                    onClick={() => setShowCommentFor({studentId: student.id, topicId: topic.id})}
                                  >
                                    <MessageSquare className="h-3 w-3" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent side="bottom">
                                  Add/Edit note for this grade
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                            
                            {showCommentFor && showCommentFor.studentId === student.id && showCommentFor.topicId === topic.id && (
                              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                                <div className="bg-card rounded-lg p-4 max-w-md w-full space-y-4 border border-white/10">
                                  <h3 className="font-medium">Add Note for {student.name}</h3>
                                  <p className="text-sm text-muted-foreground">Topic: {topic.name}</p>
                                  <Textarea
                                    ref={commentInputRef}
                                    placeholder="Add your note here..."
                                    className="min-h-[100px]"
                                    defaultValue={comments[student.id]?.[topic.id] || ""}
                                  />
                                  <div className="flex justify-end gap-2">
                                    <Button 
                                      variant="outline" 
                                      onClick={() => setShowCommentFor(null)}
                                    >
                                      Cancel
                                    </Button>
                                    <Button
                                      onClick={() => {
                                        const comment = commentInputRef.current?.value || "";
                                        handleCommentChange(student.id, topic.id, comment);
                                        setShowCommentFor(null);
                                      }}
                                    >
                                      Save Note
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        ) : (
                          <HoverCard>
                            <HoverCardTrigger>
                              <span className={`inline-block w-12 py-1 text-center rounded ${
                                grades[student.id]?.[topic.id]
                                  ? getScoreColor(grades[student.id][topic.id])
                                  : "bg-secondary/50"
                              }`}>
                                {grades[student.id]?.[topic.id] || "-"}
                              </span>
                            </HoverCardTrigger>
                            {comments[student.id]?.[topic.id] && (
                              <HoverCardContent className="w-64 bg-card/95 backdrop-blur-sm border border-white/10 p-3">
                                <div className="flex flex-col space-y-1">
                                  <div className="flex items-center">
                                    <Info className="h-3 w-3 mr-1 text-muted-foreground" />
                                    <h4 className="text-sm font-medium">{topic.name} Note:</h4>
                                  </div>
                                  <p className="text-sm text-muted-foreground">{comments[student.id][topic.id]}</p>
                                </div>
                              </HoverCardContent>
                            )}
                          </HoverCard>
                        )}
                      </div>
                    </td>
                  ))}
                  <td className="p-3 text-center font-medium">
                    {calculateAverage(student.id)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="flex justify-between items-center mt-6">
          <div className="flex gap-2">
            {isAdmin && (
              <Button 
                onClick={saveGrades}
                disabled={isSaving}
                variant="default"
                className="gap-2 mr-4"
              >
                <Save className="h-4 w-4" />
                {isSaving ? "Saving..." : "Save Grades"}
              </Button>
            )}
            <Button variant="outline" size="sm" className="border-white/10 hover:bg-secondary">
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>
            <Button variant="outline" size="sm" className="border-white/10 hover:bg-secondary">
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      </div>

      <Card className="glass-morphism rounded-lg border border-white/10 w-full gradebook-inner-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-xl flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-primary" />
            Student Notes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <p className="text-sm text-muted-foreground mb-2">Select a student to view their topic notes:</p>
              <div className="flex flex-wrap gap-2">
                <Button
                  key="all-notes"
                  variant={selectedStudentForComments === null ? "default" : "outline"}
                  onClick={() => setSelectedStudentForComments(null)}
                  className={selectedStudentForComments === null 
                    ? "bg-primary text-primary-foreground" 
                    : "bg-secondary/50 text-foreground border-white/10 hover:bg-secondary"}
                  size="sm"
                >
                  All Notes
                </Button>
                {students?.map(student => (
                  <Button
                    key={student.id}
                    variant={selectedStudentForComments === student.id ? "default" : "outline"}
                    onClick={() => setSelectedStudentForComments(student.id)}
                    className={selectedStudentForComments === student.id 
                      ? "bg-primary text-primary-foreground" 
                      : "bg-secondary/50 text-foreground border-white/10 hover:bg-secondary"}
                    size="sm"
                  >
                    {student.name}
                  </Button>
                ))}
              </div>
            </div>

            {selectedStudentForComments ? (
              <>
                <h3 className="text-md font-medium mt-4">
                  Notes for {selectedStudent?.name}
                </h3>
                <div className="rounded-lg border border-white/10 bg-black/20 backdrop-blur-sm p-4 space-y-3">
                  {getStudentComments().length > 0 ? (
                    getStudentComments().map((item, index) => (
                      <div key={index} className="p-3 rounded-md bg-card/50 border border-white/10">
                        <h4 className="font-medium mb-1">{item.topicName}</h4>
                        <p className="text-sm text-muted-foreground">{item.comment}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-muted-foreground text-center py-4">No notes available for this student.</p>
                  )}
                </div>
              </>
            ) : (
              <>
                <h3 className="text-md font-medium mt-4">
                  All Student Notes
                </h3>
                <div className="rounded-lg border border-white/10 bg-black/20 backdrop-blur-sm p-4 space-y-3">
                  {getAllStudentComments().length > 0 ? (
                    getAllStudentComments().map((item, index) => (
                      <div key={index} className="p-3 rounded-md bg-card/50 border border-white/10">
                        <div className="flex justify-between mb-1">
                          <h4 className="font-medium">{item.topicName}</h4>
                          <span className="text-xs text-muted-foreground">{item.studentName}</span>
                        </div>
                        <p className="text-sm text-muted-foreground">{item.comment}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-muted-foreground text-center py-4">No notes available for any students.</p>
                  )}
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
