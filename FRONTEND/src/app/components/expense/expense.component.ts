import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ExpenseService } from '../../services/expense.service';
import { ExpenseDTO } from '../../models/expense.model';
// Assuming Expense type is the same as DTO now:
type Expense = ExpenseDTO;

@Component({
  selector: 'app-expense',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './expense.component.html',
  styleUrl: './expense.component.css'
})
export class ExpenseComponent implements OnInit {
  // Use DTO consistently
  expenses: ExpenseDTO[] = [];
  expenseForm: FormGroup;
  isEditMode = false;
  editingId: number | null = null;
  loading = false;
  error: string | null = null;

  categories = ['Food', 'Transport', 'Entertainment', 'Bills', 'Shopping', 'Healthcare', 'Education', 'Other'];

  constructor(
    private fb: FormBuilder,
    private expenseService: ExpenseService
  ) {
    this.expenseForm = this.fb.group({
      title: ['', Validators.required],
      amount: ['', [Validators.required, Validators.min(0)]],
      date: ['', Validators.required],
      category: ['', Validators.required],
      description: ['']
    });
  }

  ngOnInit(): void {
    this.loadExpenses();
  }

  loadExpenses(): void {
    this.loading = true;
    this.error = null;
    this.expenseService.getAllExpenses().subscribe({
      next: (data) => {
        this.expenses = data || [];
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading expenses:', error);
        this.error = error?.message || 'Failed to load expenses. Please try again.';
        this.loading = false;
      }
    });
  }

   onSubmit(): void {
    // 1. CLEAR GENERAL ERROR MESSAGE AT START
    this.error = null;
    
    if (this.expenseForm.invalid) {
      // If validation fails locally, stop and keep the form errors visible.
      return;
    }

    const dto: ExpenseDTO = this.expenseForm.value;
    this.loading = true;

    if (this.isEditMode && this.editingId != null) {
      const currentId = this.editingId;
      
      this.expenseService.updateExpense(currentId, dto).subscribe({
        next: () => {
          // Success (200 OK or 204 No Content text response)
          this.patchLocal(currentId, dto);
          this.resetForm();
          this.loading = false;
        },
        error: (error) => {
          this.loading = false;
          if (error.status === 403) {
            alert('🚫 Permission Denied: You can only edit your own expenses.');
          } else {
            // ONLY set the external error banner if it's a real HTTP failure
            console.error('Update failed:', error);
            this.error = error?.message || 'Failed to update expense.';
          }
        }
      });
    } else {
      // CREATE
      this.expenseService.postExpense(dto).subscribe({
        next: (created) => {
          this.expenses = [{ ...created }, ...this.expenses];
          this.resetForm();
          this.loading = false;
        },
        error: (error) => {
          console.error('Create failed:', error);
          this.error = error?.message || 'Failed to add expense.';
          this.loading = false;
        }
      });
    }
  }

  editExpense(expense: ExpenseDTO): void {
    this.isEditMode = true;
    this.editingId = expense.id ?? null;
    
    const dateValue = expense.date ? new Date(expense.date).toISOString().split('T')[0] : '';
    this.expenseForm.patchValue({
      title: expense.title,
      amount: expense.amount,
      date: dateValue,
      category: expense.category,
      description: expense.description
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  deleteExpense(id: number): void {
    if (!confirm('Are you sure you want to delete this expense?')) return;

    // Optimistic UI: remove first
    const prev = [...this.expenses];
    this.expenses = this.expenses.filter(e => e.id !== id);

    // Delete expects Observable<string> from service
    this.expenseService.deleteExpense(id).subscribe({
      next: () => {
        // Success (UI already updated)
      },
      error: (error) => {
        // Handle failure
        if (error.status === 403) {
            alert('🚫 Permission Denied: You can only delete your own expenses.');
        } else {
            console.error('Delete failed:', error);
            this.error = error?.message || 'Failed to delete expense.';
        }
        // Restore state if failed
        this.expenses = prev;
      }
    });
  }

  resetForm(): void {
    this.expenseForm.reset();
    this.isEditMode = false;
    this.editingId = null;
  }

  getTotalExpense(): number {
    return this.expenses.reduce((sum, expense) => sum + (expense.amount || 0), 0);
  }

  private patchLocal(id: number, dto: ExpenseDTO) {
    const idx = this.expenses.findIndex(e => e.id === id);
    if (idx > -1) {
      // Keep original ID (number | undefined) to satisfy model, patch other fields
      const originalId = this.expenses[idx].id;
      // Spread the DTO data over the existing object
      this.expenses[idx] = { ...this.expenses[idx], ...dto, id: originalId };
    }
  }
}