
export interface LectureFolder {
  id: string;
  name: string;
  created_at?: string;
  updated_at?: string;
}

export interface LectureTopic {
  id: string;
  name: string;
  lecture_id: string;
  order_position: number;
  created_at?: string;
  updated_at?: string;
  completed: boolean;
}

// Add a minimal topic interface that can be used for progress calculation
export interface MinimalTopic {
  id: string;
  completed: boolean;
}

export interface LectureFile {
  id: string;
  lecture_id: string;
  file_name: string;
  file_path: string;
  file_type: string;
  created_at?: string;
  updated_at?: string;
}

export interface Lecture {
  id: string;
  title: string;
  content: string | null;
  folder_id: string | null;
  created_at?: string;
  updated_at?: string;
  topics?: LectureTopic[];
  files?: LectureFile[];
  // Allow either full LectureTopic objects or minimal topics with just id and completed
  classes_topics?: (LectureTopic | MinimalTopic)[];
  classes_folders?: {
    name: string;
  };
}

export interface LectureAssignment {
  id: string;
  lecture_id: string;
  student_id: string;
  created_at?: string;
  updated_at?: string;
}

export interface Student {
  id: string;
  name: string;
  student_id: string;
  email: string;
}
