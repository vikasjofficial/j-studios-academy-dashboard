
import { useState, useEffect } from "react";
import { useAuth } from "@/context/auth-context";
import { GradesOverview } from "./components/GradesOverview";
import { TeacherNotes } from "./components/TeacherNotes";
import { useEnrolledCourses } from "./hooks/useEnrolledCourses";
import { useCourseSemesters } from "./hooks/useCourseSemesters";
import { useTopicsWithoutSemester } from "./hooks/useTopicsWithoutSemester";
import { useStudentGrades } from "./hooks/useStudentGrades";
import { useTeacherNotes } from "./hooks/useTeacherNotes";
import { getScoreColor, calculateSemesterAverage, calculateOverallAverage } from "./utils/gradeUtils";
import { Grade } from "./types";

interface StudentGradebookViewProps {
  courseId?: string;
  viewMode?: 'table' | 'grid';
}

export function StudentGradebookView({ courseId, viewMode = 'grid' }: StudentGradebookViewProps) {
  const { user } = useAuth();
  const [selectedCourse, setSelectedCourse] = useState<string | null>(courseId || null);
  const [selectedNotesCourse, setSelectedNotesCourse] = useState<string | null>(courseId || null);
  const studentId = user?.id;

  const { data: enrolledCourses, isLoading: isLoadingCourses } = useEnrolledCourses(studentId);
  const { data: semesters, isLoading: isLoadingSemesters } = useCourseSemesters(selectedCourse);
  const { data: topicsWithoutSemester } = useTopicsWithoutSemester(selectedCourse);
  const { data: grades, isLoading: isLoadingGrades } = useStudentGrades(studentId, selectedCourse);
  const { data: allCourseComments } = useTeacherNotes(studentId, selectedNotesCourse);

  useEffect(() => {
    if (courseId) {
      setSelectedCourse(courseId);
      setSelectedNotesCourse(courseId);
    } 
    else if (enrolledCourses && enrolledCourses.length > 0 && !selectedCourse) {
      setSelectedCourse(enrolledCourses[0].id);
      setSelectedNotesCourse(enrolledCourses[0].id);
    }
  }, [enrolledCourses, selectedCourse, courseId]);

  const getGrade = (topicId: string) => {
    if (!grades) return null;
    return grades.find(grade => grade.topic_id === topicId) as Grade | null;
  };

  // Helper functions for semester and overall averages
  const getSemesterAverage = (semesterId: string) => {
    return calculateSemesterAverage(semesterId, semesters, grades);
  };

  const getOverallAverage = () => {
    return calculateOverallAverage(grades);
  };

  if (isLoadingCourses) {
    return (
      <div className="flex justify-center p-8">
        <div className="animate-spin h-8 w-8 border-2 border-current border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!enrolledCourses || enrolledCourses.length === 0) {
    return (
      <div className="text-muted-foreground">You are not enrolled in any courses.</div>
    );
  }

  return (
    <div className="space-y-6">
      <GradesOverview
        courses={enrolledCourses}
        selectedCourse={selectedCourse}
        onSelectCourse={setSelectedCourse}
        semesters={semesters || []}
        topicsWithoutSemester={topicsWithoutSemester || []}
        getGrade={getGrade}
        getScoreColor={getScoreColor}
        calculateSemesterAverage={getSemesterAverage}
        calculateOverallAverage={getOverallAverage}
        isLoading={isLoadingGrades || isLoadingSemesters}
        viewMode={viewMode}
      />

      <TeacherNotes
        courses={enrolledCourses}
        selectedCourse={selectedNotesCourse}
        onSelectCourse={setSelectedNotesCourse}
        notes={allCourseComments || []}
      />
    </div>
  );
}
