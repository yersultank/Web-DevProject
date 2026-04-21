export interface UserProfile {
  id?: number;
  username?: string;
  is_staff?: boolean;
  phone: string;
  office_address: string;
  department: string;
  position: string;
  assets?: any[];
}