import { type Client } from "./client";

export interface Contract {
  id: string;
  title: string;
  description: string;
  client: Client;
  status: "pending" | "signed" | "expired" | "cancelled";
  documentUrl: string;
  signatureUrl?: string;
  signedAt?: Date;
  expiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}
