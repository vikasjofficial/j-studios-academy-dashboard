import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Exam, ExamQuestion, ExamAssignment, ExamResult, ExamQuestionResponse } from "@/components/exams/types";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, ArrowRight, Clock, AlertTriangle, CheckCircle, Save } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/auth-context";
import DashboardLayout from "@/components/dashboard-layout";

// Sound URLs
const startSoundUrl = "https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3";
const countdownSoundUrl = "https://assets.mixkit.co/active_storage/sfx/2868/2868-preview.mp3";
const endSoundUrl = "https://assets.mixkit.co/active_storage/sfx/2871/2871-preview.mp3";

export default function ExamSession() {
  const { assignmentId } = useParams<{ assignmentId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState<Record<string, string>>({});
  const [remainingTime, setRemainingTime] = useState<number | null>(null);
  const [examStarted, setExamStarted] = useState(false);
  const [examCompleted, setExamCompleted] = useState(false);
  const [resultId, setResultId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Audio refs
  const startSoundRef = useRef<HTMLAudioElement | null>(null);
  const countdownSoundRef = useRef<HTMLAudioElement | null>(null);
  const endSoundRef = useRef<HTMLAudioElement | null>(null);

  // Timer interval ref
  const timerRef = useRef<number | null>(null);

  // Fetch assignment data
  const { data: assignment, isLoading: assignmentLoading } = useQuery({
    queryKey: ["exam-assignment", assignmentId],
    queryFn: async () => {
      if (!assignmentId) return null;
      
      const { data, error } = await supabase
        .from("exam_assignments")
        .select(`
          id,
          exam_id,
          student_id,
          assigned_at,
          due_date,
          status,
          exams:exam_id (
            id,
            name,
            description,
            exam_type,
            total_time_minutes,
            is_active
          )
        `)
        .eq("id", assignmentId)
        .single();
        
      if (error) throw error;
      
      return {
        ...data,
        exam: data.exams as Exam,
      } as ExamAssignment & { exam: Exam };
    },
    enabled: !!assignmentId,
  });

  // Fetch exam questions
  const { data: questions, isLoading: questionsLoading } = useQuery({
    queryKey: ["exam-questions", assignment?.exam_id],
    queryFn: async () => {
      if (!assignment?.exam_id) return [];
      
      const { data, error } = await supabase
        .from("exam_questions")
        .select("*")
        .eq("exam_id", assignment.exam_id)
        .order("order_position");
        
      if (error) throw error;
      return data as ExamQuestion[];
    },
    enabled: !!assignment?.exam_id,
  });

  // Fetch existing exam result
  const { data: existingResult, isLoading: resultLoading } = useQuery({
    queryKey: ["exam-result", assignmentId],
    queryFn: async () => {
      if (!assignmentId) return null;
      
      const { data, error } = await supabase
        .from("exam_results")
        .select(`
          id,
          assignment_id,
          started_at,
          completed_at,
          exam_question_responses (
            id,
            question_id,
            response_text
          )
        `)
        .eq("assignment_id", assignmentId)
        .single();
        
      if (error && error.code !== 'PGRST116') {
        throw error;
      }
      
      return data as (ExamResult & { exam_question_responses: ExamQuestionResponse[] }) | null;
    },
    enabled: !!assignmentId,
  });

  // Create or update exam result
  const createResultMutation = useMutation({
    mutationFn: async (resultData: { assignment_id: string; started_at?: string }) => {
      const { data, error } = await supabase
        .from("exam_results")
        .insert(resultData)
        .select()
        .single();
        
      if (error) throw error;
      return data as ExamResult;
    },
    onSuccess: (data) => {
      setResultId(data.id);
      queryClient.invalidateQueries({ queryKey: ["exam-result", assignmentId] });
    },
    onError: (error) => {
      console.error("Error creating exam result:", error);
      toast.error("Failed to start exam");
    },
  });

  // Update assignment status
  const updateAssignmentMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { data, error } = await supabase
        .from("exam_assignments")
        .update({ status })
        .eq("id", id)
        .select()
        .single();
        
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["exam-assignment", assignmentId] });
      queryClient.invalidateQueries({ queryKey: ["student-exams", user?.id] });
    },
  });

  // Save question response
  const saveResponseMutation = useMutation({
    mutationFn: async ({ 
      resultId, 
      questionId, 
      responseText 
    }: { 
      resultId: string; 
      questionId: string; 
      responseText: string; 
    }) => {
      // Check if response already exists
      const { data: existingResponse, error: checkError } = await supabase
        .from("exam_question_responses")
        .select("id")
        .eq("result_id", resultId)
        .eq("question_id", questionId)
        .maybeSingle();
        
      if (checkError) throw checkError;
      
      if (existingResponse) {
        // Update existing response
        const { data, error } = await supabase
          .from("exam_question_responses")
          .update({ response_text: responseText })
          .eq("id", existingResponse.id)
          .select()
          .single();
          
        if (error) throw error;
        return data;
      } else {
        // Create new response
        const { data, error } = await supabase
          .from("exam_question_responses")
          .insert({
            result_id: resultId,
            question_id: questionId,
            response_text: responseText,
          })
          .select()
          .single();
          
        if (error) throw error;
        return data;
      }
    },
  });

  // Complete exam
  const completeExamMutation = useMutation({
    mutationFn: async ({ id }: { id: string }) => {
      const { data, error } = await supabase
        .from("exam_results")
        .update({ completed_at: new Date().toISOString() })
        .eq("id", id)
        .select()
        .single();
        
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      if (assignmentId) {
        updateAssignmentMutation.mutate({ 
          id: assignmentId, 
          status: "completed" 
        });
        
        queryClient.invalidateQueries({ queryKey: ["exam-result", assignmentId] });
        setExamCompleted(true);
        
        // Play end sound
        if (endSoundRef.current) {
          endSoundRef.current.play();
        }
        
        toast.success("Exam completed successfully!");
      }
    },
    onError: (error) => {
      console.error("Error completing exam:", error);
      toast.error("Failed to complete exam");
    },
  });

  // Initialize audio elements
  useEffect(() => {
    startSoundRef.current = new Audio(startSoundUrl);
    countdownSoundRef.current = new Audio(countdownSoundUrl);
    endSoundRef.current = new Audio(endSoundUrl);
    
    return () => {
      startSoundRef.current = null;
      countdownSoundRef.current = null;
      endSoundRef.current = null;
    };
  }, []);

  // Initialize responses from existing data
  useEffect(() => {
    if (existingResult?.exam_question_responses && questions) {
      const responseMap: Record<string, string> = {};
      
      existingResult.exam_question_responses.forEach(response => {
        responseMap[response.question_id] = response.response_text || "";
      });
      
      setResponses(responseMap);
      setResultId(existingResult.id);
      
      if (existingResult.started_at && !existingResult.completed_at) {
        // Calculate remaining time for in-progress exam
        if (assignment?.exam.total_time_minutes) {
          const startTime = new Date(existingResult.started_at).getTime();
          const totalDuration = assignment.exam.total_time_minutes * 60 * 1000;
          const elapsedTime = Date.now() - startTime;
          const remaining = Math.max(0, totalDuration - elapsedTime);
          
          if (remaining > 0) {
            setRemainingTime(Math.floor(remaining / 1000));
            setExamStarted(true);
          } else {
            // Exam time expired
            setRemainingTime(0);
            setExamStarted(true);
          }
        }
      }
      
      if (existingResult.completed_at) {
        setExamCompleted(true);
      }
    }
  }, [existingResult, questions, assignment]);

  // Timer countdown logic
  useEffect(() => {
    if (examStarted && remainingTime !== null && remainingTime > 0 && !examCompleted) {
      timerRef.current = window.setInterval(() => {
        setRemainingTime(prev => {
          if (prev === null || prev <= 1) {
            // Time's up
            if (timerRef.current) clearInterval(timerRef.current);
            
            if (resultId) {
              // Auto-submit exam
              completeExamMutation.mutate({ id: resultId });
            }
            
            return 0;
          }
          
          // Play countdown sound when 1 minute remains
          if (prev === 61 && countdownSoundRef.current) {
            countdownSoundRef.current.play();
          }
          
          return prev - 1;
        });
      }, 1000);
    }
    
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [examStarted, remainingTime, examCompleted, resultId, completeExamMutation]);

  // Format time as MM:SS
  const formatTime = (seconds: number | null) => {
    if (seconds === null) return "--:--";
    
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const startExam = async () => {
    if (!assignment || !assignmentId) return;
    
    try {
      // Create exam result with required assignment_id
      createResultMutation.mutate({
        assignment_id: assignmentId,
        started_at: new Date().toISOString(),
      });
      
      // Update assignment status
      updateAssignmentMutation.mutate({
        id: assignmentId,
        status: "in_progress",
      });
      
      // Set timer
      setRemainingTime(assignment.exam.total_time_minutes * 60);
      setExamStarted(true);
      
      // Play start sound
      if (startSoundRef.current) {
        startSoundRef.current.play();
      }
    } catch (error) {
      console.error("Error starting exam:", error);
      toast.error("Failed to start exam");
    }
  };

  const handleResponseChange = (questionId: string, value: string) => {
    setResponses(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const saveCurrentResponse = async () => {
    if (!resultId || !questions || questions.length === 0) return;
    
    const currentQuestion = questions[currentQuestionIndex];
    const response = responses[currentQuestion.id] || "";
    
    try {
      setIsSubmitting(true);
      await saveResponseMutation.mutateAsync({
        resultId,
        questionId: currentQuestion.id,
        responseText: response,
      });
    } catch (error) {
      console.error("Error saving response:", error);
      toast.error("Failed to save response");
    } finally {
      setIsSubmitting(false);
    }
  };

  const navigateToQuestion = async (index: number) => {
    if (!questions || questions.length === 0) return;
    
    // Save current response before navigating
    await saveCurrentResponse();
    
    // Update index
    setCurrentQuestionIndex(index);
  };

  const submitExam = async () => {
    if (!resultId) return;
    
    try {
      // Save current response
      await saveCurrentResponse();
      
      // Submit exam
      completeExamMutation.mutate({ id: resultId });
    } catch (error) {
      console.error("Error submitting exam:", error);
      toast.error("Failed to submit exam");
    }
  };

  // If assignment is not for the current user, redirect
  useEffect(() => {
    if (assignment && user && assignment.student_id !== user.id) {
      toast.error("You do not have access to this exam");
      navigate("/student/exams");
    }
  }, [assignment, user, navigate]);

  const isLoading = assignmentLoading || questionsLoading || resultLoading;

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center py-12">
          <div className="animate-spin h-8 w-8 border-2 border-current border-t-transparent rounded-full"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (!assignment) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <p className="text-lg text-muted-foreground">Exam not found</p>
          <Button onClick={() => navigate("/student/exams")} className="mt-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Exams
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="flex">
        {/* Responsive spacing div */}
        <div className="w-16 md:w-24 lg:w-28 shrink-0"></div>
        
        <div className="space-y-6 max-w-full px-4 flex-1">
          {!examStarted && !examCompleted ? (
            <Card className="max-w-3xl mx-auto">
              <CardHeader>
                <CardTitle>{assignment.exam.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border rounded-lg p-4 bg-card">
                  <h3 className="font-semibold mb-2">Exam Instructions</h3>
                  <ul className="space-y-2 text-muted-foreground ml-6 list-disc">
                    <li>This exam contains {questions?.length || 0} questions.</li>
                    <li>You have {assignment.exam.total_time_minutes} minutes to complete the exam.</li>
                    <li>Once you start the exam, the timer cannot be paused.</li>
                    <li>Your answers are saved automatically when you navigate between questions.</li>
                    <li>Submit your exam before the time runs out.</li>
                  </ul>
                </div>
                
                <div className="flex items-center gap-2 text-muted-foreground">
                  <AlertTriangle className="h-4 w-4 text-warning" />
                  <span>
                    Once you start the exam, you must complete it. The timer will continue even if you close the browser.
                  </span>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button onClick={startExam}>
                  Start Exam
                </Button>
              </CardFooter>
            </Card>
          ) : examCompleted ? (
            <Card className="max-w-3xl mx-auto">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-success" />
                  Exam Completed
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>
                  You have successfully completed the "{assignment.exam.name}" exam.
                </p>
                <p className="text-muted-foreground">
                  Your responses have been submitted and will be reviewed by your instructor.
                </p>
              </CardContent>
              <CardFooter>
                <Button onClick={() => navigate("/student/exams")}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Exams
                </Button>
              </CardFooter>
            </Card>
          ) : (
            <>
              {/* Exam Header */}
              <div className="bg-card sticky top-16 z-10 p-4 border-b flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h1 className="text-xl font-bold">{assignment.exam.name}</h1>
                  <p className="text-sm text-muted-foreground">
                    Question {currentQuestionIndex + 1} of {questions?.length || 0}
                  </p>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className={`flex items-center gap-2 ${
                    remainingTime !== null && remainingTime <= 60 
                      ? "text-destructive animate-pulse font-bold" 
                      : ""
                  }`}>
                    <Clock className="h-5 w-5" />
                    <span className="text-lg">{formatTime(remainingTime)}</span>
                  </div>
                  
                  <Button
                    variant="destructive"
                    onClick={submitExam}
                    disabled={isSubmitting}
                  >
                    Submit Exam
                  </Button>
                </div>
              </div>
              
              {/* Question & Response */}
              {questions && questions.length > 0 && (
                <div className="grid md:grid-cols-4 gap-6">
                  {/* Question Navigation */}
                  <div className="md:col-span-1">
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg">Questions</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-4 md:grid-cols-2 lg:grid-cols-3 gap-2">
                          {questions.map((_, index) => (
                            <Button
                              key={index}
                              variant={currentQuestionIndex === index ? "default" : "outline"}
                              className="h-10 w-10 p-0"
                              onClick={() => navigateToQuestion(index)}
                            >
                              {index + 1}
                            </Button>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                  
                  {/* Current Question */}
                  <div className="md:col-span-3">
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="flex items-center justify-between">
                          <span>Question {currentQuestionIndex + 1}</span>
                          <span className="text-sm font-normal bg-muted px-2 py-1 rounded">
                            {questions[currentQuestionIndex].points} points
                          </span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="p-4 bg-muted/30 rounded-md">
                          <p className="whitespace-pre-wrap">{questions[currentQuestionIndex].question_text}</p>
                        </div>
                        
                        <Textarea
                          placeholder="Enter your answer here..."
                          value={responses[questions[currentQuestionIndex].id] || ""}
                          onChange={(e) => handleResponseChange(questions[currentQuestionIndex].id, e.target.value)}
                          className="min-h-[200px]"
                        />
                        
                        <div className="flex justify-between">
                          <Button
                            variant="outline"
                            onClick={() => navigateToQuestion(currentQuestionIndex - 1)}
                            disabled={currentQuestionIndex === 0 || isSubmitting}
                          >
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Previous
                          </Button>
                          
                          <Button 
                            onClick={() => saveCurrentResponse()}
                            variant="outline"
                            disabled={isSubmitting}
                          >
                            <Save className="mr-2 h-4 w-4" />
                            {isSubmitting ? "Saving..." : "Save"}
                          </Button>
                          
                          {currentQuestionIndex < questions.length - 1 ? (
                            <Button
                              onClick={() => navigateToQuestion(currentQuestionIndex + 1)}
                              disabled={isSubmitting}
                            >
                              Next
                              <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                          ) : (
                            <Button
                              variant="default"
                              onClick={submitExam}
                              disabled={isSubmitting}
                            >
                              Finish Exam
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
