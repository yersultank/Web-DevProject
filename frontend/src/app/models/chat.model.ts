export interface ChatMessage {
  id: number;
  sender_id: number;
  sender_name: string;
  text: string;
  file_url: string | null;
  created_at: string;
}

export interface ChatThread {
  student_id: number;
  student_username: string;
  last_message: ChatMessage | null;
  unread_count: number;
}
