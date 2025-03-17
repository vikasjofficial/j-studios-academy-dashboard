
export type ExamType = 'oral' | 'written' | 'practical';
export type ExamStatus = 'assigned' | 'in_progress' | 'completed' | 'expired';

export interface Exam {
  id: string;
  name: string;
  description?: string;
  exam_type: ExamType;
  total_time_minutes: number;
  created_at: string;
  created_by: string;
  is_active: boolean;
}

export interface ExamQuestion {
  id: string;
  exam_id: string;
  question_text: string;
  order_position: number;
  points: number;
  created_at: string;
}

export interface ExamAssignment {
  id: string;
  exam_id: string;
  student_id: string;
  assigned_at: string;
  due_date?: string;
  status: ExamStatus;
  exam?: Exam;
}

export interface ExamResult {
  id: string;
  assignment_id: string;
  started_at?: string;
  completed_at?: string;
  total_score?: number;
  teacher_notes?: string;
  created_at: string;
}

export interface ExamQuestionResponse {
  id: string;
  result_id: string;
  question_id: string;
  response_text?: string;
  score?: number;
  created_at: string;
}
