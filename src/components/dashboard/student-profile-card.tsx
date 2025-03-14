
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/auth-context';
import { Cake, GraduationCap, MessageSquare, User } from 'lucide-react';

export function StudentProfileCard() {
  const { user } = useAuth();

  // Fetch student's enrolled courses
  const { data: courses } = useQuery({
    queryKey: ["student-courses", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from("enrollments")
        .select(`
          course_id,
          courses:course_id(id, name, code)
        `)
        .eq("student_id", user.id)
        .eq("status", "active");
        
      if (error) throw error;
      
      return data.map(item => item.courses);
    },
    enabled: !!user?.id,
  });

  // Fetch recent message from admin
  const { data: recentMessage } = useQuery({
    queryKey: ["recent-message", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("student_id", user.id)
        .eq("sender_role", "admin")
        .order("created_at", { ascending: false })
        .limit(1);
        
      if (error) throw error;
      
      return data.length > 0 ? data[0] : null;
    },
    enabled: !!user?.id,
  });

  // Get student details (including student_id)
  const { data: studentDetails } = useQuery({
    queryKey: ["student-details", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .from("students")
        .select("*")
        .eq("id", user.id)
        .single();
        
      if (error) throw error;
      
      return data;
    },
    enabled: !!user?.id,
  });

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase();
  };

  return (
    <Card className="mb-6 overflow-hidden">
      <div className="bg-primary/10 p-6">
        <div className="flex flex-col md:flex-row gap-4 items-center md:items-start">
          <Avatar className="h-20 w-20 border-4 border-background">
            <AvatarImage src={studentDetails?.avatar_url} alt={user?.name || 'Student'} />
            <AvatarFallback className="text-lg">
              {user?.name ? getInitials(user.name) : 'S'}
            </AvatarFallback>
          </Avatar>
          
          <div className="space-y-2 text-center md:text-left flex-1">
            <div className="space-y-1">
              <h2 className="text-2xl font-bold">{user?.name}</h2>
              <div className="flex flex-wrap justify-center md:justify-start gap-2 items-center">
                <Badge variant="outline" className="flex items-center gap-1 bg-primary/5">
                  <User className="h-3 w-3" />
                  ID: {studentDetails?.student_id || 'N/A'}
                </Badge>
                {studentDetails?.grade && (
                  <Badge variant="outline" className="flex items-center gap-1 bg-primary/5">
                    <GraduationCap className="h-3.5 w-3.5" />
                    Grade: {studentDetails.grade}
                  </Badge>
                )}
              </div>
            </div>
            
            {courses && courses.length > 0 && (
              <div className="mt-2">
                <div className="text-sm font-medium mb-1">Enrolled Courses:</div>
                <div className="flex flex-wrap gap-1.5">
                  {courses.map((course: any) => (
                    <Badge key={course.id} variant="secondary" className="text-xs">
                      {course.name}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {recentMessage && (
        <CardContent className="p-4 bg-muted/30 border-t">
          <div className="flex items-start gap-3">
            <MessageSquare className="h-5 w-5 text-primary shrink-0 mt-0.5" />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Recent Message</span>
                <span className="text-xs text-muted-foreground">from {recentMessage.from_name}</span>
              </div>
              <p className="text-sm line-clamp-2 mt-0.5">{recentMessage.content}</p>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
}
