
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Save, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/auth-context";
import { Input } from "@/components/ui/input";

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

export function GradebookStyled() {
  const { user } = useAuth();
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
  const [selectedSemesterId, setSelectedSemesterId] = useState<string | null>(null);
  const [grades, setGrades] = useState<Record<string, Record<string, number>>>({});
  const [isSaving, setIsSaving] = useState(false);
  const isAdmin = user?.role === 'admin';

  // Fetch all courses
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
  });

  // Set initial selected course
  useEffect(() => {
    if (courses && courses.length > 0 && !selectedCourse) {
      setSelectedCourse(courses[0].id);
    }
  }, [courses, selectedCourse]);

  // Fetch semesters for selected course
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

  // Set initial selected semester
  useEffect(() => {
    if (semesters && semesters.length > 0 && !selectedSemesterId) {
      setSelectedSemesterId(semesters[0].id);
    }
  }, [semesters, selectedSemesterId]);

  // Fetch enrolled students
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

  // Fetch topics for the selected semester
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

  // Fetch existing grades
  const { data: existingGrades } = useQuery({
    queryKey: ["grades", selectedCourse, selectedSemesterId],
    queryFn: async () => {
      if (!selectedSemesterId || !topics || topics.length === 0) return [];
      
      const topicIds = topics.map(topic => topic.id);
      
      const { data, error } = await supabase
        .from("grades")
        .select("id, student_id, topic_id, score")
        .eq("course_id", selectedCourse)
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
    enabled: !!selectedSemesterId && !!topics && topics.length > 0 && !!selectedCourse,
  });

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

  const getScoreColor = (score: number) => {
    if (score >= 9) return "bg-red-400"; // Using red for the image example
    if (score >= 6) return "bg-gray-100";
    if (score >= 3) return "bg-gray-100";
    return "bg-gray-100";
  };

  const saveGrades = async () => {
    if (!selectedCourse || !selectedSemesterId) return;
    
    setIsSaving(true);
    
    try {
      const updatedGrades: Grade[] = [];
      
      // Format grades for saving
      Object.entries(grades).forEach(([studentId, topicGrades]) => {
        Object.entries(topicGrades).forEach(([topicId, score]) => {
          updatedGrades.push({
            student_id: studentId,
            topic_id: topicId,
            course_id: selectedCourse,
            score
          });
        });
      });
      
      // Check for existing grades to update or insert
      const { data: existingGradeRecords, error: checkError } = await supabase
        .from("grades")
        .select("id, student_id, topic_id")
        .eq("course_id", selectedCourse);
      
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
            student_id: grade.student_id,
            topic_id: grade.topic_id,
            course_id: selectedCourse,
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

  const calculateAverage = (studentId: string) => {
    if (!grades[studentId]) return '1';
    
    const studentGrades = Object.values(grades[studentId]);
    if (studentGrades.length === 0) return '1';
    
    const sum = studentGrades.reduce((acc, curr) => acc + curr, 0);
    const avg = Math.round(sum / studentGrades.length * 10) / 10;
    return avg.toString();
  };

  // Get selected course name
  const selectedCourseName = courses?.find(course => course.id === selectedCourse)?.name || "";

  return (
    <div className="bg-white">
      <div className="p-6">
        <div className="flex items-center gap-4 mb-5">
          <div className="text-xl font-medium">⌘ Gradebook for {selectedCourseName}</div>
        </div>
        
        {/* Semester selection */}
        <div className="flex flex-wrap gap-2 mb-6">
          {semesters?.map((semester, index) => (
            <Button
              key={semester.id}
              variant={selectedSemesterId === semester.id ? "default" : "outline"}
              onClick={() => setSelectedSemesterId(semester.id)}
              className={`rounded-md ${selectedSemesterId === semester.id ? "bg-blue-600 text-white" : "bg-white"}`}
            >
              {`Semester ${index + 1}`}
            </Button>
          ))}
        </div>
        
        {/* Gradebook table */}
        <div className="overflow-x-auto border rounded-lg">
          <table className="w-full min-w-full table-auto">
            <thead>
              <tr className="text-left bg-gray-50 border-b">
                <th className="p-3 font-medium text-gray-600">Student</th>
                {topics?.map(topic => (
                  <th key={topic.id} className="p-3 font-medium text-gray-600 text-center">
                    {topic.name}
                  </th>
                ))}
                <th className="p-3 font-medium text-gray-600 text-center">Average</th>
              </tr>
            </thead>
            <tbody>
              {students?.map((student, index) => (
                <tr key={student.id} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                  <td className="p-3 border-b">
                    <div>
                      <div className="font-medium">{student.name}</div>
                      <div className="text-xs text-gray-500">{student.student_id}</div>
                    </div>
                  </td>
                  {topics?.map(topic => (
                    <td key={topic.id} className="p-3 border-b text-center">
                      {isAdmin ? (
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
                          className={`w-12 h-8 text-center mx-auto ${
                            grades[student.id]?.[topic.id] 
                              ? getScoreColor(grades[student.id][topic.id]) 
                              : "bg-gray-100"
                          }`}
                        />
                      ) : (
                        <span className={`inline-block w-12 py-1 text-center rounded ${
                          grades[student.id]?.[topic.id]
                            ? getScoreColor(grades[student.id][topic.id])
                            : "bg-gray-100"
                        }`}>
                          {grades[student.id]?.[topic.id] || "-"}
                        </span>
                      )}
                    </td>
                  ))}
                  <td className="p-3 border-b text-center font-medium">
                    {calculateAverage(student.id)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Navigation and save button */}
        <div className="flex justify-between items-center mt-4">
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>
            <Button variant="outline" size="sm">
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
          
          {isAdmin && (
            <Button 
              onClick={saveGrades}
              disabled={isSaving}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Save className="h-4 w-4 mr-2" />
              Save Grades
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
