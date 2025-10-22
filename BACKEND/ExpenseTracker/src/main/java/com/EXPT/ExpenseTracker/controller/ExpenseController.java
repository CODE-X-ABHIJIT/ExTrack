package com.EXPT.ExpenseTracker.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException; // ADDED
import org.springframework.web.bind.annotation.*;

import com.EXPT.ExpenseTracker.dto.ExpenseDTO;
import com.EXPT.ExpenseTracker.entity.Expense;
import com.EXPT.ExpenseTracker.services.expense.ExpenseService;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;

// ADD THIS IMPORT FOR LISTS
import java.util.List;
import java.util.stream.Collectors;


@RestController
@RequestMapping("/api/expense")
@RequiredArgsConstructor
@CrossOrigin("*")
public class ExpenseController {

	
	private final ExpenseService expenseService;
    
    // NEW: Helper method to map Entity to DTO
    private ExpenseDTO mapToDTO(Expense expense) {
        ExpenseDTO dto = new ExpenseDTO();
        dto.setId(expense.getId());
        dto.setTitle(expense.getTitle());
        dto.setAmount(expense.getAmount());
        dto.setDate(expense.getDate());
        dto.setCategory(expense.getCategory());
        dto.setDescription(expense.getDescription());
        return dto;
    }
	
	@PostMapping
	public ResponseEntity<?> postExpense(@RequestBody ExpenseDTO dto) {
        // Post is usually fine because the entity is fresh/managed
		Expense createdExpense = expenseService.postExpense(dto); 
		if (createdExpense != null) {
            // Return DTO to avoid serialization error even here
            return ResponseEntity.status(HttpStatus.CREATED).body(mapToDTO(createdExpense)); 
        } else {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
	}
	
	@GetMapping("/all")
	public ResponseEntity<?> getAllExpenses() {
        // Since service returns List<Expense>, we map to List<ExpenseDTO>
		List<Expense> expenses = expenseService.getAllExpenses();
        List<ExpenseDTO> dtos = expenses.stream().map(this::mapToDTO).collect(Collectors.toList());
		return ResponseEntity.ok(dtos);
	}
	
	@GetMapping("/{id}")
	public ResponseEntity<?> getExpenseById(@PathVariable Long id) {
		try {
            // Service returns Expense, map to DTO
            Expense expense = expenseService.getExpenseById(id);
			return ResponseEntity.ok(mapToDTO(expense));
		} catch (EntityNotFoundException e) {
			return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (AccessDeniedException e) { // Handling security exception
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access Denied: Record not owned by user.");
		} catch(Exception e) {
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("An unexpected error occurred.");
		}
	}
	
	@PutMapping("/{id}")
	public ResponseEntity<?> updateExpense(@PathVariable Long id, @RequestBody ExpenseDTO dto) {
        try {
            // Service returns Expense, map to DTO
            Expense updatedExpense = expenseService.updateExpense(id, dto);
            return ResponseEntity.ok(mapToDTO(updatedExpense)); // <--- MAP TO DTO HERE
        } catch (EntityNotFoundException ex) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ex.getMessage());
        } catch (AccessDeniedException e) { // Handling security exception
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access Denied: Record not owned by user.");
        } catch(Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("An unexpected error occurred: " + e.getMessage());
        }
	}
	
	@DeleteMapping("/{id}")
	public ResponseEntity<?> deleteExpense(@PathVariable Long id) {
        try {
            expenseService.deleteExpense(id);
            return ResponseEntity.noContent().build(); // 204 No Content is cleaner than 200 OK(null)
        } catch (EntityNotFoundException ex) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ex.getMessage());
        } catch (AccessDeniedException e) { // Handling security exception
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access Denied: Record not owned by user.");
        } catch(Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("An unexpected error occurred.");
        }
	}
}