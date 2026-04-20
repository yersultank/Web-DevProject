/**
 * Represents assignment history between a user and an asset.
 */
export interface Assignment {
  id: number;
  asset: number;
  user: number;
  user_username: string;
  assigned_at: string;
  returned_at?: string | null;
  notes: string;
}