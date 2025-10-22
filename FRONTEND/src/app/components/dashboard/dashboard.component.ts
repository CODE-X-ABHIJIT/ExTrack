import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Chart, registerables } from 'chart.js';
import { StatsService } from '../../services/stats.service';
import { StatsDTO, GraphDTO } from '../../models/stats.model';
import { IncomeDTO } from '../../models/income.model';
import { ExpenseDTO } from '../../models/expense.model';

Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit, OnDestroy {
  loading = true;
  error: string | null = null;

  stats: StatsDTO | null = null;
  incomes: IncomeDTO[] = [];
  expenses: ExpenseDTO[] = [];

  incomeChart: Chart | null = null;
  expenseChart: Chart | null = null;

  constructor(private statsService: StatsService) {}

  ngOnInit(): void {
    this.refreshData();
  }

  ngOnDestroy(): void {
    this.destroyCharts();
  }

  getUsername(): string {
    return localStorage.getItem('username') || 'User';
  }

  refreshData(): void {
    this.loading = true;
    this.error = null;
    this.stats = null;
    this.incomes = [];
    this.expenses = [];
    this.destroyCharts();

    // Load stats first so the main section renders, then charts
    this.statsService.getStats().subscribe({
      next: (data) => {
        this.stats = data;
        this.loading = false;
        this.loadChartData();
      },
      error: (err) => {
        this.loading = false;
        if (err.status === 401) {
          this.error = 'Session expired. Please login again.';
        } else if (err.status === 0) {
          this.error = 'Cannot connect to backend. Check if Spring Boot is running on port 8081.';
        } else {
          this.error = err?.error || err?.message || 'Failed to load statistics. Please check if backend is running.';
        }
      }
    });
  }

  private loadChartData(): void {
    this.statsService.getChartData().subscribe({
      next: (data: GraphDTO) => {
        this.incomes = data.incomeList || [];
        this.expenses = data.expenseList || [];
        // draw after DOM updates
        setTimeout(() => {
          this.createIncomeAreaChart();
          this.createExpenseAreaChart();
        }, 0);
      },
      error: (err) => {
        console.error('Error loading chart data:', err);
      }
    });
  }

  // Unique design: Smooth gradient AREA charts (no bars, no points) for a clean ribbon/zigzag look
  private createIncomeAreaChart(): void {
    const canvas = document.getElementById('incomeChart') as HTMLCanvasElement | null;
    if (!canvas) return;

    if (this.incomeChart) this.incomeChart.destroy();
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const iso = (d: any) => new Date(d).toISOString().split('T')[0];
    const dates = Array.from(new Set(this.incomes.map(i => iso(i.date)))).sort();

    const incomeData = dates.map(d =>
      this.incomes.filter(i => iso(i.date) === d).reduce((s, i) => s + (i.amount || 0), 0)
    );

    const labels = dates.length ? dates : ['No Data'];
    const data = dates.length ? incomeData : [0];

    // Gradient fill (top -> bottom)
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, 'rgba(16, 185, 129, 0.35)'); // green 35%
    gradient.addColorStop(1, 'rgba(16, 185, 129, 0.00)'); // transparent

    this.incomeChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: 'Income',
          data: data,
          borderColor: 'rgb(16, 185, 129)',
          backgroundColor: gradient,
          borderWidth: 3,
          tension: 0.35,           // smooth, but still zigzag-ish on changes
          pointRadius: 0,          // no points
          fill: true,              // area fill
          spanGaps: true
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            mode: 'index',
            intersect: false,
            callbacks: {
              label: (c) => 'Income: ₹' + (c.parsed.y ?? 0).toFixed(2)
            }
          }
        },
        scales: {
          x: { ticks: { autoSkip: true, maxRotation: 0 } },
          y: {
            beginAtZero: true,
            ticks: { callback: (v) => '₹' + v }
          }
        }
      }
    });
  }

  private createExpenseAreaChart(): void {
    const canvas = document.getElementById('expenseChart') as HTMLCanvasElement | null;
    if (!canvas) return;

    if (this.expenseChart) this.expenseChart.destroy();
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const iso = (d: any) => new Date(d).toISOString().split('T')[0];
    const dates = Array.from(new Set(this.expenses.map(e => iso(e.date)))).sort();

    const expenseData = dates.map(d =>
      this.expenses.filter(e => iso(e.date) === d).reduce((s, e) => s + (e.amount || 0), 0)
    );

    const labels = dates.length ? dates : ['No Data'];
    const data = dates.length ? expenseData : [0];

    // Gradient fill (top -> bottom)
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, 'rgba(239, 68, 68, 0.35)');  // red 35%
    gradient.addColorStop(1, 'rgba(239, 68, 68, 0.00)');  // transparent

    this.expenseChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: 'Expense',
          data: data,
          borderColor: 'rgb(239, 68, 68)',
          backgroundColor: gradient,
          borderWidth: 3,
          tension: 0.35,          // smooth, unique ribbon look
          pointRadius: 0,         // no points
          fill: true,             // area fill
          spanGaps: true
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            mode: 'index',
            intersect: false,
            callbacks: {
              label: (c) => 'Expense: ₹' + (c.parsed.y ?? 0).toFixed(2)
            }
          }
        },
        scales: {
          x: { ticks: { autoSkip: true, maxRotation: 0 } },
          y: {
            beginAtZero: true,
            ticks: { callback: (v) => '₹' + v }
          }
        }
      }
    });
  }

  private destroyCharts(): void {
    if (this.incomeChart) { this.incomeChart.destroy(); this.incomeChart = null; }
    if (this.expenseChart) { this.expenseChart.destroy(); this.expenseChart = null; }
  }
}