export interface UserProfile {
  id?: number;
  username?: string;
  is_staff?: boolean;
  full_name: string;
  phone: string;
  office_address: string;
  department: string;
  position: string;
  assets?: MyAsset[];
}

export interface MyAsset {
  id: number;           // Assignment ID — used for return calls
  asset_id: number;
  asset_name: string;
  serial_number: string;
  status: string;
  category_name: string;
  image?: string;
  description?: string;
  assigned_at: string;
  notes: string;
}
