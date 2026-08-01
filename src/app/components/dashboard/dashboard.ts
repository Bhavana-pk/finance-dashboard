import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { TransactionService } from '../../services/transaction';
import { Transaction } from '../../models/transaction';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard implements OnInit {
  private transactionService = inject(TransactionService);
  private fb = inject(FormBuilder);

  transactions = signal<Transaction[]>([]);

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
}