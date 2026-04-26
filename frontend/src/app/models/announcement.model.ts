export interface Announcement {
  id: number;
  text: string;
  photo_url: string | null;
  created_at: string;
  read_count: number;
  total_students: number;
}
