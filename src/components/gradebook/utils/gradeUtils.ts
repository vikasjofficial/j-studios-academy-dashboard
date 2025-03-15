
export const getScoreColor = (score: number) => {
  if (score >= 9) return "bg-gradient-to-r from-green-400 to-green-500 text-black font-medium";
  if (score >= 7) return "bg-gradient-to-r from-green-300 to-green-400 text-black font-medium";
  if (score >= 5) return "bg-gradient-to-r from-yellow-300 to-yellow-400 text-black font-medium";
  if (score >= 3) return "bg-gradient-to-r from-orange-300 to-orange-400 text-black font-medium";
  return "bg-gradient-to-r from-red-400 to-red-500 text-white font-medium";
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
