package com.EXPT.ExpenseTracker.entity;

import java.time.LocalDate;

import com.EXPT.ExpenseTracker.dto.IncomeDTO;

import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import lombok.Data;

@Entity
@Data
public class Income {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;
    
    
    
	private String title;
	

	private Integer amount;
	
	
	private LocalDate date;
	
	
	private String category;
	
	private String description;
	
	public IncomeDTO getIncomeDto() {
        IncomeDTO incomeDTO = new IncomeDTO();
        incomeDTO.setId(id);
        incomeDTO.setTitle(title);
        incomeDTO.setAmount(amount);
        incomeDTO.setDate(date);
        incomeDTO.setCategory(category);
        incomeDTO.setDescription(description);
        return incomeDTO;
	}
	
	// ADD THIS NEW FIELD
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "user_id", nullable = false)
	private User user;
}