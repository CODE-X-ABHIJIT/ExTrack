package com.EXPT.ExpenseTracker.services.stats;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.OptionalDouble;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import com.EXPT.ExpenseTracker.dto.GraphDTO;
import com.EXPT.ExpenseTracker.dto.StatsDTO;
import com.EXPT.ExpenseTracker.entity.Expense;
import com.EXPT.ExpenseTracker.entity.Income;
import com.EXPT.ExpenseTracker.entity.User;
import com.EXPT.ExpenseTracker.repository.ExpenseRepository;
import com.EXPT.ExpenseTracker.repository.IncomeRepository;
import com.EXPT.ExpenseTracker.services.CustomUserDetailsService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class StatsServiceImpl implements StatsService {

	private final IncomeRepository incomeRepository;
	private final ExpenseRepository expenseRepository;
	
	@Autowired
	private CustomUserDetailsService userDetailsService;
	
	private User getCurrentUser() {
		Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
		String username = authentication.getName();
		return userDetailsService.getUserByUsername(username);
	}
	
	public GraphDTO getChartData() {
		User currentUser = getCurrentUser();
		
		LocalDate endDate = LocalDate.now();
		LocalDate startDate = endDate.minusMonths(10);
		
		GraphDTO graphDTO = new GraphDTO();
		
		// Get user's data
		List<Expense> expenses = expenseRepository.findByUserId(currentUser.getId());
		List<Income> incomes = incomeRepository.findByUserId(currentUser.getId());
		
		// Filter by date range
		List<Expense> filteredExpenses = expenses.stream()
			.filter(e -> !e.getDate().isBefore(startDate) && !e.getDate().isAfter(endDate))
			.toList();
		
		List<Income> filteredIncomes = incomes.stream()
			.filter(i -> !i.getDate().isBefore(startDate) && !i.getDate().isAfter(endDate))
			.toList();
		
		graphDTO.setExpenseList(filteredExpenses);
		graphDTO.setIncomeList(filteredIncomes);
		
		return graphDTO;
	}
	
	public StatsDTO getStats() {
		User currentUser = getCurrentUser();
//		System.out.println("Getting stats for user: " + currentUser.getUsername());
		
		// Get all user's data
		List<Income> incomeList = incomeRepository.findByUserId(currentUser.getId());
		List<Expense> expenseList = expenseRepository.findByUserId(currentUser.getId());
		
//		System.out.println("Found " + incomeList.size() + " incomes");
//		System.out.println("Found " + expenseList.size() + " expenses");
		
		// Calculate totals - DEFAULT TO 0.0 if empty
		double totalIncome = incomeList.stream()
			.mapToDouble(Income::getAmount)
			.sum(); // This returns 0.0 if list is empty
		
		double totalExpense = expenseList.stream()
			.mapToDouble(Expense::getAmount)
			.sum(); // This returns 0.0 if list is empty
		
//		System.out.println("Total Income: " + totalIncome);
//		System.out.println("Total Expense: " + totalExpense);
		
		// Get latest income and expense for this user
		Optional<Income> optionalIncome = incomeList.stream()
			.max((i1, i2) -> i1.getDate().compareTo(i2.getDate()));
		
		Optional<Expense> optionalExpense = expenseList.stream()
			.max((e1, e2) -> e1.getDate().compareTo(e2.getDate()));
		
		StatsDTO statsDTO = new StatsDTO();
		statsDTO.setIncome(totalIncome);
		statsDTO.setExpense(totalExpense);
		statsDTO.setBalance(totalIncome - totalExpense);

		optionalIncome.ifPresent(statsDTO::setLatestIncome);
		optionalExpense.ifPresent(statsDTO::setLatestExpense);
		
		// Calculate min/max - DEFAULT TO 0.0 if empty
		OptionalDouble minIncome = incomeList.stream().mapToDouble(Income::getAmount).min();
		OptionalDouble maxIncome = incomeList.stream().mapToDouble(Income::getAmount).max();
		
		OptionalDouble minExpense = expenseList.stream().mapToDouble(Expense::getAmount).min();
		OptionalDouble maxExpense = expenseList.stream().mapToDouble(Expense::getAmount).max();
		
		statsDTO.setMinIncome(minIncome.orElse(0.0));
		statsDTO.setMaxIncome(maxIncome.orElse(0.0));
		statsDTO.setMinExpense(minExpense.orElse(0.0));
		statsDTO.setMaxExpense(maxExpense.orElse(0.0));
		
//		System.out.println("Returning stats DTO: " + statsDTO);
		
		return statsDTO;
	}
}