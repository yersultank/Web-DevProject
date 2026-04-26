export interface Notification {
  id: number;
  type: 'chat' | 'toxic' | 'announcement' | 'assignment' | 'lesson';
  text: string;
  link: string;
  is_read: boolean;
  created_at: string;
}
