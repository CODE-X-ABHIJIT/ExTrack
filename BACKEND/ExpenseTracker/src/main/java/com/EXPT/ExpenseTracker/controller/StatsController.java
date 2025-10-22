package com.EXPT.ExpenseTracker.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.EXPT.ExpenseTracker.dto.GraphDTO;
import com.EXPT.ExpenseTracker.services.stats.StatsService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/stats")
@RequiredArgsConstructor
@CrossOrigin("*")
public class StatsController {

	private final StatsService statsService;
	
	
	@GetMapping("/chart")
	public ResponseEntity<GraphDTO> getChartData() {
		return ResponseEntity.ok(statsService.getChartData());
	}
	
	@GetMapping
	public ResponseEntity<?> getStats() {
		return ResponseEntity.ok(statsService.getStats());
	}
}
