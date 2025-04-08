
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GraduationCap } from "lucide-react";
import { CourseSelector } from "./CourseSelector";
import { SemesterAccordion } from "./SemesterAccordion";
import { UncategorizedTopics } from "./UncategorizedTopics";
import { Course, Semester, Topic, Grade } from "../types";
import { motion } from "framer-motion";
import movingBorderStyles from "@/styles/moving-border.module.css";
import cardStyles from "@/styles/card.module.css";
import layoutStyles from "@/styles/layout.module.css";

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
  viewMode?: 'table' | 'grid';
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
  isLoading,
  viewMode = 'grid'
}: GradesOverviewProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={layoutStyles.gradebookInnerCard}
    >
      <Card className={cn("overflow-hidden backdrop-blur-md bg-card/80", cardStyles.card)}>
        <CardHeader className="pb-2 bg-muted/10">
          <CardTitle className="flex items-center gap-1 text-sm">
            <GraduationCap className="h-4 w-4 text-primary" />
            <span className="text-gradient-primary">My Grades & Performance</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-3">
          <CourseSelector 
            courses={courses} 
            selectedCourse={selectedCourse} 
            onSelectCourse={onSelectCourse} 
          />

          {isLoading ? (
            <div className="flex justify-center p-3">
              <div className="animate-spin h-5 w-5 border-2 border-current border-t-transparent rounded-full"></div>
            </div>
          ) : (
            <div className="space-y-4">
              <SemesterAccordion 
                semesters={semesters || []} 
                getGrade={getGrade} 
                getScoreColor={getScoreColor}
                calculateSemesterAverage={calculateSemesterAverage}
                viewMode={viewMode}
              />
              
              <UncategorizedTopics 
                topics={topicsWithoutSemester || []} 
                getGrade={getGrade} 
                getScoreColor={getScoreColor} 
                viewMode={viewMode}
              />
              
              <div className={`${movingBorderStyles.movingBorderWrapper} rounded-md`}>
                <div className="p-2 bg-muted/10 rounded-md">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-sm">Overall Average</span>
                    <motion.span 
                      className="font-medium text-sm bg-primary/10 text-primary px-2 py-0.5 rounded-full"
                      initial={{ scale: 0.9 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.5, repeat: 1, repeatType: "reverse" }}
                    >
                      {calculateOverallAverage()}
                    </motion.span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

// Add the missing import for cn
import { cn } from '@/lib/utils';
