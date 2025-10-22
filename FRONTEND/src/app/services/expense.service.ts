import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { Expense, ExpenseDTO } from '../models/expense.model';

@Injectable({
  providedIn: 'root'
})
export class ExpenseService {
  // Changed port from 8081 to 8080
  private baseUrl = 'http://localhost:8081/api/expense';

  constructor(private http: HttpClient) { 
    console.log('ExpenseService initialized with baseUrl:', this.baseUrl);
  }

  postExpense(expenseDTO: ExpenseDTO): Observable<Expense> {
    console.log('POST', this.baseUrl, expenseDTO);
    return this.http.post<Expense>(this.baseUrl, expenseDTO).pipe(
      tap(response => console.log('✅ Expense created:', response)),
      catchError(this.handleError)
    );
  }

  // FIXED: Added /all to match backend @GetMapping("/all")
  getAllExpenses(): Observable<Expense[]> {
    const url = `${this.baseUrl}/all`;
    console.log('GET', url);
    return this.http.get<Expense[]>(url).pipe(
      tap(response => console.log('✅ Expenses received:', response)),
      catchError(this.handleError)
    );
  }

  getExpenseById(id: number): Observable<Expense> {
    const url = `${this.baseUrl}/${id}`;
    console.log('GET', url);
    return this.http.get<Expense>(url).pipe(
      tap(response => console.log('✅ Expense received:', response)),
      catchError(this.handleError)
    );
  }

  updateExpense(id: number, expenseDTO: ExpenseDTO): Observable<Expense> {
    const url = `${this.baseUrl}/${id}`;
    console.log('PUT', url, expenseDTO);
    return this.http.put<Expense>(url, expenseDTO).pipe(
      tap(response => console.log('✅ Expense updated:', response)),
      catchError(this.handleError)
    );
  }

  deleteExpense(id: number): Observable<any> {
    const url = `${this.baseUrl}/${id}`;
    console.log('DELETE', url);
    return this.http.delete<any>(url).pipe(
      tap(response => console.log('✅ Expense deleted:', response)),
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse) {
    console.error('❌ HTTP Error occurred:', error);
    console.error('Status:', error.status);
    console.error('Message:', error.message);
    console.error('URL:', error.url);
    console.error('Error Body:', error.error);
    
    let errorMessage = 'An error occurred';
    
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Client Error: ${error.error.message}`;
    } else {
      // Server-side error
      if (error.status === 0) {
        errorMessage = 'Cannot connect to backend. Please check if Spring Boot is running on port 8080.';
      } else if (error.status === 404) {
        errorMessage = `Endpoint not found: ${error.url}`;
      } else if (error.status === 500) {
        errorMessage = 'Server error occurred';
      } else {
        errorMessage = `Server Error: ${error.status} - ${error.message}`;
      }
    }
    
    return throwError(() => new Error(errorMessage));
  }
}