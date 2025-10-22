import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private baseUrl = 'https://extrack-backend.onrender.com/api/auth';
  private loggedIn = new BehaviorSubject<boolean>(this.hasToken());

  constructor(
    private http: HttpClient,
    private router: Router
  ) { }

  // Check if token exists
  private hasToken(): boolean {
    return !!localStorage.getItem('token');
  }

  // Login method
  login(username: string, password: string): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/login`, { username, password })
      .pipe(
        tap(response => {
          // Store user data in localStorage
          localStorage.setItem('token', response.token);
          localStorage.setItem('username', response.username);
          localStorage.setItem('email', response.email);
          localStorage.setItem('fullName', response.fullName);
          this.loggedIn.next(true);
        })
      );
  }

  // Signup method
  signup(signupData: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/signup`, signupData);
  }

  // Logout method
  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('email');
    localStorage.removeItem('fullName');
    this.loggedIn.next(false);
    this.router.navigate(['/login']);
  }

  // Get token
  getToken(): string | null {
    return localStorage.getItem('token');
  }

  // Check if logged in
  isLoggedIn(): Observable<boolean> {
    return this.loggedIn.asObservable();
  }

  // Get current user
  getCurrentUser() {
    return {
      username: localStorage.getItem('username'),
      email: localStorage.getItem('email'),
      fullName: localStorage.getItem('fullName')
    };
  }
}