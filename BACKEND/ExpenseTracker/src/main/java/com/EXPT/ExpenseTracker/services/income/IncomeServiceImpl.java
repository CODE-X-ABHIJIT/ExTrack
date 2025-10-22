package com.EXPT.ExpenseTracker.services.income;

import com.EXPT.ExpenseTracker.dto.IncomeDTO;
import com.EXPT.ExpenseTracker.entity.Income;
import com.EXPT.ExpenseTracker.entity.User;
import com.EXPT.ExpenseTracker.repository.IncomeRepository;
import com.EXPT.ExpenseTracker.services.CustomUserDetailsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class IncomeServiceImpl implements IncomeService {

    @Autowired
    private IncomeRepository incomeRepository;

    @Autowired
    private CustomUserDetailsService userDetailsService;

    // Helper method to get current logged-in user
    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        return userDetailsService.getUserByUsername(username);
    }

    @Override
    public Income postIncome(IncomeDTO incomeDTO) {
        Income income = new Income();
        income.setTitle(incomeDTO.getTitle());
        income.setAmount(incomeDTO.getAmount());
        income.setDate(incomeDTO.getDate());
        income.setCategory(incomeDTO.getCategory());
        income.setDescription(incomeDTO.getDescription());
        income.setUser(getCurrentUser()); // Link to current user
        return incomeRepository.save(income);
    }

    @Override
    public List<IncomeDTO> getAllIncomes() {
        User currentUser = getCurrentUser();
        // Only get incomes for current user
        List<Income> incomes = incomeRepository.findByUserId(currentUser.getId());
        return incomes.stream()
            .map(this::mapToDTO)
            .collect(Collectors.toList());
    }

    @Override
    public Income updateIncome(Long id, IncomeDTO incomeDTO) {
        Income income = incomeRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Income not found"));
        
        // Security check: Make sure income belongs to current user
        User currentUser = getCurrentUser();
        if (!income.getUser().getId().equals(currentUser.getId())) {
            throw new RuntimeException("Unauthorized access");
        }
        
        income.setTitle(incomeDTO.getTitle());
        income.setAmount(incomeDTO.getAmount());
        income.setDate(incomeDTO.getDate());
        income.setCategory(incomeDTO.getCategory());
        income.setDescription(incomeDTO.getDescription());
        
        return incomeRepository.save(income);
    }

    @Override
    public IncomeDTO getIncomeById(Long id) {
        Income income = incomeRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Income not found"));
        
        // Security check
        User currentUser = getCurrentUser();
        if (!income.getUser().getId().equals(currentUser.getId())) {
            throw new RuntimeException("Unauthorized access");
        }
        
        return mapToDTO(income);
    }

    @Override
    public void deleteIncome(Long id) {
        Income income = incomeRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Income not found"));
        
        // Security check
        User currentUser = getCurrentUser();
        if (!income.getUser().getId().equals(currentUser.getId())) {
            throw new RuntimeException("Unauthorized access");
        }
        
        incomeRepository.deleteById(id);
    }

    private IncomeDTO mapToDTO(Income income) {
        IncomeDTO dto = new IncomeDTO();
        dto.setId(income.getId());
        dto.setTitle(income.getTitle());
        dto.setAmount(income.getAmount());
        dto.setDate(income.getDate());
        dto.setCategory(income.getCategory());
        dto.setDescription(income.getDescription());
        return dto;
    }
}