export interface Category {
  id: number;
  name: string;
}

export interface Asset {
  id: number;
  name: string;
  category: Category; // ForeignKey связь
  condition: string;
  assigned_to?: number; // ID пользователя (ForeignKey)
  check_out_date: string;
}