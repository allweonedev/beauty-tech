export interface Sale {
  id: string;
  clientId: string;
  clientName: string;
  items: SaleItem[];
  total: number;
  status: 'pending' | 'paid' | 'cancelled';
  paymentMethod: 'pix' | 'credit' | 'debit' | 'cash';
  pixCode?: string;
  pixExpiration?: Date;
  paymentDate?: Date;
  createdAt: Date;
  updatedAt: Date;
  lastReminderSent?: Date;
  receiptId?: string;
  notes?: string;
}

export interface SaleItem {
  id: string;
  productId: string;
  name: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface PaymentReminder {
  id: string;
  saleId: string;
  clientName: string;
  amount: number;
  sentAt: Date;
  scheduledFor: Date;
  status: 'pending' | 'sent' | 'failed';
}