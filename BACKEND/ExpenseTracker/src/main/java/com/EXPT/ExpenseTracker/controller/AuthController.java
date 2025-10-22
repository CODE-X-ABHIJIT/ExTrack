package com.EXPT.ExpenseTracker.controller;

import com.EXPT.ExpenseTracker.dto.AuthResponse;
import com.EXPT.ExpenseTracker.dto.LoginRequest;
import com.EXPT.ExpenseTracker.dto.SignupRequest;
import com.EXPT.ExpenseTracker.entity.User;
import com.EXPT.ExpenseTracker.repository.UserRepository;
import com.EXPT.ExpenseTracker.services.CustomUserDetailsService;
import com.EXPT.ExpenseTracker.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin("*")
public class AuthController {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private CustomUserDetailsService userDetailsService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    @PostMapping("/signup")
    public ResponseEntity<?> signup(@RequestBody SignupRequest signupRequest) {
        System.out.println("=== SIGNUP REQUEST ===");
        System.out.println("Username: " + signupRequest.getUsername());
        System.out.println("Email: " + signupRequest.getEmail());
        
        // Check if username already exists
        if (userRepository.existsByUsername(signupRequest.getUsername())) {
            return ResponseEntity.badRequest().body(Map.of("error", "Username already exists"));
        }

        // Check if email already exists
        if (userRepository.existsByEmail(signupRequest.getEmail())) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email already exists"));
        }

        // Create new user
        User user = new User();
        user.setUsername(signupRequest.getUsername());
        user.setEmail(signupRequest.getEmail());
        user.setFullName(signupRequest.getFullName());
        
        // Encode password
        String encodedPassword = passwordEncoder.encode(signupRequest.getPassword());
        user.setPassword(encodedPassword);
        
        System.out.println("Raw password: " + signupRequest.getPassword());
        System.out.println("Encoded password: " + encodedPassword);

        User savedUser = userRepository.save(user);
        System.out.println("User saved with ID: " + savedUser.getId());

        return ResponseEntity.ok(Map.of("message", "User registered successfully"));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest) {
        System.out.println("=== LOGIN REQUEST ===");
        System.out.println("Username: " + loginRequest.getUsername());
        
        // Check if user exists
        if (!userRepository.existsByUsername(loginRequest.getUsername())) {
            System.out.println("User not found: " + loginRequest.getUsername());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of("error", "User not found"));
        }
        
        // Get user from database
        User user = userRepository.findByUsername(loginRequest.getUsername()).get();
        System.out.println("User found in DB: " + user.getUsername());
        System.out.println("Stored password: " + user.getPassword());
        
        // Test password match
        boolean passwordMatches = passwordEncoder.matches(loginRequest.getPassword(), user.getPassword());
        System.out.println("Password matches: " + passwordMatches);
        
        if (!passwordMatches) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of("error", "Invalid password"));
        }
        
        try {
            authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                    loginRequest.getUsername(),
                    loginRequest.getPassword()
                )
            );
            System.out.println("Authentication successful");
        } catch (BadCredentialsException e) {
            System.out.println("Authentication failed: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of("error", "Invalid username or password"));
        }

        final UserDetails userDetails = userDetailsService.loadUserByUsername(loginRequest.getUsername());
        final String jwt = jwtUtil.generateToken(userDetails);

        AuthResponse response = new AuthResponse(
            jwt,
            user.getUsername(),
            user.getEmail(),
            user.getFullName()
        );

        System.out.println("Login successful, returning token");
        return ResponseEntity.ok(response);
    }
}