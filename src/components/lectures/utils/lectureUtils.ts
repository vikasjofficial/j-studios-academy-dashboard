
import { Lecture } from "../types";

/**
 * Calculate progress percentage based on completed topics
 */
export const calculateProgress = (lecture: Lecture) => {
  if (!lecture.classes_topics || lecture.classes_topics.length === 0) {
    return 0;
  }
  
  const completedTopics = lecture.classes_topics.filter(topic => topic.completed).length;
  return Math.round((completedTopics / lecture.classes_topics.length) * 100);
};
