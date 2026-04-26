export interface Lesson {
  id: number;
  title: string;
  content: string;
  order: number;
  assignment_id: number | null;
}

export interface Topic {
  id: number;
  title: string;
  order: number;
  lessons: Lesson[];
}

export interface Course {
  id: number;
  name: string;
  topics: Topic[];
}
