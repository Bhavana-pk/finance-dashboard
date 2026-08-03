import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { TransactionService } from '../../services/transaction';
import { Transaction } from '../../models/transaction';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgxChartsModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard implements OnInit {
  private transactionService = inject(TransactionService);
  private fb = inject(FormBuilder);

  transactions = signal<Transaction[]>([]);
  selectedCategory = signal<string>('All');

  categories = computed(() => {
    const cats = new Set(this.transactions().map(t => t.category));
    return ['All', ...Array.from(cats)];
  });

  filteredTransactions = computed(() => {
    const cat = this.selectedCategory();
    if (cat === 'All') return this.transactions();
    return this.transactions().filter(t => t.category === cat);
  });

  totalIncome = computed(() =>
    this.filteredTransactions()
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + Number(t.amount), 0)
  );

  totalExpense = computed(() =>
    this.filteredTransactions()
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + Number(t.amount), 0)
  );

  balance = computed(() => this.totalIncome() - this.totalExpense());

  chartData = computed(() => {
    const expenseTransactions = this.transactions().filter(t => t.type === 'expense');
    const totals = new Map<string, number>();

    for (const t of expenseTransactions) {
      const current = totals.get(t.category) || 0;
      totals.set(t.category, current + Number(t.amount));
    }

    return Array.from(totals.entries()).map(([name, value]) => ({ name, value }));
  });

  transactionForm = this.fb.group({
    date: ['', Validators.required],
    category: ['', Validators.required],
    amount: [0, [Validators.required, Validators.min(1)]],
    type: ['expense', Validators.required],
    note: ['']
  });

  ngOnInit(): void {
    this.loadTransactions();
  }

  loadTransactions(): void {
    this.transactionService.getAll().subscribe({
      next: (data) => this.transactions.set(data),
      error: (err) => console.error('Failed to load transactions', err)
    });
  }

  onSubmit(): void {
    if (this.transactionForm.invalid) return;

    const formValue = this.transactionForm.value;
    this.transactionService.add({
      date: formValue.date!,
      category: formValue.category!,
      amount: Number(formValue.amount),
      type: formValue.type as 'income' | 'expense',
      note: formValue.note || ''
    }).subscribe({
      next: () => {
        this.transactionForm.reset({ type: 'expense', amount: 0, date: '', category: '', note: '' });
        this.loadTransactions();
      },
      error: (err) => console.error('Failed to add transaction', err)
    });
  }

  deleteTransaction(id: number): void {
    this.transactionService.delete(id).subscribe({
      next: () => this.loadTransactions(),
      error: (err) => console.error('Failed to delete transaction', err)
    });
  }

  onCategoryChange(category: string): void {
    this.selectedCategory.set(category);
  }
}