import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.css'
})
export class SignupComponent {
  signupForm: FormGroup;
  loading = false;
  error: string | null = null;
  success = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.signupForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      fullName: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });
  }

  // Custom validator to check if passwords match
  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { passwordMismatch: true };
  }

  onSubmit(): void {
  if (this.signupForm.valid) {
    this.loading = true;
    this.error = null;

    const { username, email, fullName, password } = this.signupForm.value;

    this.authService.signup({ username, email, fullName, password }).subscribe({
      next: (response) => {
        console.log('Signup successful:', response);
        this.success = true;
        this.loading = false;
        
        // Redirect to login after 2 seconds
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 2000);
      },
      error: (error) => {
        console.error('Signup error:', error);
        this.loading = false;
        
        // Better error handling
        if (error.status === 0) {
          this.error = 'Cannot connect to server. Please check if backend is running.';
        } else if (error.error && typeof error.error === 'string') {
          this.error = error.error;
        } else if (error.message) {
          this.error = error.message;
        } else {
          this.error = 'Registration failed. Please try again.';
        }
      }
    });
  }
}

  // Helper method to check if passwords match
  get passwordMismatch(): boolean {
    return this.signupForm.hasError('passwordMismatch') && 
           this.signupForm.get('confirmPassword')?.touched || false;
  }
}