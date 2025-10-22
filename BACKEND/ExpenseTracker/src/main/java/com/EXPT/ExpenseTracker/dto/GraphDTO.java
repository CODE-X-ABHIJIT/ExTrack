package com.EXPT.ExpenseTracker.dto;

import java.util.List;

import com.EXPT.ExpenseTracker.entity.Expense;
import com.EXPT.ExpenseTracker.entity.Income;

import lombok.Data;

@Data
public class GraphDTO {
	
	private List<Expense> expenseList;
	
	private List<Income> incomeList;
}
