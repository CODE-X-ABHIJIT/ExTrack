package com.EXPT.ExpenseTracker.services.stats;

import com.EXPT.ExpenseTracker.dto.GraphDTO;
import com.EXPT.ExpenseTracker.dto.StatsDTO;

public interface StatsService {

	GraphDTO getChartData();
	
	StatsDTO getStats();
}
