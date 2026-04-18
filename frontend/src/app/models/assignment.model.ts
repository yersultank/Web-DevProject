/**
 * Represents assignment history between a user and an asset.
 */
export interface Assignment {
  id: number;
  asset: number;
  user: number;
  assigned_at: string;
  returned_at?: string | null;
  notes: string;
}