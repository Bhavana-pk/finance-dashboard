import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TransactionService } from '../../services/transaction';
import { Transaction } from '../../models/transaction';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard implements OnInit {
  transactions = signal<Transaction[]>([]);

  constructor(private transactionService: TransactionService) {}

  ngOnInit(): void {
    this.transactionService.getAll().subscribe({
      next: (data) => this.transactions.set(data),
      error: (err) => console.error('Failed to load transactions', err)
    });
  }
}