export interface Client {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  cpf: string | null;
  address: string | null;
  birthDate: Date | null;
  documents: ClientDocument[];
  notes: ClientNote[];
  interactions: ClientInteraction[];
  createdAt: Date;
  updatedAt: Date;
  source: "manual" | "smart-link";
}

export interface ClientDocument {
  id: string;
  clientId: string;
  name: string;
  url: string;
  uploadedAt: Date;
}

export interface ClientNote {
  id: string;
  clientId: string;
  content: string;
  createdAt: Date;
}

export interface ClientInteraction {
  id: string;
  clientId: string;
  type: "sale" | "appointment" | "contract" | "note";
  description: string;
  date: Date;
  value: number | null;
  createdAt: Date;
}
