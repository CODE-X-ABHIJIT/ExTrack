package com.EXPT.ExpenseTracker.services.expense;

import java.util.Comparator;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.AccessDeniedException; // ADDED
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import com.EXPT.ExpenseTracker.dto.ExpenseDTO;
import com.EXPT.ExpenseTracker.entity.Expense;
import com.EXPT.ExpenseTracker.entity.User;
import com.EXPT.ExpenseTracker.repository.ExpenseRepository;
import com.EXPT.ExpenseTracker.services.CustomUserDetailsService;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor; 
// ...

@Service
@RequiredArgsConstructor
public class ExpenseServiceImpl implements ExpenseService {

	private final ExpenseRepository expenseRepository;
	
    // ADDED: Dependencies needed for security checks
    @Autowired
    private CustomUserDetailsService userDetailsService;
    
    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        return userDetailsService.getUserByUsername(username);
    }
	
	public Expense postExpense(ExpenseDTO expenseDTO) {
		Expense expense = new Expense();
        expense.setUser(getCurrentUser()); // ADDED: Link to user
		return saveOrUpdateExpense(expense, expenseDTO);
	}
	
	private Expense saveOrUpdateExpense(Expense expense,ExpenseDTO expenseDTO) {
		expense.setTitle(expenseDTO.getTitle());
		expense.setDate(expenseDTO.getDate());
		expense.setAmount(expenseDTO.getAmount());
        expense.setCategory(expenseDTO.getCategory());	
        expense.setDescription(expenseDTO.getDescription());
        return expenseRepository.save(expense);
	}
	
	public Expense updateExpense(Long id, ExpenseDTO expenseDTO) {
        Optional<Expense> optionalExpense = expenseRepository.findById(id);
        if (optionalExpense.isPresent()) {
            Expense existingExpense = optionalExpense.get();
            
            // SECURITY CHECK (REQUIRED)
            User currentUser = getCurrentUser();
            if (!existingExpense.getUser().getId().equals(currentUser.getId())) {
                throw new AccessDeniedException("Unauthorized access to update expense."); // THROW 403
            }
            
            return saveOrUpdateExpense(existingExpense, expenseDTO);
        } else {
            throw new EntityNotFoundException("Expense not found with id: " + id);
        }
	}	
	
	public List<Expense> getAllExpenses() {
        User currentUser = getCurrentUser(); // ADDED
		return expenseRepository.findByUserId(currentUser.getId()).stream() // MODIFIED to filter
				.sorted(Comparator.comparing(Expense::getDate).reversed())
				.collect(Collectors.toList());
	}
	
	public Expense getExpenseById(Long id) {
		Optional<Expense> optionalExpense = expenseRepository.findById(id);
		if (optionalExpense.isPresent()) {
            Expense expense = optionalExpense.get();
            
            // SECURITY CHECK (REQUIRED)
            User currentUser = getCurrentUser();
            if (!expense.getUser().getId().equals(currentUser.getId())) {
                throw new AccessDeniedException("Unauthorized access to view expense."); // THROW 403
            }
            
			return expense;
		}
		else {
			throw new EntityNotFoundException("Expense not found with id: " + id);
		}
	}
	
	public void deleteExpense(Long id) {
		Optional<Expense> optionalExpense = expenseRepository.findById(id);
		if (optionalExpense.isPresent()) {
            Expense expense = optionalExpense.get();
            
            // SECURITY CHECK (REQUIRED)
            User currentUser = getCurrentUser();
            if (!expense.getUser().getId().equals(currentUser.getId())) {
                throw new AccessDeniedException("Unauthorized access to delete expense."); // THROW 403
            }
            
			expenseRepository.deleteById(id);
		} else {
			throw new EntityNotFoundException("Expense not found with id: " + id);
		}
	}
}