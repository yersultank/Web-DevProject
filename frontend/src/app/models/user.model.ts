export interface LoginCredentials {
  username: string;
  password: string;
}

export interface AuthUser {
  id: number;
  username: string;
  is_staff: boolean;
}

export interface AuthResponse {
  access: string;
  refresh: string;
  user: AuthUser;
}

export interface Student {
  id: number;
  username: string;
  full_name: string;
  submitted: number;
  total: number;
  avg_score: number | null;
  overdue: number;
}

export interface StudentDetail extends Student {
  submissions: any[];
}

export interface ToxicMessage {
  id: number;
  trigger: 'tab_leave' | 'late_submit';
  text: string;
}

export interface ToxicSettings {
  id: number;
  enabled: boolean;
  trigger_tab_leave: boolean;
  trigger_late_submit: boolean;
  messages: ToxicMessage[];
}

export interface DashboardData {
  student_count: number;
  submitted_count: number;
  pending_count: number;
  recent_submissions: {
    id: number;
    student_name: string;
    assignment_title: string;
    submitted_at: string;
    is_late: boolean;
  }[];
  overdue_students: { id: number; name: string; count: number }[];
  chart_data: { date: string; count: number }[];
}
