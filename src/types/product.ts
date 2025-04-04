export interface Product {
  id: string;
  name: string;
  type: "equipment" | "service";
  description: string;
  price: number;
  imageUrl?: string;
  category: string;
  application: string;
  createdAt: Date;
  updatedAt: Date;
}
