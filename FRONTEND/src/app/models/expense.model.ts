export interface Expense {
  id?: number;
  title: string;
  amount: number;
  date: Date | string;
  category: string;
  description?: string;
}

export interface ExpenseDTO {
  id?: number;
  title: string;
  amount: number;
  date: Date | string;
  category: string;
  description?: string;
}