export interface Receipt {
  id: string;
  number: string;
  clientId: string;
  date: Date;
  dueDate?: Date | null;
  paymentMethod: PaymentMethod;
  status: ReceiptStatus;
  items: ReceiptItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ReceiptItem {
  id: string;
  receiptId: string;
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
  serviceDate?: Date | null;
  productId?: string | null;
}

export type PaymentMethod =
  | "cash"
  | "credit_card"
  | "debit_card"
  | "bank_transfer"
  | "pix"
  | "installment";

export type ReceiptStatus =
  | "draft"
  | "issued"
  | "paid"
  | "overdue"
  | "cancelled";
