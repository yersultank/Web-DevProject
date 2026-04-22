import { Assignment } from './assignment.model';
import { Category } from './category.model';  
export type { Category };

export interface Asset {
  id: number;
  name: string;
  description?: string;
  image?: string;
  serial_number?: string;
  status: string;
  category?: number | Category;
  category_name?: string;
  assignee?: { assignment_id: number; username: string } | null;
  created_at?: string;
  updated_at?: string;
}

export interface AssetPayload {
  name: string;
  description?: string;
  serial_number?: string;
  status: string;
  category?: number;
}