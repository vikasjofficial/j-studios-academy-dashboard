
import React from 'react';
import { Card } from "@/components/ui/card";
import { useAuth } from '@/context/auth-context';
import { StudentAvatar } from './profile/student-avatar';
import { EnrolledCourses } from './profile/enrolled-courses';
import { RecentMessage } from './profile/recent-message';
import { FeeSummary } from './profile/fee-summary';
import { useFeeData } from './profile/use-fee-data';
import { useStudentCourses } from '@/hooks/use-student-courses';
import { useStudentDetails } from '@/hooks/use-student-details';
import { useRecentMessage } from '@/hooks/use-recent-message';

export function StudentProfileCard() {
  const { user } = useAuth();
  
  // Use the custom hooks
  const { courses } = useStudentCourses(user?.id);
  const { studentDetails } = useStudentDetails(user?.id);
  const { recentMessage } = useRecentMessage(user?.id);
  
  // Use the fee data hook
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
