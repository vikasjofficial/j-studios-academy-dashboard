
export interface Topic {
  id: string;
  name: string;
  order_id: number;
  semester_id: string;
}

export interface Grade {
  id: string;
  topic_id: string;
  score: number;
  comment?: string;
}

export interface Course {
  id: string;
  name: string;
}

export interface Semester {
  id: string;
  name: string;
  topics: Topic[];
}
