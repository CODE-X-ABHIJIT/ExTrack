import { ExpenseDTO } from "./expense.model";
import { IncomeDTO } from "./income.model";

export interface StatsDTO {
  income: number;              // Matches backend property
  expense: number;             // Matches backend property
  latestIncome?: IncomeDTO;    // Added from backend
  latestExpense?: ExpenseDTO;  // Added from backend
  balance: number;
  minIncome?: number;
  maxIncome?: number;
  minExpense?: number;
  maxExpense?: number;
}

export interface GraphDTO {
  incomeList: IncomeDTO[];
  expenseList: ExpenseDTO[];
}