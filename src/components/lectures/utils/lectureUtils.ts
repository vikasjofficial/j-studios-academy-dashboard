
import { Lecture, LectureTopic } from "../types";

// Define a minimal topic interface for progress calculation
interface MinimalTopic {
  id: string;
  completed: boolean;
}

/**
 * Calculate progress percentage based on completed topics
 */
export const calculateProgress = (lecture: Lecture | Partial<Lecture>) => {
  // Check if classes_topics exists and is not empty
  if (!lecture.classes_topics || lecture.classes_topics.length === 0) {
    return 0;
  }
  
  // Using type assertion to handle both full LectureTopics and minimal topics
  const topics = lecture.classes_topics as (LectureTopic | MinimalTopic)[];
  const completedTopics = topics.filter(topic => topic.completed).length;
  return Math.round((completedTopics / topics.length) * 100);
};

/**
 * Calculate average progress for a list of lectures
 * Now accepts either full Lecture objects or partial objects with just the classes_topics field
 */
export const calculateAverageProgress = (lectures: (Lecture | Partial<Lecture>)[]) => {
  if (!lectures || lectures.length === 0) {
    return 0;
  }
  
  const totalProgress = lectures.reduce((sum, lecture) => {
    return sum + calculateProgress(lecture);
  }, 0);
  
  return Math.round(totalProgress / lectures.length);
};
