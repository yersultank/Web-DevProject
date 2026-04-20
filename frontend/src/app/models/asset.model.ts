import { Assignment } from './assignment.model';

/**
 * Represents one asset row returned by the API.
 * `category` can be a full Category object (nested) or just the FK id.
 */
export interface Category {
  id: number;
  name: string;
}

export interface Asset {
  id: number;
  name: string;
  description?: string;
  image?: string;
  serial_number?: string;
  status: string;
  category?: number | Category;   // read: API returns object OR id
  category_name?: string;
  assignments?: Assignment[];
  created_at?: string;
  updated_at?: string;
}

/**
 * What we SEND to the API on create/update.
 * category is always a number (FK id) when writing.
 */
export interface AssetPayload {
  name: string;
  description?: string;
  serial_number?: string;
  status: string;
  category?: number;   // write: always send FK id, never the object
}