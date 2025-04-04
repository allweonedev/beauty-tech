export interface Supplier {
  id: string;
  name: string;
  email: string;
  phone: string;
  cnpj: string;
  address: string;
  type: 'partner' | 'subcontractor';
  commission: {
    percentage: number;
    minimumValue?: number;
    maximumValue?: number;
  };
  bankInfo: {
    bank: string;
    agency: string;
    account: string;
    type: 'checking' | 'savings';
    pixKey?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface RentalRecord {
  id: string;
  supplierId: string;
  clientName: string;
  equipmentName: string;
  startDate: Date;
  endDate: Date;
  value: number;
  commission: number;
  status: 'pending' | 'completed' | 'cancelled';
  paymentDate?: Date;
  notes?: string;
}

export interface CommissionReport {
  period: {
    start: Date;
    end: Date;
  };
  supplier: {
    id: string;
    name: string;
  };
  rentals: RentalRecord[];
  summary: {
    totalRentals: number;
    totalValue: number;
    totalCommission: number;
    pendingCommission: number;
    paidCommission: number;
  };
}