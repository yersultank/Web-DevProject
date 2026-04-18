import { Category } from './category.model';

/**
 * Represents one asset row returned by the API.
 */
export interface Asset {
  id: number;
  name: string;
  serial_number?: string;
  status: string;
  category?: number | Category;
  category_name?: string;
  created_at?: string;
  updated_at?: string;
}