export interface Income {
  id: string;
  description: string;
  category: 'service' | 'equipment' | 'product' | 'other';
  amount: number;
  paymentMethod: 'pix' | 'credit' | 'debit' | 'cash';
  status: 'pending' | 'completed' | 'cancelled';
  date: Date;
  client: string;
  reference: string;
}

export interface Expense {
  id: string;
  description: string;
  category: 'rent' | 'utilities' | 'supplies' | 'marketing' | 'payroll' | 'other';
  type: 'fixed' | 'variable';
  amount: number;
  dueDate: Date;
  status: 'pending' | 'paid' | 'overdue';
  paymentDate?: Date;
  recurrent: boolean;
}

export interface BankTransaction {
  id: string;
  type: 'credit' | 'debit';
  description: string;
  amount: number;
  date: Date;
  status: 'pending' | 'reconciled';
  reference?: string;
  pixKey?: string;
}

export interface FinancialReport {
  period: {
    start: Date;
    end: Date;
  };
  income: {
    total: number;
    byCategory: Record<Income['category'], number>;
    byPaymentMethod: Record<Income['paymentMethod'], number>;
  };
  expenses: {
    total: number;
    byCategory: Record<Expense['category'], number>;
    byType: Record<Expense['type'], number>;
  };
  profit: number;
  cashFlow: number[];
}