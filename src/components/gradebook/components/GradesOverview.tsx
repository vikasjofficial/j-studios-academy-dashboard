
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GraduationCap } from "lucide-react";
import { CourseSelector } from "./CourseSelector";
import { SemesterAccordion } from "./SemesterAccordion";
import { UncategorizedTopics } from "./UncategorizedTopics";
import { Course, Semester, Topic, Grade } from "../types";

interface GradesOverviewProps {
  courses: Course[];
  selectedCourse: string | null;
  onSelectCourse: (courseId: string) => void;
  semesters: Semester[];
  topicsWithoutSemester: Topic[];
  getGrade: (topicId: string) => Grade | null;
  getScoreColor: (score: number) => string;
  calculateSemesterAverage: (semesterId: string) => string;
  calculateOverallAverage: () => string;
  isLoading: boolean;
}

export function GradesOverview({
  courses,
  selectedCourse,
  onSelectCourse,
  semesters,
  topicsWithoutSemester,
  getGrade,
  getScoreColor,
  calculateSemesterAverage,
  calculateOverallAverage,
  isLoading
}: GradesOverviewProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <GraduationCap className="h-5 w-5 text-primary" />
          My Grades & Notes
        </CardTitle>
      </CardHeader>
      <CardContent>
        <CourseSelector 
          courses={courses} 
          selectedCourse={selectedCourse} 
          onSelectCourse={onSelectCourse} 
        />

        {isLoading ? (
          <div className="flex justify-center p-4">
            <div className="animate-spin h-6 w-6 border-2 border-current border-t-transparent rounded-full"></div>
          </div>
        ) : (
          <div className="space-y-6">
            <SemesterAccordion 
              semesters={semesters || []} 
              getGrade={getGrade} 
              getScoreColor={getScoreColor}
              calculateSemesterAverage={calculateSemesterAverage}
            />
            
            <UncategorizedTopics 
              topics={topicsWithoutSemester || []} 
              getGrade={getGrade} 
              getScoreColor={getScoreColor} 
            />
            
            <div className="border rounded-md p-3 bg-muted/20">
              <div className="flex justify-between items-center">
                <span className="font-bold">Overall Average</span>
                <span className="font-bold text-lg">{calculateOverallAverage()}</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
