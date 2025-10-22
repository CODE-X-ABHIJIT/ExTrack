package com.EXPT.ExpenseTracker.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.EXPT.ExpenseTracker.dto.IncomeDTO;
import com.EXPT.ExpenseTracker.entity.Income;
import com.EXPT.ExpenseTracker.services.income.IncomeService;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/income")
@RequiredArgsConstructor
@CrossOrigin("*")
public class IncomeController {
	private final IncomeService incomeService;
	
	@PostMapping
	public ResponseEntity<?> postIncome(@RequestBody IncomeDTO incomeDTO){
		Income createdIncome = incomeService.postIncome(incomeDTO);
		if (createdIncome != null) {
			return ResponseEntity.status(HttpStatus.CREATED).body(createdIncome);
		} else {
			return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
		}
	}
	
	
	@GetMapping("/all")
	public ResponseEntity<?> getAllIncomes() {
		return ResponseEntity.ok(incomeService.getAllIncomes());
	}
	
	
	@PutMapping("/{id}")
	public ResponseEntity<?> updateIncome(@PathVariable Long id, @RequestBody IncomeDTO incomeDTO) {
		try {
            Income updatedIncome = incomeService.updateIncome(id, incomeDTO);
            return ResponseEntity.ok(updatedIncome);
		} catch (EntityNotFoundException ex) {
			return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ex.getMessage());
		} catch (Exception ex) {
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
					.body("An error occurred while updating the income.");
		}
	}
	
	
	@GetMapping("/{id}")
	public ResponseEntity<?> getIncomeById(@PathVariable Long id) {
		try {
			IncomeDTO incomeDTO = incomeService.getIncomeById(id);
			return ResponseEntity.ok(incomeDTO);
		} catch (EntityNotFoundException ex) {
			return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ex.getMessage());
		} catch (Exception ex) {
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
					.body("An error occurred while retrieving the income.");
		}
	}
	
	
	@DeleteMapping("/{id}")
	public ResponseEntity<?> deleteIncome(@PathVariable Long id) {
		try {
			incomeService.deleteIncome(id);
			return ResponseEntity.ok("Income deleted successfully.");
		} catch (EntityNotFoundException ex) {
			return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ex.getMessage());
		} catch (Exception ex) {
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
					.body("An error occurred while deleting the income.");
		}
	}

}
