export interface Assignment {
  id: number;
  title: string;
  description: string;
  deadline: string;
  lesson_id: number;
}

export interface MyAssignment {
  id: number;
  title: string;
  description: string;
  deadline: string;
  lesson_id: number;
  status: 'pending' | 'reviewed' | 'overdue';
  submission_id: number | null;
  score: number | null;
  is_late: boolean;
}

export interface SubmissionComment {
  id: number;
  sender_id: number;
  sender_name: string;
  text: string;
  created_at: string;
}

export interface Submission {
  id: number;
  assignment: Assignment;
  assignment_id?: number;
  student_id: number;
  student_name: string;
  text_answer: string;
  code_answer: string;
  file_answer: string | null;
  submitted_at: string;
  is_late: boolean;
  status: 'pending' | 'reviewed';
  score: number | null;
  feedback: string;
  reviewed_at: string | null;
  comments?: SubmissionComment[];
}
