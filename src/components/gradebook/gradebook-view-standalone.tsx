
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { 
  Card, 
  CardContent,
} from "@/components/ui/card";
import { Search, Save } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useAuth } from "@/context/auth-context";

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
  code: string;
}

interface Topic {
  id: string;
  name: string;
  order_id: number;
}

export function GradebookViewStandalone() {
  const { user } = useAuth();
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [grades, setGrades] = useState<Record<string, Record<string, number>>>({});
  const [activeTab, setActiveTab] = useState("all");
  const [isSaving, setIsSaving] = useState(false);
  const isAdmin = user?.role === 'admin';

  // Fetch all courses
  const { data: courses } = useQuery({
    queryKey: ["all-courses"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("courses")
        .select("id, name, code")
        .order("name");
        
      if (error) throw error;
      
      if (data.length > 0 && !selectedCourse) {
        setSelectedCourse(data[0].id);
      }
      
      return data as Course[];
    },
  });

  // Fetch students enrolled in selected course or all students
  const { data: students, isLoading: studentsLoading } = useQuery({
    queryKey: ["students", selectedCourse, activeTab],
    queryFn: async () => {
      let query;
      
      if (activeTab === "all" || !selectedCourse) {
        // Fetch all students
        const { data, error } = await supabase
          .from("students")
          .select("id, name, student_id")
          .order("name");
          
        if (error) throw error;
        return data as Student[];
      } else {
        // Fetch students enrolled in the selected course
        const { data, error } = await supabase
          .from("enrollments")
          .select(`
            student_id,
            students:student_id(id, name, student_id)
          `)
          .eq("course_id", selectedCourse);
          
        if (error) throw error;
        return data.map(item => item.students) as Student[];
      }
    },
    enabled: true,
  });

  // Fetch topics for the selected course
  const { data: topics } = useQuery({
    queryKey: ["course-topics", selectedCourse],
    queryFn: async () => {
      if (!selectedCourse) return [];
      
      const { data, error } = await supabase
        .from("topics")
        .select("id, name, order_id")
        .eq("course_id", selectedCourse)
        .order("order_id");
        
      if (error) throw error;
      return data as Topic[];
    },
    enabled: !!selectedCourse,
  });

  // Fetch existing grades
  const { data: existingGrades } = useQuery({
    queryKey: ["existing-grades", selectedCourse],
    queryFn: async () => {
      if (!selectedCourse || !topics || topics.length === 0) return [];
      
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
    enabled: !!selectedCourse && !!topics && topics.length > 0,
  });

  // Handle grade change
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

  // Get color based on score
  const getScoreColor = (score: number) => {
    if (score >= 9) return "bg-[#4ade80]"; // Neon Green
    if (score >= 6) return "bg-[#86efac]"; // Faint Green
    if (score >= 3) return "bg-[#fdba74]"; // Orange
    return "bg-[#f87171]"; // Red
  };

  // Save grades to Supabase
  const saveGrades = async () => {
    if (!selectedCourse) return;
    
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
          // For updates, include all required fields
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

  // Filter students based on search query
  const filteredStudents = students?.filter(student => 
    student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.student_id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Calculate average grade for a student
  const calculateAverage = (studentId: string) => {
    if (!grades[studentId]) return "-";
    
    const studentGrades = Object.values(grades[studentId]);
    if (studentGrades.length === 0) return "-";
    
    const sum = studentGrades.reduce((acc, curr) => acc + curr, 0);
    const avg = Math.round(sum / studentGrades.length * 10) / 10;
    return avg.toString();
  };

  // Calculate class average for a topic
  const calculateTopicAverage = (topicId: string) => {
    if (!students || students.length === 0) return "-";
    
    let sum = 0;
    let count = 0;
    
    students.forEach(student => {
      if (grades[student.id]?.[topicId]) {
        sum += grades[student.id][topicId];
        count++;
      }
    });
    
    if (count === 0) return "-";
    
    const avg = Math.round(sum / count * 10) / 10;
    return avg.toString();
  };

  // Calculate overall class average
  const calculateClassAverage = () => {
    if (!students || students.length === 0 || !topics || topics.length === 0) return "-";
    
    let totalSum = 0;
    let totalCount = 0;
    
    students.forEach(student => {
      if (grades[student.id]) {
        const values = Object.values(grades[student.id]);
        totalSum += values.reduce((acc, curr) => acc + curr, 0);
        totalCount += values.length;
      }
    });
    
    if (totalCount === 0) return "-";
    
    const avg = Math.round(totalSum / totalCount * 10) / 10;
    return avg.toString();
  };

  const getProgressColor = (score: string) => {
    if (score === "-") return "bg-[#2A2F3C]";
    
    const numScore = parseFloat(score);
    if (numScore >= 9) return "bg-[#4ade80]"; // Neon Green
    if (numScore >= 6) return "bg-[#86efac]"; // Faint Green
    if (numScore >= 3) return "bg-[#fdba74]"; // Orange
    return "bg-[#f87171]"; // Red
  };

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden border-none bg-[#1A1F2C] text-white shadow-md">
        <CardContent className="p-0">
          <div className="p-4 pb-0">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="flex items-center text-2xl font-semibold">
                <span className="mr-2">←</span> Class
              </h2>
              
              {isAdmin && selectedCourse && (
                <Button 
                  onClick={saveGrades}
                  disabled={isSaving}
                  className="flex items-center gap-2 bg-[#6E59A5] hover:bg-[#5A4A87]"
                >
                  <Save className="h-4 w-4" />
                  {isSaving ? "Saving..." : "Save Grades"}
                </Button>
              )}
            </div>
            
            <div className="mb-4 flex gap-3">
              <div className="relative w-64">
                <div className="flex items-center rounded-lg bg-[#2A2F3C] p-2">
                  <div className="flex items-center gap-2 font-medium">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#6E59A5]">
                      C
                    </span>
                    {courses && courses.length > 0 && (
                      <select 
                        className="w-full appearance-none bg-transparent focus:outline-none"
                        value={selectedCourse || ""}
                        onChange={(e) => setSelectedCourse(e.target.value)}
                      >
                        {courses.map(course => (
                          <option key={course.id} value={course.id} className="bg-[#2A2F3C] text-white">
                            {course.name}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                  <span className="ml-auto">▼</span>
                </div>
              </div>
              
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-auto">
                <TabsList className="flex bg-[#2A2F3C] p-1">
                  <TabsTrigger 
                    value="all" 
                    className={cn(
                      "rounded-lg px-4 py-2 text-sm data-[state=active]:bg-[#1A1F2C] data-[state=active]:text-white",
                      activeTab === "all" ? "bg-[#1A1F2C] text-white" : "text-gray-400"
                    )}
                  >
                    All
                    <span className="ml-1 rounded bg-[#2A2F3C] px-1 text-xs">
                      {students?.length || 0}
                    </span>
                  </TabsTrigger>
                  {courses?.map(course => (
                    <TabsTrigger 
                      key={course.id}
                      value={course.id}
                      className={cn(
                        "rounded-lg px-4 py-2 text-sm data-[state=active]:bg-[#1A1F2C] data-[state=active]:text-white",
                        activeTab === course.id ? "bg-[#1A1F2C] text-white" : "text-gray-400"
                      )}
                      onClick={() => setSelectedCourse(course.id)}
                    >
                      {course.name}
                      <span className="ml-1 rounded bg-[#2A2F3C] px-1 text-xs">
                        {students?.length || 0}
                      </span>
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            </div>
            
            <div className="flex items-center gap-2 px-4 py-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Name"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-9 w-full rounded-md border-none bg-[#2A2F3C] pl-9 text-sm text-white placeholder-gray-400 focus-visible:ring-0 focus-visible:ring-offset-0"
                />
              </div>
              
              <div className="grid grid-cols-4 gap-2">
                <div className="w-24 text-center text-sm font-medium">Progress</div>
                <div className="w-24 text-center text-sm font-medium">Average</div>
                {topics?.slice(0, 2).map(topic => (
                  <div key={topic.id} className="w-24 text-center text-xs font-medium">
                    <div className="whitespace-nowrap">{topic.name}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <div className="mt-2">
            <div className="flex items-center gap-2 border-b border-[#2A2F3C] bg-[#222430] px-4 py-3">
              <div className="flex flex-1 items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#2A2F3C]">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3 13.125C3 12.2298 3.71634 11.5 4.6 11.5H8.44134C8.7999 11.5 9.1333 11.6897 9.31913 12.0013L10.6809 14.2487C10.8667 14.5603 11.2001 14.75 11.5587 14.75H12.4413C12.7999 14.75 13.1333 14.5603 13.3191 14.2487L14.6809 12.0013C14.8667 11.6897 15.2001 11.5 15.5587 11.5H19.4C20.2837 11.5 21 12.2298 21 13.125V18C21 19.1046 20.1046 20 19 20H5C3.89543 20 3 19.1046 3 18V13.125Z" stroke="white" strokeWidth="1.5"/>
                    <path d="M7.5 11.5V6.75C7.5 5.09315 8.84315 3.75 10.5 3.75H13.5C15.1569 3.75 16.5 5.09315 16.5 6.75V11.5" stroke="white" strokeWidth="1.5"/>
                  </svg>
                </div>
                <span className="font-medium">Average grade</span>
              </div>
              
              <div className="grid grid-cols-4 gap-2">
                <div className="w-24 text-center">
                  <div 
                    className={`mx-auto h-8 w-16 rounded-md ${getProgressColor(calculateClassAverage())}`} 
                  />
                </div>
                <div className="w-24 text-center font-medium">
                  {calculateClassAverage()}
                </div>
                {topics?.slice(0, 2).map(topic => (
                  <div key={topic.id} className="w-24 text-center font-medium">
                    {calculateTopicAverage(topic.id)}
                  </div>
                ))}
              </div>
            </div>
            
            {filteredStudents?.map((student, index) => (
              <div 
                key={student.id}
                className={cn(
                  "flex items-center gap-2 border-b border-[#2A2F3C] px-4 py-3 hover:bg-[#222430]",
                  index % 2 === 0 ? "bg-[#1E2130]" : "bg-[#1A1F2C]"
                )}
              >
                <div className="flex flex-1 items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#2A2F3C] text-sm font-medium">
                    {index + 1}
                  </div>
                  <span className="font-medium">{student.name}</span>
                </div>
                
                <div className="grid grid-cols-4 gap-2">
                  <div className="w-24 text-center">
                    <div 
                      className={`mx-auto h-8 w-16 rounded-md ${getProgressColor(calculateAverage(student.id))}`}
                    />
                  </div>
                  <div className="w-24 text-center font-medium">
                    {calculateAverage(student.id)}
                  </div>
                  {topics?.slice(0, 2).map(topic => (
                    <div key={topic.id} className="w-24 text-center font-medium">
                      {isAdmin && selectedCourse ? (
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
                          className={`w-16 text-center h-8 mx-auto border-none text-white ${
                            grades[student.id]?.[topic.id] 
                              ? getScoreColor(grades[student.id][topic.id]) 
                              : "bg-[#2A2F3C]"
                          }`}
                        />
                      ) : (
                        <span 
                          className={`inline-block w-16 py-1 px-2 rounded ${
                            grades[student.id]?.[topic.id] 
                              ? getScoreColor(grades[student.id][topic.id]) 
                              : "bg-[#2A2F3C]"
                          }`}
                        >
                          {grades[student.id]?.[topic.id] || "-"}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
