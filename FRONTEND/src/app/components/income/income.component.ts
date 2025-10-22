import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { IncomeService } from '../../services/income.service';
import { IncomeDTO } from '../../models/income.model';

@Component({
  selector: 'app-income',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './income.component.html',
  styleUrl: './income.component.css'
})
export class IncomeComponent implements OnInit {
  incomes: IncomeDTO[] = [];
  incomeForm: FormGroup;
  isEditMode = false;
  editingId: number | null = null;
  loading = false;
  error: string | null = null;

  categories = ['Salary', 'Freelance', 'Investment', 'Business', 'Gift', 'Other'];

  constructor(
    private fb: FormBuilder,
    private incomeService: IncomeService
  ) {
    this.incomeForm = this.fb.group({
      title: ['', Validators.required],
      amount: ['', [Validators.required, Validators.min(0)]],
      date: ['', Validators.required],
      category: ['', Validators.required],
      description: ['']
    });
  }

  ngOnInit(): void {
    this.loadIncomes();
  }

  loadIncomes(): void {
    this.loading = true;
    this.error = null;

    this.incomeService.getAllIncomes().subscribe({
      next: (data) => {
        this.incomes = data || [];
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading incomes:', error);
        this.error = error?.message || 'Failed to load incomes. Please check your backend connection.';
        this.incomes = [];
        this.loading = false;
      }
    });
  }

  onSubmit(): void {
    if (this.incomeForm.invalid) return;

    const incomeDTO: IncomeDTO = this.incomeForm.value;

    if (this.isEditMode && this.editingId != null) {
      // UPDATE
      const currentId = this.editingId; // capture for closures

      this.incomeService.updateIncome(currentId, incomeDTO).subscribe({
        next: () => {
          // Update UI immediately; keep original id from the list
          const idx = this.incomes.findIndex(i => i.id === currentId);
          if (idx > -1) {
            const originalId = this.incomes[idx].id; // number | undefined (not null)
            this.incomes[idx] = { ...this.incomes[idx], ...incomeDTO, id: originalId };
          }
          this.resetForm(true);
        },
        error: (err) => {
          // Sometimes backend updates but returns text/empty body or odd status; verify instead of showing false error
          this.incomeService.getIncomeById(currentId).subscribe({
            next: (remote) => {
              const norm = (d: any) => (d ? new Date(d).toISOString().split('T')[0] : '');
              const matches =
                remote?.title === incomeDTO.title &&
                remote?.amount === incomeDTO.amount &&
                norm(remote?.date) === incomeDTO.date &&
                remote?.category === incomeDTO.category &&
                (remote?.description || '') === (incomeDTO.description || '');

              if (matches) {
                const idx = this.incomes.findIndex(i => i.id === currentId);
                if (idx > -1) {
                  const originalId = this.incomes[idx].id;
                  this.incomes[idx] = { ...this.incomes[idx], ...incomeDTO, id: originalId };
                }
                this.resetForm(true);
              } else {
                alert('Failed to update income: ' + (err?.message || 'Unknown error'));
              }
            },
            error: () => {
              alert('Failed to update income: ' + (err?.message || 'Unknown error'));
            }
          });
        }
      });
    } else {
      // CREATE
      this.incomeService.postIncome(incomeDTO).subscribe({
        next: (created) => {
          const toAdd: IncomeDTO = created ? {
            id: created.id,
            title: created.title,
            amount: created.amount,
            date: created.date,
            category: created.category,
            description: created.description
          } : { ...incomeDTO }; // keep id undefined (not null)
          this.incomes = [toAdd, ...this.incomes];
          this.resetForm(true);
        },
        error: (error) => {
          alert('Failed to add income: ' + (error?.message || 'Unknown error'));
        }
      });
    }
  }

  editIncome(income: IncomeDTO): void {
    this.isEditMode = true;
    this.editingId = income.id ?? null;

    const dateValue = income.date ? new Date(income.date).toISOString().split('T')[0] : '';
    this.incomeForm.patchValue({
      title: income.title,
      amount: income.amount,
      date: dateValue,
      category: income.category,
      description: income.description
    });

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  deleteIncome(id: number): void {
    if (!confirm('Are you sure you want to delete this income?')) return;

    // Optimistic UI: remove first, revert if fails
    const prev = [...this.incomes];
    this.incomes = this.incomes.filter(i => i.id !== id);

    this.incomeService.deleteIncome(id).subscribe({
      next: () => {
        // OK; UI already updated
      },
      error: (error) => {
        // Restore on real failure
        this.incomes = prev;
        alert('Failed to delete income: ' + (error?.message || 'Unknown error'));
      }
    });
  }

  resetForm(showLog = false): void {
    this.incomeForm.reset();
    this.isEditMode = false;
    this.editingId = null;
    if (showLog) console.log('✔️ Action completed');
  }

  getTotalIncome(): number {
    return this.incomes.reduce((sum, income) => sum + (income.amount || 0), 0);
  }
}