export interface Income {
  id?: number;
  title: string;
  amount: number;
  date: Date | string;
  category: string;
  description?: string;
}

export interface IncomeDTO {
  id?: number;
  title: string;
  amount: number;
  date: Date | string;
  category: string;
  description?: string;
}