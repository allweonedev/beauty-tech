export interface Event {
  id: string;
  title: string;
  start: Date;
  end: Date;
  client: string;
  service: string;
  status: 'confirmed' | 'pending' | 'cancelled' | 'completed';
  location?: string;
  notes?: string;
}

export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  cpf: string;
  address: string;
  birthDate: string;
  documents: ClientDocument[];
  notes: ClientNote[];
  interactions: ClientInteraction[];
  createdAt: Date;
  source: 'manual' | 'smart-link';
}

export interface ClientDocument {
  id: string;
  name: string;
  url: string;
  uploadedAt: Date;
}

export interface ClientNote {
  id: string;
  content: string;
  createdAt: Date;
}

export interface ClientInteraction {
  id: string;
  type: 'sale' | 'appointment' | 'contract' | 'note';
  description: string;
  date: Date;
  value?: number;
}

export interface Product {
  id: string;
  name: string;
  type: 'equipment' | 'service';
  description: string;
  price: number;
  imageUrl?: string;
  category: string;
  application: string;
  createdAt: Date;
}

export interface ReceiptData {
  clientName: string;
  equipment: string;
  date: Date;
  startTime: string;
  endTime: string;
  hours: number;
  value: number;
  address: string;
  phone: string;
  status: string;
  invoiceLink?: string;
}

export interface ChartData {
  labels: string[];
  datasets: {
    label?: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string;
    tension?: number;
    fill?: boolean;
    borderRadius?: number;
  }[];
}

export interface ChartOptions {
  responsive: boolean;
  maintainAspectRatio: boolean;
  plugins: {
    legend: {
      display: boolean;
      position?: 'top' | 'bottom' | 'left' | 'right';
      labels?: {
        usePointStyle?: boolean;
        padding?: number;
      };
    };
  };
  scales?: {
    x?: {
      grid?: {
        display?: boolean;
      };
    };
    y?: {
      beginAtZero?: boolean;
      grid?: {
        color?: string;
      };
      ticks?: {
        callback?: (value: number) => string;
      };
    };
  };
}

export interface Notification {
  id: string;
  title: string;
  description: string;
  time: string;
  read: boolean;
  type: 'client' | 'payment' | 'appointment' | 'review';
  data?: {
    clientId?: string;
    paymentId?: string;
    appointmentId?: string;
    reviewId?: string;
    amount?: number;
    clientName?: string;
    appointmentTime?: string;
    rating?: number;
  };
}