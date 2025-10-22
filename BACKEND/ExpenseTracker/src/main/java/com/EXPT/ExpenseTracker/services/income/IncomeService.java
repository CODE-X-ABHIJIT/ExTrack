package com.EXPT.ExpenseTracker.services.income;

import java.util.List;

import com.EXPT.ExpenseTracker.dto.IncomeDTO;
import com.EXPT.ExpenseTracker.entity.Income;

public interface IncomeService {
	Income postIncome(IncomeDTO incomeDTO);
	
	List<IncomeDTO> getAllIncomes();
	
	Income updateIncome(Long id, IncomeDTO incomeDTO);
	
	IncomeDTO getIncomeById(Long id);
	
	void deleteIncome(Long id);
}
