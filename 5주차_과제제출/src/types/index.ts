export type PaymentStatus = "pending" | "succeeded" | "failed" | "canceled";

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
}
