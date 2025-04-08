
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card } from "@/components/ui/card";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/auth-context';
import { StudentAvatar } from './profile/student-avatar';
import { EnrolledCourses } from './profile/enrolled-courses';
import { RecentMessage } from './profile/recent-message';
import { FeeSummary } from './profile/fee-summary';
import { useFeeData } from './profile/use-fee-data';

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

  // Use the custom hook to get fee data and summary
  const { feeSummary } = useFeeData(user?.id);

  return (
    <Card className="mb-6 overflow-hidden">
      <div className="bg-primary/10 p-6">
        <StudentAvatar 
          avatarUrl={studentDetails?.avatar_url}
          name={user?.name}
          studentId={studentDetails?.student_id}
          grade={studentDetails?.grade}
        />
        
        <div className="md:ml-28 mt-2">
          <EnrolledCourses courses={courses} />
        </div>
      </div>
      
      <RecentMessage message={recentMessage} />
      
      <FeeSummary feeSummary={feeSummary} />
    </Card>
  );
}
