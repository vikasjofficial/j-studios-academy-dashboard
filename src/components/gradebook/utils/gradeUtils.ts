
export const getScoreColor = (score: number) => {
  if (score >= 9) return "bg-[#4ade80] text-black font-medium";
  if (score >= 6) return "bg-[#86efac] text-black font-medium";
  if (score >= 3) return "bg-[#fdba74] text-black font-medium";
  return "bg-[#f87171] text-black font-medium";
};

export const calculateSemesterAverage = (
  semesterId: string, 
  semesters: any[] | undefined, 
  grades: any[] | undefined
) => {
  if (!grades || !semesters) return "-";
  
  const semesterTopicIds = semesters
    .find(sem => sem.id === semesterId)
    ?.topics.map((topic: any) => topic.id) || [];
  
  const semesterGrades = grades.filter(grade => 
    semesterTopicIds.includes(grade.topic_id)
  );
  
  if (semesterGrades.length === 0) return "-";
  
  const sum = semesterGrades.reduce((acc, grade) => acc + grade.score, 0);
  const avg = Math.round((sum / semesterGrades.length) * 10) / 10;
  return avg.toString();
};

export const calculateOverallAverage = (grades: any[] | undefined) => {
  if (!grades || grades.length === 0) return "-";
  
  const sum = grades.reduce((acc, grade) => acc + grade.score, 0);
  const avg = Math.round((sum / grades.length) * 10) / 10;
  return avg.toString();
};
