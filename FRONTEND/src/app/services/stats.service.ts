import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { StatsDTO, GraphDTO } from '../models/stats.model';

@Injectable({
  providedIn: 'root'
})
export class StatsService {
  
  private baseUrl = 'http://localhost:8081/api/stats';

  constructor(private http: HttpClient) { 
    console.log('StatsService initialized with baseUrl:', this.baseUrl);
  }

  getChartData(): Observable<GraphDTO> {
    const url = `${this.baseUrl}/chart`;
    console.log('GET', url);
    return this.http.get<GraphDTO>(url).pipe(
      tap(response => console.log('✅ Chart data received:', response)),
      catchError(this.handleError)
    );
  }

  getStats(): Observable<StatsDTO> {
    console.log('GET', this.baseUrl);
    return this.http.get<StatsDTO>(this.baseUrl).pipe(
      tap(response => console.log('✅ Stats received:', response)),
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
        errorMessage = 'Cannot connect to backend. Please check if Spring Boot is running on port 8081.';
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