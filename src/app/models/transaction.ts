export interface Transaction {
  id: number;
  date: string;
  amount: number;
  category: string;
  type: 'income' | 'expense';
  note: string;
}