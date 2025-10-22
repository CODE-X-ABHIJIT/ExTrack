import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { Income, IncomeDTO } from '../models/income.model';

@Injectable({
  providedIn: 'root'
})
export class IncomeService {
  private baseUrl = 'https://extrack-backend.onrender.com/api/income';

  constructor(private http: HttpClient) {
    console.log('IncomeService initialized with baseUrl:', this.baseUrl);
  }

  postIncome(incomeDTO: IncomeDTO): Observable<Income> {
    const url = this.baseUrl;
    console.log('POST', url, incomeDTO);
    return this.http.post<Income>(url, incomeDTO).pipe(
      tap((res: Income) => console.log('✅ Income created:', res)),
      catchError(this.handleError)
    );
  }

  getAllIncomes(): Observable<IncomeDTO[]> {
    const url = `${this.baseUrl}/all`;
    console.log('GET', url);
    return this.http.get<IncomeDTO[]>(url).pipe(
      tap((res: IncomeDTO[]) => console.log('✅ Incomes received:', res)),
      catchError(this.handleError)
    );
  }

  getIncomeById(id: number): Observable<IncomeDTO> {
    const url = `${this.baseUrl}/${id}`;
    console.log('GET', url);
    return this.http.get<IncomeDTO>(url).pipe(
      tap((res: IncomeDTO) => console.log('✅ Income received:', res)),
      catchError(this.handleError)
    );
  }

  // Return text so we never hit JSON parsing errors even if backend responds with plain text/empty body.
  updateIncome(id: number, incomeDTO: IncomeDTO): Observable<string> {
    const url = `${this.baseUrl}/${id}`;
    console.log('PUT', url, incomeDTO);
    return this.http.put<string>(url, incomeDTO, { responseType: 'text' as 'json' }).pipe(
      tap((res: string) => console.log('✅ Income updated (text):', res)),
      catchError(this.handleError)
    );
  }

  // Return text for delete to avoid parsing error on 200+plain text.
  deleteIncome(id: number): Observable<string> {
    const url = `${this.baseUrl}/${id}`;
    console.log('DELETE', url);
    return this.http.delete<string>(url, { responseType: 'text' as 'json' }).pipe(
      tap((res: string) => console.log('✅ Income deleted (text):', res)),
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse) {
    console.error('❌ HTTP Error occurred:', error);

    // Don’t craft “authorized” text here; pass along concise message only.
    if (error.status === 0) {
      return throwError(() => new Error('Cannot connect to backend. Please check if Spring Boot is running on port 8081.'));
    }
    if (typeof error.error === 'string' && error.error.length) {
      return throwError(() => new Error(error.error));
    }
    // Keep messages generic; avoid forcing “You can only edit your own incomes.”
    if (error.status === 403) {
      return throwError(() => new Error('Forbidden (403).'));
    }
    if (error.status === 404) {
      return throwError(() => new Error(`Endpoint not found: ${error.url}`));
    }
    if (error.status === 500) {
      return throwError(() => new Error('Server error occurred'));
    }

    return throwError(() => new Error(`Server Error: ${error.status} - ${error.message}`));
  }
}